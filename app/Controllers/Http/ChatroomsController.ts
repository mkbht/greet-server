import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chatroom from 'App/Models/Chatroom'
import ChatroomUser from 'App/Models/ChatroomUser';
import Ws from "App/Services/Ws";
import User from "App/Models/User";
import Gift from "App/Models/Gift";
import Database from "@ioc:Adonis/Lucid/Database";
import Redis from "@ioc:Adonis/Addons/Redis";

export default class ChatroomsController {

  public async sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }


  public async listChatrooms({ response }: HttpContextContract) {
    try {
      const chatrooms = await Chatroom.query().limit(5).preload('joinedUsers');
      return response.send(chatrooms);
    } catch (e) {
      return response.badRequest({message: "Failed to load chatrooms."});
    }
  }

  public async listJoinedChatrooms({ auth }: HttpContextContract) {
    const query = await ChatroomUser.query().select('chatroom_id').where('user_id', auth.user!.id);
    //return query.map(item => item.chatroom_id);
    const chatrooms = await Chatroom.query().whereIn("id", query.map(item => item.chatroom_id)).preload("joinedUsers");
    if(chatrooms) {
      return chatrooms;
    } else {
      return [];
    }
  }

  public async listMyChatrooms({ auth }: HttpContextContract) {
    const chatrooms = await Chatroom.query().where("owner", auth.user!.id).preload("joinedUsers");
    if(chatrooms) {
      return chatrooms;
    } else {
      return [];
    }
  }

  public async create({ request, response, auth }: HttpContextContract) {
    let userInput = request.all();
    let findChatroom = await Chatroom.findBy("name", userInput.name);
    if(findChatroom) {
      return response.badRequest({message: "Chatroom already exists with given name."});
    }
    const chatroom = new Chatroom();
    chatroom.name = userInput.name;
    chatroom.description = userInput.description;
    chatroom.capacity = 25;
    chatroom.owner = auth.user!.id;
    await chatroom.save();
    return response.send({message: "Chatroom created successfully"});
  }

  public async delete({ request, response }: HttpContextContract) {
    // await this.sleep(3000);
    try {
      const chatroom = await Chatroom.find(request.input("chatroom_id"));
      if (!chatroom) {
        return response.badRequest({ message: "Chatroom doesn't exist." });
      }
      await chatroom.delete();
      response.status(200).send({ message: "Chatroom deleted successfully." });
    } catch (e) {
      return response.badRequest({ message: "Can not delete chatroom" });
    }

  }

  public async join({ request, response, auth }: HttpContextContract) {
      try {
        const isJoined = await ChatroomUser.query().where('chatroom_id', request.input('chatroom_id')).where('user_id', auth.user!.id).first();
        if(isJoined) {

          Ws.io.socketsJoin("room:" + request.input('chatroom_id'));
          // return chatroom instance
          let chatroom = await Chatroom.find(request.input('chatroom_id'));
          await chatroom?.load('joinedUsers');
          return chatroom;
        } else {
          let joinChatRoom = new ChatroomUser();
          joinChatRoom.user_id = auth.user!.id;
          joinChatRoom.chatroom_id = request.input('chatroom_id');
          await joinChatRoom.save();

          Ws.io.socketsJoin("room:" + request.input('chatroom_id'));
          Ws.io.to("room:" + request.input('chatroom_id')).emit("sendChatRoomMessage", {
            sender: "SYSTEM",
            sender_id: auth.user!.id,
            chatroom_id: request.input('chatroom_id'),
            type: 2,
            message: `${auth.user!.username} joined the chatroom.`
          });

          // return chatroom instance
          let chatroom = await Chatroom.find(request.input('chatroom_id'));
          await chatroom?.load('joinedUsers');
          return chatroom;
        }
      } catch(e) {
        response.badRequest({message: "Can not join chatroom."})
      }
  }

  public async leave({ request, response, auth }: HttpContextContract) {
    try {
      const isJoined = await ChatroomUser.query().where('user_id', auth.user!.id).where('chatroom_id', request.input('chatroom_id')).first();
      if(!isJoined) {
        return response.badRequest({message: "You are not in the room"});
      }
      await isJoined.delete();
      Ws.io.to("room:" + request.input('chatroom_id')).emit("sendChatRoomMessage", {
        sender: "SYSTEM",
        sender_id: auth.user!.id,
        chatroom_id: request.input('chatroom_id'),
        type: 2,
        message: `${auth.user!.username} left the chatroom.`
      });
      Ws.io.socketsLeave("room:" + request.input('chatroom_id'));
      return response.send({message: "You left chatroom."});
    } catch(e) {
      response.badRequest({message: "Can not join chatroom."})
    }
}

  public async sendChat({ request, response, auth }: HttpContextContract) {
    try {
    let message = request.input("message");
    let command = message.split(" ");
    if(['!start', '!j', '!h', '!t'].indexOf(message) > -1 && request.input("chatroom_id") == 50) {
      let res = await this.playGame(message, request, response, auth);
      return res;
    }
    if(command[0] == "/gift") {
      if(command.length !== 3) {
        return response.badRequest({message: "Invalid command: use /gift username giftname"});
      }
      let user = await User.findBy("username", command[1]);
      if(!user) {
        return response.badRequest({message: "Invalid username"});
      }
      let gift = await Gift.findBy("name", command[2]);
      if(!gift) {
        return response.badRequest({message: "Invalid username"});
      }
      if(gift.price > auth.user!.balance) {
        return response.badRequest({message: "Insufficient balance in your account."});
      }
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table('user_gifts')
        .insert({ user_id: user.id, gift_id: gift.id, sender_id: auth.user!.id });
      Ws.io.socketsJoin("room:" + request.input('chatroom_id'));
      Ws.io.to("room:" + request.input('chatroom_id')).emit("sendChatRoomMessage", {
        sender: "GIFT",
        sender_id: auth.user!.id,
        chatroom_id: request.input('chatroom_id'),
        type: 3,
        message: `${auth.user!.username} gifted ${user.username} a ${gift.icon} ${gift.name}. HURRAY!!!!`
      });
      let me = await User.find(auth.user!.id);
      me!.balance = me!.balance - gift.price;
      await me?.save();
      return response.send({message: `You gifted ${user.username}  a ${gift.icon} ${gift.name} of price: ${gift.price}`});

    }
      const isJoined = await ChatroomUser.query().where('user_id', auth.user!.id).where('chatroom_id', request.input('chatroom_id')).first();
      if(!isJoined) {
        return response.badRequest({message: "You are not in the room"});
      }
      Ws.io.socketsJoin("room:" + request.input('chatroom_id'));
      Ws.io.to("room:" + request.input('chatroom_id')).emit("sendChatRoomMessage", {
        sender: auth.user!.username,
        sender_id: auth.user!.id,
        chatroom_id: request.input('chatroom_id'),
        type: 1,
        message: request.input("message")
      });
    } catch(e) {
      response.badRequest({message: "Can not join chatroom." + e.message})
    }
  }

  public async playGame(command, request, response, auth) {
    if(command === '!start') {
      let gameStatus = await Redis.get("hot:status");
      console.log(gameStatus);
      if(gameStatus !== 'init') {
        return response.badRequest({message: "Game already started!"});
      }
      await Redis.sadd("gameUser", [auth.user!.username]);
      await Redis.set("hot:status", 'join');

      await Redis.publish('hot:play',
        JSON.stringify({
          user_id: auth.user!.id,
          username: auth.user!.username,
          chatroom_id: request.input('chatroom_id'),
          status: 'start'
        }));
      return response.status(200).send({"message": "You joined the game"});
    }
    if(command == '!j') {
      let gameStatus = await Redis.get("hot:status");
      if(gameStatus !== 'start') {
        return response.badRequest({message: "Invalid command!"});
      }
      let gameUsers = await Redis.smembers("gameUser");
      console.log(gameUsers);
      if(gameUsers.indexOf(auth.user!.username) !== -1) {
        return response.badRequest({message: "You have already joined"});
      }
      await Redis.sadd("gameUser", [auth.user!.username]);
      Ws.io.emit("sendGameMessage", {
        sender: "GAME",
        sender_id: 0,
        chatroom_id: 0,
        type: 4,
        message: `${auth.user!.username} joined the game.`
      });
      return;
    }

    if(command == '!h' || command == '!t') {
      if(command == '!h') {
        await Redis.sadd("head", [auth.user!.username]);
        Ws.io.emit("sendGameMessage", {
          sender: "GAME",
          sender_id: 0,
          chatroom_id: 0,
          type: 4,
          message: `${auth.user!.username} selected Head.`
        });
      }
      if(command == '!t') {
        await Redis.sadd("tail", [auth.user!.username]);
        Ws.io.emit("sendGameMessage", {
          sender: "GAME",
          sender_id: 0,
          chatroom_id: 0,
          type: 4,
          message: `${auth.user!.username} selected Tail.`
        });
      }
    }
  }

}

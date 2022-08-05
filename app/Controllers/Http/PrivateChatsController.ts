import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import PrivateChat from "App/Models/PrivateChat";
import User from 'App/Models/User';
import Ws from "App/Services/Ws";

export default class PrivateChatsController {
  public async sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  public async fetchChatList({ response, auth }: HttpContextContract) {
    let chats = await PrivateChat.query().where("sender", auth.user!.id).orWhere("receiver", auth.user!.id).orderBy("id", "desc").preload("sender_obj").preload("receiver_obj");

    let chatList = chats.map(item => {
      if(item.sender == auth.user!.id) {
        item.sender = item.receiver;
        item.sender_obj = item.receiver_obj
      }
      return item;
    });
    chatList = chatList.filter((a, i) => chats.findIndex((s) => a.sender === s.sender) === i)

    return response.status(200).send(chatList);
  }

  public async fetchChat({ request, response, auth }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = 30;
    let user = await User.find(request.input("user_id"));
    if(!user) {
      return response.badRequest({message: "User not found."});
    }

    let chats = await PrivateChat.query()
    .where((query) => {
      query
        .where("sender", auth.user!.id)
        .where('receiver', user!.id)
    })
    .orWhere((query) => {
      query
      .where("receiver", auth.user!.id)
      .where('sender', user!.id)
    }).orderBy("id", "desc").paginate(page, limit);
    return response.status(200).send({user, chats, author: auth.user!.username});
  }

  public async iceBreaker({ response, auth }: HttpContextContract) {
    const user = await User.query().where("id", "!=", auth.user!.id).orderByRaw("RAND()").first();
    return response.send(user);
  }

  public async sendChat({ response, request, auth }: HttpContextContract) {
    try {

        let message = new PrivateChat();
        message.sender = auth.user!.id;
        message.receiver = request.input("user");
        message.message = request.input("message");
        await message.save();
        Ws.io.to("user:"+message.receiver).emit("sendMessage", message.toJSON());
        return message;
    } catch(e) {
      console.log("Err", e);
      return response.badRequest({message: e});

    }
  }

}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chatroom from 'App/Models/Chatroom'
import ChatroomUser from 'App/Models/ChatroomUser';

export default class ChatroomsController {

  public async listChatrooms({ response }: HttpContextContract) {
    const chatrooms = await Chatroom.all();
    return chatrooms;
  }

  public async create({ request }: HttpContextContract) {
    const chatroom = new Chatroom();
    let userInput = request.all();
    chatroom.merge(userInput);
    await chatroom.save();
    return chatroom;
  }

  public async delete({ request, response }: HttpContextContract) {
    try {
      const chatroom = await Chatroom.find(request.input("chatroom"));
      if (!chatroom) {
        return response.badRequest({ message: "Chatroom doesn't exist." });
      }
      chatroom.delete();
      response.status(200).send({ message: "Chatroom deleted successfully." });
    } catch (e) {
      return response.badRequest({ message: "Can not delete chatroom" });
    }

  }

  public async join({ request, response, auth }: HttpContextContract) {
      try {
        const isJoined = await ChatroomUser.firstOrCreate({
          user_id: auth.user!.id,
          chatroom_id: request.input('chatroom_id')
        },
        {
          user_id: auth.user!.id,
          chatroom_id: request.input('chatroom_id')
        });
        return isJoined;
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
      return response.send({message: "You left chatroom."});
      return
    } catch(e) {
      response.badRequest({message: "Can not join chatroom."})
    }
}

}

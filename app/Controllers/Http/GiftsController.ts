// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import Chatroom from "App/Models/Chatroom";
import Gift from "App/Models/Gift";

export default class GiftsController {
  public async myGifts({ auth }: HttpContextContract) {
    const chatrooms = await Chatroom.query().where("owner", auth.user!.id).preload("joinedUsers");
    if(chatrooms) {
      return chatrooms;
    } else {
      return [];
    }
  }

  public async list({ }: HttpContextContract) {
    const gifts = await Gift.query();
    return gifts;
  }
}

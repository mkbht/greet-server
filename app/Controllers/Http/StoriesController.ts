// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import Story from "App/Models/Story";
import Application from "@ioc:Adonis/Core/Application";

export default class StoriesController {
  public async list({ }: HttpContextContract) {
    const stories = await Story.query().preload('user').orderBy('id', "desc");
    return stories;
  }

  public async upload({ request, response, auth }: HttpContextContract) {
    const image = request.file('image')
    try {
      if (image) {
        await image.move(Application.publicPath('uploads'));
        let story = new Story();
        story.image = image.clientName;
        story.text = "";
        story.userId = auth.user!.id;
        await story.save();
        return response.send({message: "Story uploaded successfully!"});
      }
    } catch (e) {
        return response.badRequest({message: "Can not upload story."})
    }
  }

}

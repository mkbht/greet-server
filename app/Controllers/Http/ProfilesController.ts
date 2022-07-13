// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Follow from "App/Models/Follow";

export default class ProfilesController {
  public async sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  public async myProfile({ response, auth }: HttpContextContract) {
    await this.sleep(1000);
    const user = await User.findBy("username", auth.user?.username);
    await user?.load("followers");
    await user?.load("followings");
      if (!user) {
        return response.status(400).send({
          message: "Profile not found.",
        });
      }
      return response.status(200).send(user);
  }

  public async fetchProfile({ request, response, auth }: HttpContextContract) {
    await this.sleep(1000);
    const user = await User.findBy("username", request.input("username"));
    await user?.load("followers");
    await user?.load("followings");
    let finalUser = JSON.parse(JSON.stringify(user));
    finalUser.isFollowing = (user && user.followers.findIndex((item) => item.id === auth.user?.id) > -1);

      if (!user) {
        return response.status(400).send({
          message: "Profile not found.",
        });
      }
      return response.status(200).send(finalUser);
  }

  public async updateMyProfile({ request, response, auth }: HttpContextContract) {
    const userSchema = schema.create({
      first_name: schema.string({ escape: true, trim: true }, [
        rules.minLength(2),
        rules.alpha({ allow: ["dash", "space"] }),
      ]),
      last_name: schema.string({ escape: true, trim: true }, [
        rules.minLength(2),
        rules.alpha({ allow: ["dash", "space"] }),
      ]),
      date_of_birth: schema.date({
        format: 'yyyy-MM-dd',
      }),
    });
    try {
      await request.validate({ schema: userSchema });
      const user = await User.findBy("username", auth.user?.username);
      if (!user) {
        return response.status(400).send({
          message: "Profile update failed.",
        });
      }
      user.merge(request.all());
      await user.save();
      return response.status(200).send({
        user,
        message: "Profile edited successfully.",
      });
    } catch (error) {
      if (error.messages) {
        return response.status(400).send({
          message: "Required fields missing.",
        });
      }
      return response.status(500).send({
        message: error.message,
      });
    }
  }

  public async searchUsers({ request, response }: HttpContextContract) {
    await this.sleep(1000);
    if(!request.input("query")) {
      return response.status(200).send([]);
    }
    const users = await User.query().where("username", "LIKE", "%" + request.input("query") + "%")
    .orWhere("firstName", "LIKE", "%" + request.input("query") + "%")
    .orWhere("lastName", "LIKE", "%" + request.input("query") + "%").preload("followers").preload("followings");
    return response.status(200).send(users);
  }

  public async follow({ request, response, auth }: HttpContextContract) {
    const isFollowed = await Follow
    .query().where('follower_id', auth.user!.id).where('following_id', request.input("user")).first();
    if(!isFollowed) {
      let follow = new Follow();
      follow.follower_id = auth.user!.id;
      follow.following_id = request.input("user");
      follow.save();
    }

    return response.status(200).send({message: "Followed successfully!"});
  }

  public async unfollow({ request, response, auth }: HttpContextContract) {
    const isFollowed = await Follow
    .query().where('follower_id', auth.user!.id).where('following_id', request.input("user")).first();
    if(isFollowed) {
      isFollowed.delete();
    }

    return response.status(200).send({message: "Unfollowed successfully!"});
  }

}

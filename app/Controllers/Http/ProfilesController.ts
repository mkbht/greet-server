// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import {rules, schema} from "@ioc:Adonis/Core/Validator";

export default class ProfilesController {
    public async myProfile({auth}: HttpContextContract) {
        return auth.user;
    }

    public async updateProfile({request, response }: HttpContextContract) {
        const userSchema = schema.create({
            first_name: schema.string({ escape: true, trim: true }, [
                rules.minLength(2),
                rules.alpha({allow: ['dash', 'space']})
            ]),
            last_name: schema.string({ escape: true, trim: true }, [
              rules.minLength(2),
              rules.alpha({allow: ['dash', 'space']})
          ]),
            date_of_birth: schema.date({format: 'yyyy-MM-dd'}, [
            ]),
        });
        let user = request.validate({schema: userSchema})
        
        const user = await User.findBy('username', request.input('username'));
        if(user) {
            user.firstName = request.input("first_name");
            user.lastName = request.input("last_name");
            user.dateOfBirth = request.input("date_of_birth");
            user.save();
            return response.status(200).send({
                message: "Profile edited successfully."
            });
        } else {
            return response.status(400).send({
                message: "Can't update profile."
            });
        }
    }
}

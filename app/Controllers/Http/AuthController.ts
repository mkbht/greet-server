import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from "App/Models/User";
import Hash from "@ioc:Adonis/Core/Hash";

export default class AuthController {

    public async login({request, auth, response}: HttpContextContract) {
        const username = request.input("username");
        const password = request.input("password");
        // Lookup user manually
        const user = await User
            .findByOrFail('username', username);
        console.log(user);
        if (!(await Hash.verify(user.password, password))) {
            return response.badRequest('Invalid credentials')
        }
        const token = await auth.use("api").login(user);
        return token.toJSON();
    }

    public async register({ request, auth }: HttpContextContract) {
        const username = request.input("username");
        const email = request.input("email");
        const password = request.input("password");
        const firstName = request.input("first_name");
        const lastName = request.input("last_name");
        const dateOfBirth = request.input("date_of_birth");
        const newUser = new User();
        newUser.username = username;
        newUser.email = email;
        newUser.password = password;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.dateOfBirth = dateOfBirth;
        await newUser.save();
        const token = await auth.use("api").login(newUser, {
            expiresIn: "10 days",
        });
        return token.toJSON();
    }
}

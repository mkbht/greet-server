import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext';
import User from "App/Models/User";
import Hash from "@ioc:Adonis/Core/Hash";
import Mail from "@ioc:Adonis/Addons/Mail";

export default class AuthController {

  public async sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

    public async login(http: HttpContextContract) {

    let {request, auth, response} = http;
        const username = request.input("username");
        const password = request.input("password");
        // Lookup user manually
        const user = await User
            .query().where('username', username).orWhere('email', username).first();
        if (!user || !(await Hash.verify(user.password, password))) {
            return response.badRequest({message: 'Invalid credentials.'});
        }
        if (user.status === 0) {
            return response.badRequest({message: 'Please verify your account to login.'});
        }
        const token = await auth.use("api").login(user);
        return {
          token: token.toJSON(),
          user: user
        };
    }

    public async register({ request, response }: HttpContextContract) {
        const username = request.input("username");
        const email = request.input("email");
        const password = request.input("password");
        const firstName = request.input("first_name");
        const lastName = request.input("last_name");
        const dateOfBirth = request.input("date_of_birth");
        const gender = request.input("gender");
        const newUser = new User();
        newUser.username = username;
        newUser.email = email;
        newUser.password = password;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.dateOfBirth = dateOfBirth;
        newUser.gender = gender;
        newUser.status = 0;

        try {
            const token = await Hash.make(username + password + email);
            const encodedToken = encodeURIComponent(token);
            newUser.verificationToken = token;
            await newUser.save();

            const link = `http://${request.host()}/api/verify?token=${encodedToken}`;
            // generate token
            // send verification email
            await Mail.send((message) => {
                message
                    .from('donotreply@greet.app', 'Greet')
                    .to(email)
                    .subject('Please verify your account.')
                    .htmlView('emails/verify', {
                        name: `${firstName} ${lastName}`,
                        link: link
                    });
            });
            return response.status(200).send({
                message: "Account created successfully, Please check your email for verification link."
            });
        } catch (error) {
            if(error.code === "ER_DUP_ENTRY") {
                return response.status(500).send({
                    code: error.code,
                    message: "User already registered with given information.",
                });
            }
            return response.status(500).send({
                code: error.code,
                message: "Could not create new account. Something went wrong."
            });
        }

    }

    public async verify({ request }: HttpContextContract) {
        const verificationToken = request.input("token");
        const user = await User
            .findBy('verification_token', verificationToken);

        if(user) {
            user.status = 1;
            user.verificationToken = '';
            user.save();
            return "You are successfully verified. Please return to app and login.";
        } else {
            return "Verification failed.";
        }
    }

    public async forgotPassword({ request, response }: HttpContextContract) {
        const email = request.input("email");
        const user = await User
            .findBy('email', email);

        if(user) {
            const token = await Hash.make(email + user.username + user.password);
            const encodedToken = encodeURIComponent(token);
            user.forgotPasswordToken = token;
            await user.save();
            user.save();

            const link = `http://${request.host()}/api/resetPassword?token=${encodedToken}`;
            // generate token
            // send verification email
            await Mail.send((message) => {
                message
                    .from('donotreply@greet.app', 'Greet')
                    .to(email)
                    .subject('Reset your password.')
                    .htmlView('emails/reset', {
                        link: link
                    });
            });
        }
        return response.send({message: "Password reset link has been sent to your email address."});
    }

    public async resetPassword({ request, view }: HttpContextContract) {
        const verificationToken = request.input("token");
        const user = await User
            .findBy('forgot_password_token', verificationToken);

        if(user) {
            return view.render("reset", {
                token: verificationToken
            });
        } else {
            return "Link expired";
        }
    }

    public async reset({ request }: HttpContextContract) {
        const password = request.input("password");
        const confirmPassword = request.input("confirm_password");
        const token = request.input("token");
        const user = await User
            .findBy('forgot_password_token', token);

        if(user && password === confirmPassword) {
            user.status = 1;
            user.forgotPasswordToken = '';
            user.password = password;
            user.save();
            return "Password changed successfully";
        } else {
            return "Verification failed.";
        }
    }
}

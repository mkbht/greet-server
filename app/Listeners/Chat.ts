import Pusher from "pusher";
import Env from "@ioc:Adonis/Core/Env";

export default class Chat {

    private pusher;

    constructor() {
        this.pusher = new Pusher({
            appId: Env.get('PUSHER_APP_ID', ''),
            key: Env.get('PUSHER_APP_KEY', ''),
            secret: Env.get('PUSHER_APP_SECRET', ''),
            cluster: Env.get('PUSHER_CLUSTER', 'us2'),
            useTLS: false
        });
    }

    public async onPrivateChat(message) {
        let channel;
        if(message.sender < message.receiver) {
            channel = "chat_" + message.sender + "_" + message.receiver;
        } else {
            channel = "chat_" + message.receiver + "_" + message.sender;
        }

        this.pusher.trigger(channel, 'send-message', message);
    }
}

import Pusher from "pusher";
import Env from "@ioc:Adonis/Core/Env";

export default class Chat {

    private pusher;

    constructor() {
        this.pusher = new Pusher({
            appId: Env.get('PUSHER_APP_ID', ''),
            key: Env.get('PUSHER_KEY', ''),
            secret: Env.get('PUSHER_SECRET', ''),
            cluster: Env.get('PUSHER_CLUSTER', 'us2'),
            encrypted: true
        });
    }

    public async onPrivateChat(message) {
        let channel;
        if(message.sender < message.receiver) {
            channel = "privatechat_" + message.sender + "_" + message.receiver;
        } else {
            channel = "privatechat_" + message.receiver + "_" + message.sender;
        }
        this.pusher.trigger(channel, 'send-message', message);
    }
}

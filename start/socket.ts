import Ws from 'App/Services/Ws'
import Redis from "@ioc:Adonis/Addons/Redis";
import ChatroomUser from "App/Models/ChatroomUser";
import User from "App/Models/User";

Ws.boot()

/**
 * Listen for incoming socket connections
 * */

Ws.io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' })
  console.log(socket.id);

  socket.on('sendChat', (data) => {
    Ws.io.to("user:"+25).emit("sendMessage", data);
  });

  socket.on('joinRoom', (id) => {
    socket.join("room:" + id);
  })


  socket.on('login', async (id) => {
    socket.join("user:" + id);
    await Redis.set('id:'+socket.id, id);
  });

  socket.on('disconnecting', async () => {
    let userId = await Redis.get('id:'+socket.id);
    console.log("Disconnecting ID: ", userId);
    try {
      const joinedRooms = await ChatroomUser.query().where('user_id', userId!);
      for (const item of joinedRooms) {
        console.log("B",item.chatroom_id)
        const user = await User.find(item.user_id);
        const joinedRoom = await ChatroomUser.find(item.id);
        await joinedRoom?.delete();
        Ws.io.to("room:" + item.chatroom_id).emit("sendChatRoomMessage", {
          sender: "SYSTEM",
          sender_id: -1,
          chatroom_id: item.chatroom_id,
          type: 2,
          message: `${user!.username} left the chatroom.`
        });
      }
    } catch(e) {
      throw e;
    }
  });
})

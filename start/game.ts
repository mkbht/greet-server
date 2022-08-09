import Ws from "App/Services/Ws";
import Redis from "@ioc:Adonis/Addons/Redis";
import { string } from '@ioc:Adonis/Core/Helpers';

Ws.boot();


init();
// periodically run init
let timer = setInterval(init, 10000);



Redis.subscribe('hot:play', async (payload) => {
  let data = JSON.parse(payload);
  await Redis.get("hot:status");
  switch(data.status) {
    case 'start': {
      await startGame(data);
      break;
    }
    case 'beforeJoin': {
      Ws.io.emit("sendGameMessage", {
        sender: "GAME",
        sender_id: 0,
        chatroom_id: 0,
        type: 4,
        message: `User started a new game. type !j <bet amount> to join.`
      });
      break;
    }
    case 'join': {
      Ws.io.emit("sendGameMessage", {
        sender: "GAME",
        sender_id: 0,
        chatroom_id: 0,
        type: 4,
        message: `${data.username} joined the game.`
      });
      break;
    }
    case 'beforeChoice': {
      Ws.io.emit("sendGameMessage", {
        sender: "GAME",
        sender_id: 0,
        chatroom_id: 0,
        type: 4,
        message: `Game is starting...`
      });
      break;
    }
    case 'choice': {
      await choice(data);
      break;
    }

    case 'beforeFlip': {
      await beforeFlip(data);
      break;
    }
    case 'flip': {
      await flip(data);
      break;
    }
    case 'afterFlip': {
      timer = setInterval(init, 10000);
      break;
    }
    case 'notEnoughPlayers': {
        Ws.io.emit("sendGameMessage", {
          sender: "GAME",
          sender_id: 0,
          chatroom_id: 0,
          type: 4,
          message: `Not enough player. Game over.`
        });
        timer = setInterval(init, 10000);
    }
  }
});

async function init() {
  await Redis.set("hot:status", "init");
  await Redis.del('gameUser');
  await Redis.del('head');
  await Redis.del('tail');
  Ws.io.emit("sendGameMessage", {
    sender: "GAME",
    sender_id: 0,
    chatroom_id: 0,
    type: 4,
    message: `Head or Tail: Type !start to start a new game.`
  });
}

async function startGame(data) {
  clearInterval(timer);
  await Redis.set("hot:status", "start");
  Ws.io.emit("sendGameMessage", {
    sender: "GAME",
    sender_id: 0,
    chatroom_id: 0,
    type: 4,
    message: `${data.username} started a new game. Type !j to join.`
  });
  setTimeout(async () => {
    await Redis.set("hot:status", "bet");
    await Redis.publish('hot:play', JSON.stringify({
      user_id: data.user_id,
      chatroom_id: data.chatroom_id,
      status: 'choice'
    }));
  }, 15000);
}

async function choice(data) {

  let gameUser = await Redis.smembers("gameUser");
  Ws.io.emit("sendGameMessage", {
    sender: "GAME",
    sender_id: 0,
    chatroom_id: 0,
    type: 4,
    message: `Users: ${string.toSentence(gameUser)}`
  });

    await Redis.set("hot:status", "choice");
    if(gameUser.length <= 1) {
      await Redis.publish('hot:play', JSON.stringify({
        user_id: data.user_id,
        username: data.username,
        chatroom_id: data.chatroom_id,
        status: 'notEnoughPlayers'
      }));
    } else {
      Ws.io.emit("sendGameMessage", {
        sender: "GAME",
        sender_id: 0,
        chatroom_id: 0,
        type: 4,
        message: `Type !h for head or !t for tail.`
      });
      setTimeout(async () => {
      await Redis.publish('hot:play', JSON.stringify({
        user_id: data.user_id,
        username: data.username,
        chatroom_id: data.chatroom_id,
        status: 'beforeFlip'
      }));
      }, 15000);
    }
}

async function beforeFlip(data) {
  setTimeout(async () => {
    await Redis.publish('hot:play', JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      chatroom_id: data.chatroom_id,
      status: 'flip'
    }));
  }, 3000);
}

async function flip(data) {
  Ws.io.emit("sendGameMessage", {
    sender: "GAME",
    sender_id: 0,
    chatroom_id: 0,
    type: 4,
    message: `Choice period ends. Bot is flipping the coin.`
  });
  setTimeout(async () => {
    const randomNumber = Math.floor(Math.random() * 1) + 0;
    console.log(randomNumber);
    const choice = ['Head', 'Tail'];
    Ws.io.emit("sendGameMessage", {
      sender: "GAME",
      sender_id: 0,
      chatroom_id: 0,
      type: 4,
      message: `Bot flipped ${choice[randomNumber]}!`
    });
    let winners;
    if(randomNumber == 0) {
      winners = await Redis.smembers("head");
    }
    else {
      winners = await Redis.smembers("tail");
    }
    Ws.io.emit("sendGameMessage", {
      sender: "GAME",
      sender_id: 0,
      chatroom_id: 0,
      type: 4,
      message: `Winners: ${string.toSentence(winners)}`
    });
    await Redis.publish('hot:play', JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      chatroom_id: data.chatroom_id,
      status: 'afterFlip'
    }));
  }, 1000);
}

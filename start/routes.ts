/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'


Route.get('/', async ({view}) => {
  return view.render('welcome.edge');
})
Route.group(() => {
  Route.post("login", "AuthController.login");
  Route.post("register", "AuthController.register");
  Route.get("verify", "AuthController.verify");
  Route.post("forgotPassword", "AuthController.forgotPassword");
  Route.get("resetPassword", "AuthController.resetPassword");
  Route.post("reset", "AuthController.reset");
  Route.group(() => {
    Route.get("myprofile", "ProfilesController.myProfile");
    Route.get("profile", "ProfilesController.fetchProfile");
    Route.put("updateprofile", "ProfilesController.updateMyProfile");
    Route.get("search", "ProfilesController.searchUsers");
    Route.get("follow", "ProfilesController.follow");
    Route.get("unfollow", "ProfilesController.unfollow");

    // private chat
    Route.get("chatlist", "PrivateChatsController.fetchChatList");
    Route.get("chat", "PrivateChatsController.fetchChat");
    Route.post("chat", "PrivateChatsController.sendChat");
    Route.get("icebreaker", "PrivateChatsController.iceBreaker");

    // chatrooms
    Route.get("chatrooms", "ChatroomsController.listChatrooms");
    Route.get("mychatrooms", "ChatroomsController.listMyChatrooms");
    Route.get("joinedchatrooms", "ChatroomsController.listJoinedChatrooms");
    Route.post("chatrooms", "ChatroomsController.create");
    Route.delete("chatrooms", "ChatroomsController.delete");

    Route.post("chatrooms/join", "ChatroomsController.join");
    Route.post("chatrooms/send", "ChatroomsController.sendChat");
    Route.post("chatrooms/leave", "ChatroomsController.leave");

    // gifts
    Route.get("gifts", "GiftsController.list");

    // stories
    Route.get("stories", "StoriesController.list");
    Route.post("stories", "StoriesController.upload");

  }).middleware("auth:api");
}).prefix("api");

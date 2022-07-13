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

Route.get('/', async () => {
  return { hello: 'world' }
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
  }).middleware("auth:api");
}).prefix("api");

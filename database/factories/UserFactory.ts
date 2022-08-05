import Factory from '@ioc:Adonis/Lucid/Factory'
import User from "App/Models/User";
import {DateTime} from "luxon";

export default Factory.define(User, ({faker}) => {
  return {
    username: faker.internet.userName().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    password: 'password',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    dateOfBirth: DateTime.fromSQL('1995-01-08'),
    gender: 1,
    avatar: faker.internet.avatar(),
    status: 1
  }
}).build()

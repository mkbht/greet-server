import { DateTime } from 'luxon'
import {BaseModel, column, computed, ManyToMany, manyToMany} from '@ioc:Adonis/Lucid/Orm'
import User from "App/Models/User";

export default class Chatroom extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public capacity: number

  @column()
  public owner: number

  @computed()
  public get joined() {
    return this.joinedUsers.length;
  }


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => User, {
    localKey: "id",
    pivotForeignKey: "chatroom_id",
    pivotRelatedForeignKey: "user_id",
    pivotTable: "chatroom_users",
    serializeAs: null
  })
  public joinedUsers: ManyToMany<typeof User>
}

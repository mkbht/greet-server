import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User';

export default class PrivateChat extends BaseModel {
  public static table = 'private_chats';

  @column({ isPrimary: true })
  public id: number

  @column()
  public sender: number

  @column()
  public receiver: number

  @column()
  public message: string

  @column()
  public image: string

  @column.date()
  public seenAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: "sender"
  })
  public sender_obj: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: "receiver"
  })
  public receiver_obj: BelongsTo<typeof User>
}

import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Follow from './Follow'
import { IdentityStore } from 'aws-sdk'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column({ serializeAs: null })
  public password: string

  @column.date()
  public dateOfBirth: DateTime

  @column()
  public gender: number

  @column()
  public address: number

  @column()
  public avatar: string

  @column()
  public status: number

  @column({ serializeAs: null })
  public verificationToken: string

  @column({ serializeAs: null })
  public forgotPasswordToken: string

  @column()
  public lastLogin: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }


  @manyToMany(() => User, {
    localKey: "id",
    pivotForeignKey: "following_id",
    pivotRelatedForeignKey: "follower_id",
    pivotTable: "follows"
  })
  public followers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    localKey: "id",
    pivotForeignKey: "follower_id",
    pivotRelatedForeignKey: "following_id",
    pivotTable: "follows"
  })
  public followings: ManyToMany<typeof User>
}

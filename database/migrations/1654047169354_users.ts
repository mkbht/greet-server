import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('username', 255).notNullable().unique()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('first_name', 180).notNullable()
      table.string('last_name', 180).notNullable()
      table.dateTime('date_of_birth').nullable()
      table.tinyint('gender').nullable()
      table.decimal('balance', 2).nullable()
      table.integer('address').nullable()
      table.string('avatar').nullable()
      table.tinyint('status').nullable()
      table.string('verification_token').nullable()
      table.dateTime('last_login').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

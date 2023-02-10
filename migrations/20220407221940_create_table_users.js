
exports.up = function (knex, Promise) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary()
        table.string('name').notNull()
        table.integer('age').notNull()
        table.string('email').notNull().unique()
        table.string('password').notNull()
        table.string('image')
        table.string('signature')
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('users')
};
exports.up = function(knex) {
    return knex.schema.createTable('drinks_users', table => {
        table.increments('id').primary()
        table.date('date_solicitation')
        table.integer('userId').references('id')
        .inTable('users').notNull()
        table.integer('drinkId').references('id')
        .inTable('drink').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('drinks_users')
};
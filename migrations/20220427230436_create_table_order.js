
exports.up = function(knex) {
    return knex.schema.createTable('order', table => {
        table.increments('id').primary()
        table.timestamp('date_solicitation')
        table.float('value').notNull()
        table.integer('userId').references('id')
        .inTable('users').notNull()
        table.integer('drinkId').references('id')
        .inTable('drink').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('order')
};

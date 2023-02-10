
exports.up = function(knex) {
    return knex.schema.createTable('favorites', table => {
        table.integer('user_id').references('id')
            .inTable('users').notNull()
        table.integer('partner_id').references('id')
            .inTable('parceiro').notNull()
        table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('favorites')
};

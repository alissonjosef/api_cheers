
exports.up = function (knex, Promise) {
    return knex.schema.createTable('drink', table => {
        table.increments('id').primary()
        table.string('nomeDrink').notNull()
        table.string('ingredientes')
        table.double('value').notNull()
        table.string('imagemDrink').notNull()
        table.integer('parceiroId').references('id')
            .inTable('parceiro').notNull()
        table.string('active').default('S')
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('drink')
};

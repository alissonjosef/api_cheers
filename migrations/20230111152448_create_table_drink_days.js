
exports.up = function (knex) {
    return knex.schema.createTable('drink_day', table => {
        table.increments('id').primary();
        table.integer('drinkId')
            .references('id')
            .inTable('drink')
            .onDelete('CASCADE')
            .notNull();
            table.boolean('sunday_active').defaultTo(true);
            table.integer('sunday_from');
            table.integer('sunday_to');

            table.boolean('monday_active').defaultTo(true);
            table.integer('monday_from');
            table.integer('monday_to');

            table.boolean('tuesday_active').defaultTo(true);
            table.integer('tuesday_from');
            table.integer('tuesday_to');

            table.boolean('wednesday_active').defaultTo(true);
            table.integer('wednesday_from');
            table.integer('wednesday_to');

            table.boolean('thursday_active').defaultTo(true);
            table.integer('thursday_from');
            table.integer('thursday_to');

            table.boolean('friday_active').defaultTo(true);
            table.integer('friday_from');
            table.integer('friday_to');

            table.boolean('saturday_active').defaultTo(true);
            table.integer('saturday_from');
            table.integer('saturday_to');
    })

};

exports.down = function (knex) {
    return knex.schema.dropTable('drink_day')
};

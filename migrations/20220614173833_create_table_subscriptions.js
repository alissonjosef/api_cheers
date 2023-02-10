
exports.up = function(knex) {
    return knex.schema.createTable('subscriptions', table => {
        table.string('id').primary()
        table.string('customer_email')

        table.integer('user_id')
            .references('id')
            .inTable('users')

        table.string('status')
        table.string('payment_status')
        table.string('subscription_status')

        table.integer('started_at')
        table.integer('end_at')
        table.float('total')
        
        table.string('has_disputed').defaultTo("N")
        table.string('disputed_reason')
        table.string('disputed_status')

        table.string('invoice_pdf')
        
        table.string('plan_id')
        table.string('sub_id').unique()
        table.string('payment_intent').unique()
        

        table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
        table.dateTime('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('subscriptions')
};

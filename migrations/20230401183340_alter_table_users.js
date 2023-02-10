
exports.up = function (knex, Promise) {
    return knex.schema.alterTable('users', table => {
        table.string('password_key')
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.alterTable('users', table => {
        table.dropColumn('password_key')
    })
};

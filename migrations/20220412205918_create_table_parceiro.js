exports.up = function (knex, Promise) {
    return knex.schema.createTable('parceiro', table => {
        table.increments('id').primary()
        table.string('nome').notNull()
        table.string('email').notNull().unique()
        table.string('password').notNull()
        table.string('nome_negocio')
        table.string('descricao_negocio')
        table.string('endereco')
        table.string('lat')
        table.string('long')
        table.string('horario_funcionamento')
        table.string('telefone')
        table.string('image_bar')
        table.string('url_facebook')
        table.string('url_instagram')
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('parceiro')
};

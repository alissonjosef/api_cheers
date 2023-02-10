const connectionLocal = {
	database: 'cheersTest',
	user: 'postgres',
	password: 'postgres'
}

const connectionProduction = {
	host : '191.101.0.223',
	database: 'postgres',
	user: 'postgres',
	password: 'cheers@2023'
}

module.exports = {
	client: 'postgresql',
	connection: connectionProduction,
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: 'knex_migrations'
	}
};

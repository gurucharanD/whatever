knex = require('knex');
let path = require('path');


const options = {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  migrations: {
    tableName: 'sravanproject_knex_migrations',
    directory: path.join(__dirname + '/migrations')
  },
  pool: {
    min: 2,
    max: 10
  }
}

const Knex = knex(options)

module.exports = Knex;

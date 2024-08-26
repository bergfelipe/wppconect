const { Pool } = require('pg');

// Configurações do banco de dados
const pool = new Pool({
  user: 'felipe', // substitua com seu usuário do PostgreSQL
  host: 'localhost', // ou o host do seu servidor PostgreSQL
  database: 'meu_banco_de_dados', // substitua pelo nome do seu banco de dados
  password: 'felipe123', // substitua com sua senha do PostgreSQL
  port: 5432, // porta padrão do PostgreSQL
});

module.exports = pool;

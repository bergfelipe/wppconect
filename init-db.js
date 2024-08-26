const { Client } = require('pg');

const client = new Client({
    user: 'felipe',
    host: 'localhost',
    database: 'meu_banco_de_dados',
    password: 'felipe123',
  port: 5432,
});

client.connect();

client.query(`
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone_number VARCHAR(20),
    whatsapp_id VARCHAR(50)
  );
`, (err, res) => {
  if (err) {
    console.error('Error creating contacts table:', err);
  } else {
    console.log('Contacts table created successfully');
  }
  client.end();
});

const { Client } = require('pg');
const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');

// Configuração da conexão com o banco de dados PostgreSQL
const clientDB = new Client({
  user: 'felipe',
  host: 'localhost',
  database: 'meu_banco_de_dados',
  password: 'felipe123',
  port: 5432,
});

clientDB.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to the database');
  }
});

// Criação do cliente WPPConnect
wppconnect
  .create({
    session: 'sessionName',
    puppeteerOptions: {
      userDataDir: '/home/felipe/wppconect/tokens/new-session'
    }
  })
  .then((client) => start(client))
  .catch((error) => console.log('Error creating client:', error));

// Função para iniciar o processamento de mensagens
function start(client) {
  console.log('Starting message listener');
  client.onMessage((message) => {
    console.log('Message received:', message);

    const responses = {
      'Hello': 'Oi, como você está?',
      'Hi': 'Olá! Precisa de alguma ajuda?',
      'Good morning': 'Bom dia! Como posso ajudar?',
      'Good night': 'Boa noite! Durma bem!',
      'How are you?': 'Estou bem, obrigado por perguntar! E você?',
      'What is your name?': 'Eu sou um bot criado com wppconnect.',
      'Bye': 'Até logo! Tenha um ótimo dia!'
    };

    const response = responses[message.body];
    const contactName = message.sender.pushname || 'Unknown';
    const contactNumber = message.from;
    const whatsappId = message.id;
    const messageText = message.body;
    const timestamp = new Date(); // Armazena a data e hora da mensagem

    // Inserir dados do contato no banco de dados
    clientDB.query(
      'INSERT INTO contacts (name, phone_number, whatsapp_id) VALUES ($1, $2, $3) ON CONFLICT (whatsapp_id) DO NOTHING',
      [contactName, contactNumber, whatsappId],
      (err, res) => {
        if (err) {
          console.error('Error saving contact:', err);
        } else {
          console.log(`Contact saved: ${contactName} (${contactNumber})`);
        }
      }
    );

    // Inserir mensagem no banco de dados
    clientDB.query(
      'INSERT INTO messages (from_user, message_text, "timestamp", contact_name, contact_number, whatsapp_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [contactNumber, messageText, timestamp, contactName, contactNumber, whatsappId],
      (err, res) => {
        if (err) {
          console.error('Error saving message:', err);
        } else {
          console.log(`Message saved from ${contactNumber}: ${messageText}`);
        }
      }
    );

    // Verifica e envia imagem para a mensagem "eai"
    if (message.body.toLowerCase() === 'eai') {
      const imagePath = path.resolve(__dirname, 'public/foto.png'); // Caminho para a imagem
      const caption = 'Aqui está uma imagem para você!';
      
      client.sendImage(message.from, imagePath, 'foto.png', caption)
        .then((result) => {
          console.log(`Image sent to ${message.from}`);
          console.log('Result:', result);
        })
        .catch((error) => {
          console.error(`Error when sending image to ${message.from}:`, error);
        });
    } else if (message.body.toLowerCase() === 'video') {
      const videoPath = path.resolve(__dirname, 'public/video.mp4'); // Exemplo de caminho para vídeo
      client.sendFile(message.from, videoPath, 'video.mp4', 'Aqui está um vídeo para você!')
        .then((result) => {
          console.log(`Video sent to ${message.from}`);
          console.log('Result:', result);
        })
        .catch((error) => {
          console.error(`Error when sending video to ${message.from}:`, error);
        });
    } else if (message.body.toLowerCase() === 'audio') {
      const audioPath = path.resolve(__dirname, 'public/audio.ogg'); // Exemplo de caminho para áudio
      client.sendFile(message.from, audioPath, 'audio.mp3', 'Aqui está um áudio para você!')
        .then((result) => {
          console.log(`Audio sent to ${message.from}`);
          console.log('Result:', result);
        })
        .catch((error) => {
          console.error(`Error when sending audio to ${message.from}:`, error);
        });
    } else if (message.body.toLowerCase() === 'enviar documento') {
      const docPath = path.resolve(__dirname, 'public/Procuração.docx'); // Caminho para o documento
      client.sendFile(message.from, docPath, 'Procuração.docx', 'Aqui está o documento que você pediu!')
        .then((result) => {
          console.log(`Document sent to ${message.from}`);
          console.log('Result:', result);
        })
        .catch((error) => {
          console.error(`Error when sending document to ${message.from}:`, error);
        });
    } else if (response) {
      // Enviar uma mensagem de texto se for uma resposta padrão
      client
        .sendText(message.from, response)
        .then((result) => {
          console.log(`Message sent to ${message.from}: ${response}`);
          console.log('Result:', result);
        })
        .catch((error) => {
          console.error(`Error when sending to ${message.from}:`, error);
        });
    } else {
      console.log(`Received unknown message from ${message.from}: ${message.body}`);
    }
  });
}

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
  client.onMessage(async (message) => {
    console.log('Message received:', message);

    const responses = {
      'Hello': 'Oi, como você está?',
      'Hi': 'Olá! Precisa de alguma ajuda sua linda?',
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

    switch (message.type) {
      case 'image':
        const imagePath = path.join(__dirname, '/wppconect/public/foto.png');
        client
          .sendImage(message.from, imagePath, 'Image Caption', 'Here is an image for you!')
          .then((result) => {
            console.log(`Image sent to ${message.from}`);
            console.log('Result:', result);
          })
          .catch((error) => {
            console.error(`Error sending image to ${message.from}:`, error);
          });
        break;
      case 'video':
        const videoPath = path.join(__dirname, '/wppconect/public/video.mp4');
        client
          .sendVideo(message.from, videoPath, 'Video Caption', 'Here is a video for you!')
          .then((result) => {
            console.log(`Video sent to ${message.from}`);
            console.log('Result:', result);
          })
          .catch((error) => {
            console.error(`Error sending video to ${message.from}:`, error);
          });
        break;
      case 'audio':
        const audioPath = path.join(__dirname, 'path/to/your/audio.mp3');
        client
          .sendAudio(message.from, audioPath, 'Audio Caption', 'Here is an audio message for you!')
          .then((result) => {
            console.log(`Audio sent to ${message.from}`);
            console.log('Result:', result);
          })
          .catch((error) => {
            console.error(`Error sending audio to ${message.from}:`, error);
          });
        break;
      case 'document':
        const filePath = path.join(__dirname, '/wppconect/public/Procuração.docx');
        client
          .sendFile(message.from, filePath, 'Document Caption', 'Here is a document for you!')
          .then((result) => {
            console.log(`Document sent to ${message.from}`);
            console.log('Result:', result);
          })
          .catch((error) => {
            console.error(`Error sending document to ${message.from}:`, error);
          });
        break;
      default:
        if (response) {
          // Enviar resposta de texto
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
        break;
    }
  });
}
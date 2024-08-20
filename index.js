const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect
  .create()
  .then((client) => start(client))
  .catch((error) => console.log('Error creating client:', error));

function start(client) {
  client.onMessage((message) => {
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

    if (response) {
      client
        .sendText(message.from, response)
        .then((result) => {
          console.log(`Message sent to ${message.from}: ${response}`);
          console.log('Result:', result); //return object success
        })
        .catch((error) => {
          console.error(`Error when sending to ${message.from}:`, error); //return object error
        });
    } else {
      console.log(`Received unknown message from ${message.from}: ${message.body}`);
    }
  });
}

// imports
const express = require('express'); // Import the express framework
const app = express(); // Create a new instance of the express app
const PORT = 4000; // Set the port number

// setup http server
const http = require('http').Server(app); // Create a new HTTP server using the express app
const cors = require('cors'); // Import the cors middleware

app.use(cors()); // Use the cors middleware to enable Cross-Origin Resource Sharing (CORS)

const socketIO = require('socket.io')(http, { // Create a new socket.io instance using the HTTP server
  cors: {
    origin: "http://localhost:3000" // Configure the origin of the requests that will be allowed to connect to the socket.io server
  }
});

// listener for connection to socket server
let users = []; // Create an empty array to store the users
let cards_user_1 = []; // Create an empty array to store user 1 cards
let cards_user_2 = []; // Create an empty array to store user 2 cards



// Physicist list
let Physicist = [
  {
    name: "Albert Einstein",
    photo: `https://cms-api.galileo.tv/app/uploads/2019/11/91370791.jpg`,
    birth: 1,
    iq: 1,
    awards: 1,
    influence: 1,
    assets: 1,
    wiki: 1,
  },
  {
    name: "Isaac Newton",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sir_Isaac_Newton_by_Sir_Godfrey_Kneller%2C_Bt.jpg/250px-Sir_Isaac_Newton_by_Sir_Godfrey_Kneller%2C_Bt.jpg`,
    birth: 2,
    iq: 2,
    awards: 2,
    influence: 2,
    assets: 2,
    wiki: 2,
  },
  {
    name: "Max Planck",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Max_Planck_%281858-1947%29.jpg/220px-Max_Planck_%281858-1947%29.jpg`,
    birth: 3,
    iq: 3,
    awards: 3,
    influence: 3,
    assets: 3,
    wiki: 3,
  },
  {
    name: "Erwin Schrödinger",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Erwin_Schr%C3%B6dinger_%281933%29.jpg/220px-Erwin_Schr%C3%B6dinger_%281933%29.jpg`,
    birth: 4,
    iq: 4,
    awards: 4,
    influence: 4,
    assets: 4,
    wiki: 4,
  }
];

function randomPhysicistsSplit(list) {

  // Shuffle the list randomly
  let shuffledList = list.sort(() => Math.random() - 0.5);

  // Split the list into two equally sized halves
  let halfSize = Math.floor(list.length / 2);
  cards_user_1 = shuffledList.slice(0, halfSize);
  cards_user_2 = shuffledList.slice(halfSize);

  return [cards_user_1, cards_user_2];
}

socketIO.on('connection', (socket) => { // Add a listener for the 'connection' event on the socket.io server
  console.log(`⚡: ${socket.id} user just connected!`); // Log a message when a new user connects to the server
  socket.on('message', (data) => { // Add a listener for the 'message' event on the socket
    socketIO.emit('messageResponse', data); // Broadcast the received message to all connected clients
  });

  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data)); // Add a listener for the 'typing' event on the socket and broadcast it to all connected clients except the sender

  socket.on('newUser', (data) => { // Add a listener for the 'newUser' event on the socket
    users.push(data); // Add the new user to the array of users
    socketIO.emit('newUserResponse', users); // Broadcast the updated array of users to all connected clients

    if (users.length === 1) {
      console.log('⬆️: Players; 0 -> 1');
      randomPhysicistsSplit(Physicist);

    } else if (users.length === 2) {
      console.log('⬆️: Players: 1 -> 2');
      startGame();
    }

  });

  socket.on('first-user', () => {
    socket.emit('send_first-user', cards_user_1);
  });

  socket.on('second-user', () => {
    socket.emit('send_second-user', cards_user_2);
  });

  socket.on('disconnect', () => { // Add a listener for the 'disconnect' event on the socket
    console.log('🔥: A user disconnected'); // Log a message when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id); // Remove the disconnected user from the array of users
    socketIO.emit('newUserResponse', users); // Broadcast the updated array of users to all connected clients
    socket.disconnect(); // Disconnect the socket
  });

});

// test return for api
app.get('/api', (req, res) => { // Add a listener for the GET request to the '/api' endpoint
  res.json({ // Return a JSON response
    message: 'Hello World', // Return a simple message
  });
});


function startGame() {
  console.log('🚀 Game started');
}

// set port for server and create server
http.listen(PORT, () => { // Set the HTTP server to listen on the specified port
  console.log(`Server listening on ${PORT}`); // Log a message when the server starts listening
});

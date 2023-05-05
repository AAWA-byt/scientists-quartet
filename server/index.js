// imports
const express = require('express'); // Import the express framework
const app = express(); // Create a new instance of the express app
const PORT = 4000; // Set the port number

// setup http server
const http = require('http').Server(app); // Create a new HTTP server using the express app
const cors = require('cors'); // Import the cors middleware

app.use(cors()); // Use the cors middleware to enable Cross-Origin Resource Sharing (CORS)

const socketIO = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000" // Configure the origin of the requests that will be allowed to connect to the socket.io server
  }
});

// listener for connection to socket server
let users = []; // Create an empty array to store the users
let cards_user_1 = []; // Create an empty array to store user 1 cards
let cards_user_2 = []; // Create an empty array to store user 2 cards
let player_active = [];

// Physicist list
let Physicist = [
  {
    name: "Albert Einstein",
    photo: `https://cms-api.galileo.tv/app/uploads/2019/11/91370791.jpg`,
    birth: 1879,
    iq: 160,
    awards: 42,
    influence: 10,
    assets: 31000000,
    wiki:  159389,
  },
  {
    name: "Sir Isaac Newton",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sir_Isaac_Newton_by_Sir_Godfrey_Kneller%2C_Bt.jpg/250px-Sir_Isaac_Newton_by_Sir_Godfrey_Kneller%2C_Bt.jpg`,
    birth: 1642,
    iq: 190,
    awards: 19,
    influence: 9,
    assets: 5000000,
    wiki: 61533,
  },
  {
    name: "Max Planck",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Max_Planck_%281858-1947%29.jpg/220px-Max_Planck_%281858-1947%29.jpg`,
    birth: 1858,
    iq: 185,
    awards: 29,
    influence: 9,
    assets: 800000,
    wiki: 879777,
  },
  {
    name: "Erwin Schrödinger",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Erwin_Schr%C3%B6dinger_%281933%29.jpg/220px-Erwin_Schr%C3%B6dinger_%281933%29.jpg`,
    birth: 1887,
    iq: 190,
    awards: 16,
    influence: 8,
    assets: 215000,
    wiki: 30266,
  }
];

/*
  @description Shuffles and splits the Physicist array into two equally sized halves.
  @param {Array} list The array to be shuffled and split.
  @returns {Array} The shuffled and split array.
*/

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

  // Add a listener for the 'message' event on the socket and broadcast the received message to all connected clients
  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data);
  });

  // Add a listener for the 'typing' event on the socket and broadcast it to all connected clients except the sender
  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

  // Add a listener for the 'newUser' event on the socket and update the array of users
  socket.on('newUser', (data) => {
    users.push(data);
    socketIO.emit('newUserResponse', users);

    // If there is only one user, split the Physicist array randomly
    if (users.length === 1) {
      console.log('⬆️: Players; 0 -> 1');
      // users[0] = player_active;
      randomPhysicistsSplit(Physicist);

      // If there are two users, start the game
    } else if (users.length === 2) {
      console.log('⬆️: Players: 1 -> 2');
      // users[1] = player_waiting;
      startGame();
    }

  });

  // Add a listener for the 'first-user' event on the socket and send the first user's cards to them
  socket.on('first-user', () => {
    socket.emit('send_first-user', cards_user_1);
  });

  // Add a listener for the 'second-user' event on the socket and send the second user's cards to them
  socket.on('second-user', () => {
    socket.emit('send_second-user', cards_user_2);
  });

  // Add a listener for the 'disconnect' event on the socket and remove the disconnected user from the array of users
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });

});

// Add a listener for the GET request to the '/api' endpoint and return a simple message
app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World',
  });
});

// Function to start the game
function startGame() {
  console.log('🚀 Game started');
  console.log("Players list:");
  console.log(users);
  player_active = users[0];
  socketIO.emit('player-active', player_active);
  console.log("Active player:");
  console.log(player_active);

}

// Set the HTTP server to listen on the specified port and log a message when the server starts listening
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

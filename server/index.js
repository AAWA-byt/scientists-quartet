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

socketIO.on('connection', (socket) => { // Add a listener for the 'connection' event on the socket.io server
  console.log(`⚡: ${ socket.id } user just connected!`); // Log a message when a new user connects to the server
  socket.on('message', (data) => { // Add a listener for the 'message' event on the socket
    socketIO.emit('messageResponse', data); // Broadcast the received message to all connected clients
  });

  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data)); // Add a listener for the 'typing' event on the socket and broadcast it to all connected clients except the sender

  socket.on('newUser', (data) => { // Add a listener for the 'newUser' event on the socket
    users.push(data); // Add the new user to the array of users
    socketIO.emit('newUserResponse', users); // Broadcast the updated array of users to all connected clients
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

// set port for server and create server
http.listen(PORT, () => { // Set the HTTP server to listen on the specified port
  console.log(`Server listening on ${ PORT }`); // Log a message when the server starts listening
});

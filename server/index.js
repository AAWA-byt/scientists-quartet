// imports
const express = require('express');
const app = express();
const PORT = 4000;

// setup http server
const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());

// setup socket.io 
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

// listener for connection to socket server
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });
});

// test return for api
app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

// set port for server and create server
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

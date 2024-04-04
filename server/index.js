// imports
const express = require('express'); // Import the express framework
const app = express(); // Create a new instance of the express app
const PORT = 4000; // Set the port number
const fs = require('fs'); // Import fs package
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')); // import origin data from config.json
const cards = JSON.parse(fs.readFileSync('./components/Cards.json', 'utf-8')); // import cards data from Cards.json

// setup http server
const http = require('http').Server(app); // Create a new HTTP server using the express app
const cors = require('cors'); // Import the cors middleware

app.use(cors()); // Use the cors middleware to enable Cross-Origin Resource Sharing (CORS)

const socketIO = require('socket.io')(http, {
  cors: {
    origin: config.origin // Configure the origin of the requests that will be allowed to connect to the socket.io server
  }
});

let users = []; // Create an empty array to store the users
let cards_user_1 = []; // Create an empty array to store user 1 cards
let cards_user_2 = []; // Create an empty array to store user 2 cards
let cards_user_3 = []; // Create an empty array to store user 2 cards
let cards_user_4 = []; // Create an empty array to store user 2 cards
let player_active = []; // Create an empty array to store active user
let cards_draw = []; // Create an empty array to store draw cards
let game_status = []; // Create an empty array to store game status

// Physicist list
let Physicist = cards;

// Array for player that lost
let game_lost = [
  {
    name: "x",
    photo: `https://sd.keepcalms.com/i-w600/keep-calm-even-though-you-lost-the-game.jpg`,
    birth: 0,
    age: 0,
    iq: 0,
    h_index: 0,
    influence: 0,
    wiki: 0,
  }];

// Array for player that lost
let game_won = [
  {
    name: "x",
    photo: `https://sd.keepcalms.com/i/keep-calm-game-over-we-win.png`,
    birth: 0,
    age: 0,
    iq: 0,
    h_index: 0,
    influence: 0,
    wiki: 0,
  }];

// Array for player that lost
let game_draw = [
  {
    name: "x",
    photo: `https://sd.keepcalms.com/i-w600/keep-calm-it-s-a-tie-game.jpg`,
    birth: 0,
    age: 0,
    iq: 0,
    h_index: 0,
    influence: 0,
    wiki: 0,
  }];

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
      randomPhysicistsSplit(Physicist);
      game_status = "Waiting..";
      socketIO.emit('new_GameStatus', game_status);

      // If there are two users, start the game and update game status
    } else if (users.length === 2) {
      console.log('⬆️: Players: 1 -> 2');
      startGame();
      game_status = "Active";
      socketIO.emit('new_GameStatus', game_status);
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


  // GAME STATES FUNCTIONS

  // NEW MOVE: Birth 
  socket.on('NewMove_birth', () => {
    // check if active player is first user in user list
    if (player_active === users[0]) {
      // check if choosen value from user 1 card wins over value from user 2 (previous year wins)
      if (cards_user_1[0].birth < cards_user_2[0].birth) {

        // check is there are draw cards and give them to user 1
        if (cards_draw != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (previous year wins)  
      } else if (cards_user_1[0].birth > cards_user_2[0].birth) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[1];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].birth === cards_user_2[0].birth) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }

      // check if active player is second user in user list 
    } else if (player_active === users[1]) {
      // check if choosen value from user 1 card wins over value from user 2 (previous year wins)
      if (cards_user_1[0].birth < cards_user_2[0].birth) {

        // check is there are draw cards and give them to user 1
        if (cards_draw.length != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[0];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (previous year wins)  
      } else if (cards_user_1[0].birth > cards_user_2[0].birth) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);


        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].birth === cards_user_2[0].birth) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }

    }

  });

  // NEW MOVE: AGE 
  socket.on('NewMove_age', () => {
    // check if active player is first user in user list
    if (player_active === users[0]) {
      // check if choosen value from user 1 card wins over value from user 2 (higher value wins)
      if (cards_user_1[0].age > cards_user_2[0].age) {

        // check is there are draw cards and give them to user 1
        if (cards_draw != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (higher value wins)  
      } else if (cards_user_1[0].age < cards_user_2[0].age) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[1];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].age === cards_user_2[0].age) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }

      // check if active player is second user in user list 
    } else if (player_active === users[1]) {
      // check if choosen value from user 1 card wins over value from user 2 (previous year wins)
      if (cards_user_1[0].age > cards_user_2[0].age) {

        // check is there are draw cards and give them to user 1
        if (cards_draw.length != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[0];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (previous year wins)  
      } else if (cards_user_1[0].age < cards_user_2[0].age) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);


        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].age === cards_user_2[0].age) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }
    }

  });

  // NEW MOVE: IQ 
  socket.on('NewMove_iq', () => {
    // check if active player is first user in user list
    if (player_active === users[0]) {
      // check if choosen value from user 1 card wins over value from user 2 (higher value wins)
      if (cards_user_1[0].iq > cards_user_2[0].iq) {

        // check is there are draw cards and give them to user 1
        if (cards_draw != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (higher value wins)  
      } else if (cards_user_1[0].iq < cards_user_2[0].iq) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[1];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].iq === cards_user_2[0].iq) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }

      // check if active player is second user in user list 
    } else if (player_active === users[1]) {
      // check if choosen value from user 1 card wins over value from user 2 (previous year wins)
      if (cards_user_1[0].iq > cards_user_2[0].iq) {

        // check is there are draw cards and give them to user 1
        if (cards_draw.length != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[0];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (previous year wins)  
      } else if (cards_user_1[0].iq < cards_user_2[0].iq) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);


        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].iq === cards_user_2[0].iq) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }
    }

  });

  // NEW MOVE: H-Index 
  socket.on('NewMove_hindex', () => {
    // check if active player is first user in user list
    if (player_active === users[0]) {
      // check if choosen value from user 1 card wins over value from user 2 (higher value wins)
      if (cards_user_1[0].h_index > cards_user_2[0].h_index) {

        // check is there are draw cards and give them to user 1
        if (cards_draw != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (higher value wins)  
      } else if (cards_user_1[0].h_index < cards_user_2[0].h_index) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[1];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].h_index === cards_user_2[0].h_index) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }

      // check if active player is second user in user list 
    } else if (player_active === users[1]) {
      // check if choosen value from user 1 card wins over value from user 2 (previous year wins)
      if (cards_user_1[0].h_index > cards_user_2[0].h_index) {

        // check is there are draw cards and give them to user 1
        if (cards_draw.length != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[0];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (previous year wins)  
      } else if (cards_user_1[0].h_index < cards_user_2[0].h_index) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);


        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].h_index === cards_user_2[0].h_index) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }
    }

  });

  // NEW MOVE: Influence 
  socket.on('NewMove_influence', () => {
    // check if active player is first user in user list
    if (player_active === users[0]) {
      // check if choosen value from user 1 card wins over value from user 2 (higher value wins)
      if (cards_user_1[0].influence > cards_user_2[0].influence) {

        // check is there are draw cards and give them to user 1
        if (cards_draw != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (higher value wins)  
      } else if (cards_user_1[0].influence < cards_user_2[0].influence) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[1];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].influence === cards_user_2[0].influence) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }

      // check if active player is second user in user list 
    } else if (player_active === users[1]) {
      // check if choosen value from user 1 card wins over value from user 2 (previous year wins)
      if (cards_user_1[0].influence > cards_user_2[0].influence) {

        // check is there are draw cards and give them to user 1
        if (cards_draw.length != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[0];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (previous year wins)  
      } else if (cards_user_1[0].influence < cards_user_2[0].influence) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);


        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].influence === cards_user_2[0].influence) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }
    }

  });

  // NEW MOVE: WikiFactor 
  socket.on('NewMove_wiki', () => {
    // check if active player is first user in user list
    if (player_active === users[0]) {
      // check if choosen value from user 1 card wins over value from user 2 (higher value wins)
      if (cards_user_1[0].wiki > cards_user_2[0].wiki) {

        // check is there are draw cards and give them to user 1
        if (cards_draw != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (higher value wins)  
      } else if (cards_user_1[0].wiki < cards_user_2[0].wiki) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[1];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].wiki === cards_user_2[0].wiki) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }

      // check if active player is second user in user list 
    } else if (player_active === users[1]) {
      // check if choosen value from user 1 card wins over value from user 2 (previous year wins)
      if (cards_user_1[0].wiki > cards_user_2[0].wiki) {

        // check is there are draw cards and give them to user 1
        if (cards_draw.length != 0) {
          cards_user_1 = cards_user_1.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds the won card to the end of the array
        cards_user_1.push(cards_user_2[0]);

        // removes the lost card from user 2
        cards_user_2.shift();

        // Appends the first element of the array back to the end of the array from user 1
        let used_card = cards_user_1.shift();
        cards_user_1.push(used_card);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        // Update Active User list
        player_active = users[0];
        socketIO.emit('player-active', player_active);

        checkWin();

        // check if choosen value from user 1 card loses over value from user 2 (previous year wins)  
      } else if (cards_user_1[0].wiki < cards_user_2[0].wiki) {

        // check is there are draw cards and give them to user 2
        if (cards_draw.length != 0) {
          cards_user_2 = cards_user_2.concat(cards_draw);
          cards_draw.length = 0;
        }

        // Adds lost card to user 2 array
        cards_user_2.push(cards_user_1[0]);

        // Removes the lost card from user 1
        cards_user_1.shift();

        // Appends the first element of the array back to the end of the array from user 2
        let used_card = cards_user_2.shift();
        cards_user_2.push(used_card);


        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

        // check if a draw is made
      } else if (cards_user_1[0].wiki === cards_user_2[0].wiki) {
        // if a draw is made start a tie-break

        // Remove used cards from players
        //user 1
        let used_card_user1 = cards_user_1.shift();
        cards_draw.push(used_card_user1);
        // user 2 
        let used_card_user2 = cards_user_2.shift();
        cards_draw.push(used_card_user2);

        // update the new card decks for both users
        socketIO.emit('send_first-user', cards_user_1);
        socketIO.emit('send_second-user', cards_user_2);

        checkWin();

      }
    }

  });

});

// Add a listener for the GET request to the '/api' endpoint and return a simple message
app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World',
  });
});

// Add a listener for the GET request to the '/api/cards' endpoint and return "Physicist"
app.get('/api/cards', (req, res) => {
  res.json({
    Physicist
  })
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

// Function to check if a player has won
function checkWin() {
  // check if user 1 wins
  if (cards_user_1.length > 0 && cards_user_2.length < 1) {
    // Set Photos for winner and loser
    cards_user_2 = game_lost;
    cards_user_1 = game_won;
    // Update Game status
    game_status = "Game Over!";

    // Send everything to the clients
    socketIO.emit('send_first-user', cards_user_1);
    socketIO.emit('send_second-user', cards_user_2);
    socketIO.emit('new_GameStatus', game_status);

    console.log("Game Over!");

    // check if user 2 wins
  } else if (cards_user_2.length > 0 && cards_user_1.length < 1) {
    // Set Photos for winner and loser
    cards_user_1 = game_lost;
    cards_user_2 = game_won;
    // Update Game status
    game_status = "Game Over!";

    socketIO.emit('send_first-user', cards_user_1);
    socketIO.emit('send_second-user', cards_user_2);
    socketIO.emit('new_GameStatus', game_status);

    console.log("Game Over!");

    // check if it is a draw
  } else if (cards_user_1.length < 1 && cards_user_2.length < 1) {
    // Set Photos for winner and loser
    cards_user_1 = game_draw;
    cards_user_2 = game_draw;
    // Update Game status
    game_status = "Game Over!";


    socketIO.emit('send_first-user', cards_user_1);
    socketIO.emit('send_second-user', cards_user_2);
    socketIO.emit('new_GameStatus', game_status);

    console.log("Game Over!");

  }
}

// Set the HTTP server to listen on the specified port and log a message when the server starts listening
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  console.log(`Cards in total: ${Physicist.length}`);
});

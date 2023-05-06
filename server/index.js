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

let users = []; // Create an empty array to store the users
let cards_user_1 = []; // Create an empty array to store user 1 cards
let cards_user_2 = []; // Create an empty array to store user 2 cards
let player_active = []; // Create an empty array to store active user
let cards_draw = []; // Create an empty array to store draw cards

// Physicist list
let Physicist = [
  {
    name: "Albert Einstein",
    photo: `https://cms-api.galileo.tv/app/uploads/2019/11/91370791.jpg`,
    birth: 1879,
    age: 76,
    iq: 160,
    h_index: 62,
    influence: 95,
    wiki: 159389,
  },
  {
    name: "Sir Isaac Newton",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sir_Isaac_Newton_by_Sir_Godfrey_Kneller%2C_Bt.jpg/250px-Sir_Isaac_Newton_by_Sir_Godfrey_Kneller%2C_Bt.jpg`,
    birth: 1643,
    age: 84,
    iq: 190,
    h_index: 0,
    influence: 85,
    wiki: 61533,
  },
  {
    name: "Max Planck",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Max_Planck_%281858-1947%29.jpg/220px-Max_Planck_%281858-1947%29.jpg`,
    birth: 1858,
    age: 89,
    iq: 160,
    h_index: 127,
    influence: 90,
    wiki: 87996,
  },
  {
    name: "Erwin Schrödinger",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Erwin_Schr%C3%B6dinger_%281933%29.jpg/220px-Erwin_Schr%C3%B6dinger_%281933%29.jpg`,
    birth: 1887,
    age: 73,
    iq: 140,
    h_index: 73,
    influence: 85,
    wiki: 30266,
  },
  {
    name: "Marie Curie",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Marie_Curie_%28Nobel-Chem%29.jpg/220px-Marie_Curie_%28Nobel-Chem%29.jpg`,
    birth: 1867,
    age: 66,
    iq: 175,
    h_index: 58,
    influence: 92,
    wiki: 82640,
  },
  {
    name: "Ada Lovelace",
    photo: `https://mujeresconciencia.com/app/uploads/2021/06/Ada_Lovelace_portrait_circa_1840.jpg`,
    birth: 1815,
    age: 36,
    iq: 150,
    h_index: 0,
    influence: 90,
    wiki: 36018,
  },
  {
    name: "Alan Turin",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Alan_Turing_az_1930-as_%C3%A9vekben.jpg/220px-Alan_Turing_az_1930-as_%C3%A9vekben.jpg`,
    birth: 1912,
    age: 37,
    iq: 185,
    h_index: 27,
    influence: 99,
    wiki: 57152,
  },
  {
    name: "Rosalind Franklin",
    photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Rosalind_Franklin_%28retouched%29.jpg/220px-Rosalind_Franklin_%28retouched%29.jpg`,
    birth: 1920,
    age: 41,
    iq: 175,
    h_index: 0,
    influence: 96,
    wiki: 63395,
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

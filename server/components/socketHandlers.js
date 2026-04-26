const {
  MOVES,
  createGame,
  dealCards,
  startGame,
  resolveMove,
  checkWin,
} = require('./gameLogic');

function broadcastHands(io, game) {
  io.emit('send_first-user', game.cards1);
  io.emit('send_second-user', game.cards2);
}

function registerHandlers(io, allCards) {
  const game = createGame();

  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('message', (data) => io.emit('messageResponse', data));
    socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

    socket.on('newUser', (data) => {
      game.users.push(data);
      io.emit('newUserResponse', game.users);

      if (game.users.length === 1) {
        console.log('⬆️: Players; 0 -> 1');
        dealCards(game, allCards);
        game.status = 'Waiting..';
        io.emit('new_GameStatus', game.status);
      } else if (game.users.length === 2) {
        console.log('⬆️: Players: 1 -> 2');
        startGame(game);
        console.log('🚀 Game started');
        console.log('Players list:');
        console.log(game.users);
        console.log('Active player:');
        console.log(game.activePlayer);
        io.emit('player-active', game.activePlayer);
        io.emit('new_GameStatus', game.status);
      }
    });

    socket.on('first-user', () => socket.emit('send_first-user', game.cards1));
    socket.on('second-user', () => socket.emit('send_second-user', game.cards2));

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      game.users = game.users.filter((user) => user.socketID !== socket.id);
      io.emit('newUserResponse', game.users);
      socket.disconnect();
    });

    MOVES.forEach(({ event, attribute, direction }) => {
      socket.on(event, () => {
        const previousActive = game.activePlayer;
        resolveMove(game, attribute, direction);
        broadcastHands(io, game);
        if (game.activePlayer !== previousActive) {
          io.emit('player-active', game.activePlayer);
        }
        if (checkWin(game)) {
          broadcastHands(io, game);
          io.emit('new_GameStatus', game.status);
          console.log('Game Over!');
        }
      });
    });
  });
}

module.exports = { registerHandlers };

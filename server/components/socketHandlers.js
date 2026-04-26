const {
  MOVES,
  STATUS,
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

function resetForRejoin(game, allCards) {
  dealCards(game, allCards);
  game.activePlayer = null;
  game.status = game.users.length === 1 ? STATUS.WAITING : STATUS.IDLE;
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
        game.status = STATUS.WAITING;
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
      const wasActive = game.status === STATUS.ACTIVE;
      game.users = game.users.filter((user) => user.socketID !== socket.id);
      io.emit('newUserResponse', game.users);

      if (wasActive && game.users.length < 2) {
        resetForRejoin(game, allCards);
        broadcastHands(io, game);
        io.emit('player-active', game.activePlayer);
        io.emit('new_GameStatus', game.status);
        console.log('♻️: Game reset after mid-game disconnect');
      }
    });

    MOVES.forEach(({ event, attribute, direction }) => {
      socket.on(event, () => {
        // Reject moves from anyone but the active player.
        if (!game.activePlayer || socket.id !== game.activePlayer.socketID) {
          return;
        }
        if (game.status !== STATUS.ACTIVE) {
          return;
        }

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

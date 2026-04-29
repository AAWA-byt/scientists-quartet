const {
  MOVES,
  STATUS,
  createGame,
  dealCards,
  startGame,
  resolveMove,
  checkWin,
} = require('./gameLogic');

const MAX_PLAYERS = 2;

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
      // Reject silently if game is already full or this socket is already a player.
      if (game.users.length >= MAX_PLAYERS) {
        socket.emit('newUser-rejected', { reason: 'full' });
        return;
      }
      if (game.users.some((u) => u.socketID === socket.id)) {
        return;
      }

      const userName = typeof data?.userName === 'string' ? data.userName : 'anon';
      // Server-controlled identity: never trust client-supplied socketID.
      const user = { userName, socketID: socket.id };
      game.users.push(user);

      const role = String(game.users.length); // '1' or '2'
      socket.emit('role-assigned', { role });

      io.emit('newUserResponse', game.users);

      if (game.users.length === 1) {
        console.log('⬆️: Players; 0 -> 1');
        dealCards(game, allCards);
        game.status = STATUS.WAITING;
        io.emit('new_GameStatus', game.status);
      } else if (game.users.length === MAX_PLAYERS) {
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

    function ensureAuthorisedFor(role) {
      const expected = game.users[role === '1' ? 0 : 1];
      return expected && expected.socketID === socket.id;
    }

    socket.on('first-user', () => {
      if (!ensureAuthorisedFor('1')) return;
      socket.emit('send_first-user', game.cards1);
    });
    socket.on('second-user', () => {
      if (!ensureAuthorisedFor('2')) return;
      socket.emit('send_second-user', game.cards2);
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      const wasPlayer = game.users.some((u) => u.socketID === socket.id);
      game.users = game.users.filter((user) => user.socketID !== socket.id);
      io.emit('newUserResponse', game.users);

      // Reset deck whenever a player leaves and we drop below the threshold,
      // so a returning player doesn't inherit a finished or partial game.
      if (wasPlayer && game.users.length < MAX_PLAYERS) {
        resetForRejoin(game, allCards);
        broadcastHands(io, game);
        io.emit('player-active', game.activePlayer);
        io.emit('new_GameStatus', game.status);
        console.log('♻️: Game reset after player left');
      }
    });

    MOVES.forEach(({ event, attribute, direction }) => {
      socket.on(event, () => {
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

module.exports = { registerHandlers, MAX_PLAYERS };

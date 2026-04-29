import { useEffect, useState } from 'react';

// Subscribes to all game-related socket events and exposes derived state.
// userID is now assigned by the server (see Home.js + role-assigned event)
// and persisted in localStorage; this hook just reads it.
export function useGameSocket(socket) {
  const [users, setUsers] = useState([]);
  const [cards1, setCards1] = useState([]);
  const [cards2, setCards2] = useState([]);
  const [playerActive, setPlayerActive] = useState({});
  const [gameStatus, setGameStatus] = useState('');
  const userID = localStorage.getItem('userID');

  useEffect(() => {
    const handlers = {
      newUserResponse: setUsers,
      'player-active': setPlayerActive,
      'send_first-user': setCards1,
      'send_second-user': setCards2,
      new_GameStatus: setGameStatus,
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    if (userID === '1') socket.emit('first-user');
    else if (userID === '2') socket.emit('second-user');

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
    };
  }, [socket, userID]);

  const myCards = userID === '2' ? cards2 : cards1;

  return { users, myCards, playerActive, gameStatus };
}

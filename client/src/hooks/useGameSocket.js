import { useEffect, useState } from 'react';

// Subscribes to all game-related socket events and exposes derived state.
// `myCards` is selected based on the userID stored in localStorage.
export function useGameSocket(socket) {
  const [users, setUsers] = useState([]);
  const [cards1, setCards1] = useState([]);
  const [cards2, setCards2] = useState([]);
  const [playerActive, setPlayerActive] = useState({});
  const [gameStatus, setGameStatus] = useState('');

  useEffect(() => {
    socket.emit('first-user');

    const handlers = {
      newUserResponse: setUsers,
      'player-active': setPlayerActive,
      'send_first-user': setCards1,
      'send_second-user': setCards2,
      new_GameStatus: setGameStatus,
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
    };
  }, [socket]);

  useEffect(() => {
    if (users.length === 1 && !localStorage.getItem('userID')) {
      localStorage.setItem('userID', '1');
      socket.emit('first-user');
    } else if (users.length === 2 && !localStorage.getItem('userID')) {
      localStorage.setItem('userID', '2');
      socket.emit('second-user');
    }
  }, [socket, users]);

  const myCards = localStorage.getItem('userID') === '2' ? cards2 : cards1;

  return { users, myCards, playerActive, gameStatus };
}

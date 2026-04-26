import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import { STATUS } from '../constants/gameStatus';

// Stat IDs match the original markup; see git history for the typos
// (`stats_influence` for h-index, `stats_assets` for influence) — preserved
// to keep this refactor purely structural.
const STATS = [
  { event: 'NewMove_birth',     key: 'birth',     label: 'Birth',      icon: '👶', statsId: 'stats_birth',     btnId: 'btn_birth' },
  { event: 'NewMove_age',       key: 'age',       label: 'Age',        icon: '🕰️', statsId: 'stats_age',       btnId: 'btn_age' },
  { event: 'NewMove_iq',        key: 'iq',        label: 'IQ',         icon: '🧠', statsId: 'stats_iq',        btnId: 'btn_iq', prefix: '~ ' },
  { event: 'NewMove_hindex',    key: 'h_index',   label: 'H-Index',    icon: '👑', statsId: 'stats_influence', btnId: 'btn_hindex' },
  { event: 'NewMove_influence', key: 'influence', label: 'Influence',  icon: '🌟', statsId: 'stats_assets',    btnId: 'btn_influence' },
  { event: 'NewMove_wiki',      key: 'wiki',      label: 'Wikifactor', icon: '📚', statsId: 'stats_wiki',      btnId: 'btn_wiki' },
];

const NOTICE_TIMEOUT_MS = 2500;

const Cards = ({ socket }) => {
  const { users, myCards, playerActive, gameStatus } = useGameSocket(socket);
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const topCard = myCards[0];

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(''), NOTICE_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [notice]);

  const handleLeaveGame = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userID');
    navigate('/');
    window.location.reload();
  };

  const handleMove = (event) => {
    if (gameStatus === STATUS.GAME_OVER) {
      setNotice('The game is over.');
      return;
    }
    if (playerActive.userName !== localStorage.getItem('userName')) {
      setNotice('It is not your turn! Please wait.');
      return;
    }
    socket.emit(event);
  };

  return (
    <>
      <div className="cards__sidebar">
        <h2>Scientists Quartet</h2>
        <div>
          <h4 className="cards__header">INFORMATIONS</h4>
          <div className="cards__users">
            <p id='playercount'><b>Players:</b> {users.length}/2</p>
            <p id='gamestatus'><b>Gamestatus:</b> {gameStatus}</p>
          </div>
        </div>
      </div>

      <header className='cards__mainHeader'>
        <p>Made with socket.io</p>
        <button className='leave__btn' onClick={handleLeaveGame}>Leave Game</button>
      </header>

      <div className='cards__container'>
        <h1>Current card</h1>
        {notice && (
          <div role='status' className='cards__notice'>{notice}</div>
        )}
        <div className='cards__wrapper'>
          <div className='image_container'>
            <img src={topCard && topCard.photo} alt="img" />
          </div>
          <div className='stats_container'>
            <p id='stats_name'><b>👤 Name:</b> {topCard && topCard.name}</p>
            {STATS.map(({ key, label, icon, statsId, prefix }) => (
              <p key={key} id={statsId}>
                <b>{icon} {label}:</b> {prefix || ''}{topCard && topCard[key]}
              </p>
            ))}
          </div>
        </div>
        <div className='stats_buttons'>
          {STATS.map(({ btnId, event, icon }) => (
            <button key={btnId} id={btnId} onClick={() => handleMove(event)}>{icon}</button>
          ))}
        </div>
      </div>

      <div className="cards__footer">
        <p><b>Your Cards:</b> {myCards.length}, <b>Turn:</b> {playerActive.userName}</p>
      </div>
    </>
  );
};

export default Cards;

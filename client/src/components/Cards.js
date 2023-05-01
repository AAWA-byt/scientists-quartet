import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import albert_einstein from '../assets/albert_einstein.jpg';

const Cards = ({ socket }) => {
    const [users, setUsers] = useState([]);
    const [gotCards, setGotCards] = useState([]);
    const [myCards, setMyCards] = useState([]);
    const [cards1, setCards1] = useState([]);
    const [cards2, setCards2] = useState([]);
    const navigate = useNavigate();

    const handleLeaveChat = () => {
        localStorage.removeItem('userName');
        localStorage.removeItem('userID');
        navigate('/');
        window.location.reload();
    };

    useEffect(() => {
        socket.emit('first-user');

    })


    useEffect(() => {
        socket.on('newUserResponse', (data) => setUsers(data));
        if (users.length === 1 && !localStorage.getItem('userID')) {
            localStorage.setItem('userID', '1');
            socket.emit('first-user');

        } else if (users.length === 2) {
            if (!localStorage.getItem('userID')) {
                localStorage.setItem('userID', '2');
                socket.emit('second-user');
            }
        }
    }, [socket, users]);

    useEffect(() => {
        socket.on('send_first-user', (data) => {
            setCards1(data);
            if (localStorage.getItem('userID') === '1') {
                setMyCards(data);
            }
        });
    }, [socket]);

    useEffect(() => {
        socket.on('send_second-user', (data) => {
            setCards2(data);
            if (localStorage.getItem('userID') === '2') {
                setMyCards(data);
            }
        });
    }, [socket])



    // render a div containing a header, user count and game status
    return (
        <><div className="cards__sidebar">
            <h2>Physiker Quartett</h2>
            <div>
                <h4 className="cards__header">INFORMATIONS</h4>
                <div className="cards__users">
                    <p id='playercount'><b>Players:</b> {users.length}/2</p>
                    <p id='gamestatus'><b>Gamestatus:</b> waiting</p>
                </div>
            </div>
        </div>
            <header className='cards__mainHeader'>
                <p>Made with socket.io</p>
                <button className='leaveChat__btn' onClick={handleLeaveChat}>LEAVE GAME</button>
            </header>

            <div className='cards__container'>
                <h1>Aktuelle Karte</h1>
                <div className='cards__wrapper'>
                    <div className='image_container'>
                        <img src={myCards.length > 0 && myCards[0].photo} alt="img" />
                    </div>
                    <div className='stats_container'>
                        <p id='stats_name'><b>👤 Name:</b> {myCards.length > 0 && myCards[0].name}</p>
                        <p id='stats_birth'><b>👶 Geburtsdatum:</b> {myCards.length > 0 && myCards[0].birth}</p>
                        <p id='stats_iq'><b>🧠 IQ:</b> {myCards.length > 0 && myCards[0].iq}</p>
                        <p id='stats_awards'><b>🏆 Auszeichnungen:</b> {myCards.length > 0 && myCards[0].awards}</p>
                        <p id='stats_influence'><b>👑 Einfluss:</b> {myCards.length > 0 && myCards[0].influence}</p>
                        <p id='stats_assets'><b>💵 Vermögen:</b> {myCards.length > 0 && myCards[0].assets}</p>
                        <p id='stats_wiki'><b>📚 Wikifaktor:</b> {myCards.length > 0 && myCards[0].wiki}</p>
                    </div>
                </div>
                <div className='stats_buttons'>
                    <button id='btn_birth'>👶</button>
                    <button id='btn_iq'>🧠</button>
                    <button id='btn_awards'>🏆</button>
                    <button id='btn_influence'>👑</button>
                    <button id='btn_assets'>💵</button>
                    <button id='btn_wiki'>📚</button>
                </div>
            </div>

            <div className="cards__footer">
                <p><b>Your Cards:</b> {myCards.length}, <b>Turn:</b> xxxxx</p>
            </div>
        </>
    );
};

// export the Cards component as default
export default Cards;

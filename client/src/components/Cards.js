//imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Cards = ({ socket }) => {

    // Define state variables for users, received cards, current user's cards, and cards for each player, active player, game status and import useNavigate from react-router-dom.
    const [users, setUsers] = useState([]);
    const [myCards, setMyCards] = useState([]);
    const [cards1, setCards1] = useState([]);
    const [cards2, setCards2] = useState([]);
    const [player_active, setPlayerActive] = useState([]);
    const [game_status, setGameStatus] = useState([]);
    // const [player_active, setPlayerActive] = useState([]);
    // const [player_waiting, setPlayerWaiting] = useState([]);
    const navigate = useNavigate();

    // Handle leaving the game room
    const handleLeaveGame = () => {
        localStorage.removeItem('userName');
        localStorage.removeItem('userID');
        navigate('/');
        window.location.reload();
    };

    // Request cards from the server when the component mounts
    useEffect(() => {
        socket.emit('first-user');
    })

    // Update the active player array
    useEffect(() => {
        socket.on('player-active', (data) => setPlayerActive(data));
    }, [socket]);

    // Update the list of connected users when a new user joins or leaves the chat room
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

    // Update the cards for the first user when they receive them from the server
    useEffect(() => {
        socket.on('send_first-user', (data) => {
            setCards1(data);
            if (localStorage.getItem('userID') === '1') {
                setMyCards(data);
            }
        });
    }, [socket]);

    // Update the cards for the second user when they receive them from the server
    useEffect(() => {
        socket.on('send_second-user', (data) => {
            setCards2(data);
            if (localStorage.getItem('userID') === '2') {
                setMyCards(data);
            }
        });
    }, [socket]);

    // Update the games status array
    useEffect(() => {
        socket.on('new_GameStatus', (data) => {
            setGameStatus(data);
        });
    }, [socket]);


    // Functions for Button Events
    // function for buttton with id "btn_birth"
    function btn_birth() {
        // check if it is the users turn
        if (player_active.userName === localStorage.getItem('userName')) {
            // check if game is not over
            if (game_status != "Game Over!") {
                // proceed if it is the users turn
                socket.emit('NewMove_birth');
            } else {
                alert('The game is over.')
            }

        } else {
            alert('It is not your turn! Please wait.')
        }

    }

    // function for buttton with id "btn_age"
    function btn_age() {
        // check if it is the users turn
        if (player_active.userName === localStorage.getItem('userName')) {
            // check if game is not over
            if (game_status != "Game Over!") {
                // proceed if it is the users turn
                socket.emit('NewMove_age');
            } else {
                alert('The game is over.')
            }

        } else {
            alert('It is not your turn! Please wait.')
        }

    }

    // function for buttton with id "btn_iq"
    function btn_iq() {
        // check if it is the users turn
        if (player_active.userName === localStorage.getItem('userName')) {
            // check if game is not over
            if (game_status != "Game Over!") {
                // proceed if it is the users turn
                socket.emit('NewMove_iq');
            } else {
                alert('The game is over.')
            }

        } else {
            alert('It is not your turn! Please wait.')
        }

    }

    // function for buttton with id "btn_hindex"
    function btn_hindex() {
        // check if it is the users turn
        if (player_active.userName === localStorage.getItem('userName')) {
            // check if game is not over
            if (game_status != "Game Over!") {
                // proceed if it is the users turn
                socket.emit('NewMove_hindex');
            } else {
                alert('The game is over.')
            }

        } else {
            alert('It is not your turn! Please wait.')
        }

    }

    // function for buttton with id "btn_influence"
    function btn_influence() {
        // check if it is the users turn
        if (player_active.userName === localStorage.getItem('userName')) {
            // check if game is not over
            if (game_status != "Game Over!") {
                // proceed if it is the users turn
                socket.emit('NewMove_influence');
            } else {
                alert('The game is over.')
            }

        } else {
            alert('It is not your turn! Please wait.')
        }

    }

    // function for buttton with id "btn_wiki"
    function btn_wiki() {
        // check if it is the users turn
        if (player_active.userName === localStorage.getItem('userName')) {
            // check if game is not over
            if (game_status != "Game Over!") {
                // proceed if it is the users turn
                socket.emit('NewMove_wiki');
            } else {
                alert('The game is over.')
            }

        } else {
            alert('It is not your turn! Please wait.')
        }

    }

    // Render a div containing a header, user count and game status
    return (
        <>
            <div className="cards__sidebar">
                <h2>Scientists Quartet</h2>
                <div>
                    <h4 className="cards__header">INFORMATIONS</h4>
                    <div className="cards__users">
                        <p id='playercount'><b>Players:</b> {users.length}/2</p>
                        <p id='gamestatus'><b>Gamestatus:</b> {game_status}</p>
                    </div>
                </div>
            </div>

            {/* Header containing game title, made with statement and leave game button */}
            <header className='cards__mainHeader'>
                <p>Made with socket.io</p>
                <button className='leave__btn' onClick={handleLeaveGame}>Leave Game</button>
            </header>

            {/* Container for the current card */}
            <div className='cards__container'>
                <h1>Current card</h1>
                <div className='cards__wrapper'>
                    {/* Container for the card image */}
                    <div className='image_container'>
                        <img src={myCards.length > 0 && myCards[0].photo} alt="img" />
                    </div>
                    {/* Container for the card stats */}
                    <div className='stats_container'>
                        <p id='stats_name'><b>👤 Name:</b> {myCards.length > 0 && myCards[0].name}</p>
                        <p id='stats_birth'><b>👶 Birth:</b> {myCards.length > 0 && myCards[0].birth}</p>
                        <p id='stats_age'><b>🕰️ Age:</b> {myCards.length > 0 && myCards[0].age}</p>
                        <p id='stats_iq'><b>🧠 IQ:</b> ~ {myCards.length > 0 && myCards[0].iq}</p>
                        <p id='stats_influence'><b>👑 H-Index:</b> {myCards.length > 0 && myCards[0].h_index}</p>
                        <p id='stats_assets'><b>🌟 Influence:</b> {myCards.length > 0 && myCards[0].influence}</p>
                        <p id='stats_wiki'><b>📚 Wikifactor:</b> {myCards.length > 0 && myCards[0].wiki}</p>
                    </div>
                </div>
                {/* Container for the card stat buttons */}
                <div className='stats_buttons'>
                    <button id='btn_birth' onClick={btn_birth}>👶</button>
                    <button id='btn_age' onClick={btn_age}>🕰️</button>
                    <button id='btn_iq' onClick={btn_iq}>🧠</button>
                    <button id='btn_hindex' onClick={btn_hindex}>👑</button>
                    <button id='btn_influence' onClick={btn_influence}>🌟</button>
                    <button id='btn_wiki' onClick={btn_wiki}>📚</button>
                </div>
            </div>

            {/* Footer containing player's card count and turn */}
            <div className="cards__footer">
                <p><b>Your Cards:</b> {myCards.length}, <b>Turn:</b> {player_active.userName}</p>
            </div>
        </>
    );
}
// Export the Cards component as default
export default Cards;
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import albert_einstein from "../assets/albert_einstein.jpg"


// define a functional component Cards that takes props
const Cards = ({ socket }) => {
    // use state hook to initialize users state to an empty array
    const [users, setUsers] = useState([]);

    const navigate = useNavigate()


    // useEffect hook to listen for 'newUserResponse' event from socket and update users state accordingly
    useEffect(() => {
        socket.on('newUserResponse', (data) => setUsers(data));
    }, [socket, users]);

    // This function is called when the "LEAVE CHAT" button is clicked
    const handleLeaveChat = () => {
        localStorage.removeItem("userName") // Remove the "userName" item from localStorage
        navigate("/") // Navigate to the home page
        window.location.reload() // Reload the page to reset the chat
    }

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
                <div className='image_container'>
                    <img src={albert_einstein} />
                </div>
                <div className='stats_container'>
                    <p><b>Geburtsdatum:</b> xxx</p>
                    <p><b>IQ:</b> xxx</p>
                    <p><b>Auszeichnungen:</b> xxx</p>
                    <p><b>Einfluss:</b> xxx</p>
                    <p><b>Vermögen:</b> xxx</p>
                    <p><b>Wikifaktor:</b> xxx</p>
                </div>

            </div>

            <div className="cards__footer">
                <p><b>Your Cards:</b> xx, <b>Turn:</b> xxxxx</p>
            </div>
        </>
    );
};

// export the Cards component as default
export default Cards;

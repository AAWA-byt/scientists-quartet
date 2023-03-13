import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"


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
        <><div className="chat__sidebar">
            <h2>Physiker Quartett</h2>
            <div>
                <h4 className="chat__header">INFORMATIONS</h4>
                <div className="chat__users">
                    <p id='playercount'><b>Players:</b> {users.length}/2</p>
                    <p id='gamestatus'><b>Gamestatus:</b> waiting</p>
                </div>
            </div>
        </div>
            <header className='chat__mainHeader'>
                <p>Made with socket.io</p>
                <button className='leaveChat__btn' onClick={handleLeaveChat}>LEAVE GAME</button>
            </header>

            <div className='message__container'>

            </div>

            <div className="chat__footer">
                <p><b>Your Cards:</b> xx, <b>Turn:</b> xxxxx</p>
            </div>
        </>
    );
};

// export the Cards component as default
export default Cards;

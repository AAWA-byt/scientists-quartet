import React, { useState, useEffect } from 'react';

// define a functional component Cards that takes props
const Cards = ({ socket }) => {
    // use state hook to initialize users state to an empty array
    const [users, setUsers] = useState([]);

    // useEffect hook to listen for 'newUserResponse' event from socket and update users state accordingly
    useEffect(() => {
        socket.on('newUserResponse', (data) => setUsers(data));
    }, [socket, users]);

    // render a div containing a header, user count and game status
    return (
        <div className="chat__sidebar">
            <h2>Physiker Quartett</h2>
            <div>
                <h4 className="chat__header">INFORMATIONS</h4>
                <div className="chat__users">
                    <p id='playercount'><b>Players:</b> {users.length}/2</p>
                    <p id='gamestatus'><b>Gamestatus:</b> waiting</p>

                </div>
            </div>
        </div>
    );
};

// export the Cards component as default
export default Cards;

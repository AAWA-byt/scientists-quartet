import React, { useState, useEffect } from 'react';


const Cards = ({ socket }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on('newUserResponse', (data) => setUsers(data));

    }, [socket, users]);

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

export default Cards;
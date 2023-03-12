import React, { useState, useEffect } from 'react';

const ChatBar = ({ socket }) => {
  // Define state to hold the list of active users
  const [users, setUsers] = useState([]);

  // Listen for 'newUserResponse' event from server and update state accordingly
  useEffect(() => {
    socket.on('newUserResponse', (data) => setUsers(data));
  }, [socket, users]);

  return (
    <div className="chat__sidebar">
      <h2>Physiker Quartett</h2>
      <div>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          {/* Map through the 'users' state and render the list of active users */}
          {users.map((user) => (
            <p key={user.socketID}>{user.userName}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;



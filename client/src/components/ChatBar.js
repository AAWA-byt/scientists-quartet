import React, { useState, useEffect } from 'react';

const ChatBar = ({ socket }) => {
  // Define state to hold the list of active users
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const onUsers = (data) => setUsers(data);
    socket.on('newUserResponse', onUsers);
    return () => socket.off('newUserResponse', onUsers);
  }, [socket]);

  return (
    <div className="chat__sidebar">
      <h2>Game Chat</h2>
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



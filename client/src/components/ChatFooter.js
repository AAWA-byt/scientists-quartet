import React, { useState } from 'react';

const ChatFooter = ({ socket }) => {
  // State to store the input message
  const [message, setMessage] = useState('');

  // Function to emit the typing status to the server
  const handleTyping = () =>
    socket.emit('typing', `${localStorage.getItem('userName')} is typing`);

  // Function to handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    // Check if there is a message to send and a user is logged in
    if (message.trim() && localStorage.getItem('userName')) {
      // Emit the message to the server
      socket.emit('message', {
        text: message,
        name: localStorage.getItem('userName'),
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
      });
    }
    // Clear the input message
    setMessage('');
  };

  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        {/* Input for message */}
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          // Event listener for the onKeyDown event to emit typing status
          onKeyDown={handleTyping}
        />
        {/* Button to send message */}
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;


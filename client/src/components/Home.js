// Import the required modules from the React and react-router-dom libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define a functional component called "Home" that takes in a socket object as a prop
const Home = ({ socket }) => {

  // Call the "useNavigate" hook from the react-router-dom library to obtain a navigation object
  const navigate = useNavigate();

  // Define state to hold the list of active users
  const [users, setUsers] = useState([]);

  // Listen for 'newUserResponse' event from server and update state accordingly
  useEffect(() => {
    socket.on('newUserResponse', (data) => setUsers(data));
  }, [socket, users]);

  // Call the "useState" hook from the React library to create a state variable called "userName" and a function called "setUserName" to update it
  const [userName, setUserName] = useState('');

  // Define a function called "handleSubmit" that takes in an event object and prevents its default behavior
  const handleSubmit = (e) => {
    e.preventDefault();
    // Store the username in the browser's local storage
    localStorage.setItem('userName', userName);
    // Emit a "newUser" event to the Node.js server with the username and the socket ID
    socket.emit('newUser', { userName, socketID: socket.id });
    // Navigate to the chat page
    navigate('/game');
  };

  // Render a form with a header, a label, an input field for the username, and a button if there are less than two users
  if (users.length < 2) {
    return (
      <form className="home__container" onSubmit={handleSubmit}>
        <h2 className="home__header">Choose your username</h2>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          minLength={6}
          name="username"
          id="username"
          className="username__input"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button className="home__cta">SIGN IN</button>
        <p>There is still room for more players.</p>
      </form>
    );
  } else { // Render a message if there are already two users
    return (
      <h1>The maximum number of players has been reached</h1>
    );
  }
};

// Export the "Home" component as the default export of this module
export default Home;

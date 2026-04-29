import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onUsers = (data) => setUsers(data);
    socket.on('newUserResponse', onUsers);
    return () => socket.off('newUserResponse', onUsers);
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const onAssigned = ({ role }) => {
      socket.off('role-assigned', onAssigned);
      socket.off('newUser-rejected', onRejected);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userID', role);
      navigate('/game');
    };
    const onRejected = ({ reason }) => {
      socket.off('role-assigned', onAssigned);
      socket.off('newUser-rejected', onRejected);
      setError(reason === 'full' ? 'Game is already full.' : 'Could not join game.');
    };

    socket.on('role-assigned', onAssigned);
    socket.on('newUser-rejected', onRejected);
    socket.emit('newUser', { userName });
  };

  if (users.length < 2) {
    return (
      <div className='home'>
        <form className="home__container" onSubmit={handleSubmit}>
          <h1>Scientists Quartet</h1>
          <h3 className="home__header">Choose your username</h3>
          <input
            type="text"
            required
            minLength={6}
            name="username"
            placeholder='Username'
            id="username"
            className="username__input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button>SIGN IN</button>
          {error && <p role='alert' className='home__error'>{error}</p>}
          <p>There is still room for more players.</p>
        </form>
      </div>
    );
  }
  return (
    <div className='home'>
      <h1>The maximum number of players has been reached</h1>
    </div>
  );
};

export default Home;

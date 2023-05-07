import React, { useState, useEffect } from 'react';

const CardsOverview = ({ socket }) => {
  // Define state to hold the list of active users
  const [users, setUsers] = useState([]);

  // Listen for 'sendCardsOverview' event from server and update state accordingly
  useEffect(() => {
    
  }, [socket]);

  return (
    <div className="cards_overview">
        <div className="cards_overview__container">
            <div className="cards_overview__cards">
    	        <h1>Test</h1>
            </div>
        </div>
    </div>
  );
};

export default CardsOverview;

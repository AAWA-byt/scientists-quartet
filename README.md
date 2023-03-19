# physiker-quartet

This project is an online multiplayer quartet game for the browser. 
It includes a backend server and a front end. 
The backend is a Node.js server and the front end is a React.js application. 
The communication between server and client takes place with the help of Socket.io.

## :rocket: Game concept
In this version of the quartet, the player with the highest number or value on the card wins. If a player takes a turn and names a value, the player with the highest value wins. This player collects all the cards and adds them to his pile and it is his turn.

If two cards have the same value, a draw is made. In this case, both cards are placed in the middle and the player who was last to act chooses a value from his next card. The player with the higher value then collects all the cards from the centre. The game ends when one player has all the cards and is thus considered the winner of the game.

## :sparkles: Features

- Quartet game
- Live Chat 
- User list & user count
- User limit
- Responsive design

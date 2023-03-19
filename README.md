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

## :wrench: How to install

### :package: Requirements 
- [Node.js](https://nodejs.org/en/download)
- [npm](https://docs.npmjs.com/cli/)
- [Git](https://git-scm.com/downloads)
- [pm2](https://pm2.keymetrics.io/)
- [Docker](https://docs.docker.com/)

### :page_facing_up: Procedure

- Clone the source code with the following command
```
git clone https://github.com/AAWA-byt/physiker-quartet.git
```
- Edit the config file ```./server/config.json``` as you need it 
- In the ```./client``` folder you run the following commands
```
# Install all required packages
npm i

# Build project to serve it to a static server
npm run build
```
- Now deploy the files from the ```build``` folder to a static server
- After deploying the files, you go back to the ```./config``` folder and the following commands
```
# Install all required packages
npm i

# Start backend server for testing
npm start
```
- For running the backend server in the background execute the following command after installing the packages
```
pm2 index.js
```



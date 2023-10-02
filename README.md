# scientists-quartet

This project is an online multiplayer quartet game for the browser. 
It includes a backend server and a front end. 
The backend is a Node.js server and the front end is a React.js application. 
The communication between server and client takes place with the help of Socket.io.

⚠ I take no responsibility for the data used in the various categories. If you find any errors, please create an issue and point them out. ⚠ 

## :rocket: Game concept
In this version of the quartet, the player with the highest number or value on the card wins. If a player takes a turn and names a value, the player with the highest value wins. This player collects all the cards and adds them to his pile and it is his turn.

If two cards have the same value, a draw is made. In this case, both cards are placed in the middle and the player who was last to act chooses a value from his next card. The player with the higher value then collects all the cards from the centre. The game ends when one player has all the cards and is thus considered the winner of the game.

## :sparkles: Features

- ✅ Quartet game
- ✅ Live Chat 
- ✅ User list & user count
- ✅ User limit
- ✅ Responsive design
- ☑️ Log Games (MySQL)
- ☑️ Multiple games (game rooms with codes)

## :wrench: How to install

### :package: Requirements 
- [Node.js](https://nodejs.org/en/download)
- [npm](https://docs.npmjs.com/cli/)
- [Git](https://git-scm.com/downloads)
- [pm2](https://pm2.keymetrics.io/)
- [Docker](https://docs.docker.com/)

### :page_facing_up: Procedure

- Clone the source code with the following command:
```
git clone https://github.com/AAWA-byt/scientists-quartet.git
```
- Edit the config file ```./server/config.json``` as you need it (here you define the address with which the backend server is allowed to communicate)
- In the ```./client``` folder you run the following commands:
```
# Install all required packages
npm i

# Build project to serve it to a static server
npm run build
```
- Now deploy the files from the ```build``` folder to a static server
- After deploying the files, you go back to the ```./server``` folder and run the following commands:
```
# Install all required packages
npm i

# Start backend server for testing
npm start
```
- For running the backend server in the background execute the following command after installing the packages:
```
pm2 index.js
```

### 🐘 Docker Compose

It is also possible to run the backend server in a Docker container. Here you can use the following commands:
```
# pull the repo from github
git clone https://github.com/AAWA-byt/physiker-quartet.git

# start docker
cd ./server
docker-compose up -d 
```
Proceed as described above with the files for the web server and the config files.


# :construction: Contribute
### Pull Request
You are always welcome to create a [pull request](https://github.com/AAWA-byt/scientists-quartet/pulls). I will look at it as soon as possible. 

### Bug Reports / Feature Requests

If you want to report a bug or request a new feature, feel free to open a new [issue](https://github.com/AAWA-byt/physiker-quartet/issues). 

# :memo: License
Copyright 2023 Aaron Wagner

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

See the [LICENSE.md](https://github.com/AAWA-byt/scientists-quartet/blob/main/LICENSE.md) file for details.

# :construction_worker: Author
- [AAWA-byt](www.github.com/AAWA-byt) - Aaron Wagner

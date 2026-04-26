const fs = require('fs');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { registerHandlers } = require('./components/socketHandlers');

const PORT = 4000;
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const cards = JSON.parse(fs.readFileSync('./components/Cards.json', 'utf-8'));

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.origin },
});

registerHandlers(io, cards);

app.get('/api', (_req, res) => {
  res.json({ message: 'Hello World' });
});

app.get('/api/cards', (_req, res) => {
  res.json({ Physicist: cards });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  console.log(`Cards in total: ${cards.length}`);
});

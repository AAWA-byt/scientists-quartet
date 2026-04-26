// Game logic for the scientists quartet.
// Each move is defined by an attribute and the comparison direction:
// "lower" wins for `birth` (earlier birth year), "higher" wins for the rest.
const MOVES = [
  { event: 'NewMove_birth', attribute: 'birth', direction: 'lower' },
  { event: 'NewMove_age', attribute: 'age', direction: 'higher' },
  { event: 'NewMove_iq', attribute: 'iq', direction: 'higher' },
  { event: 'NewMove_hindex', attribute: 'h_index', direction: 'higher' },
  { event: 'NewMove_influence', attribute: 'influence', direction: 'higher' },
  { event: 'NewMove_wiki', attribute: 'wiki', direction: 'higher' },
];

const PLACEHOLDER = {
  lost: {
    name: 'x',
    photo: 'https://sd.keepcalms.com/i-w600/keep-calm-even-though-you-lost-the-game.jpg',
    birth: 0, age: 0, iq: 0, h_index: 0, influence: 0, wiki: 0,
  },
  won: {
    name: 'x',
    photo: 'https://sd.keepcalms.com/i/keep-calm-game-over-we-win.png',
    birth: 0, age: 0, iq: 0, h_index: 0, influence: 0, wiki: 0,
  },
  draw: {
    name: 'x',
    photo: 'https://sd.keepcalms.com/i-w600/keep-calm-it-s-a-tie-game.jpg',
    birth: 0, age: 0, iq: 0, h_index: 0, influence: 0, wiki: 0,
  },
};

function shuffleAndSplit(cards) {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  const half = Math.floor(shuffled.length / 2);
  return [shuffled.slice(0, half), shuffled.slice(half)];
}

function createGame() {
  return {
    cards1: [],
    cards2: [],
    drawPile: [],
    activePlayer: null,
    status: '',
    users: [],
  };
}

function dealCards(game, allCards) {
  const [hand1, hand2] = shuffleAndSplit(allCards);
  game.cards1 = hand1;
  game.cards2 = hand2;
  game.drawPile = [];
}

function startGame(game) {
  game.activePlayer = game.users[0];
  game.status = 'Active';
}

// Player wins the trick: collect any pending draw cards, take the opponent's
// top card, and rotate own top card to the back of the deck.
function awardTrick(winnerHand, loserHand, drawPile) {
  if (drawPile.length > 0) {
    winnerHand.push(...drawPile);
    drawPile.length = 0;
  }
  winnerHand.push(loserHand.shift());
  winnerHand.push(winnerHand.shift());
}

function resolveMove(game, attribute, direction) {
  const value1 = game.cards1[0][attribute];
  const value2 = game.cards2[0][attribute];
  const [user1, user2] = game.users;

  if (value1 === value2) {
    game.drawPile.push(game.cards1.shift());
    game.drawPile.push(game.cards2.shift());
    return;
  }

  const user1Wins = direction === 'lower' ? value1 < value2 : value1 > value2;
  if (user1Wins) {
    awardTrick(game.cards1, game.cards2, game.drawPile);
    game.activePlayer = user1;
  } else {
    awardTrick(game.cards2, game.cards1, game.drawPile);
    game.activePlayer = user2;
  }
}

function checkWin(game) {
  const empty1 = game.cards1.length < 1;
  const empty2 = game.cards2.length < 1;
  if (empty1 && empty2) {
    game.cards1 = [PLACEHOLDER.draw];
    game.cards2 = [PLACEHOLDER.draw];
    game.status = 'Game Over!';
    return true;
  }
  if (empty2) {
    game.cards1 = [PLACEHOLDER.won];
    game.cards2 = [PLACEHOLDER.lost];
    game.status = 'Game Over!';
    return true;
  }
  if (empty1) {
    game.cards1 = [PLACEHOLDER.lost];
    game.cards2 = [PLACEHOLDER.won];
    game.status = 'Game Over!';
    return true;
  }
  return false;
}

module.exports = {
  MOVES,
  createGame,
  dealCards,
  startGame,
  resolveMove,
  checkWin,
};

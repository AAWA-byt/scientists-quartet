const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MOVES,
  STATUS,
  createGame,
  dealCards,
  startGame,
  resolveMove,
  checkWin,
} = require('../components/gameLogic');

const card = (overrides) => ({
  name: 'x', photo: '', birth: 0, age: 0, iq: 0, h_index: 0, influence: 0, wiki: 0,
  ...overrides,
});

const userA = { userName: 'a', socketID: 'sa' };
const userB = { userName: 'b', socketID: 'sb' };

function gameWith(hand1, hand2, active = userA) {
  const g = createGame();
  g.users = [userA, userB];
  g.cards1 = hand1;
  g.cards2 = hand2;
  g.activePlayer = active;
  g.status = STATUS.ACTIVE;
  return g;
}

test('dealCards splits an even deck in equal halves', () => {
  const g = createGame();
  const deck = Array.from({ length: 20 }, (_, i) => card({ name: `c${i}` }));
  dealCards(g, deck);
  assert.equal(g.cards1.length, 10);
  assert.equal(g.cards2.length, 10);
  assert.equal(g.drawPile.length, 0);
});

test('startGame sets activePlayer to first user and status to ACTIVE', () => {
  const g = createGame();
  g.users = [userA, userB];
  startGame(g);
  assert.equal(g.activePlayer, userA);
  assert.equal(g.status, STATUS.ACTIVE);
});

test('resolveMove (higher wins): user1 takes the trick and stays active', () => {
  const g = gameWith(
    [card({ name: 'p1', age: 80 })],
    [card({ name: 'p2', age: 50 }), card({ name: 'p3', age: 20 })],
    userA,
  );
  resolveMove(g, 'age', 'higher');
  assert.equal(g.cards1.length, 2);
  assert.equal(g.cards2.length, 1);
  assert.equal(g.cards1[g.cards1.length - 1].name, 'p1', 'played card rotates to back');
  assert.equal(g.activePlayer, userA);
});

test('resolveMove (higher wins): user2 wins switches active player', () => {
  const g = gameWith(
    [card({ name: 'p1', age: 30 }), card({ name: 'p3', age: 10 })],
    [card({ name: 'p2', age: 90 })],
    userA,
  );
  resolveMove(g, 'age', 'higher');
  assert.equal(g.cards1.length, 1);
  assert.equal(g.cards2.length, 2);
  assert.equal(g.activePlayer, userB);
});

test('resolveMove (lower wins): birth-year comparison', () => {
  const g = gameWith(
    [card({ name: 'p1', birth: 1850 }), card({ name: 'p3', birth: 1900 })],
    [card({ name: 'p2', birth: 1950 }), card({ name: 'p4', birth: 1960 })],
    userA,
  );
  resolveMove(g, 'birth', 'lower');
  assert.equal(g.cards1.length, 3);
  assert.equal(g.cards2.length, 1);
  assert.equal(g.activePlayer, userA, 'earlier birth year wins');
});

test('resolveMove tie: top cards move to draw pile, active player unchanged', () => {
  const g = gameWith(
    [card({ name: 'p1', iq: 150 }), card({ name: 'p3', iq: 80 })],
    [card({ name: 'p2', iq: 150 }), card({ name: 'p4', iq: 90 })],
    userA,
  );
  resolveMove(g, 'iq', 'higher');
  assert.equal(g.drawPile.length, 2);
  assert.equal(g.cards1.length, 1);
  assert.equal(g.cards2.length, 1);
  assert.equal(g.activePlayer, userA, 'tie does not change active player');
});

test('resolveMove: trick winner sweeps the draw pile', () => {
  const g = gameWith(
    [card({ name: 'p1', iq: 200 })],
    [card({ name: 'p2', iq: 100 }), card({ name: 'p3', iq: 50 })],
    userA,
  );
  g.drawPile = [card({ name: 'd1' }), card({ name: 'd2' })];
  resolveMove(g, 'iq', 'higher');
  assert.equal(g.drawPile.length, 0, 'draw pile cleared');
  assert.equal(g.cards1.length, 4, 'winner gets own card + opponent card + 2 draw cards');
});

test('checkWin: empty user2 hand → user1 wins', () => {
  const g = gameWith([card({ name: 'p1' })], [], userA);
  const ended = checkWin(g);
  assert.equal(ended, true);
  assert.equal(g.status, STATUS.GAME_OVER);
  assert.match(g.cards1[0].photo, /win/);
  assert.match(g.cards2[0].photo, /lost/);
});

test('checkWin: empty user1 hand → user2 wins', () => {
  const g = gameWith([], [card({ name: 'p2' })], userB);
  const ended = checkWin(g);
  assert.equal(ended, true);
  assert.match(g.cards1[0].photo, /lost/);
  assert.match(g.cards2[0].photo, /win/);
});

test('checkWin: both hands empty → draw', () => {
  const g = gameWith([], [], userA);
  const ended = checkWin(g);
  assert.equal(ended, true);
  assert.match(g.cards1[0].photo, /tie/);
  assert.match(g.cards2[0].photo, /tie/);
});

test('checkWin: ongoing game returns false', () => {
  const g = gameWith([card({})], [card({})], userA);
  assert.equal(checkWin(g), false);
});

test('MOVES table covers all six attributes with correct directions', () => {
  const byAttr = Object.fromEntries(MOVES.map((m) => [m.attribute, m.direction]));
  assert.equal(byAttr.birth, 'lower');
  assert.equal(byAttr.age, 'higher');
  assert.equal(byAttr.iq, 'higher');
  assert.equal(byAttr.h_index, 'higher');
  assert.equal(byAttr.influence, 'higher');
  assert.equal(byAttr.wiki, 'higher');
});

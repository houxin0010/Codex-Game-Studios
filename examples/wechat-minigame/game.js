const { createGame } = require('./src/game');
const game = createGame(wx, {
  request: callback => requestAnimationFrame(callback),
  cancel: id => cancelAnimationFrame(id),
});
game.start();

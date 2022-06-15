'use strict'

const Max7219 = require('max7219-display');
const Gpio = require('onoff').Gpio;
const m = new Max7219({ device: '/dev/spidev0.0', controllerCount: 4, font: 'lcd'});
const redButton = new Gpio(3, 'in', 'falling', {debounceTimeout: 150});
const blackButton = new Gpio(22, 'in', 'both', {debounceTimeout: 500});
const relay = new Gpio(4, 'out');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const onExit = async () => {
  console.log();
  await m.resetAll();
  redButton.unexport();
  blackButton.unexport();
  process.exit();
};

let enabled = true;
let text = 'oleksiisedun.github.io';

(async () => {
  redButton.watch(async () => {
    enabled = !enabled;
    relay.writeSync(+!enabled);
  });
  blackButton.watch((err, value) => {
    if (value) text = 'Black button is pressed!';
    else text = 'oleksiisedun.github.io';
  });
  await m.resetAll();
  while (true) {
    if (enabled) {
      await m.scroll(text, {scrollIn: true, loop: false, speed: 100});
    } else {
      await delay(100);
    }
  }
})();

process.on('SIGINT', onExit);

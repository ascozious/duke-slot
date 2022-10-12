var IMG_MACHINE = "https://i.ibb.co/bN7Dtv0/duke-list-image.png";

var STATE_ZERO = 0;
var STATE_INIT = 1;
var STATE_MOVING = 2;
var STATE_CHECK_WIN = 3;

var SLOT_NUMBER = 4;
var INITIAL_X = window.innerWidth / 2 - 270;
var TILE_HEIGHT = 120;
var TILE_WIDTH = TILE_HEIGHT;
var N_CYCLE = 5;
var TOT_TILES = 7;

var gameStatus = 0;
var finalTileY = [];
var slotSprite = [];
var preChoosedPosition = [];
var INC = [15, 20, 25, 30];

var stage = new PIXI.Stage(0x000000);
var renderer = PIXI.autoDetectRenderer(
  window.innerWidth - 20,
  window.innerHeight - 250,
  {
    antialiasing: false,
    transparent: true,
    resolution: 1,
  }
);

var currBalanceEle = document.getElementById("curr-balance");
var currBonusSpinEle = document.getElementById("curr-bonus-spin");
var currSpinButton = document.getElementById("spin-button");
var currBonusSpinButton = document.getElementById("bonus-spin-button");

var getCurrBalance = parseInt(currBalanceEle.innerHTML);
var getCurrBonusSpin = parseInt(currBonusSpinEle.innerHTML);

var slotBodyEle = document.getElementById("slot-body");
slotBodyEle.appendChild(renderer.view);
stage.interactive = true;

var loader = new PIXI.AssetLoader([IMG_MACHINE]);
loader.onComplete = setup;
loader.load();

//setup
function setup() {
  texture = PIXI.TextureCache[IMG_MACHINE];
  preChoosedPosition = [1, 2, 3, 4];
  for (var i = 0; i < SLOT_NUMBER; i++) {
    slotSprite[i] = new PIXI.TilingSprite(
      texture,
      TILE_WIDTH,
      TILE_HEIGHT + 385
    );
    slotSprite[i].tilePosition.x = -1;
    slotSprite[i].tilePosition.y = -preChoosedPosition[i] * TILE_HEIGHT + 60;
    slotSprite[i].x = INITIAL_X + i * 140;
    slotSprite[i].y = 20;
    stage.addChild(slotSprite[i]);
  }
  draw();
}

function draw() {
  if (gameStatus == STATE_ZERO) {
    gameStatus = STATE_INIT;
  } else if (gameStatus == STATE_INIT) {
    gameStatus = STATE_CHECK_WIN;
  } else if (gameStatus == STATE_MOVING) {
    for (var i = 0; i < SLOT_NUMBER; i++) {
      if (finalTileY[i] > 0) {
        slotSprite[i].tilePosition.y = slotSprite[i].tilePosition.y + INC[i];
        finalTileY[i] = finalTileY[i] - INC[i];
      }
    }

    if (finalTileY[0] - 5 <= 0) {
      gameStatus = STATE_CHECK_WIN;
    }
  } else if (gameStatus == STATE_CHECK_WIN) {
    var winStatus = true;
    var winStatusText = "";

    for (var i = 1; i < SLOT_NUMBER; i++) {
      if (preChoosedPosition[i] != preChoosedPosition[i - 1]) {
        winStatus = false;
      }
    }

    if (winStatus) {
      console.log(preChoosedPosition);

      if (preChoosedPosition.includes(1) || preChoosedPosition.includes(5)) {
        getCurrBonusSpin = getCurrBonusSpin + 1;
        winStatusText = "1 Bonus Spin";
      } else if (preChoosedPosition.includes(3)) {
        winStatusText = "Free Spin";
        currSpinButton.innerText = "FREE";
      } else if (preChoosedPosition.includes(2)) {
        winStatusText = "Jackpot, 2 $";
        getCurrBalance = getCurrBalance + 2;
      } else {
        winStatusText = "1 $";
        getCurrBalance = getCurrBalance + 1;
      }
      alert("Congratulations, You Winning " + winStatusText);
      updateBalance(getCurrBalance);
      updateBonus(getCurrBonusSpin);
    }

    currSpinButton.removeAttribute("disabled");
    currBonusSpinButton.removeAttribute("disabled");
    return;
  }

  renderer.render(stage);
  requestAnimationFrame(draw);
}

function startAnimation() {
  if (gameStatus == STATE_INIT || gameStatus == STATE_CHECK_WIN) {
    preChoosedPosition = getRandomPositions();
    for (var i = 0; i < SLOT_NUMBER; i++) {
      slotSprite[i].tilePosition.y = -preChoosedPosition[i] * TILE_HEIGHT + 80;
      finalTileY[i] = N_CYCLE * TILE_HEIGHT * TOT_TILES;
    }
    gameStatus = STATE_MOVING;
    draw();
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPositions() {
  var x = getRandomInt(0, 1);
  if (x == 1) {
    x = getRandomInt(0, 5);
    return [x, x, x, x];
  }
  return [
    getRandomInt(0, 5),
    getRandomInt(0, 5),
    getRandomInt(0, 5),
    getRandomInt(0, 5),
  ];
}

function refreshBalance() {
  getCurrBalance = getCurrBalance + 10;
  updateBalance(getCurrBalance);
}

function updateBalance(balance) {
  currBalanceEle.innerHTML = balance;
}
function updateBonus(bonus) {
  currBonusSpinEle.innerHTML = bonus;
}

function checkingButtonSource(id) {
  if (id == "bonus-spin-button") {
    if (getCurrBonusSpin == 0) {
      alert("You have no Bonus Spin");
    } else {
      getCurrBonusSpin = getCurrBonusSpin - 1;
      currBonusSpinButton.setAttribute("disabled", "");
      startAnimation();
    }
  } else if (id == "spin-button") {
    if (currSpinButton.innerHTML == "FREE") {
      currSpinButton.innerHTML = "SPIN";
      currSpinButton.setAttribute("disabled", "");
      startAnimation();
    } else {
      if (getCurrBalance == 0) {
        alert("Insuffiecient Balance");
      } else {
        getCurrBalance = getCurrBalance - 1;
        currSpinButton.setAttribute("disabled", "");
        startAnimation();
      }
    }
  }
  updateBalance(getCurrBalance);
  updateBonus(getCurrBonusSpin);
}

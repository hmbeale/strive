const stdin = process.stdin;
stdin.setEncoding('utf8');

const player = new Object();
player.attack = 3;
player.attackPenalty = 2;
player.defenseValue = 1;

player.health = 15;
player.maxHealth = 15;
player.combatStartHealth = 15;
player.combatHealValue = 2;

player.inCombat = false;
player.disposition = '';
player.distanceTraveled = 0;

const playerDispositions = [
  'you hear some birds chirping',
  'your feet ache',
  'you feel a pleasant breeze',
  'sweat trickles from your brow'
];

const creature = new Object();
creature.type = '';
creature.adjective = '';
creature.health = 0;
creature.attack = 0;

const creatureSizes = ['delicate', 'medium sized', 'large', 'hulking'];
const creatureTypes = [
  'beast with dulled fangs',
  'creature with sharp claws',
  'beast with many fearsome horns',
  'creature with flames dripping from its jaws'
];

const scenery = new Object();
scenery.adjective = '';
scenery.type = '';

const sceneryAdjectives = ['small', 'big', 'dark', 'sunlit'];
const sceneryTypes = ['river', 'pool of water', 'tree',
                      'tower', 'hill', 'cliff', 'cloud'];

const distNeeded = 30;

console.log('welcome to strive \nenter \'-help\' for help \n');
//handles player input
//player can move forward, attack, defend, and flee
//each move forward procedurally generates a new scenario
//  based on a 'roll' from 1 to 40
stdin.on('data', function(d) {
  if (d.trim() == 'w' && !player.inCombat) {

    if (player.distanceTraveled >= distNeeded) {
      console.log('you made it to your destination, congratulations');
      process.exit();
    }

    let randNum = getRandom(1, 40);

    if (randNum <= 6) {
      moveForward();
      startCombat();
      console.log(`you encounter a ${creature.adjective} ${creature.type} \n`);
    }

    if (randNum >= 7 && randNum <= 29) {
      moveForward();
      console.log('');
    }

    if (randNum >= 30 && randNum <= 36) {
      moveForward();
      updateScenery();
      console.log(`you see a ${scenery.adjective} ${scenery.type} \n`);
    }

    if (randNum >= 37 && randNum <= 38) {
      moveForward();
      updatePlayerDisposition();
      console.log(player.disposition + '\n');
    }

    if (randNum == 39) {
      moveForward();
      console.log('you find some medical supplies');
      playerHeal(5);
      console.log(`your health is ${player.health}/${player.maxHealth} \n`);
    }

    if (randNum == 40) {
      moveForward();
      console.log('you find a better weapon \n');
      player.attack++;
    }
  }

  if (d.trim() == 'a' && player.inCombat) {
    console.log('you attack');
    standardCombatRound(player.attack, creature.attack);
  }

  if (d.trim() == 'd' && player.inCombat) {
    console.log('you defend');
    standardCombatRound(
      player.attack - player.attackPenalty,
      creature.attack - player.defenseValue
    );
  }

  if (d.trim() == 'f' && player.inCombat) {
    console.log('you flee');
    let randNum = getRandom(1, 4);

    //flee fails
    if (randNum == 1) {
      console.log(`the ${creature.type} catches you`);
      standardCombatRound(0, player.maxHealth - 1);
    }

    //flee succeeds
    if (randNum > 1) {
      player.inCombat = false;
      console.log(
        'you escape successfully but your ' +
          'flight takes you away from your goal \n'
      );
      postCombatHeal();
      player.distanceTraveled = player.distanceTraveled - 5;
    }
  }
  if (d.trim() == '-help') {
    console.log('you are journeying through a land of some peril');
    console.log(
      'enter w to move forward, a to attack, d to defend, and f to flee'
    );
    console.log(
      'note that defending does deals damage, just less than attacking'
    );
    console.log('good luck \n');
  }
});

const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
};

const moveForward = () => {
  console.log('you move forward');
  player.distanceTraveled++;
};

const updateScenery = () => {
  scenery.type = sceneryTypes[getRandom(0, sceneryTypes.length - 1)];
  scenery.adjective =
    sceneryAdjectives[getRandom(0, sceneryAdjectives.length - 1)];
};

const updatePlayerDisposition = () => {
  player.disposition =
    playerDispositions[getRandom(0, playerDispositions.length - 1)];
};

const startCombat = () => {
  createCreature();
  player.combatStartHealth = player.health;
  player.inCombat = true;
};

const createCreature = () => {
  let randHealth = getRandom(1, 4);
  let randAttack = getRandom(1, 4);
  //lowest health should take about two attacks (3-7 hp)
  //highest health should take about five attacks (15-19 hp)
  creature.health = getRandom(randHealth * 4 - 1, randHealth * 4 + 3);
  creature.adjective = creatureSizes[randHealth - 1];

  creature.attack = randAttack;
  creature.type = creatureTypes[randAttack - 1];
};

const standardCombatRound = (playerAttack, creatureAttack) => {
  resolveCombatDamage(playerAttack, creatureAttack);
  if (creature.health <= 0) {
    slaycreature();
  }
  if (player.health <= 0) {
    playerCombatDeath();
  }
  if (!player.inCombat) {
    postCombatHeal();
  }
};

const resolveCombatDamage = (playerAttack, creatureAttack) => {
  console.log(`the ${creature.type} attacks`);
  creature.health = creature.health - playerAttack;
  //makes sure player isn't healed by negative damage
  if (creatureAttack > 0) {
    player.health = player.health - creatureAttack;
  }
  console.log(`your health is ${player.health}/${player.maxHealth} \n`);
};

const slaycreature = () => {
  console.log(`you slay the ${creature.type} \n`);
  player.inCombat = false;
  creature.attack = 0;
};

const playerCombatDeath = () => {
  console.log(`the ${creature.type} slays you`);
  process.exit();
};

const postCombatHeal = () => {
  if (player.health < player.combatStartHealth) {
    console.log('you bind your wounds as best you can');
  }
  playerHeal(player.combatHealValue);
  //fighting shouldn't make you healthier than when you started
  if (player.health > player.combatStartHealth) {
    player.health = player.combatStartHealth;
  }
  console.log(`your health is ${player.health}/${player.maxHealth} \n`);
};

const playerHeal = (healAmount) => {
  player.health = player.health + healAmount;
  if (player.health > player.maxHealth) {
    player.health = player.maxHealth;
  }
};

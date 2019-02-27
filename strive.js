const stdin = process.stdin;
stdin.setEncoding("utf8");

const creatureAdjectives = ["delicate", "", "large", "enormous"];
const creatures = [
  "beast with dulled fangs",
  "creature with sharp claws",
  "beast with many fearsome horns",
  "creature with flames dripping from its jaws"
];

const sceneryAdjectives = ["small", "strange", "venerable", "remarkable"];
const scenery = ["river", "tree", "tower", "hill"];

//maybe I should rename this variable
const dispositions = [
  "you hear some birds chirping",
  "your feet ache",
  "you feel a pleasant breeze",
  "sweat trickles from your brow"
];

let playerAttack = 3;
const attackPenalty = 1;
const playerDefense = 1;

let playerHealth = 15;
const maxPlayerHealth = 15;
let playerFightStartHealth = 0;

let isMonster = false;
let monsterType = "";
let monsterAdj = "";
let monsterHealth = 0;
let monsterAttack = 0;

let combatQueued = true;
const postCombatHeal = 2;

let distTraveled = 0;
const distNeeded = 30;

let sceneryType = "";
let sceneryAdj = "";

const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
};
const updateMonster = () => {
  let randHealth = getRandom(1,4);
  let randAttack = getRandom(1,4);
  //lowest health should take about two attacks (3-7 hp)
  //highest health should take about five attacks (15-19 hp)
  monsterHealth = getRandom((randHealth * 4)-1, (randHealth * 4) -3);
  monsterAdj = creatureAdjectives[randHealth-1];

  monsterAttack = randAttack;
  monsterType = creatures[randAttack-1];
};
const updateScenery = () => {
  sceneryType = scenery[getRandom(0, scenery.length - 1)];
  sceneryAdj = sceneryAdjectives[getRandom(0, sceneryAdjectives.length - 1)];
};

//introductory text
console.log("welcome to strive \nenter '-help' for help \n");
//handles user input
stdin.on("data", function(d) {
  if (d.trim() == "w" && !isMonster) {
    if (distTraveled >= distNeeded) {
      console.log("you made it to your destination, congratulations");
      process.exit();
    }

    console.log("you move forward");
    distTraveled++;
   console.log(`you've traveled ${distTraveled}`)
    let randNum = getRandom(1, 40);
    if (randNum <= 6) {
      isMonster = true;
      updateMonster();
      console.log(`you encounter a ${monsterAdj} ${monsterType} \n`);
    }

    if (randNum >= 10 && randNum <= 16) {
      updateScenery();
      console.log(`you see a ${sceneryAdj} ${sceneryType} \n`);
    }

    if (randNum >= 20 && randNum <= 21) {
      console.log(dispositions[getRandom(0, dispositions.length - 1)] + "\n");
    }

    if (randNum == 39) {
      //find an item
      console.log("you find some medical supplies");
      playerHealth = playerHealth + 5;
      if (playerHealth > maxPlayerHealth) {
        playerHealth = maxPlayerHealth;
      }
      console.log(`your health is ${playerHealth}/${maxPlayerHealth} \n`);
    }

    if (randNum == 40) {
      console.log("you find a better weapon \n");
      playerAttack++;
    }
  }
  if (d.trim() == "a" && isMonster) {
    console.log("you attack");
    console.log(`the ${monsterType} attacks`);
    if (combatQueued) {
      playerFightStartHealth = playerHealth;
    }
    combatQueued = false;

    monsterHealth = monsterHealth - playerAttack;
    playerHealth = playerHealth - monsterAttack;
    console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);

    if (monsterHealth <= 0) {
      console.log(`you slay the ${monsterType}`);
      isMonster = false;
      monsterAttack = 0;
      combatQueued = true;
    }

    if (playerHealth <= 0) {
      console.log(`the ${monsterType} slays you`);
      process.exit();
    }
    //it's possible player and monster are slain simultaneously
    if (!isMonster) {
      if (playerHealth < playerFightStartHealth) {
        console.log("you bind your wounds as best you can");
      }
      playerHealth = playerHealth + postCombatHeal;
      if (playerHealth > playerFightStartHealth) {
        playerHealth = playerFightStartHealth;
      }
      console.log(`your health is ${playerHealth}/${maxPlayerHealth} \n`);
    }
  }
  if (d.trim() == "d" && isMonster) {
    console.log("you defend");
    console.log(`the ${monsterType} attacks`);
    if (combatQueued) {
      playerFightStartHealth = playerHealth;
    }
    combatQueued = false;

    monsterHealth = monsterHealth - (playerAttack - attackPenalty);

    //makes sure player isn't healed by negative damage
    if (monsterAttack - playerDefense > 0) {
      playerHealth = playerHealth - (monsterAttack - playerDefense);
    }

    console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);

    if (monsterHealth <= 0) {
      console.log(`you slay the ${monsterType}`);
      isMonster = false;
      monsterAttack = 0;
      combatQueued = true;
    }

    if (playerHealth <= 0) {
      console.log(`the ${monsterType} slays you`);
      process.exit();
    }

    if (!isMonster) {
      if (playerHealth < playerFightStartHealth) {
        console.log("you bind your wounds as best you can");
      }
      playerHealth = playerHealth + postCombatHeal;

      //fighting shouldn't make you healthier than when you started
      if (playerHealth > playerFightStartHealth) {
        playerHealth = playerFightStartHealth;
      }
      console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);
    }
  }
  if (d.trim() == "f" && isMonster) {
    console.log("you flee");
    if (combatQueued) {
      playerFightStartHealth = playerHealth;
    }
    let randNum = getRandom(1, 4);
    combatQueued = false;

    //flee fails
    if (randNum == 1) {
      console.log(`the ${monsterType} catches you and mauls you badly`);
      playerHealth = playerHealth - (maxPlayerHealth - 1);
      console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);
      if (playerHealth <= 0) {
        console.log(`the ${monsterType} slays you`);
        process.exit();
      }
    }

    //flee succeeds
    if (randNum > 1) {
      combatQueued = false;
      isMonster = false;

      console.log("you flee successfully");
      playerHealth = playerHealth + postCombatHeal;

      //fighting shouldn't make you healthier than when you started
      if (playerHealth > playerFightStartHealth) {
        playerHealth = playerFightStartHealth;
      }
      if (playerHealth < playerFightStartHealth) {
        console.log("you bind your wounds as best you can");
        console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);
      }
      distTraveled = distTraveled + 5;
      combatQueued = true;
    }
  }
  if (d.trim() == "-help") {
    console.log("you are journeying through a land of some peril");
    console.log(
      "enter w to move forward, a to attack, d to defend, and f to flee"
    );
    console.log("note that defending deals damage, just less than attacking");
    console.log("good luck");
  }
});

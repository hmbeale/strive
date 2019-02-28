const stdin = process.stdin;
stdin.setEncoding("utf8");

const creatureAdjectives = ["delicate", "medium sized", "large", "hulking"];
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

const player = new Object();
player.attack = 3;
player.attackPenalty = 2;
player.defenseValue = 1;
player.attack = 3;
player.health = 15;
player.maxHealth = 15;
player.fightStartHealth = 15;
player.postCombatHeal = 2;

const monster = new Object();
monster.type = "";
monster.adj = "";
monster.health = 0;
monster.attack = 0;

let isMonster = false;
let combatQueued = true;

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
  let randHealth = getRandom(1, 4);
  let randAttack = getRandom(1, 4);
  //lowest health should take about two attacks (3-7 hp)
  //highest health should take about five attacks (15-19 hp)
  monster.health = getRandom(randHealth * 4 - 1, randHealth * 4 + 3);
  monster.adj = creatureAdjectives[randHealth - 1];

  monster.attack = randAttack;
  monster.type = creatures[randAttack - 1];
};
const updateScenery = () => {
  sceneryType = scenery[getRandom(0, scenery.length - 1)];
  sceneryAdj = sceneryAdjectives[getRandom(0, sceneryAdjectives.length - 1)];
};
const moveForward = () => {
  console.log("you move forward");
  distTraveled++;
};
const slayMonster = () => {
  console.log(`you slay the ${monster.type} \n`);
  isMonster = false;
  monster.attack = 0;
  combatQueued = true;
};
const postCombatHealing = () => {
  if (player.health < player.fightStartHealth) {
    console.log("you bind your wounds as best you can");
  }

  //fighting shouldn't make you healthier than when you started
  if (player.health > player.fightStartHealth) {
    player.health = player.fightStartHealth;
  }
  console.log(`your health is ${player.health}/${player.maxHealth} \n`);
};
const combatStart = () => {
  console.log(`the ${monster.type} attacks`);
  if (combatQueued) {
    player.fightStartHealth = player.health;
  }
  combatQueued = false;
};
const playerCombatDeath = () => {
  console.log(`the ${monster.type} slays you`);
  process.exit();
};
const resolveCombatDamage = (playerAttack, monsterAttack) => {
  monster.health = monster.health - playerAttack;

  //makes sure player isn't healed by negative damage
  if (monsterAttack > 0) {
    player.health = player.health - monsterAttack;
  }

  console.log(`your health is ${player.health}/${player.maxHealth} \n`);
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

    let randNum = getRandom(1, 40);
    if (randNum <= 6) {
      moveForward();
      updateMonster();
      console.log(`you encounter a ${monster.adj} ${monster.type} \n`);
      isMonster = true;
    }

    if (randNum >= 7 && randNum <= 29) {
      moveForward();
      console.log("");
    }

    if (randNum >= 30 && randNum <= 36) {
      moveForward();
      updateScenery();
      console.log(`you see a ${sceneryAdj} ${sceneryType} \n`);
    }

    if (randNum >= 37 && randNum <= 38) {
      moveForward();
      console.log(dispositions[getRandom(0, dispositions.length - 1)] + "\n");
    }

    if (randNum == 39) {
      moveForward();
      console.log("you find some medical supplies");
      player.health = player.health + 5;
      if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
      }
      console.log(`your health is ${player.health}/${player.maxHealth} \n`);
    }

    if (randNum == 40) {
      moveForward();
      console.log("you find a better weapon \n");
      player.attack++;
    }
  }
  if (d.trim() == "a" && isMonster) {
    console.log("you attack");
    combatStart();
    resolveCombatDamage(player.attack, monster.attack);

    if (monster.health <= 0) {
      slayMonster();
    }

    if (player.health <= 0) {
      playerCombatDeath();
    }

    if (!isMonster) {
      postCombatHealing();
    }
  }
  if (d.trim() == "d" && isMonster) {
    console.log("you defend");
    combatStart();
    resolveCombatDamage(
      player.attack - player.attackPenalty,
      monster.attack - player.defenseValue
    );

    if (monster.health <= 0) {
      slayMonster();
    }

    if (player.health <= 0) {
      playerCombatDeath();
    }

    if (!isMonster) {
      postCombatHealing();
    }
  }
  if (d.trim() == "f" && isMonster) {
    console.log("you flee");
    combatStart();

    let randNum = getRandom(1, 4);

    //flee fails
    if (randNum == 1) {
      console.log(`the ${monster.type} catches you and mauls you badly`);
      console.log("");
      //player deals no damage, monster deals max hp-1 damage
      resolveCombatDamage(0, player.maxHealth - 1);
      if (player.health <= 0) {
        playerCombatDeath();
      }
    }

    //flee succeeds
    if (randNum > 1) {
      isMonster = false;

      console.log(
        "you escape successfully but your " +
          "flight takes you further from your goal \n"
      );
      player.health = player.health + player.postCombatHeal;

      postCombatHealing();

      distTraveled = distTraveled - 5;
      combatQueued = true;
    }
  }
  if (d.trim() == "-help") {
    console.log("you are journeying through a land of some peril");
    console.log(
      "enter w to move forward, a to attack, d to defend, and f to flee"
    );
    console.log(
      "note that defending does deals damage, just less than attacking"
    );
    console.log("good luck");
  }
});

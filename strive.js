const stdin = process.stdin;
stdin.setEncoding('utf8');

const creatureAdjectives = ['big', 'foul smelling', 'nasty', 'ravenous'];
const creatures = ['beast with sharp fangs',
                   'creature with a hairy hide',
                   'beast with fearsome horns',
                   'creature with cloven hooves'];

const sceneryAdjectives = ['small', 'strange', 'venerable', 'remarkable'];
const scenery = ['river', 'tree', 'tower', 'hill'];

//maybe I should rename this variable
const dispositions = ['you hear some birds chirping',
                      'your feet ache',
                      'you feel a pleasant breeze',
                      'sweat trickles from your brow']

let playerAttack = 3;
const attackPenalty = 2;
const playerDefense = 1;

let playerHealth = 20;
const maxPlayerHealth = 20;
let playerFightStartHealth = 0;

let isMonster = false;
let monsterType = '';
let monsterAdj = '';
let monsterHealth = 0;
let monsterAttack = 0;

let combatStart = true;
const postCombatHeal = 4;

let distTraveled = 0;
const distNeeded = 30;

let sceneryType = '';
let sceneryAdj = '';

const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
const updateMonster = () => {
  monsterHealth = getRandom(6,15);
  monsterAttack = getRandom(1,3);
  monsterType = creatures[getRandom(0, creatures.length-1)];
  monsterAdj = creatureAdjectives[getRandom(0, creatureAdjectives.length-1)];
}
const updateScenery = () => {
  sceneryType = scenery[getRandom(0, scenery.length-1)];
  sceneryAdj = sceneryAdjectives[getRandom(0, sceneryAdjectives.length-1)];
}


//introductory text
console.log('welcome to strive \nenter \'-help\' for help \n');
//handles user input
stdin.on("data", function(d) {
    if (d.trim() == "w" && !isMonster){

      if (distTraveled >= distNeeded){
        console.log('you succeeded, congratulations')
        process.exit();
      }

      console.log('you move forward \n');
      distTraveled++;
      let randNum = getRandom(1,20)
      if (randNum <=3){
        isMonster = true;
        updateMonster();
        console.log (`you encounter a ${monsterAdj} ${monsterType} \n`);
      }

      if (randNum >=4 && randNum <=6){
        updateScenery();
        console.log(`you see a ${sceneryAdj} ${sceneryType} \n`);
      }

      if (randNum >= 7 && randNum <= 7){
        console.log(dispositions[getRandom(0, dispositions.length-1)] + '\n');
      }

      if (randNum == 19){
        //find an item
        console.log('you find some medical supplies');
        playerHealth = playerHealth + 5;
        if (playerHealth > maxPlayerHealth){playerHealth = maxPlayerHealth};
        console.log(`your health is ${playerHealth}/${maxPlayerHealth} \n`);
      }

      if (randNum == 20){
        console.log('you find a better weapon \n')
        playerAttack++;
      }

    }
    if (d.trim() == "a" && isMonster){
      console.log('you attack');
      console.log(`the ${monsterType} attacks`);
      if (combatStart){ playerFightStartHealth = playerHealth; }
      combatStart = false;

      monsterHealth = monsterHealth - playerAttack;
      playerHealth = playerHealth - monsterAttack;
      console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);

      if (monsterHealth <= 0){
          console.log(`you slay the ${monsterType}`);
          isMonster = false;
          monsterAttack = 0;
          combatStart = true;
        }

      if (playerHealth <=0){
        console.log(`the ${monsterType} slays you`);
        process.exit();
      }
      //it's possible player and monster are slain simultaneously
      if (!isMonster){
          if (playerHealth < playerFightStartHealth){
            console.log('you bind your wounds as best you can');
          }
          playerHealth = playerHealth + postCombatHeal;
          if (playerHealth > playerFightStartHealth){playerHealth = playerFightStartHealth};
          console.log(`your health is ${playerHealth}/${maxPlayerHealth} \n`);
        }

    }
    if (d.trim() == "d" && isMonster){
      console.log('you defend');
      console.log(`the ${monsterType} attacks`);
      if (combatStart){ playerFightStartHealth = playerHealth; }
      combatStart = false;

      monsterHealth = monsterHealth - (playerAttack - attackPenalty);

      //makes sure player isn't healed by negative damage
      if ((monsterAttack - playerDefense) > 0){
          playerHealth = playerHealth - (monsterAttack - playerDefense);
      }

      console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);

      if (monsterHealth <= 0){
          console.log(`you slay the ${monsterType}`);
          isMonster = false;
          monsterAttack = 0;
          combatStart = true;
        }

      if (playerHealth <=0){
        console.log(`the ${monsterType} slays you`);
        process.exit();
      }

      if (!isMonster){
          if (playerHealth < playerFightStartHealth){
            console.log('you bind your wounds as best you can');
          }
          playerHealth = playerHealth + postCombatHeal;

          //fighting shouldn't make you healthier than when you started
          if (playerHealth > playerFightStartHealth){playerHealth = playerFightStartHealth};
          console.log(`your health is ${playerHealth}/${maxPlayerHealth}`);
        }

    }
    if (d.trim() == "-help"){
      console.log('you are journeying through a land of some peril');
      console.log('enter w to move forward, a to attack and d to defend');
      console.log('note that defending deals damage, just less than attacking')
      console.log('good luck');
    }
  });

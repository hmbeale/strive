const stdin = process.stdin;
stdin.setEncoding('utf8');

const creatureAdjectives = ['big', 'hairy', 'nasty', 'ravenous'];
const creatures = ['bugblatter', 'shinesniper', 'amblesnout', 'limberlimp'];
//other names
//'dirgefalker', 'quimsplinter', 'thneedoran', 'askulip'

const sceneryAdjectives = ['small', 'strange', 'venerable', 'remarkable'];
const scenery = ['river', 'tree', 'tower', 'hill'];

//maybe I should rename these
const dispositions = ['you hear some birds chirping',
                      'your feet ache',
                      'you feel a pleasant breeze',
                      'you have been away from home a long time']
//add other items prob
const items = ['fist-sized rock']

let playerAttack = 1;
let playerHealth = 10;
let maxPlayerHealth = 10;
let distTraveled = 0;
const distNeeded = 30;

let isMonster = false;
let monsterType = '';
let monsterAdj = '';
let monsterHealth = 0;
let monsterAttack = 0;

let sceneryType = '';
let sceneryAdj = '';

let playerDisposition = '';
let playerItem = '';

const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
const updateMonster = () => {
  monsterHealth = getRandom(1,3);
  monsterAttack = getRandom(1,4);
  monsterType = creatures[getRandom(0, creatures.length-1)];
  monsterAdj = creatureAdjectives[getRandom(0, creatureAdjectives.length-1)];
}
const updateScenery = () => {
  sceneryType = scenery[getRandom(0, scenery.length-1)];
  sceneryAdj = sceneryAdjectives[getRandom(0, sceneryAdjectives.length-1)];
}
const updateDisposition = () => {
  playerDisposition = dispositions[getRandom(0, dispositions.length-1)];
}
const updateItem = () => {
  playerItem = items[getRandom(0, items.length-1)];
}

console.log('move forward with w, attack with a and use item with d');
updateItem();
console.log(`you have a ${playerItem}`);

//handles user input
stdin.on("data", function(d) {
    if (d.trim() == "w" && !isMonster){

      if (distTraveled >= distNeeded){
        console.log('you succeeded, congratulations')
        process.exit();
      }

      console.log('you move forward');
      distTraveled++;
      let randNum = getRandom(1,20)
      if (randNum <=4){
        isMonster = true;
        updateMonster();
        console.log (`you encounter a ${monsterAdj} ${monsterType}`);
      }

      if (randNum >=9 && randNum <=12){
        updateScenery();
        console.log(`you see a ${sceneryAdj} ${sceneryType}`);
      }

      if (randNum == 13){
        updateDisposition();
        console.log(playerDisposition);
      }

      if (randNum >=16 && randNum <=18){
        updateItem();
        console.log(`you find a ${playerItem}`);
      }

      if (randNum == 19){
        //find an item
        console.log('you find some medical supplies');
        playerHealth = maxPlayerHealth;
        console.log(`your health is ${playerHealth}`);
      }

      if (randNum == 20){
        console.log('you find a better weapon')
        playerAttack++;
      }

    }
    if (d.trim() == "a" && isMonster){
      console.log('you attack');
      console.log(`the ${monsterType} attacks`);
      monsterHealth = monsterHealth - playerAttack;
      playerHealth = playerHealth - monsterAttack;
      console.log(`your health is ${playerHealth}`);

    }
    if (d.trim() == "d" && isMonster){
      console.log(`you use your ${playerItem}`);
      console.log(`the ${monsterType} attacks`);

      if (playerItem == 'fist-sized rock'){
        console.log(`the thrown rock hurts the ${monsterType} before it can reach you`)
        monsterHealth = monsterHealth - 2;
        playerItem = '';
      }

      if (monsterHealth <= 0){
          console.log(`you slay the ${monsterType}`);
          isMonster = false;
          monsterAttack = 0;
        }

      playerHealth = playerHealth - monsterAttack;

      if (playerHealth <=0){
        console.log(`the ${monsterType} slays you`);
        process.exit();
      }
      //it's possible player and monster are slain simultaneously
      if (monsterHealth <= 0){
          if (playerHealth < maxPlayerHealth){
            console.log('you bind your wounds as best you can');
          }
          playerHealth = playerHealth + 2;
          if (playerHealth > maxPlayerHealth){playerHealth = maxPlayerHealth};
          console.log(`your health is ${playerHealth}`);
        }
    }

  });

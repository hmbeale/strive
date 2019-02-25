const prompt = require('prompt');
prompt.message = "input something please"
  //
  // Start the prompt
  //
  prompt.start();

  //
  // Get two properties from the user: username and email
  //
  prompt.get(['action'], function (err, result) {
    //
    // Log the results.

    if (result.action.length<= 5){
      console.log ('ah, a simple action');
    }

    console.log(`you ${result.action}`);
  });

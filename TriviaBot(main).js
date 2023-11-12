require("dotenv").config();
const tmi = require("tmi.js");

let activeChannels = ["king110063", "scam_etc"];
let trivia = {
  "What is the capital of France?": "Paris",
  "What is the capital of Japan?": "Tokyo",
  // Add more trivia questions and answers here
};
let currentQuestion = "";
let currentAnswer = "";
let leaderboards = {};

const client = new tmi.Client({
  options: { debug: false }, //if debug is set to true u see chat messages and bot status automatically.
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: process.env.USERNAME1, //username is set to krish when process.env.USERNAME is used.
    password: process.env.PASSWORD,
  },
  channels: activeChannels,
});

client
  .connect().then(() => {
    activeChannels.forEach((channel, index) => {
      setTimeout(() => {
        if (!client.channels.includes(channel)) {
          client
            .join(channel)
            .then(() => {
              client
                .say(channel, " has entered the chat.")
                .catch(console.error);
            })
            .catch(console.error);
        }
      }, index * 2000); // Increase delay to 2 seconds

      leaderboards[channel] = {}; // Initialize leaderboard for each channel
      console.log(`Bot is connected to ${channel.slice(1)}`);
    });
  }).catch(console.error);

let isSendingMessages = {}; //  To toggle the bot on/off in a channel.
let firstCorrectGuess = {}; // To give 100 points only to the first correct guesser.
let correctGuessers = {}; // To stop correct chatters to reguess on the same question.

activeChannels.forEach((channel) => {
  isSendingMessages[channel] = true;
  firstCorrectGuess[channel] = false;
});

client.on("message", (channel, tags, message, self) => {
  if(self) return;

  // console.log(channel, ":", tags.username, "=>", message);

  message = message.toLowerCase();

  // Check if the message sender is the owner of the channel
  if (tags.username === channel.slice(1)) {
    if (message === "!joinchannel") {
      if (!activeChannels.includes(channel)) {
        activeChannels.push(channel);
        client.join(channel);
        }
      if (isSendingMessages[channel]){
          client.say(channel,'Bot is already active.')
      } else {client.say(channel, "has entered the chat.");
      }
      isSendingMessages[channel] = true;
      
    } else if (message === "!leavechannel") {
      isSendingMessages[channel] = false;
      client.say(channel, "has left the chat.");
    } else if (message === "!reset") {
      leaderboards[channel] = {};
      client.say(channel, "Leaderboard has been reset.");
    }
  } else {
    if (message === "!joinchannel" || message === "!leavechannel" || message === "!reset") {
      client.say(channel, "This command is only available to the owner.");
    }
  }

  if (isSendingMessages[channel]) {
    if (message === "!question") {
      client.say(channel, `The current question is: ${currentQuestion}`);
    } else if (message.startsWith("!ans ") || message.startsWith("!answer ")) {
      if (isSendingMessages[channel]) {
        const userAnswer = message.split(" ").slice(1).join(" ");
        if (userAnswer.toLowerCase() === currentAnswer.toLowerCase()) {
          // Ignore the answer if the user has already guessed correctly
          if (
            correctGuessers[channel] &&
            correctGuessers[channel][tags.username]
          ) {
            client.say(channel, `${tags.username}, You have already guessed the answer.`); //or return;
          } else {
            if (!leaderboards[channel][tags.username]) {
            leaderboards[channel][tags.username] = 0;
          }

          if (!firstCorrectGuess[channel]) {
            leaderboards[channel][tags.username] += 100;
            firstCorrectGuess[channel] = true;
          } else {
            leaderboards[channel][tags.username] += 20;
          }

          // Mark the user as having guessed correctly
          if (!correctGuessers[channel]) {
            correctGuessers[channel] = {};
          }
          correctGuessers[channel][tags.username] = true;

          client.say(channel, `${tags.username}, that's correct!`);        
          }
        } else {
          if (
            correctGuessers[channel] &&
            correctGuessers[channel][tags.username]
          ) {
            client.say(channel, `${tags.username}, You have already guessed the answer.`);
          }else{
          client.say(channel, `${tags.username}, sorry, that's not correct.`);
          }
        }
      }
    } else if (message.startsWith("!points")) {
      let username = message.split(" ")[1];
      if (!username) {
        username = tags.username; // Use the username of the user who executed the command
      } else if (username.startsWith("@")) {
        username = username.slice(1); // Remove the '@' symbol
      }
      const points = leaderboards[channel][username] || 0;
      client.say(channel, `${username} has ${points} points.`);
    } else if (message === "!leaderboard") {
      let leaderboard = Object.entries(leaderboards[channel])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      let leaderboardString = leaderboard
        .map((user, index) => `${index + 1}. ${user[0]}: ${user[1]} points`)
        .join("\n");
      client.say(channel, `Top 10 guessers:\n${leaderboardString}`);
    } else if (message === "!commands") {
      client.say(channel,"Commanads available to owner: !joinchannel, !leavechannel, !reset.\n Global commanads: !question, !ans/!answer, !points, !leaderboard.");
    }
  }
});

setInterval(()=> {
  const keys = Object.keys(trivia);
  currentQuestion = keys[Math.floor(Math.random() * keys.length)];
  currentAnswer = trivia[currentQuestion];

  activeChannels.forEach((channel) => {
    if (isSendingMessages[channel]) {
      client.say(channel, `Trivia time! ${currentQuestion}`);
      firstCorrectGuess[channel] = false;
      correctGuessers[channel] = {}; // Reset the correct guessers for the new question
    }
  });
},15 * 60 * 1000) //send a random trivia every 15 mins.


require('dotenv').config();
const tmi = require('tmi.js');

// console.log(process.env.USERNAME1);
// console.log(process.env.PASSWORD);

let activeChannels = ['king110063','scam_etc'];
let trivia = {
    'What is the capital of France?': 'Paris',
    'What is the capital of Japan?': 'Tokyo',
    // Add more trivia questions and answers here
};
let currentQuestion = '';
let currentAnswer = '';
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

(client.connect().then(() => {
    activeChannels.forEach((channel, index) => {
        setTimeout(() => {
            if (!client.channels.includes(channel)) {
                client.join(channel).then(() => {
                    client.say(channel, " has entered the chat.").catch(console.error);
                }).catch(console.error);
            }
        }, index * 2000); // Increase delay to 2 seconds
    
    leaderboards[channel] = {}; // Initialize leaderboard for each channel
    console.log(`Bot is connected to ${(channel.slice(1))}`);    
    });
}).catch(console.error)
);
 
let isSendingMessages = {};
let firstCorrectGuess = {};

activeChannels.forEach(channel => {
    isSendingMessages[channel] = true;
    firstCorrectGuess[channel] = false;
});

client.on('message', (channel, tags, message, self) => {
//   if (self) return; // Ignore messages from the bot itself

  console.log(channel, ":", tags.username, "=>", message);

  message = message.toLowerCase();

  // Check if the message sender is the owner of the channel
  if (tags.username === channel.slice(1)) {
    if (message === "!joinchannel") {
      if (!activeChannels.includes(channel)) {
        activeChannels.push(channel);
        client.join(channel);
        isSendingMessages[channel] = true;
        client.say(channel, "has entered the chat.");
      } else {
        isSendingMessages[channel] = true;
        client.say(channel, "has entered the chat.");
      }
    } else if (message === "!leavechannel") {
      isSendingMessages[channel] = false;
      client.say(channel, "has left the chat.");
    } else if (message === "!reset") {
      leaderboards[channel] = {};
      client.say(channel, "Leaderboard has been reset.");
    }
  } else {
        if(message === '!joinchannel' || message === '!leavechannel' || message === '!reset') {
            client.say(channel, "This command is only available to the owner.");
        }
  }

  if (message === "!question") {
    if (isSendingMessages[channel]) {
      client.say(channel, `The current question is: ${currentQuestion}`);
    }
  } else if (message.startsWith("!ans ") || message.startsWith("!answer ")) {
    if (isSendingMessages[channel]) {
      const userAnswer = message.split(" ").slice(1).join(" ");
      if (userAnswer.toLowerCase() === currentAnswer.toLowerCase()) {
        if (!leaderboards[channel][tags.username]) {
          leaderboards[channel][tags.username] = 0;
        }
        if (!firstCorrectGuess[channel]) {
          leaderboards[channel][tags.username] += 100;
          firstCorrectGuess[channel] = true;
        } else {
          leaderboards[channel][tags.username] += 20;
        }
        client.say(channel, `${tags.username}, that's correct!`);
      } else {
        client.say(channel, `${tags.username}, Try again, that's not correct.`);
      }
    }
  } else if (message.startsWith("!points ")) {
    
    let username = message.split(" ")[1];
    if (username.startsWith("@")) {
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
  }
});

setInterval(() => {
    // Select a random trivia question
    const keys = Object.keys(trivia);
    currentQuestion = keys[Math.floor(Math.random() * keys.length)];
    currentAnswer = trivia[currentQuestion];

    activeChannels.forEach(channel => {
        if(isSendingMessages[channel]) {
            client.say(channel, `Trivia time! ${currentQuestion}`);
            firstCorrectGuess[channel] = false
        }
    });
}, 5*60*1000 ); // 5 minutes

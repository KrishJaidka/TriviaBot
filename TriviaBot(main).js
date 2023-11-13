require("dotenv").config();
const tmi = require("tmi.js");

let activeChannels = ["king110063", "scam_etc"];
let trivia = {
  'Who said this quote: "Chess is life."': "Bobby Fischer",
  'Who said this quote: "A computer once beat me at chess, but it was no match for me at kickboxing."':
    "Emo Philips",
  'Who said this quote: "Critical thinking is the most important factor with chess. As it is in life, you need to think before you make decisions."':
    "Hikaru Nakamura",
  'Who said this quote: "Chess is my life, but my life is not chess."':
    "Anatoly Karpov",
  'Who said this quote: "I am convinced, the way one plays chess always reflects the player\'s personality. If something defines his character, then it will also define his way of playing."':
    "Vladimir Kramnik",
  'Who said this quote: "Chess demolishes differences. It\'s a language of different generations."':
    "Judit Polgar",
  'Who said this quote: "Chess is ruthless: you\'ve got to be prepared to kill people."':
    "Nigel Short",
  'Who said this quote: "Chess is not for timid souls."': "Wilhelm Steinitz",
  'Who said this quote: "All I want to do, ever, is play chess."':
    "Bobby Fischer",
  'Who said this quote: "I am still a victim of chess. It has all the beauty of art and much more. It cannot be commercialized. Chess is much purer than art in its social position."':
    "Marcel Duchamp",
  "Who said this quote: \"Once you're a chess player, you spend a lot of time thinking about the game and you can't get it completely out of your head.\"":
    "Magnus Carlsen",
  'Who said this quote: "Chess first of all teaches you to be objective."':
    "Alexander Alekhine",
  'Who said this quote: "I get more upset at losing at other things than chess. I always get upset when I lose at Monopoly."':
    "Magnus Carlsen",
  'Who said this quote: "Life is very much about making the best decisions you can. So I think chess is very valuable."':
    "Hikaru Nakamura",
  'Who said this quote: "Chess is mental torture."': "Garry Kasparov",
  'Who said this quote: "Chess is changing. I hope chess is getting more popular, more spectacular."':
    "Alexandra Kosteniuk",
  "Who said this quote: \"The great thing about chess is it's a game for oneself. You don't work on what you can't control, you just work on yourself. And I think if more people did that, we'd all be a lot better off.\"":
    "Daniel Naroditsky",
  'Who said this quote: "Chess is an infinitely complex game, which one can play in infinitely numerous and varied ways."':
    "Vladimir Kramnik",
  'Who said this quote: "Chess taught me patience."': "Yuzvendra Chahal",
  'Who said this quote: "In poker, you want to play the weaker guys. In chess, it\'s the opposite."':
    "Hikaru Nakamura",
  'Who said this quote: "I believe that the true beauty of chess is more than enough to satisfy all possible demands."':
    "Alexander Alekhine",
  'Who said this quote: "Whoever sees no other aim in the game than that of giving checkmate to one\'s opponent will never become a good Chess player."':
    "Max Euwe",
  'Who said this quote: "I was world champion. For me, chess is my life. It is everything."':
    "Anatoly Karpov",
  'Who said this quote: "For me art and chess are closely related, both are forms in which the self finds beauty and expression."':
    "Vladimir Kramnik",
  "Who said this quote: \"In chess, everyone's accepted. That's what's great about it. You can be a little bit different. You can be an oddball.\"":
    "Hikaru Nakamura",
  'Who said this quote: "I want to show how rich chess is and what kind of history it has, through culture, literature, and education."':
    "Judit Polgar",
  'Who said this quote: "I consider myself to be a genius who happens to play chess."':
    "Bobby Fischer",
  'Who said this quote: "Chess is a game where all different sorts of people can come together, not a game in which people are divided because of their religion or country of origin."':
    "Hikaru Nakamura",
  "Who said this quote: \"With chess, it was almost this palpable electricity that I felt. You're totally in control of your own fate. There's no luck factor. It's you and the pieces.\"":
    "Daniel Naroditsky",
  'Who said this quote: "I learned that fighting on the chessboard could also have an impact on the political climate in the country."':
    "Garry Kasparov",
  'Who said this quote: "I barely know what my plans are for tomorrow, but I hope chess will remain a major part of my life."':
    "Anish Giri",
  'Who said this quote: "Chess for me is not a game, but an art. Yes, and I take upon myself all those responsibilities which an art imposes on its adherents."':
    "Alexander Alekhine",
  'Who said this quote: "Chess is so inspiring that I do not believe a good player is capable of having an evil thought during the game."':
    "Wilhelm Steinitz",
  'Who said this quote: "consider myself to be a genius who happens to play chess."':
    "Bobby Fischer",
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
  .connect()
  .then(() => {
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
  })
  .catch(console.error);

let isSendingMessages = {}; //  To toggle the bot on/off in a channel.
let firstCorrectGuess = {}; // To give 100 points only to the first correct guesser.
let correctGuessers = {}; // To stop correct chatters to reguess on the same question.

activeChannels.forEach((channel) => {
  isSendingMessages[channel] = true;
  firstCorrectGuess[channel] = false;
});

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  // console.log(channel, ":", tags.username, "=>", message);

  message = message.toLowerCase();

  // Check if the message sender is the owner of the channel
  if (tags.username === channel.slice(1)) {
    if (message === "!joinchannel") {
      if (!activeChannels.includes(channel)) {
        activeChannels.push(channel);
        client.join(channel);
      }
      if (isSendingMessages[channel]) {
        client.say(channel, "Bot is already active.");
      } else {
        client.say(channel, "has entered the chat.");
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
    if (
      message === "!joinchannel" ||
      message === "!leavechannel" ||
      message === "!reset"
    ) {
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
            client.say(
              channel,
              `${tags.username}, You have already guessed the answer.`
            ); //or return;
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
            client.say(
              channel,
              `${tags.username}, You have already guessed the answer.`
            );
          } else {
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
        .join("");
      client.say(channel, `Top 10 guessers:${leaderboardString}`);
    } else if (message === "!commands") {
      client.say(
        channel,
        "Commanads available to owner: !joinchannel, !leavechannel, !reset. Global commanads: !question, !ans/!answer, !points, !leaderboard."
      );
    }
  }
});

setInterval(() => {
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
},15 * 60 * 1000) //send a random trivia every 5 mins.
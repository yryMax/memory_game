const express = require("express");
const http = require("http");
const websocket = require("ws");
const port = process.argv[2];
const app = express();
const GameState = require("./game");
let gameState = new GameState();
const message = {
  cards: [],
  cardsState: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  opScore: 0,
  myScore: 0,
  needSwitch: false,
  wait: true,
  aborted: false
}
const array = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const server = http.createServer(app);
const wss = new websocket.Server({ server });
//router
let visitors = 0;
app.get("/play", function (req, res) {
  res.sendFile("game.html", {root: "./public"});
});
app.get("/", function (req, res) {
  //console.log(gameState.checkOngoingGame());
  //console.log(gameState.checkCompletedGame());
  //console.log(visitors)
  res.render("splash.ejs", {
    gamesOngoing: gameState.checkOngoingGame(),
    gamesCompleted: gameState.checkCompletedGame(),
    visitors: visitors
  });
  visitors++;
});

//websocket
let connectionID = 0;

let currentGame = gameState.offerNewGame();
const websockets = {}; //property: websocket, value: game

wss.on("connection", function connection(ws) {
  const con = ws;
  con["id"] = connectionID;
  websockets[connectionID++] = currentGame;
  console.log(
    `Player ${con["id"]} placed in game ${currentGame.id}`
  );
  //console.log(gameState.checkOngoingGame());
  //console.log(gameState.checkCompletedGame());
  if(currentGame.addPlayer(con) == true){//the game is about to start
    message.wait = false;
    message.cards = array.sort((a, b) => 0.5 - Math.random());
    message.cardsState = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    message.opScore = 0;
    message.myScore = 0;
    message.needSwitch = false;
    message.aborted = false;
    currentGame.playerB.send(JSON.stringify(message));
    message.needSwitch = true;
    currentGame.playerA.send(JSON.stringify(message));
    currentGame.status = 1;//set the current game ongoing
    currentGame = gameState.offerNewGame();
  }
  else {
    message.wait = true;
    con.send(JSON.stringify(message));
  }
  con.on("message", function incoming(msg) {
    const oMsg = JSON.parse(msg.toString());

    const gameObj = websockets[con["id"]];

 //   console.log(oMsg);
    if(oMsg.opScore+oMsg.myScore == 8)gameObj.setComplete();//set game complete
    if(gameObj.playerA == con){//send message from A to B
      gameObj.playerB.send(JSON.stringify(oMsg));
    }
    else {//send message from B to A
      gameObj.playerA.send(JSON.stringify(oMsg));
    }
  });
  
  con.on("close", function(code) {
    console.log(`${con["id"]} disconnected ...`);
    if (code == 1001) {
      const gameObj = websockets[con["id"]];
 
      if(gameObj.status == 0){//game is aborted during waiting state
        currentGame = gameState.offerNewGame();
      }
      else if(gameObj.isOngoing()){//game is aborted during ongoing state, should notice the other player
        gameObj.status = 3;
        message.aborted = true;
        if(gameObj.playerA == con){//A abort the game
          gameObj.playerB.send(JSON.stringify(message));
        }
        else {//B abort the game
          gameObj.playerA.send(JSON.stringify(message));
        }
      }
    }
  });

});
server.listen(process.env.PORT || port);


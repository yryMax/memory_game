var ori = document.body.innerHTML;
//waiting for connection
document.body.innerHTML = "<h1>connecting... </h1><h1>waiting for another player</h1>";
function loadGamePage(){
    document.body.innerHTML = ori;
}

//setup the storage
let gameBoard = new GameBoard();
let me = new Player(0);
let op = new Player(1);
let gameState = new GameState(me,op,gameBoard);
//setup all the listeners
let elements = document.querySelectorAll(".card");
Array.from(elements).forEach(function (el) {
  let ind = el.id - 1;
  el.addEventListener("click", function singleClick(e) {
        clickCard(ind);
        el.removeEventListener("click", singleClick, false);
        el.setAttribute('listener', 'false');
  });
  el.setAttribute('listener', 'true');
});

//set up connection
const socket = new WebSocket("ws://localhost:3002");
socket.onmessage = function (event){
    let incomingMsg = JSON.parse(event.data);
    if(incomingMsg.aborted == true){//check if the other user quit the game
        let ele = document.getElementById("winner_status");
        ele.innerHTML = "GAME ABORTED!";
        let back = document.getElementById("back_button");
        back.style.visibility = "visible";
        return;
    }
    if(incomingMsg.wait == true)return; // still waiting
    if(message.wait == true){//game start
        loadGamePage();
        op.switchCounter();
    }
    message = incomingMsg;
    gameBoard.setCards(message.cards);
    gameBoard.setStatus(message.cardsState);
    op.changeScore(message.opScore);
    me.changeScore(message.myScore);
    //console.log(message);
    if(message.needSwitch == true){// now the receiver is now making the move
        gameState.switchPlayer();
        //add all the listener
        const elements = document.querySelectorAll(".card");
        Array.from(elements).forEach(function (el) {
          let ind = el.id - 1;
          if(gameBoard.status[ind] == 0 &&el.getAttribute('listener')!= 'true'){
            el.addEventListener("click", function singleClick(e) {
                clickCard(ind);
                el.removeEventListener("click", singleClick, false);
                el.setAttribute('listener', 'false');
            });
            el.setAttribute('listener', 'true');
          };  
        });
    }
    gameState.init();//show all the info
    gameState.checkWinner();//theck if there is a winner，if it is ,show it on the web
}
function clickCard(index){//user movement
    if(me.isActive == false)return;//only the active user can make the move
    if(gameBoard.checkTwo() == true)return;
    gameBoard.flipCards(index);
    if(gameBoard.checkTwo() == true){//two cards are flipped
        message.cardsState = gameBoard.status;
        message.needSwitch = false;
        message.opScore = me.score;
        message.myScore = op.score;
        socket.send(JSON.stringify(message));
        gameState.init();
        setTimeout(checkCancel, 1000);
    }
    else {//only one cards are flipped
        message.cardsState = gameBoard.status;
        message.needSwitch = false;
        message.opScore = me.score;
        message.myScore = op.score;
        socket.send(JSON.stringify(message));  
        gameState.init();
    }
}
function checkCancel(){
    let flag = gameBoard.cancelCards();
    console.log(gameBoard.status);
    if(flag == true){//the user's score increase
        me.score++;
        message.needSwitch = false;
    }
    else{// ban all the listener, switch the curent player
        gameState.switchPlayer();
        message.needSwitch = true;
    }
    gameState.init();
    gameState.checkWinner();
    message.cardsState = gameBoard.status;
    message.opScore = me.score;
    message.myScore = op.score;
    socket.send(JSON.stringify(message));
}
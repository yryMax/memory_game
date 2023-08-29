function GameBoard(){
    this.cards = []; // an array of each card to make the url;
    this.status = [];
    this.setStatus = function(s){
        this.status = s;
    }
    this.setCards = function(cards){
        this.cards = cards;
    }
    this.showCards = function(){
        /*
        show the cards according to their status
        */
       for(let i = 0;i<this.cards.length;i++){
           let url = "/images/";
           url += this.status[i] == 0? 0:this.cards[i];
           url += ".jpg";
          // console.log(url);
           if(this.status[i] == -1){
               let el = document.getElementById(i+1);
               if(!el.classList.contains("no-hover"))el.classList.add("no-hover");
               url = "";
           }
           document.getElementById(i+1).style.backgroundImage = "url(" + url + ")";
       }
    }
    this.flipCards = function(index){
        /*
        try to flip a card, if the flip is valid, return a positive sign
        */
       if(this.status[index] != 0)return false;
       this.status[index] = 1;
       return true;
    }
    this.checkTwo = function(){
        return this.status.filter(num => num == 1).length == 2;
    }
    this.cancelCards = function(){
        /*
        only be called when there is actually two card flipped,
        if the two cards are same set there dom element invisable, return a positive sign.
        */
        let x=-1;
        for(let i=0;i<this.cards.length;i++){
            if(this.status[i] == 1){
                if(x ==-1)x = i;
                else {
                    if(this.cards[x] == this.cards[i]){//cancel out
                        this.status[x] = -1;
                        this.status[i] = -1;
                        return true;
                    }
                    else {
                        this.status[x] = 0;
                        this.status[i] = 0;
                        return false;
                    }
                }
            }
        }
        return false;
    }
    /*
    this.resetCards = function(){
        for(let i = 0;i<this.cards.length;i++){
            if(this.status[i] == 1){
                this.status[i] = 0;
            }
        }
    }
    */
}
 /*
let cards = [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8];
let s = [1,0,0,0,-1,0,-1,-1,0,1,0,0,0,0,0,0];
let gameBoard = new GameBoard(cards,s);
gameBoard.cancelCards();
gameBoard.showCards();
**/

function Player(type){//indicate the player is me(0)/opponent(1)
    this.score = 0;
    this.isActive = false;
    this.currentSec = 0;
    this.type = type;
    this.intervalID;
    this.switchCounter = function(){
        /*
        if the player is the current mover, clear the interval
        if the player is the next mover, set the interval
        show the timer on the board
        */
        if(this.isActive == false){
            this.intervalID = setInterval(() => {
                this.currentSec++;
                let min = Math.floor(this.currentSec/60);
                let sec = this.currentSec%60;
                if(min<10)min = "0" + min;
                if(sec<10)sec = "0" + sec;
               // console.log(min+":"+sec);
                let sc = document.getElementsByClassName("timer");
                sc[type].innerHTML = min + ":" + sec;
            }, 1000);
        }
        else {
            clearInterval(this.intervalID);
        }
        this.isActive = !this.isActive;
        console.log(this.isActive);
    }
    this.showScore = function(){
        /*
        increase the this player's score by one
        show it on the dom
        */
       let sc = document.getElementsByClassName("score");
       sc[type].innerHTML = this.score;
    } 
    this.changeScore = function(score){
        this.score = score;
    }
}
/*
let me = new Player(1);
me.switchPlayer();
*/
function GameState(me,opponent,gameBoard){
    this.me = me;
    this.opponent = opponent;
    this.gameBoard = gameBoard;
    this.init = function(){
        /*
        when the state is updated (come from the server)
        fresh everything on the webpage.
        */
       this.me.showScore();//show my current score
       this.opponent.showScore();//show my opponent's current score
       this.gameBoard.showCards();//show all the cards
       if(this.me.isActive == true){//who is making the move
        document.getElementById("yourTurn").style.visibility= "visible";
        document.getElementById("opTurn").style.visibility= "hidden";
       }
       else{
        document.getElementById("yourTurn").style.visibility= "hidden";
        document.getElementById("opTurn").style.visibility= "visible";
       }
    }
    this.checkWinner = function(){
        /*
        when sum of the two player's score is equal to 8
        if the game ends, use a popup to indicate who is the winner
        */
       let ele = document.getElementById("popup");
 //      console.log(ele);
       if(this.me.score + this.opponent.score == 8){
           if(this.me.score>this.opponent.score){
                ele.innerHTML = "VICTORY";
           }
           else if(this.me.score < this.opponent.score){
                ele.innerHTML = "DEFEAT";
  
          }
          else {
              ele.innerHTML = "DRAW";
          }
        //disable the timer.
        this.me.isActive = false;
        this.opponent.isActive = false;
        clearInterval(me.intervalID);
        clearInterval(opponent.intervalID);
        }
    }

    this.switchPlayer = function(){
        this.me.switchCounter();
        this.opponent.switchCounter();
    }
}
//       console.log(this.me.score + this.opponent.score);

/*
let cards = [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8];
let s = [1,0,0,0,-1,0,-1,-1,0,1,0,0,0,-1,0,0];
let gameBoard = new GameBoard(cards,s);
let me = new Player(0);
let op = new Player(1);
op.switchCounter();
op.score = 4;
me.score = 4;
let gameState = new GameState(me,op,gameBoard);
gameState.init();
gameState.checkWinner();
*/
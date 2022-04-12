function gameStatus (){
    this.games = new Array();
    this.gameAmount = 0;
    this.offerNewGame = function(){
        G = new game(this.gameAmount);
        this.games[this.gameAmount++] = G;
        return G; 
    }
    this.checkOngoingGame = function(){
        let ans = 0;
        for(let i=0;i<this.gameAmount;i++)if(this.games[i].isOngoing())ans++;
        return ans;
    }
    this.checkCompletedGame = function(){
        let ans = 0;
        for(let i=0;i<this.gameAmount;i++)if(this.games[i].isComplete())ans++;
        return ans;
    }

}
function game (gameID) {
    this.playerA = null;
    this.playerB = null;
    this.id = gameID;
    /**
     * 0: not start yet,waiting for anothor player
     * 1: ongoing
     * 2: complete
     * 3：aborted
     */
    this.status = 0;
    this.isComplete = function(){
        return this.status == 2;
    }
    this.setComplete = function(){
        this.status = 2;
    }
    this.isOngoing = function(){
        return this.status == 1;
    }
    this.addPlayer = function(p){
        if(this.playerA == null){
            this.playerA = p;
            return false;
        }
        else {
            this.playerB = p;
            return true; //the game can start now
        }
    }
  };
  module.exports = gameStatus;
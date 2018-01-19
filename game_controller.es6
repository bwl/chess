const throwIfMissing = p => { throw new Error(`Missing parameter: ${p}`) }
// specify whether piece was trying to move through other piece or just onto position it can't hit
// should have case sensitivity protection to avoid future blackPawn BlackPawn issues

class GameController {
	constructor(){
		this.board = new Board();
		// this.pieceMovementRules = PieceMovementRules.getInstance();
		// this.pieceMovementRules = new PieceMovementRules()
		// this.pieceMovementRules = new PieceMovementRules();
		this.postMovementRules = new PostMovementRules
		// this.PostMovementRules = new PostMovementRules();
	    this.view = new View();
		// this.view = new View();
	}
	attemptMove(startPosition = throwIfMissing("startPosition"), endPosition = throwIfMissing("endPosition")) {
		var board = this.board,
			layOut = board.layOut,
			pieceString = layOut[startPosition],
			team = board.teamAt(startPosition),
			checkNotation = "",
			captureNotation = "",
			promotionNotation = "",
			notation = "";
		if( board.gameOver ){
			return
		}
		if( team == "empty" ){
			alert("that tile is empty")
			return
		}
		if( team !== board.allowedToMove ){
			alert( "other team's turn" )
			return
		}
		var moveObject = PieceMovementRules.moveIsIllegal(startPosition, endPosition, board);
		if( moveObject.illegal ){
			this.view.displayAlert(moveObject.alert)
			return
		} else {
			this.board.storeCurrentLayoutAsPrevious()
			captureNotation = this.board.movePiece( startPosition, endPosition, moveObject.additionalActions)
			promotionNotation = this.postMovementRules.pawnPromotionQuery( board )
			let otherTeam = this.board.teamNotMoving()
			let otherTeamsKingPosition = this.board.kingPosition(otherTeam)
			if( this.postMovementRules.checkmate( board )){
				let displayAlert = this.view.displayAlert
				setTimeout( function(){ displayAlert("checkmate") }, 200)
				checkNotation = "#"
				board.endGame()
			}
			if( !board.gameOver && PieceMovementRules.kingInCheck( {startPosition: otherTeamsKingPosition, endPosition: otherTeamsKingPosition, board: board} )){
				let displayAlert = this.view.displayAlert
				setTimeout( function(){ displayAlert("check") }, 200 )
				checkNotation = "+"
			}
			this.view.displayLayOut(this.board.layOut)
			var stalemate = this.postMovementRules.stalemate(board);
			if( !board.gameOver && stalemate ){
				let displayAlert = this.view.displayAlert
				setTimeout( function(){ displayAlert("stalemate") }, 200 )
				board.endGame()
			}
			if( moveObject.fullNotation ){
        // pretty sure i was supposed to add captureNotation etc... here, but need to check
				notation = moveObject.fullNotation + captureNotation + positionNotation + promotionNotation + checkNotation
			} else {
				var positionNotation = Board.gridCalculator(endPosition),
					pieceNotation	= moveObject.pieceNotation,
					captureNotation = captureNotation || moveObject.captureNotation || "";
					notation = pieceNotation + captureNotation + positionNotation + promotionNotation + checkNotation
			}
			this.board.recordNotation(notation)
			if( !board.gameOver ){ this.nextTurn() }
		}
	}

  nextTurn(){
    if( this.board.allowedToMove === "white" ){
      this.prepareBlackTurn()
    } else{
      this.prepareWhiteTurn()
    }
  }

  prepareBlackTurn(){
    this.board.allowedToMove = "black"
  }

  prepareWhiteTurn(){
    this.board.allowedToMove = "white"
  }
	runMoves(moveArray){
		var func = this.runMoves.bind(this)
		if (moveArray.length > 1 ) {
			this.attemptMove( moveArray[0], moveArray[1] )
			moveArray.shift()
			moveArray.shift()
			setTimeout( function(){ func(moveArray)  }, 500)
		}
	}
}
gameController = new GameController()
gameController.view.displayLayOut(gameController.board.layOut)
gameController.view.setClickListener()


tests = {
	pawnPromotion: [1,  18, 50, 42, 11, 27, 59, 41, 3,  19, 42, 34, 14, 22, 34, 27, 18, 24, 51, 43, 10, 26, 41, 17, 26, 34, 49, 33, 19, 33, 57, 42, 33, 49, 27, 19, 34, 43, 19, 12, 43, 52, 12,  5, 4,   5, 17,  9, 52, 61 ],
  sim2: [1,  18, 50, 42, 11, 27, 59, 41, 3,  19, 42, 34, 14, 22, 34, 27, 0,  1, 27, 18, 9,  18, 51, 35, 15, 23, 58, 23 ],
  blackEnPassant: [1,  18, 50, 42, 11, 27, 59, 41, 3,  19, 42, 34, 14, 22, 34, 27, 18, 24, 51, 43, 10, 26],
  whiteEnPassant: [1,  18, 50, 42, 11, 27, 59, 41, 3,  19, 42, 34, 14, 22, 34, 27, 18, 24, 51, 43, 10, 26, 41, 17, 26, 34, 49, 33],
  checkmate: [12, 20, 57, 42, 5,  26, 42, 32, 3,  21, 32, 17, 21, 53],
  queensCastles: [11, 19, 51, 43, 2,  20, 58, 44, 3,  11, 59, 51, 1,  18, 57, 42, 4,   2, 60, 58],
  kingsCastles: [12, 20, 52, 44, 5,  12, 61, 43, 6,  23, 62, 52, 4,  6, 60, 62],
  singleMoveTest: [1,  18],
  threeFold: [1, 18, 62, 45, 18,  1, 45, 62, 1, 18, 62, 45, 18,  1, 45, 62],
  notThreeFold: [1, 18, 62, 45, 18,  1, 45, 62, 1, 18, 62, 45, 18,  1, 50,  42, 1, 18, 45, 62, 18,  1, 62, 45]
}

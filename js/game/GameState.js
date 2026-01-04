class GameState {
  constructor() {
    this.board = new Board();
    this.currentPlayer = Color.WHITE;
    this.selectedPiece = null;
    this.validMoves = [];
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.isGameOver = false;
    this.winner = null;
  }

  getAllLegalMoves(color) {
    const moves = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board.getPiece(row, col);
        if (piece && piece.color === color) {
          const pieceMoves = generateMovesForPiece(this.board.squares, piece);

          // Filtrar movimientos que dejan al rey en jaque
          const legalMoves = pieceMoves.filter((move) => {
            return !this.wouldBeInCheckAfterMove(move);
          });

          moves.push(...legalMoves);
        }
      }
    }

    return moves;
  }

  wouldBeInCheckAfterMove(move) {
    // Simular el movimiento
    const tempBoard = cloneBoard(this.board.squares);
    const piece = tempBoard[move.fromRow][move.fromCol];

    tempBoard[move.toRow][move.toCol] = piece;
    tempBoard[move.fromRow][move.fromCol] = null;

    if (piece) {
      piece.row = move.toRow;
      piece.col = move.toCol;
    }

    // Verificar si el rey está en jaque
    return isKingInCheck(tempBoard, move.piece.color);
  }

  makeMove(move) {
    const piece = this.board.getPiece(move.fromRow, move.fromCol);

    // VERIFICAR QUE LA PIEZA EXISTE
    if (!piece) {
      console.error("Error: Intento de mover pieza inexistente", move);
      return;
    }

    // ESTADO PREVIO
    move.prevHasMoved = piece.hasMoved;

    // CAPTURA
    if (move.capturedPiece) {
      const list =
        move.capturedPiece.color === Color.WHITE
          ? this.capturedPieces.white
          : this.capturedPieces.black;
      list.push(move.capturedPiece);
    }

    // ENROQUE (PRECAPTURA)
    if (move.isCastling) {
      const row = move.fromRow;

      if (move.toCol === 6) {
        // corto
        move.rook = this.board.getPiece(row, 7);
        move.rookFromCol = 7;
        move.rookToCol = 5;
      } else {
        // largo
        move.rook = this.board.getPiece(row, 0);
        move.rookFromCol = 0;
        move.rookToCol = 3;
      }

      // VERIFICAR QUE LA TORRE EXISTE
      if (!move.rook) {
        console.error("Error: Torre no encontrada para enroque", move);
        return;
      }

      move.rookPrevHasMoved = move.rook.hasMoved;
    }

    // MOVER PIEZA
    this.board.setPiece(move.toRow, move.toCol, piece);
    this.board.setPiece(move.fromRow, move.fromCol, null);
    piece.hasMoved = true;

    // MOVER TORRE (ENROQUE)
    if (move.isCastling && move.rook) {
      const row = move.toRow;
      this.board.setPiece(row, move.rookToCol, move.rook);
      this.board.setPiece(row, move.rookFromCol, null);
      move.rook.hasMoved = true;
    }

    // PROMOCIÓN
    if (move.promotionType) {
      move.promotedPiece = new Piece(
        move.promotionType,
        piece.color,
        move.toRow,
        move.toCol
      );
      this.board.setPiece(move.toRow, move.toCol, move.promotedPiece);
    }

    // HISTORIAL
    this.moveHistory.push(move);

    // TURNO
    this.switchPlayer();

    // FIN DE JUEGO
    const legalMoves = this.getAllLegalMoves(this.currentPlayer);
    if (legalMoves.length === 0) {
      this.isGameOver = true;
      if (isKingInCheck(this.board.squares, this.currentPlayer)) {
        this.winner =
          this.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;
      } else {
        this.winner = "draw";
      }
    }
  }
  undoMove() {
    if (this.moveHistory.length === 0) return;

    const move = this.moveHistory.pop();
    const piece = this.board.getPiece(move.toRow, move.toCol);

    // PROMOCIÓN
    if (move.promotedPiece) {
      // Quitar pieza promovida
      this.board.setPiece(move.toRow, move.toCol, null);

      // Restaurar peón original
      this.board.setPiece(move.fromRow, move.fromCol, move.piece);
      move.piece.row = move.fromRow;
      move.piece.col = move.fromCol;
    } else {
      // Movimiento normal
      this.board.setPiece(move.fromRow, move.fromCol, piece);
      this.board.setPiece(move.toRow, move.toCol, move.capturedPiece);
    }

    // ENROQUE
    if (move.isCastling && move.rook) {
      const row = move.toRow;

      this.board.setPiece(row, move.rookFromCol, move.rook);
      this.board.setPiece(row, move.rookToCol, null);

      move.rook.hasMoved = move.rookPrevHasMoved || false;
    }

    // hasMoved
    move.piece.hasMoved = move.prevHasMoved;

    // CAPTURAS
    if (move.capturedPiece) {
      const capturedList =
        move.capturedPiece.color === Color.WHITE
          ? this.capturedPieces.white
          : this.capturedPieces.black;

      const index = capturedList.indexOf(move.capturedPiece);
      if (index > -1) capturedList.splice(index, 1);
    }

    // ESTADO
    this.switchPlayer();
    this.isGameOver = false;
    this.winner = null;
  }

  // ========== MÉTODOS QUE FALTABAN ==========

  switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;
  }

  reset() {
    this.board = new Board();
    this.currentPlayer = Color.WHITE;
    this.selectedPiece = null;
    this.validMoves = [];
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.isGameOver = false;
    this.winner = null;
  }
}

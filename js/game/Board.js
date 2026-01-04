class Board {
  constructor() {
    this.squares = this.initializeBoard();
  }

  initializeBoard() {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Peones
    for (let col = 0; col < 8; col++) {
      board[1][col] = new Piece(PieceType.PAWN, Color.BLACK, 1, col);
      board[6][col] = new Piece(PieceType.PAWN, Color.WHITE, 6, col);
    }

    // Torres
    board[0][0] = new Piece(PieceType.ROOK, Color.BLACK, 0, 0);
    board[0][7] = new Piece(PieceType.ROOK, Color.BLACK, 0, 7);
    board[7][0] = new Piece(PieceType.ROOK, Color.WHITE, 7, 0);
    board[7][7] = new Piece(PieceType.ROOK, Color.WHITE, 7, 7);

    // Caballos
    board[0][1] = new Piece(PieceType.KNIGHT, Color.BLACK, 0, 1);
    board[0][6] = new Piece(PieceType.KNIGHT, Color.BLACK, 0, 6);
    board[7][1] = new Piece(PieceType.KNIGHT, Color.WHITE, 7, 1);
    board[7][6] = new Piece(PieceType.KNIGHT, Color.WHITE, 7, 6);

    // Alfiles
    board[0][2] = new Piece(PieceType.BISHOP, Color.BLACK, 0, 2);
    board[0][5] = new Piece(PieceType.BISHOP, Color.BLACK, 0, 5);
    board[7][2] = new Piece(PieceType.BISHOP, Color.WHITE, 7, 2);
    board[7][5] = new Piece(PieceType.BISHOP, Color.WHITE, 7, 5);

    // Reinas
    board[0][3] = new Piece(PieceType.QUEEN, Color.BLACK, 0, 3);
    board[7][3] = new Piece(PieceType.QUEEN, Color.WHITE, 7, 3);

    // Reyes
    board[0][4] = new Piece(PieceType.KING, Color.BLACK, 0, 4);
    board[7][4] = new Piece(PieceType.KING, Color.WHITE, 7, 4);

    return board;
  }

  getPiece(row, col) {
    return this.squares[row][col];
  }

  setPiece(row, col, piece) {
    this.squares[row][col] = piece;
    if (piece) {
      piece.row = row;
      piece.col = col;
    }
  }

  clone() {
    const newBoard = new Board();
    newBoard.squares = cloneBoard(this.squares);
    return newBoard;
  }
}

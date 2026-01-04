class Piece {
  constructor(type, color, row, col) {
    this.type = type;
    this.color = color;
    this.row = row;
    this.col = col;
    this.hasMoved = false; // Para enroque y movimiento doble del peón
  }

  clone() {
    const piece = new Piece(this.type, this.color, this.row, this.col);
    piece.hasMoved = this.hasMoved;
    return piece;
  }

  getSymbol() {
    const symbols = {
      [PieceType.PAWN]: "♟",
      [PieceType.ROOK]: "♜",
      [PieceType.KNIGHT]: "♞",
      [PieceType.BISHOP]: "♝",
      [PieceType.QUEEN]: "♛",
      [PieceType.KING]: "♚",
    };
    return this.color === Color.WHITE
      ? symbols[this.type]
      : symbols[this.type].toLowerCase();
  }
}

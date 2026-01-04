class Move {
  constructor(
    fromRow,
    fromCol,
    toRow,
    toCol,
    piece,
    capturedPiece = null,
    isEnPassant = false,
    isCastling = false,
    promotionType = null
  ) {
    this.fromRow = fromRow;
    this.fromCol = fromCol;
    this.toRow = toRow;
    this.toCol = toCol;
    this.piece = piece;
    this.capturedPiece = capturedPiece;
    this.isEnPassant = isEnPassant;
    this.isCastling = isCastling;
    this.promotionType = promotionType;
    this.prevHasMoved = piece.hasMoved;
    this.rook = null;
    this.rookFromCol = null;
    this.rookToCol = null;
    this.promotedPiece = null;
  }

  toString() {
    return `${indicesToNotation(
      this.fromRow,
      this.fromCol
    )}-${indicesToNotation(this.toRow, this.toCol)}`;
  }

  equals(other) {
    return (
      this.fromRow === other.fromRow &&
      this.fromCol === other.fromCol &&
      this.toRow === other.toRow &&
      this.toCol === other.toCol
    );
  }
}

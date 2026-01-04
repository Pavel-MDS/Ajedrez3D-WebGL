// Genera todos los movimientos legales para una pieza
function generateMovesForPiece(board, piece, forAttack = false) {
  const moves = [];

  switch (piece.type) {
    case PieceType.PAWN:
      generatePawnMoves(board, piece, moves, forAttack);
      break;
    case PieceType.ROOK:
      generateRookMoves(board, piece, moves);
      break;
    case PieceType.KNIGHT:
      generateKnightMoves(board, piece, moves);
      break;
    case PieceType.BISHOP:
      generateBishopMoves(board, piece, moves);
      break;
    case PieceType.QUEEN:
      generateQueenMoves(board, piece, moves);
      break;
    case PieceType.KING:
      generateKingMoves(board, piece, moves, forAttack);
      break;
  }

  return moves;
}

// Movimientos del peón
function generatePawnMoves(board, pawn, moves) {
  const direction = pawn.color === Color.WHITE ? -1 : 1;
  const startRow = pawn.color === Color.WHITE ? 6 : 1;
  const promotionRow = pawn.color === Color.WHITE ? 0 : 7;

  const row = pawn.row;
  const col = pawn.col;
  const newRow = row + direction;

  // Movimiento simple
  if (isValidPosition(newRow, col) && !board[newRow][col]) {
    if (newRow === promotionRow) {
      moves.push(
        new Move(
          row,
          col,
          newRow,
          col,
          pawn,
          null,
          false,
          false,
          PieceType.QUEEN
        )
      );
    } else {
      moves.push(new Move(row, col, newRow, col, pawn));
    }

    // Movimiento doble
    if (row === startRow) {
      const doubleRow = row + 2 * direction;
      if (!board[doubleRow][col]) {
        moves.push(new Move(row, col, doubleRow, col, pawn));
      }
    }
  }

  // Capturas diagonales
  [-1, 1].forEach((dc) => {
    const newCol = col + dc;
    if (isValidPosition(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (target && target.color !== pawn.color) {
        if (newRow === promotionRow) {
          moves.push(
            new Move(
              row,
              col,
              newRow,
              newCol,
              pawn,
              target,
              false,
              false,
              PieceType.QUEEN
            )
          );
        } else {
          moves.push(new Move(row, col, newRow, newCol, pawn, target));
        }
      }
    }
  });
}
// Movimientos de la torre
function generateRookMoves(board, rook, moves) {
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  generateSlidingMoves(board, rook, moves, directions);
}

// Movimientos del alfil
function generateBishopMoves(board, bishop, moves) {
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  generateSlidingMoves(board, bishop, moves, directions);
}

// Movimientos de la reina
function generateQueenMoves(board, queen, moves) {
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  generateSlidingMoves(board, queen, moves, directions);
}

// Función auxiliar para piezas deslizantes
function generateSlidingMoves(board, piece, moves, directions) {
  directions.forEach(([dr, dc]) => {
    let row = piece.row + dr;
    let col = piece.col + dc;

    while (isValidPosition(row, col)) {
      const target = board[row][col];

      if (!target) {
        moves.push(new Move(piece.row, piece.col, row, col, piece));
      } else {
        if (target.color !== piece.color) {
          moves.push(new Move(piece.row, piece.col, row, col, piece, target));
        }
        break;
      }

      row += dr;
      col += dc;
    }
  });
}

// Movimientos del caballo
function generateKnightMoves(board, knight, moves) {
  const offsets = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  offsets.forEach(([dr, dc]) => {
    const newRow = knight.row + dr;
    const newCol = knight.col + dc;

    if (isValidPosition(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target || target.color !== knight.color) {
        moves.push(
          new Move(knight.row, knight.col, newRow, newCol, knight, target)
        );
      }
    }
  });
}

// Movimientos del rey
function generateKingMoves(board, king, moves, forAttack = false) {
  const offsets = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  // Movimientos normales
  offsets.forEach(([dr, dc]) => {
    const r = king.row + dr;
    const c = king.col + dc;

    if (isValidPosition(r, c)) {
      const target = board[r][c];
      if (!target || target.color !== king.color) {
        moves.push(new Move(king.row, king.col, r, c, king, target));
      }
    }
  });

  // Si solo estamos calculando ataques, NO enroque
  if (forAttack) return;

  // =====================
  // ENROQUE
  // =====================
  if (king.hasMoved) return;
  if (isKingInCheck(board, king.color)) return;

  const enemyColor = king.color === Color.WHITE ? Color.BLACK : Color.WHITE;
  const row = king.row;

  // Enroque corto
  const rookShort = board[row][7];
  if (
    rookShort &&
    rookShort.type === PieceType.ROOK &&
    !rookShort.hasMoved &&
    !board[row][5] &&
    !board[row][6] &&
    !isSquareAttacked(board, row, 5, enemyColor) &&
    !isSquareAttacked(board, row, 6, enemyColor)
  ) {
    moves.push(new Move(row, 4, row, 6, king, null, false, true));
  }

  // Enroque largo
  const rookLong = board[row][0];
  if (
    rookLong &&
    rookLong.type === PieceType.ROOK &&
    !rookLong.hasMoved &&
    !board[row][1] &&
    !board[row][2] &&
    !board[row][3] &&
    !isSquareAttacked(board, row, 3, enemyColor) &&
    !isSquareAttacked(board, row, 2, enemyColor)
  ) {
    moves.push(new Move(row, 4, row, 2, king, null, false, true));
  }
}

// Verifica si el rey está en jaque
function isKingInCheck(board, color) {
  let kingPos = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === PieceType.KING && p.color === color) {
        kingPos = { row: r, col: c };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  const enemyColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === enemyColor) {
        const moves = generateMovesForPiece(board, piece, true);
        for (const m of moves) {
          if (m.toRow === kingPos.row && m.toCol === kingPos.col) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function isSquareAttacked(board, row, col, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === byColor) {
        const moves = generateMovesForPiece(board, piece, true);
        for (const m of moves) {
          if (m.toRow === row && m.toCol === col) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

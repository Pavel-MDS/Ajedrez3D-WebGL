// Evalúa la posición del tablero
function evaluateBoard(board, color) {
  let score = 0;

  // Evaluar material y posición
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const pieceValue = evaluatePiece(piece, row, col);

      if (piece.color === color) {
        score += pieceValue;
      } else {
        score -= pieceValue;
      }
    }
  }

  // Evaluar seguridad del rey
  score += evaluateKingSafety(board, color) * 50;
  score -=
    evaluateKingSafety(
      board,
      color === Color.WHITE ? Color.BLACK : Color.WHITE
    ) * 50;

  // Evaluar movilidad (cantidad de movimientos legales)
  const mobilityDiff = evaluateMobility(board, color);
  score += mobilityDiff * 10;

  return score;
}

// Evaluar seguridad del rey
function evaluateKingSafety(board, color) {
  let safety = 0;

  // Encontrar el rey
  let kingPos = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PieceType.KING && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return -10000; // Rey no encontrado = muy malo

  // Verificar si está en jaque
  if (isKingInCheck(board, color)) {
    safety -= 100; // Penalización fuerte por estar en jaque
  }

  const enemyColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

  // Contar piezas enemigas atacando casillas alrededor del rey
  const kingNeighbors = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  let attackedSquares = 0;
  let defenderCount = 0;

  for (const [dr, dc] of kingNeighbors) {
    const r = kingPos.row + dr;
    const c = kingPos.col + dc;

    if (!isValidPosition(r, c)) continue;

    // Verificar si la casilla está atacada
    if (isSquareAttacked(board, r, c, enemyColor)) {
      attackedSquares++;
    }

    // Contar defensores alrededor
    const neighbor = board[r][c];
    if (neighbor && neighbor.color === color) {
      defenderCount++;
    }
  }

  safety -= attackedSquares * 15; // Penalizar casillas atacadas cerca del rey
  safety += defenderCount * 5; // Bonificar defensores

  // Bonificar enroque (rey movido a columnas 2 o 6)
  if (
    (kingPos.col === 2 || kingPos.col === 6) &&
    (kingPos.row === 0 || kingPos.row === 7)
  ) {
    safety += 30;
  }

  return safety;
}

// Evaluar movilidad (diferencia de movimientos legales)
function evaluateMobility(board, color) {
  const enemyColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

  let myMoves = 0;
  let enemyMoves = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const moves = generateMovesForPiece(board, piece, true);

      if (piece.color === color) {
        myMoves += moves.length;
      } else {
        enemyMoves += moves.length;
      }
    }
  }

  return myMoves - enemyMoves;
}

// Evalúa una pieza individual
function evaluatePiece(piece, row, col) {
  const materialValue = PieceValue[piece.type];

  // Usar tabla de posición
  let positionValue = 0;
  if (PositionTables[piece.type]) {
    const table = PositionTables[piece.type];
    if (piece.color === Color.WHITE) {
      positionValue = table[row][col];
    } else {
      positionValue = table[7 - row][col];
    }
  }

  return materialValue + positionValue;
}

// Ordena movimientos para mejorar la poda alfa-beta
function orderMoves(moves, board) {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // PRIORIDAD 1: Capturas (MVV-LVA)
    if (a.capturedPiece) {
      scoreA +=
        PieceValue[a.capturedPiece.type] * 10 - PieceValue[a.piece.type];
    }
    if (b.capturedPiece) {
      scoreB +=
        PieceValue[b.capturedPiece.type] * 10 - PieceValue[b.piece.type];
    }

    // PRIORIDAD 2: Jaques (movimientos que dan jaque)
    if (givesCheck(board, a)) scoreA += 50;
    if (givesCheck(board, b)) scoreB += 50;

    // PRIORIDAD 3: Movimientos centrales
    const aCenterBonus = getCenterBonus(a.toRow, a.toCol);
    const bCenterBonus = getCenterBonus(b.toRow, b.toCol);
    scoreA += aCenterBonus;
    scoreB += bCenterBonus;

    // PRIORIDAD 4: Promociones
    if (a.promotionType) scoreA += 800;
    if (b.promotionType) scoreB += 800;

    return scoreB - scoreA;
  });
}

// Verificar si un movimiento da jaque
function givesCheck(board, move) {
  const tempBoard = cloneBoard(board);
  const piece = tempBoard[move.fromRow][move.fromCol];

  if (!piece) return false;

  tempBoard[move.toRow][move.toCol] = piece;
  tempBoard[move.fromRow][move.fromCol] = null;
  piece.row = move.toRow;
  piece.col = move.toCol;

  const enemyColor = piece.color === Color.WHITE ? Color.BLACK : Color.WHITE;
  return isKingInCheck(tempBoard, enemyColor);
}

// Bonificación por movimientos centrales
function getCenterBonus(row, col) {
  const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
  return (7 - centerDistance) * 2;
}

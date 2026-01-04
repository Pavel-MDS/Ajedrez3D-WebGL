// Función para convertir notación de ajedrez (e.g., "e2") a índices
function notationToIndices(notation) {
  const col = notation.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - parseInt(notation[1]);
  return { row, col };
}

// Función para convertir índices a notación de ajedrez
function indicesToNotation(row, col) {
  const letter = String.fromCharCode("a".charCodeAt(0) + col);
  const number = 8 - row;
  return letter + number;
}

// Verificar si una posición está dentro del tablero
function isValidPosition(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Clonar un tablero profundamente
function cloneBoard(board) {
  const newBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const newPiece = new Piece(piece.type, piece.color, row, col);
        newPiece.hasMoved = piece.hasMoved;
        newBoard[row][col] = newPiece;
      }
    }
  }

  return newBoard;
}

// Logging de información
function logMove(move, color) {
  console.log(`${color} mueve de ${indicesToNotation(
    move.fromRow,
    move.fromCol
  )} 
  ${indicesToNotation(move.toRow, move.toCol)}`);
  function lookAt(eye, target, up) {
    const z = normalizeVec3([
      eye[0] - target[0],
      eye[1] - target[1],
      eye[2] - target[2],
    ]);

    const x = normalizeVec3(cross(up, z));
    const y = cross(z, x);

    return [
      x[0],
      y[0],
      z[0],
      0,
      x[1],
      y[1],
      z[1],
      0,
      x[2],
      y[2],
      z[2],
      0,
      -dot(x, eye),
      -dot(y, eye),
      -dot(z, eye),
      1,
    ];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function normalizeVec3(v) {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  }
}

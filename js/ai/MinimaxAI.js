class MinimaxAI {
  constructor(depth = 6, timeLimit = 5000) {
    this.depth = depth;
    this.timeLimit = timeLimit;
    this.startTime = 0;
    this.nodesEvaluated = 0;
    this.positionHistory = {}; // NUEVO: Historial de posiciones
  }

  findBestMove(gameState) {
    this.nodesEvaluated = 0;
    this.startTime = Date.now();

    // Construir historial de posiciones
    this.buildPositionHistory(gameState);

    const color = gameState.currentPlayer;
    let bestMove = null;
    let bestValue = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    const moves = gameState.getAllLegalMoves(color);
    const orderedMoves = orderMoves(moves, gameState.board.squares);

    // NUEVO: Verificar si estamos en jaque (aumentar profundidad)
    const inCheck = isKingInCheck(gameState.board.squares, color);
    const searchDepth = inCheck ? this.depth + 2 : this.depth;

    console.log(`AI analizando ${moves.length} movimientos posibles...`);
    console.log(
      `Profundidad de búsqueda: ${searchDepth}${inCheck ? " (en jaque)" : ""}`
    );

    for (const move of orderedMoves) {
      if (Date.now() - this.startTime > this.timeLimit) {
        console.log("Tiempo límite alcanzado");
        break;
      }

      const tempState = this.cloneGameState(gameState);
      tempState.makeMove(move);

      let value = this.minimax(
        tempState,
        searchDepth - 1, // Usar searchDepth en lugar de this.depth
        alpha,
        beta,
        false,
        color
      );

      // Penalizar repeticiones de posición
      const posKey = this.getPositionKey(tempState.board.squares);
      if (this.positionHistory[posKey]) {
        const penalty = this.positionHistory[posKey] * 50;
        value -= penalty;
      }

      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }

      alpha = Math.max(alpha, value);
    }

    const elapsed = Date.now() - this.startTime;
    console.log(`AI evaluó ${this.nodesEvaluated} nodos en ${elapsed}ms`);
    console.log(
      `Mejor movimiento: ${bestMove ? bestMove.toString() : "ninguno"
      }, valor: ${bestValue}`
    );

    return bestMove;
  }

  // NUEVO: Construir historial de posiciones
  buildPositionHistory(gameState) {
    this.positionHistory = {};

    // Analizar últimos movimientos
    const tempState = this.cloneGameState(gameState);
    const historyLength = Math.min(gameState.moveHistory.length, 10);

    for (let i = 0; i < historyLength; i++) {
      tempState.undoMove();
      const key = this.getPositionKey(tempState.board.squares);
      this.positionHistory[key] = (this.positionHistory[key] || 0) + 1;
    }
  }

  // NUEVO: Generar clave única para una posición
  getPositionKey(board) {
    let key = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          key += `${piece.type[0]}${piece.color[0]}${row}${col}`;
        } else {
          key += ".";
        }
      }
    }
    return key;
  }

  minimax(gameState, depth, alpha, beta, isMaximizing, aiColor) {
    if (Date.now() - this.startTime > this.timeLimit) {
      return evaluateBoard(gameState.board.squares, aiColor);
    }

    this.nodesEvaluated++;

    if (depth === 0 || gameState.isGameOver) {
      return evaluateBoard(gameState.board.squares, aiColor);
    }

    const currentColor = gameState.currentPlayer;
    const moves = gameState.getAllLegalMoves(currentColor);

    if (moves.length === 0) {
      if (isKingInCheck(gameState.board.squares, currentColor)) {
        return isMaximizing ? -Infinity : Infinity;
      }
      return 0;
    }

    const orderedMoves = orderMoves(moves, gameState.board.squares);

    if (isMaximizing) {
      let maxValue = -Infinity;

      for (const move of orderedMoves) {
        const tempState = this.cloneGameState(gameState);
        tempState.makeMove(move);

        const value = this.minimax(
          tempState,
          depth - 1,
          alpha,
          beta,
          false,
          aiColor
        );

        maxValue = Math.max(maxValue, value);
        alpha = Math.max(alpha, value);

        if (beta <= alpha) {
          break;
        }
      }

      return maxValue;
    } else {
      let minValue = Infinity;

      for (const move of orderedMoves) {
        const tempState = this.cloneGameState(gameState);
        tempState.makeMove(move);

        const value = this.minimax(
          tempState,
          depth - 1,
          alpha,
          beta,
          true,
          aiColor
        );

        minValue = Math.min(minValue, value);
        beta = Math.min(beta, value);

        if (beta <= alpha) {
          break;
        }
      }

      return minValue;
    }
  }

  cloneGameState(gameState) {
    const newState = new GameState();

    // Clonar el tablero correctamente
    newState.board.squares = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board.squares[row][col];
        if (piece) {
          const newPiece = new Piece(piece.type, piece.color, row, col);
          newPiece.hasMoved = piece.hasMoved;
          newState.board.squares[row][col] = newPiece;
        }
      }
    }

    newState.currentPlayer = gameState.currentPlayer;
    newState.isGameOver = gameState.isGameOver;
    newState.winner = gameState.winner;

    // NO clonar moveHistory porque puede causar problemas con referencias
    newState.moveHistory = [];

    return newState;
  }

  setDifficulty(depth) {
    this.depth = Math.max(2, Math.min(8, depth));

    // Ajustar tiempo límite según profundidad
    if (this.depth >= 8) {
      this.timeLimit = 15000; // 15 segundos para experto
    } else if (this.depth >= 6) {
      this.timeLimit = 8000; // 8 segundos para difícil
    } else {
      this.timeLimit = 5000; // 5 segundos para normal
    }

    console.log(`Dificultad ajustada a profundidad: ${this.depth}, Tiempo: ${this.timeLimit}ms`);
  }
}

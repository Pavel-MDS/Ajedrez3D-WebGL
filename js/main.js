// Variables globales
let gameState;
let renderer;
let ai;
let selectedSquare = null;
let validMoves = [];
let isPlayerTurn = true;

// Inicialización del juego
function init() {
  console.log("Inicializando juego de ajedrez...");

  // Crear instancias
  gameState = new GameState();
  ai = new MinimaxAI(4); // Profundidad inicial: 4

  // Inicializar renderer WebGL
  const canvas = document.getElementById("chess-canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  renderer = new ChessRenderer(canvas, gameState);

  // Configurar event listeners
  setupEventListeners();

  // Actualizar UI
  updateUI();

  console.log("Juego inicializado correctamente");
}

// Configurar event listeners
function setupEventListeners() {
  // Botón Nueva Partida
  document.getElementById("new-game").addEventListener("click", () => {
    newGame();
  });

  // Botón Deshacer
  document.getElementById("undo").addEventListener("click", () => {
    undoMove();
  });

  // Selector de dificultad
  document.getElementById("difficulty").addEventListener("change", (e) => {
    const depth = parseInt(e.target.value);
    ai.setDifficulty(depth);
    console.log(`Dificultad cambiada a profundidad: ${depth}`);
  });

  // Detección de clicks en el canvas
  const canvas = document.getElementById("chess-canvas");
  let mouseDownX = 0;
  let mouseDownY = 0;
  let mouseDownTime = 0;

  canvas.addEventListener("mousedown", (e) => {
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;
    mouseDownTime = Date.now();
  });

  // Listener para Hover (movimiento del mouse)
  canvas.addEventListener("mousemove", (e) => {
    // Evitar hacer raycasting constante si no es necesario (opcional: throttling)
    handleMouseMove(e);
  });

  canvas.addEventListener("click", (event) => {
    // Solo procesar como click si:
    // 1. No se movió mucho el mouse (menos de 5 píxeles)
    // 2. Fue un click rápido (menos de 200ms)
    const dx = Math.abs(event.clientX - mouseDownX);
    const dy = Math.abs(event.clientY - mouseDownY);
    const elapsed = Date.now() - mouseDownTime;

    const isClick = dx < 5 && dy < 5 && elapsed < 200;

    if (isClick) {
      handleCanvasClick(event);
    }
  });

  // Redimensionar canvas
  window.addEventListener("resize", () => {
    const canvas = document.getElementById("chess-canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  });
}

// Manejar click en el canvas
function handleCanvasClick(event) {
  if (gameState.isGameOver) {
    console.log("El juego ha terminado");
    return;
  }

  if (!isPlayerTurn) {
    console.log("Esperando movimiento de la IA...");
    return;
  }

  // Usar el método que YA EXISTE en renderer
  const square = renderer.getSquareFromMouse(event);

  if (!square) {
    console.log("Click fuera del tablero");
    return;
  }

  console.log(`Click en casilla: ${indicesToNotation(square.row, square.col)}`);

  handleSquareSelection(square.row, square.col);
}

// Manejar movimiento del mouse para hover
function handleMouseMove(event) {
  if (!renderer || !gameState) return;

  // Si es turno de la IA y no terminó, quizás no queramos mostrar nada, pero
  // el usuario pidió "al posicionar el cursor sobre una ficha". 
  // Lo haremos para el jugador actual.

  // Solo si es turno del humano para evitar confusión
  if (!isPlayerTurn) {
    renderer.hoverMoves = [];
    return;
  }

  const square = renderer.getSquareFromMouse(event);

  if (square) {
    const piece = gameState.board.getPiece(square.row, square.col);

    // Si hay pieza y es del color del jugador actual
    if (piece && piece.color === gameState.currentPlayer) {
      // Calcular movimientos
      const moves = gameState.getAllLegalMoves(piece.color)
        .filter(m => m.fromRow === square.row && m.fromCol === square.col);

      // Pasar al renderer transformados a formato simple {row, col}
      renderer.hoverMoves = moves.map(m => ({ row: m.toRow, col: m.toCol }));
    } else {
      renderer.hoverMoves = [];
    }
  } else {
    renderer.hoverMoves = [];
  }
}

// Manejar selección de casilla
function handleSquareSelection(row, col) {
  const piece = gameState.board.getPiece(row, col);

  // Si hay una pieza seleccionada
  if (selectedSquare) {
    // Verificar si el click es un movimiento válido
    const moveFound = validMoves.find(
      (move) => move.toRow === row && move.toCol === col
    );

    if (moveFound) {
      // Ejecutar el movimiento
      makePlayerMove(moveFound);
    } else if (piece && piece.color === gameState.currentPlayer) {
      // Seleccionar otra pieza del mismo color
      selectPiece(row, col, piece);
    } else {
      // Deseleccionar
      deselectPiece();
    }
  } else {
    // Seleccionar pieza si es del jugador actual
    if (piece && piece.color === gameState.currentPlayer) {
      selectPiece(row, col, piece);
    }
  }
}

// Seleccionar una pieza
function selectPiece(row, col, piece) {
  selectedSquare = { row, col };
  validMoves = gameState
    .getAllLegalMoves(piece.color)
    .filter((move) => move.fromRow === row && move.fromCol === col);

  console.log(
    `Pieza seleccionada: ${piece.type} en ${indicesToNotation(row, col)}`
  );
  console.log(`Movimientos válidos: ${validMoves.length}`);

  // Actualizar visualización
  renderer.selectedSquare = selectedSquare;
  renderer.validMoves = validMoves;
}

// Deseleccionar pieza
function deselectPiece() {
  selectedSquare = null;
  validMoves = [];
  renderer.selectedSquare = null;
  renderer.validMoves = [];
  console.log("Pieza deseleccionada");
}

// Hacer movimiento del jugador
function makePlayerMove(move) {
  console.log(`Jugador mueve: ${move.toString()}`);

  // Ejecutar movimiento
  gameState.makeMove(move);
  deselectPiece();
  updateUI();

  // Verificar fin del juego
  if (gameState.isGameOver) {
    handleGameOver();
    return;
  }

  // Turno de la IA
  if (gameState.currentPlayer === Color.BLACK) {
    isPlayerTurn = false;
    makeAIMove();
  }
}

// Hacer movimiento de la IA
function makeAIMove() {
  console.log("IA está pensando...");

  // Deshabilitar controles
  document.getElementById("undo").disabled = true;

  // Pequeño delay para que se vea el pensamiento
  setTimeout(() => {
    const startTime = Date.now();
    const move = ai.findBestMove(gameState);
    const elapsed = Date.now() - startTime;

    if (move) {
      console.log(`IA mueve: ${move.toString()} (tiempo: ${elapsed}ms)`);
      gameState.makeMove(move);
      updateUI();

      // Verificar fin del juego
      if (gameState.isGameOver) {
        handleGameOver();
      }
    } else {
      console.error("IA no pudo encontrar un movimiento válido");
    }

    // Habilitar controles
    document.getElementById("undo").disabled = false;
    isPlayerTurn = true;
  }, 300);
}

// Deshacer movimiento
function undoMove() {
  if (gameState.moveHistory.length < 2) {
    console.log("No hay movimientos para deshacer");
    return;
  }

  // Deshacer el movimiento del jugador y de la IA
  gameState.undoMove(); // Movimiento de la IA
  gameState.undoMove(); // Movimiento del jugador

  deselectPiece();
  updateUI();
  isPlayerTurn = true;

  console.log("Movimientos deshechos");
}

// Nueva partida
function newGame() {
  console.log("Iniciando nueva partida...");

  gameState.reset();
  deselectPiece();
  renderer.reset();
  isPlayerTurn = true;

  updateUI();

  console.log("Nueva partida iniciada");
}

// Actualizar interfaz de usuario
function updateUI() {
  // Actualizar estado del turno
  const statusElement = document.getElementById("game-status");
  if (gameState.isGameOver) {
    if (gameState.winner === "draw") {
      statusElement.textContent = "¡Empate!";
      statusElement.style.background = "#f0ad4e";
    } else {
      const winnerText =
        gameState.winner === Color.WHITE ? "Blancas" : "Negras";
      statusElement.textContent = `¡${winnerText} ganan!`;
      statusElement.style.background = "#5cb85c";
    }
  } else {
    const turnText =
      gameState.currentPlayer === Color.WHITE ? "Blancas" : "Negras";
    statusElement.textContent = `Turno: ${turnText}`;
    statusElement.style.background = "#f0f0f0";

    // Verificar jaque
    if (isKingInCheck(gameState.board.squares, gameState.currentPlayer)) {
      statusElement.textContent += " - ¡JAQUE!";
      statusElement.style.background = "#d9534f";
      statusElement.style.color = "white";
    } else {
      statusElement.style.color = "black";
    }
  }

  // Actualizar piezas capturadas
  updateCapturedPieces();

  // Actualizar historial de movimientos
  updateMoveHistory();

  // Habilitar/deshabilitar botón deshacer
  document.getElementById("undo").disabled =
    gameState.moveHistory.length < 2 || !isPlayerTurn || gameState.isGameOver;
}

// Actualizar piezas capturadas
function updateCapturedPieces() {
  const whiteCapturedElement = document.getElementById("white-captured");
  const blackCapturedElement = document.getElementById("black-captured");

  // Piezas blancas capturadas
  whiteCapturedElement.innerHTML = "<strong>Capturadas (Blancas):</strong><br>";
  if (gameState.capturedPieces.white.length === 0) {
    whiteCapturedElement.innerHTML +=
      '<span style="color: #999;">Ninguna</span>';
  } else {
    gameState.capturedPieces.white.forEach((piece) => {
      whiteCapturedElement.innerHTML += `<span style="font-size: 20px; margin: 2px;">${piece.getSymbol()}</span>`;
    });
  }

  // Piezas negras capturadas
  blackCapturedElement.innerHTML = "<strong>Capturadas (Negras):</strong><br>";
  if (gameState.capturedPieces.black.length === 0) {
    blackCapturedElement.innerHTML +=
      '<span style="color: #999;">Ninguna</span>';
  } else {
    gameState.capturedPieces.black.forEach((piece) => {
      blackCapturedElement.innerHTML += `<span style="font-size: 20px; margin: 2px;">${piece.getSymbol()}</span>`;
    });
  }
}

// Actualizar historial de movimientos
function updateMoveHistory() {
  const historyElement = document.getElementById("move-history");
  historyElement.innerHTML = "<strong>Historial de Movimientos:</strong><br>";

  if (gameState.moveHistory.length === 0) {
    historyElement.innerHTML +=
      '<div style="color: #999; padding: 5px;">Sin movimientos aún</div>';
    return;
  }

  // Agrupar movimientos por parejas (blancas-negras)
  for (let i = 0; i < gameState.moveHistory.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = gameState.moveHistory[i];
    const blackMove = gameState.moveHistory[i + 1];

    let moveText = `<div class="move-item">
        <strong>${moveNumber}.</strong> 
        ${formatMove(whiteMove)}`;

    if (blackMove) {
      moveText += ` - ${formatMove(blackMove)}`;
    }

    moveText += "</div>";
    historyElement.innerHTML += moveText;
  }

  // Scroll al final
  historyElement.scrollTop = historyElement.scrollHeight;
}

// Formatear movimiento para mostrar
function formatMove(move) {
  const piece = move.piece;
  const pieceSymbol = piece.getSymbol();
  const from = indicesToNotation(move.fromRow, move.fromCol);
  const to = indicesToNotation(move.toRow, move.toCol);
  const capture = move.capturedPiece ? "x" : "-";

  return `${pieceSymbol} ${from}${capture}${to}`;
}

// Manejar fin del juego
function handleGameOver() {
  console.log("¡Juego terminado!");

  isPlayerTurn = false;

  if (gameState.winner === "draw") {
    console.log("Resultado: Empate");
    alert("¡Empate! No hay movimientos legales disponibles.");
  } else {
    const winnerText = gameState.winner === Color.WHITE ? "Blancas" : "Negras";
    console.log(`Ganador: ${winnerText}`);
    alert(`¡${winnerText} ganan por jaque mate!`);
  }
}

// Función global para manejar clicks en casillas (llamada desde renderer)
window.handleSquareClick = function (row, col) {
  handleSquareSelection(row, col);
};

// Inicializar cuando se cargue la página
window.addEventListener("load", () => {
  console.log("Página cargada, inicializando...");
  init();
});

// Manejar errores globales
window.addEventListener("error", (event) => {
  console.error("Error global:", event.error);
  alert("Ha ocurrido un error. Por favor, recarga la página.");
});

class ChessRenderer {
  constructor(canvas, gameState) {
    this.canvas = canvas;
    this.gameState = gameState;
    this.gl = canvas.getContext("webgl");

    if (!this.gl) {
      alert("WebGL no está disponible en tu navegador");
      return;
    }

    this.camera = new Camera();
    this.camera.attach(this.canvas);
    this.selectedSquare = null;
    this.hoverMoves = []; // Moves to highlight on hover
    this.validMoves = [];
    this.frameCount = 0;

    this.init();
    this.setupEventListeners();
    this.render();
  }
  getMouseNDC(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    return [x, y];
  }
  init() {
    const gl = this.gl;

    console.log("=== INICIALIZANDO RENDERER ===");

    // Crear programa de shaders
    this.program = createShaderProgram(gl);
    if (!this.program) {
      console.error("No se pudo crear el programa de shaders");
      return;
    }
    console.log("✓ Programa de shaders creado");

    // Obtener ubicaciones
    this.locations = {
      attributes: {
        position: gl.getAttribLocation(this.program, "aPosition"),
        normal: gl.getAttribLocation(this.program, "aNormal"),
        color: gl.getAttribLocation(this.program, "aColor"),
      },
      uniforms: {
        modelViewMatrix: gl.getUniformLocation(
          this.program,
          "uModelViewMatrix"
        ),
        projectionMatrix: gl.getUniformLocation(
          this.program,
          "uProjectionMatrix"
        ),
        normalMatrix: gl.getUniformLocation(this.program, "uNormalMatrix"),
        lightPosition: gl.getUniformLocation(this.program, "uLightPosition"),
        viewPosition: gl.getUniformLocation(this.program, "uViewPosition"),
        highlightColor: gl.getUniformLocation(this.program, "uHighlightColor"),
      },
    };

    console.log("✓ Locations obtenidas");

    // Crear geometría
    this.createBoardGeometry();

    // Configuración WebGL
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.1, 0.1, 0.15, 1.0);

    console.log("✓ WebGL configurado");
    console.log("=== INICIALIZACIÓN COMPLETA ===\n");
  }
  setupEventListeners() {
    this.canvas.addEventListener("click", (e) => this.onClick(e));
  }
  onClick(event) {
    const square = this.getSquareFromMouse(event);
    if (square && window.handleSquareClick) {
      window.handleSquareClick(square.row, square.col);
    }
  }

  createBoardGeometry() {
    const gl = this.gl;
    const whiteSquare = [0.9, 0.9, 0.85];
    const blackSquare = [0.4, 0.3, 0.25];

    this.boardSquares = [];

    console.log("Creando geometría del tablero...");

    for (let row = 0; row < 8; row++) {
      this.boardSquares[row] = [];
      for (let col = 0; col < 8; col++) {
        // Alternar colores
        const color = (row + col) % 2 === 0 ? whiteSquare : blackSquare;

        // Crear geometría del cubo
        const geometry = createCube(0.95, color);

        // Posición en el espacio 3D
        const x = col - 3.5; // -3.5 a 3.5
        const z = row - 3.5; // -3.5 a 3.5
        const y = 0; // Altura del tablero

        // Crear buffers
        const buffers = this.createBuffers(geometry);

        this.boardSquares[row][col] = {
          buffers: buffers,
          position: [x, y, z],
          vertexCount: geometry.count,
          row: row,
          col: col,
        };
      }
    }

    console.log(
      `✓ Tablero creado: ${this.boardSquares.length}x${this.boardSquares[0].length
      } = ${this.boardSquares.length * this.boardSquares[0].length} casillas`
    );
  }

  createBuffers(geometry) {
    const gl = this.gl;

    // Buffer de posiciones
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(geometry.vertices),
      gl.STATIC_DRAW
    );

    // Buffer de normales
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(geometry.normals),
      gl.STATIC_DRAW
    );

    // Buffer de colores
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(geometry.colors),
      gl.STATIC_DRAW
    );

    return {
      position: positionBuffer,
      normal: normalBuffer,
      color: colorBuffer,
    };
  }

  render() {
    const gl = this.gl;

    // Actualizar cámara
    this.camera.update();

    // Ajustar tamaño del canvas
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (
      this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight
    ) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }

    // Limpiar pantalla
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Usar programa de shaders
    gl.useProgram(this.program);

    // Calcular matrices
    const aspect = gl.canvas.width / gl.canvas.height;
    const projectionMatrix = this.createPerspectiveMatrix(
      Math.PI / 4,
      aspect,
      0.1,
      100.0
    );
    const viewMatrix = this.camera.getViewMatrix();
    this.projectionMatrix = projectionMatrix;
    this.viewMatrix = viewMatrix;
    // Establecer uniforms globales
    gl.uniformMatrix4fv(
      this.locations.uniforms.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniform3fv(this.locations.uniforms.lightPosition, [5, 10, 5]);
    gl.uniform3fv(this.locations.uniforms.viewPosition, this.camera.position);

    // Renderizar tablero
    this.renderBoard(viewMatrix);

    // Renderizar piezas
    this.renderPieces(viewMatrix);

    // Log cada segundo
    this.frameCount++;
    if (this.frameCount === 60) {
      console.log(
        `Renderizando - Cámara: [${this.camera.position
          .map((v) => v.toFixed(1))
          .join(", ")}]`
      );
      this.frameCount = 0;
    }

    // Continuar animación
    requestAnimationFrame(() => this.render());
  }

  renderBoard(viewMatrix) {
    const gl = this.gl;

    // Renderizar cada casilla
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this.boardSquares[row][col];

        // Crear matriz de modelo
        const modelMatrix = this.createTranslationMatrix(
          square.position[0],
          square.position[1],
          square.position[2]
        );

        // Combinar con vista
        const modelViewMatrix = this.multiplyMatrices(modelMatrix, viewMatrix);
        const normalMatrix = this.createNormalMatrix(modelViewMatrix);

        // Establecer uniforms
        gl.uniformMatrix4fv(
          this.locations.uniforms.modelViewMatrix,
          false,
          modelViewMatrix
        );
        gl.uniformMatrix4fv(
          this.locations.uniforms.normalMatrix,
          false,
          normalMatrix
        );

        // Determinar resaltado
        let highlight = [0, 0, 0];

        // Si está en movimiento hover (Verde)
        const isHoverMove = this.hoverMoves.some(m => m.row === row && m.col === col);
        if (isHoverMove) {
          highlight = [0.0, 1.0, 0.0]; // Verde
        }

        gl.uniform3fv(this.locations.uniforms.highlightColor, highlight);

        // Dibujar
        this.drawBuffers(square.buffers, square.vertexCount);
      }
    }
  }

  renderPieces(viewMatrix) {
    const gl = this.gl;
    const whiteColor = [0.95, 0.95, 0.9];
    const blackColor = [0.15, 0.15, 0.15];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameState.board.getPiece(row, col);
        if (!piece) continue;

        // Color de la pieza
        const color = piece.color === Color.WHITE ? whiteColor : blackColor;

        // Crear geometría
        const geometry = createPieceGeometry(piece.type, color);
        const buffers = this.createBuffers(geometry);

        // Posición
        const x = col - 3.5;
        const z = row - 3.5;
        const y = 0.7; // Encima del tablero

        // Matrices
        const modelMatrix = this.createTranslationMatrix(x, y, z);
        const modelViewMatrix = this.multiplyMatrices(modelMatrix, viewMatrix);
        const normalMatrix = this.createNormalMatrix(modelViewMatrix);

        // Verificar si está seleccionada
        const isSelected =
          this.selectedSquare &&
          this.selectedSquare.row === row &&
          this.selectedSquare.col === col;

        // Establecer uniforms
        gl.uniformMatrix4fv(
          this.locations.uniforms.modelViewMatrix,
          false,
          modelViewMatrix
        );
        gl.uniformMatrix4fv(
          this.locations.uniforms.normalMatrix,
          false,
          normalMatrix
        );

        // Resaltado de pieza seleccionada (Amarillo)
        const highlight = isSelected ? [1.0, 1.0, 0.0] : [0, 0, 0];
        gl.uniform3fv(this.locations.uniforms.highlightColor, highlight);

        // Dibujar
        this.drawBuffers(buffers, geometry.count);
      }
    }
  }

  drawBuffers(buffers, vertexCount) {
    const gl = this.gl;

    // Posiciones
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      this.locations.attributes.position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.locations.attributes.position);

    // Normales
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
      this.locations.attributes.normal,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.locations.attributes.normal);

    // Colores
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      this.locations.attributes.color,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.locations.attributes.color);

    // Dibujar
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }

  // === FUNCIONES DE MATRICES ===

  createPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) * nf,
      -1,
      0,
      0,
      2 * far * near * nf,
      0,
    ];
  }

  createTranslationMatrix(x, y, z) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  }

  multiplyMatrices(a, b) {
    const result = new Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] =
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    return result;
  }

  createNormalMatrix(modelViewMatrix) {
    const inv = this.invertMatrix(modelViewMatrix);
    return this.transposeMatrix(inv);
  }

  invertMatrix(m) {
    const inv = new Array(16);
    inv[0] =
      m[5] * m[10] * m[15] -
      m[5] * m[11] * m[14] -
      m[9] * m[6] * m[15] +
      m[9] * m[7] * m[14] +
      m[13] * m[6] * m[11] -
      m[13] * m[7] * m[10];
    inv[4] =
      -m[4] * m[10] * m[15] +
      m[4] * m[11] * m[14] +
      m[8] * m[6] * m[15] -
      m[8] * m[7] * m[14] -
      m[12] * m[6] * m[11] +
      m[12] * m[7] * m[10];
    inv[8] =
      m[4] * m[9] * m[15] -
      m[4] * m[11] * m[13] -
      m[8] * m[5] * m[15] +
      m[8] * m[7] * m[13] +
      m[12] * m[5] * m[11] -
      m[12] * m[7] * m[9];
    inv[12] =
      -m[4] * m[9] * m[14] +
      m[4] * m[10] * m[13] +
      m[8] * m[5] * m[14] -
      m[8] * m[6] * m[13] -
      m[12] * m[5] * m[10] +
      m[12] * m[6] * m[9];
    inv[1] =
      -m[1] * m[10] * m[15] +
      m[1] * m[11] * m[14] +
      m[9] * m[2] * m[15] -
      m[9] * m[3] * m[14] -
      m[13] * m[2] * m[11] +
      m[13] * m[3] * m[10];
    inv[5] =
      m[0] * m[10] * m[15] -
      m[0] * m[11] * m[14] -
      m[8] * m[2] * m[15] +
      m[8] * m[3] * m[14] +
      m[12] * m[2] * m[11] -
      m[12] * m[3] * m[10];
    inv[9] =
      -m[0] * m[9] * m[15] +
      m[0] * m[11] * m[13] +
      m[8] * m[1] * m[15] -
      m[8] * m[3] * m[13] -
      m[12] * m[1] * m[11] +
      m[12] * m[3] * m[9];
    inv[13] =
      m[0] * m[9] * m[14] -
      m[0] * m[10] * m[13] -
      m[8] * m[1] * m[14] +
      m[8] * m[2] * m[13] +
      m[12] * m[1] * m[10] -
      m[12] * m[2] * m[9];
    inv[2] =
      m[1] * m[6] * m[15] -
      m[1] * m[7] * m[14] -
      m[5] * m[2] * m[15] +
      m[5] * m[3] * m[14] +
      m[13] * m[2] * m[7] -
      m[13] * m[3] * m[6];
    inv[6] =
      -m[0] * m[6] * m[15] +
      m[0] * m[7] * m[14] +
      m[4] * m[2] * m[15] -
      m[4] * m[3] * m[14] -
      m[12] * m[2] * m[7] +
      m[12] * m[3] * m[6];
    inv[10] =
      m[0] * m[5] * m[15] -
      m[0] * m[7] * m[13] -
      m[4] * m[1] * m[15] +
      m[4] * m[3] * m[13] +
      m[12] * m[1] * m[7] -
      m[12] * m[3] * m[5];
    inv[14] =
      -m[0] * m[5] * m[14] +
      m[0] * m[6] * m[13] +
      m[4] * m[1] * m[14] -
      m[4] * m[2] * m[13] -
      m[12] * m[1] * m[6] +
      m[12] * m[2] * m[5];
    inv[3] =
      -m[1] * m[6] * m[11] +
      m[1] * m[7] * m[10] +
      m[5] * m[2] * m[11] -
      m[5] * m[3] * m[10] -
      m[9] * m[2] * m[7] +
      m[9] * m[3] * m[6];
    inv[7] =
      m[0] * m[6] * m[11] -
      m[0] * m[7] * m[10] -
      m[4] * m[2] * m[11] +
      m[4] * m[3] * m[10] +
      m[8] * m[2] * m[7] -
      m[8] * m[3] * m[6];
    inv[11] =
      -m[0] * m[5] * m[11] +
      m[0] * m[7] * m[9] +
      m[4] * m[1] * m[11] -
      m[4] * m[3] * m[9] -
      m[8] * m[1] * m[7] +
      m[8] * m[3] * m[5];
    inv[15] =
      m[0] * m[5] * m[10] -
      m[0] * m[6] * m[9] -
      m[4] * m[1] * m[10] +
      m[4] * m[2] * m[9] +
      m[8] * m[1] * m[6] -
      m[8] * m[2] * m[5];

    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    if (det === 0) return m;
    det = 1.0 / det;
    for (let i = 0; i < 16; i++) inv[i] *= det;
    return inv;
  }

  transposeMatrix(m) {
    return [
      m[0],
      m[4],
      m[8],
      m[12],
      m[1],
      m[5],
      m[9],
      m[13],
      m[2],
      m[6],
      m[10],
      m[14],
      m[3],
      m[7],
      m[11],
      m[15],
    ];
  }
  // ================== RAY CASTING ==================

  getRayFromMouse(event) {
    const [ndcX, ndcY] = this.getMouseNDC(event);

    const invProj = this.invertMatrix(this.projectionMatrix);
    const invView = this.invertMatrix(this.viewMatrix);

    const clip = [ndcX, ndcY, -1, 1];

    let eye = this.multiplyVec4(invProj, clip);
    eye = [eye[0], eye[1], -1, 0];

    const world = this.multiplyVec4(invView, eye);

    const dir = this.normalize([world[0], world[1], world[2]]);
    const origin = this.camera.position;

    return { origin, dir };
  }

  // Intersectar rayo con plano
  intersectPlane(ray, planeY) {
    const t = (planeY - ray.origin[1]) / ray.dir[1];
    if (t < 0) return null;

    return [
      ray.origin[0] + ray.dir[0] * t,
      planeY,
      ray.origin[2] + ray.dir[2] * t,
    ];
  }

  // Intersectar rayo con caja (AABB - Axis Aligned Bounding Box)
  intersectBox(ray, boxMin, boxMax) {
    const tMin = [
      (boxMin[0] - ray.origin[0]) / ray.dir[0],
      (boxMin[1] - ray.origin[1]) / ray.dir[1],
      (boxMin[2] - ray.origin[2]) / ray.dir[2],
    ];

    const tMax = [
      (boxMax[0] - ray.origin[0]) / ray.dir[0],
      (boxMax[1] - ray.origin[1]) / ray.dir[1],
      (boxMax[2] - ray.origin[2]) / ray.dir[2],
    ];

    // Ordenar min y max
    const t1 = [
      Math.min(tMin[0], tMax[0]),
      Math.min(tMin[1], tMax[1]),
      Math.min(tMin[2], tMax[2]),
    ];

    const t2 = [
      Math.max(tMin[0], tMax[0]),
      Math.max(tMin[1], tMax[1]),
      Math.max(tMin[2], tMax[2]),
    ];

    const tNear = Math.max(t1[0], t1[1], t1[2]);
    const tFar = Math.min(t2[0], t2[1], t2[2]);

    if (tNear > tFar || tFar < 0) {
      return null;
    }

    const t = tNear > 0 ? tNear : tFar;

    return [
      ray.origin[0] + ray.dir[0] * t,
      ray.origin[1] + ray.dir[1] * t,
      ray.origin[2] + ray.dir[2] * t,
    ];
  }

  getSquareFromMouse(event) {
    const ray = this.getRayFromMouse(event);

    let closestSquare = null;
    let closestDistance = Infinity;

    // Verificar intersección con cada casilla del tablero
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this.boardSquares[row][col];
        const [x, y, z] = square.position;

        // Dimensiones de la casilla (cubo de tamaño 0.95)
        const halfSize = 0.95 / 2;

        const boxMin = [x - halfSize, y - halfSize, z - halfSize];
        const boxMax = [x + halfSize, y + halfSize, z + halfSize];

        const hit = this.intersectBox(ray, boxMin, boxMax);

        if (hit) {
          // Calcular distancia desde la cámara
          const dx = hit[0] - ray.origin[0];
          const dy = hit[1] - ray.origin[1];
          const dz = hit[2] - ray.origin[2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestSquare = { row, col, hit };
          }
        }
      }
    }

    if (closestSquare) {
      console.log(
        `Click en casilla [${closestSquare.row}, ${closestSquare.col}] - ` +
        `Punto 3D: [${closestSquare.hit.map((v) => v.toFixed(2)).join(", ")}]`
      );
      return { row: closestSquare.row, col: closestSquare.col };
    }

    console.log("Click fuera del tablero");
    return null;
  }

  // ================== VECTORES ==================

  normalize(v) {
    const l = Math.hypot(v[0], v[1], v[2]);
    if (l === 0) return [0, 0, 0];
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  multiplyVec4(m, v) {
    return [
      m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
      m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
      m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
      m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
    ];
  }

  reset() {
    this.selectedSquare = null;
    this.validMoves = [];
  }
}

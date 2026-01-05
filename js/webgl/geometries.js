// Crear geometría de un cubo
function createCube(size, color) {
  const s = size / 2;
  const vertices = [
    // Frente
    -s, -s, s, s, -s, s, s, s, s,
    -s, -s, s, s, s, s, -s, s, s,
    // Atrás
    -s, -s, -s, -s, s, -s, s, s, -s,
    -s, -s, -s, s, s, -s, s, -s, -s,
    // Arriba
    -s, s, -s, -s, s, s, s, s, s,
    -s, s, -s, s, s, s, s, s, -s,
    // Abajo
    -s, -s, -s, s, -s, -s, s, -s, s,
    -s, -s, -s, s, -s, s, -s, -s, s,
    // Derecha
    s, -s, -s, s, s, -s, s, s, s,
    s, -s, -s, s, s, s, s, -s, s,
    // Izquierda
    -s, -s, -s, -s, -s, s, -s, s, s,
    -s, -s, -s, -s, s, s, -s, s, -s,
  ];

  const normals = [
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ];

  // YA NO se genera array de colores
  return { vertices, normals, count: 36 };
}

// Crear geometría de un cilindro (o cono truncado)
function createCylinder(radiusTop, radiusBottom, height, segments, color) {
  const vertices = [];
  const normals = [];

  // Tapa inferior
  if (radiusBottom > 0) {
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      vertices.push(
        0, -height / 2, 0,
        Math.cos(angle1) * radiusBottom, -height / 2, Math.sin(angle1) * radiusBottom,
        Math.cos(angle2) * radiusBottom, -height / 2, Math.sin(angle2) * radiusBottom
      );
      normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
    }
  }

  // Tapa superior
  if (radiusTop > 0) {
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      vertices.push(
        0, height / 2, 0,
        Math.cos(angle2) * radiusTop, height / 2, Math.sin(angle2) * radiusTop,
        Math.cos(angle1) * radiusTop, height / 2, Math.sin(angle1) * radiusTop
      );
      normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
    }
  }

  // Lados
  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2;
    const angle2 = ((i + 1) / segments) * Math.PI * 2;

    const x1_b = Math.cos(angle1) * radiusBottom;
    const z1_b = Math.sin(angle1) * radiusBottom;
    const x2_b = Math.cos(angle2) * radiusBottom;
    const z2_b = Math.sin(angle2) * radiusBottom;

    const x1_t = Math.cos(angle1) * radiusTop;
    const z1_t = Math.sin(angle1) * radiusTop;
    const x2_t = Math.cos(angle2) * radiusTop;
    const z2_t = Math.sin(angle2) * radiusTop;

    vertices.push(x1_b, -height / 2, z1_b, x2_b, -height / 2, z2_b, x2_t, height / 2, z2_t);
    vertices.push(x1_b, -height / 2, z1_b, x2_t, height / 2, z2_t, x1_t, height / 2, z1_t);

    const slope = (radiusBottom - radiusTop) / height;
    const ny = slope;
    const len = Math.sqrt(1 + ny * ny);

    const nx1 = Math.cos(angle1);
    const nz1 = Math.sin(angle1);
    const n1 = [nx1 / len, ny / len, nz1 / len];

    const nx2 = Math.cos(angle2);
    const nz2 = Math.sin(angle2);
    const n2 = [nx2 / len, ny / len, nz2 / len];

    normals.push(...n1, ...n2, ...n2);
    normals.push(...n1, ...n2, ...n1);
  }

  return { vertices, normals, count: vertices.length / 3 };
}

function createCone(radius, height, segments, color) {
  // Wrapper para mantener compatibilidad
  return createCylinder(0, radius, height, segments, color);
}


// Crear geometría de una esfera (mejorada)
function createSphere(radius, segments, color) {
  const vertices = [];
  const normals = [];

  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / segments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      vertices.push(radius * x, radius * y, radius * z);
      normals.push(x, y, z);
    }
  }

  const indices = [];
  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const first = lat * (segments + 1) + lon;
      const second = first + segments + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  const expandedVertices = [];
  const expandedNormals = [];

  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    expandedVertices.push(
      vertices[index * 3],
      vertices[index * 3 + 1],
      vertices[index * 3 + 2]
    );
    expandedNormals.push(
      normals[index * 3],
      normals[index * 3 + 1],
      normals[index * 3 + 2]
    );
  }

  return { vertices: expandedVertices, normals: expandedNormals, count: expandedVertices.length / 3 };
}

// Crear geometría de un toro (para la corona)
function createTorus(majorRadius, minorRadius, majorSegments, minorSegments, color) {
  const vertices = [];
  const normals = [];

  for (let i = 0; i < majorSegments; i++) {
    const phi = (i / majorSegments) * Math.PI * 2;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let j = 0; j < minorSegments; j++) {
      const theta = (j / minorSegments) * Math.PI * 2;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const x = (majorRadius + minorRadius * cosTheta) * cosPhi;
      const y = minorRadius * sinTheta;
      const z = (majorRadius + minorRadius * cosTheta) * sinPhi;

      const nx = cosPhi * cosTheta;
      const ny = sinTheta;
      const nz = sinPhi * cosTheta;

      vertices.push(x, y, z);
      normals.push(nx, ny, nz);
    }
  }

  const indices = [];
  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const nextI = (i + 1) % majorSegments;
      const nextJ = (j + 1) % minorSegments;

      const a = i * minorSegments + j;
      const b = nextI * minorSegments + j;
      const c = i * minorSegments + nextJ;
      const d = nextI * minorSegments + nextJ;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const expandedVertices = [];
  const expandedNormals = [];

  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    expandedVertices.push(
      vertices[index * 3],
      vertices[index * 3 + 1],
      vertices[index * 3 + 2]
    );
    expandedNormals.push(
      normals[index * 3],
      normals[index * 3 + 1],
      normals[index * 3 + 2]
    );
  }

  return { vertices: expandedVertices, normals: expandedNormals, count: expandedVertices.length / 3 };
}

// Helper para unir geometrías
function mergeMesh(target, source, translation = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const cx = Math.cos(rotation[0]), sx = Math.sin(rotation[0]);
  const cy = Math.cos(rotation[1]), sy = Math.sin(rotation[1]);
  const cz = Math.cos(rotation[2]), sz = Math.sin(rotation[2]);

  for (let i = 0; i < source.vertices.length; i += 3) {
    let x = source.vertices[i] * scale[0];
    let y = source.vertices[i + 1] * scale[1];
    let z = source.vertices[i + 2] * scale[2];

    // Rotación X
    let ry = y * cx - z * sx;
    let rz = y * sx + z * cx;
    y = ry; z = rz;

    // Rotación Y
    let rx = x * cy + z * sy;
    rz = -x * sy + z * cy;
    x = rx; z = rz;

    // Rotación Z
    rx = x * cz - y * sz;
    ry = x * sz + y * cz;
    x = rx; y = ry;

    target.vertices.push(x + translation[0], y + translation[1], z + translation[2]);

    // Transformar normales
    let nx = source.normals[i];
    let ny = source.normals[i + 1];
    let nz = source.normals[i + 2];

    ry = ny * cx - nz * sx;
    rz = ny * sx + nz * cx;
    ny = ry; nz = rz;

    rx = nx * cy + nz * sy;
    rz = -nx * sy + nz * cy;
    nx = rx; nz = rz;

    rx = nx * cz - ny * sz;
    ry = nx * sz + ny * cz;
    nx = rx; ny = ry;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0) {
      nx /= len; ny /= len; nz /= len;
    }

    target.normals.push(nx, ny, nz);
  }
  target.count += source.count;
}

// Crear geometría para diferentes tipos de piezas (ESTILO STAUNTON)
function createPieceGeometry(pieceType, color) {
  const segments = 36; // Muy alta calidad
  const mesh = { vertices: [], normals: [], colors: [], count: 0 };

  switch (pieceType) {
    case PieceType.PAWN:
      // Base amplia con anillo
      mergeMesh(mesh, createCylinder(0.35, 0.40, 0.10, segments, color), [0, 0.05, 0]);
      mergeMesh(mesh, createTorus(0.36, 0.025, segments/2, 16, color), [0, 0.10, 0]);
      
      // Cuerpo cónico elegante
      mergeMesh(mesh, createCylinder(0.18, 0.32, 0.50, segments, color), [0, 0.35, 0]);
      
      // Cuello con anillos decorativos
      mergeMesh(mesh, createCylinder(0.14, 0.16, 0.10, segments, color), [0, 0.63, 0]);
      mergeMesh(mesh, createTorus(0.17, 0.030, segments/2, 12, color), [0, 0.68, 0]);
      
      // Cabeza esférica grande
      mergeMesh(mesh, createSphere(0.22, segments, color), [0, 0.92, 0]);
      break;

    case PieceType.ROOK:
      // Base robusta multicapa
      mergeMesh(mesh, createCylinder(0.38, 0.43, 0.08, segments, color), [0, 0.04, 0]);
      mergeMesh(mesh, createTorus(0.39, 0.02, segments/2, 12, color), [0, 0.08, 0]);
      mergeMesh(mesh, createCylinder(0.34, 0.38, 0.08, segments, color), [0, 0.12, 0]);
      
      // Cuerpo principal cónico
      mergeMesh(mesh, createCylinder(0.28, 0.34, 0.40, segments, color), [0, 0.40, 0]);
      
      // Parte media
      mergeMesh(mesh, createCylinder(0.26, 0.28, 0.40, segments, color), [0, 0.80, 0]);
      mergeMesh(mesh, createTorus(0.27, 0.025, segments/2, 12, color), [0, 1.0, 0]);
      
      // Corona de la torre (acampanada)
      mergeMesh(mesh, createCylinder(0.34, 0.26, 0.20, segments, color), [0, 1.15, 0]);
      
      // Almenas (8 torres pequeñas)
      const merlonCount = 8;
      for (let i = 0; i < merlonCount; i++) {
        const angle = (i * Math.PI * 2) / merlonCount;
        const radius = 0.26;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Torre con base y tope
        mergeMesh(mesh, createCylinder(0.050, 0.055, 0.14, 12, color), [x, 1.32, z]);
        mergeMesh(mesh, createCylinder(0.060, 0.050, 0.03, 12, color), [x, 1.41, z]);
      }
      break;

    case PieceType.KNIGHT:
      // Base estándar
      mergeMesh(mesh, createCylinder(0.38, 0.43, 0.08, segments, color), [0, 0.04, 0]);
      mergeMesh(mesh, createTorus(0.39, 0.02, segments/2, 12, color), [0, 0.08, 0]);
      mergeMesh(mesh, createCylinder(0.34, 0.38, 0.08, segments, color), [0, 0.12, 0]);
      mergeMesh(mesh, createCylinder(0.30, 0.34, 0.35, segments, color), [0, 0.37, 0]);
      
      // Pedestal del caballo
      mergeMesh(mesh, createCylinder(0.26, 0.30, 0.15, segments, color), [0, 0.62, 0]);
      
      // Cuello arqueado (3 segmentos para curva)
      mergeMesh(mesh, createCylinder(0.20, 0.26, 0.25, 24, color), [0, 0.82, 0.08], [1, 1, 1], [-0.15, 0, 0]);
      mergeMesh(mesh, createCylinder(0.18, 0.20, 0.22, 20, color), [0, 1.02, 0.18], [1, 1, 1], [-0.28, 0, 0]);
      mergeMesh(mesh, createCylinder(0.16, 0.18, 0.18, 16, color), [0, 1.18, 0.28], [1, 1, 1], [-0.35, 0, 0]);
      
      // Cabeza del caballo (esfera alargada)
      mergeMesh(mesh, createSphere(0.26, segments, color), [0, 1.28, 0.38], [1.0, 1.2, 1.6]);
      
      // Orejas puntiagudas
      mergeMesh(mesh, createCone(0.045, 0.16, 12, color), [-0.13, 1.50, 0.32], [1, 1, 1], [0.25, 0, -0.25]);
      mergeMesh(mesh, createCone(0.045, 0.16, 12, color), [0.13, 1.50, 0.32], [1, 1, 1], [0.25, 0, 0.25]);
      
      // Hocico
      mergeMesh(mesh, createSphere(0.14, 16, color), [0, 1.18, 0.54], [0.7, 0.65, 1.1]);
      
      // Melena (pequeños detalles)
      mergeMesh(mesh, createSphere(0.08, 12, color), [-0.08, 1.38, 0.26], [0.6, 1.2, 0.6]);
      mergeMesh(mesh, createSphere(0.08, 12, color), [0.08, 1.38, 0.26], [0.6, 1.2, 0.6]);
      break;

    case PieceType.BISHOP:
      // Base elegante
      mergeMesh(mesh, createCylinder(0.38, 0.43, 0.08, segments, color), [0, 0.04, 0]);
      mergeMesh(mesh, createTorus(0.39, 0.02, segments/2, 12, color), [0, 0.08, 0]);
      mergeMesh(mesh, createCylinder(0.34, 0.38, 0.08, segments, color), [0, 0.12, 0]);
      
      // Cuerpo inferior
      mergeMesh(mesh, createCylinder(0.30, 0.34, 0.35, segments, color), [0, 0.37, 0]);
      
      // Cuerpo esbelto y alto
      mergeMesh(mesh, createCylinder(0.16, 0.30, 0.80, segments, color), [0, 0.94, 0]);
      
      // Anillo decorativo
      mergeMesh(mesh, createTorus(0.18, 0.030, segments/2, 12, color), [0, 1.34, 0]);
      
      // Base de la mitra
      mergeMesh(mesh, createCylinder(0.16, 0.16, 0.10, segments, color), [0, 1.42, 0]);
      
      // Mitra (cabeza ovalada distintiva)
      mergeMesh(mesh, createSphere(0.21, segments, color), [0, 1.62, 0], [0.92, 1.75, 0.92]);
      
      // Ranura característica (pequeña esfera)
      mergeMesh(mesh, createSphere(0.09, 16, color), [0, 1.90, 0]);
      
      // Bola superior
      mergeMesh(mesh, createSphere(0.055, 12, color), [0, 2.0, 0]);
      break;

    case PieceType.QUEEN:
      // Base majestuosa
      mergeMesh(mesh, createCylinder(0.38, 0.43, 0.08, segments, color), [0, 0.04, 0]);
      mergeMesh(mesh, createTorus(0.39, 0.02, segments/2, 12, color), [0, 0.08, 0]);
      mergeMesh(mesh, createCylinder(0.34, 0.38, 0.08, segments, color), [0, 0.12, 0]);
      
      // Cuerpo bajo
      mergeMesh(mesh, createCylinder(0.30, 0.34, 0.35, segments, color), [0, 0.37, 0]);
      
      // Cuerpo elegante y curvo
      mergeMesh(mesh, createCylinder(0.16, 0.30, 1.05, segments, color), [0, 1.07, 0]);
      
      // Anillo superior grueso
      mergeMesh(mesh, createTorus(0.20, 0.038, segments/2, 12, color), [0, 1.62, 0]);
      
      // Copa de la corona
      mergeMesh(mesh, createCylinder(0.28, 0.16, 0.20, segments, color), [0, 1.78, 0]);
      
      // Base de corona plana
      mergeMesh(mesh, createCylinder(0.26, 0.10, 0.10, 8, color), [0, 1.93, 0]);
      
      // Corona con bolas decorativas (9 puntas)
      const queenPoints = 9;
      for (let i = 0; i < queenPoints; i++) {
        const angle = (i / queenPoints) * Math.PI * 2;
        const radius = 0.22;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Pequeña torre para cada punta
        mergeMesh(mesh, createCylinder(0.030, 0.035, 0.08, 12, color), [x, 2.02, z]);
        // Bola en la punta
        mergeMesh(mesh, createSphere(0.070, 12, color), [x, 2.10, z]);
      }
      
      // Bola central superior
      mergeMesh(mesh, createSphere(0.085, 16, color), [0, 2.15, 0]);
      break;

    case PieceType.KING:
      // Base imponente
      mergeMesh(mesh, createCylinder(0.38, 0.43, 0.08, segments, color), [0, 0.04, 0]);
      mergeMesh(mesh, createTorus(0.39, 0.02, segments/2, 12, color), [0, 0.08, 0]);
      mergeMesh(mesh, createCylinder(0.34, 0.38, 0.08, segments, color), [0, 0.12, 0]);
      
      // Cuerpo bajo robusto
      mergeMesh(mesh, createCylinder(0.30, 0.34, 0.35, segments, color), [0, 0.37, 0]);
      
      // Cuerpo alto y majestuoso
      mergeMesh(mesh, createCylinder(0.18, 0.32, 1.15, segments, color), [0, 1.12, 0]);
      
      // Anillo grueso distintivo
      mergeMesh(mesh, createTorus(0.23, 0.045, segments/2, 12, color), [0, 1.72, 0]);
      
      // Copa de corona
      mergeMesh(mesh, createCylinder(0.28, 0.16, 0.24, segments, color), [0, 1.92, 0]);
      
      // Pedestal de la cruz
      mergeMesh(mesh, createCylinder(0.10, 0.10, 0.18, segments, color), [0, 2.13, 0]);
      
      // Cruz distintiva del Rey (más prominente)
      // Vertical
      mergeMesh(mesh, createCube(0.075, color), [0, 2.35, 0], [1, 3.5, 1]);
      // Horizontal
      mergeMesh(mesh, createCube(0.075, color), [0, 2.42, 0], [3.2, 1, 1]);
      
      // Bola en el tope de la cruz
      mergeMesh(mesh, createSphere(0.050, 12, color), [0, 2.58, 0]);
      break;
  }

  return mesh;
}






// Crear geometría de un cubo
function createCube(size, color) {
  const s = size / 2;
  const vertices = [
    // Frente
    -s,
    -s,
    s,
    s,
    -s,
    s,
    s,
    s,
    s,
    -s,
    -s,
    s,
    s,
    s,
    s,
    -s,
    s,
    s,
    // Atrás
    -s,
    -s,
    -s,
    -s,
    s,
    -s,
    s,
    s,
    -s,
    -s,
    -s,
    -s,
    s,
    s,
    -s,
    s,
    -s,
    -s,
    // Arriba
    -s,
    s,
    -s,
    -s,
    s,
    s,
    s,
    s,
    s,
    -s,
    s,
    -s,
    s,
    s,
    s,
    s,
    s,
    -s,
    // Abajo
    -s,
    -s,
    -s,
    s,
    -s,
    -s,
    s,
    -s,
    s,
    -s,
    -s,
    -s,
    s,
    -s,
    s,
    -s,
    -s,
    s,
    // Derecha
    s,
    -s,
    -s,
    s,
    s,
    -s,
    s,
    s,
    s,
    s,
    -s,
    -s,
    s,
    s,
    s,
    s,
    -s,
    s,
    // Izquierda
    -s,
    -s,
    -s,
    -s,
    -s,
    s,
    -s,
    s,
    s,
    -s,
    -s,
    -s,
    -s,
    s,
    s,
    -s,
    s,
    -s,
  ];

  const normals = [
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ];

  const colors = [];
  for (let i = 0; i < 36; i++) {
    colors.push(...color);
  }

  return { vertices, normals, colors, count: 36 };
}

// Crear geometría de un cilindro (o cono truncado)
function createCylinder(radiusTop, radiusBottom, height, segments, color) {
  const vertices = [];
  const normals = [];
  const colors = [];

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
      colors.push(...color, ...color, ...color);
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
      colors.push(...color, ...color, ...color);
    }
  }

  // Lados del cilindro/cono
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

    // Primer triángulo
    vertices.push(x1_b, -height / 2, z1_b, x2_b, -height / 2, z2_b, x2_t, height / 2, z2_t);
    // Segundo triángulo
    vertices.push(x1_b, -height / 2, z1_b, x2_t, height / 2, z2_t, x1_t, height / 2, z1_t);

    // Calcular normales inclinadas
    // Aproximación simple: normal horizontal + componente Y por inclinación
    const slope = (radiusBottom - radiusTop) / height;
    const ny = slope;
    const len = Math.sqrt(1 + ny * ny);

    // Normal para el ángulo 1
    const nx1 = Math.cos(angle1);
    const nz1 = Math.sin(angle1);
    const n1 = [nx1 / len, ny / len, nz1 / len];

    // Normal para el ángulo 2
    const nx2 = Math.cos(angle2);
    const nz2 = Math.sin(angle2);
    const n2 = [nx2 / len, ny / len, nz2 / len];

    normals.push(...n1, ...n2, ...n2);
    normals.push(...n1, ...n2, ...n1);

    for (let j = 0; j < 6; j++) {
      colors.push(...color);
    }
  }

  return { vertices, normals, colors, count: vertices.length / 3 };
}

function createCone(radius, height, segments, color) {
  // Wrapper para mantener compatibilidad
  return createCylinder(0, radius, height, segments, color);
}


// Crear geometría de una esfera (mejorada)
function createSphere(radius, segments, color) {
  const vertices = [];
  const normals = [];
  const colors = [];

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
      colors.push(...color);
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

  // Convertir índices a vértices expandidos
  const expandedVertices = [];
  const expandedNormals = [];
  const expandedColors = [];

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
    expandedColors.push(
      colors[index * 3],
      colors[index * 3 + 1],
      colors[index * 3 + 2]
    );
  }

  return {
    vertices: expandedVertices,
    normals: expandedNormals,
    colors: expandedColors,
    count: expandedVertices.length / 3,
  };
}

// Crear geometría de un toro (para la corona)
function createTorus(
  majorRadius,
  minorRadius,
  majorSegments,
  minorSegments,
  color
) {
  const vertices = [];
  const normals = [];
  const colors = [];

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
      colors.push(...color);
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

  // Expandir índices
  const expandedVertices = [];
  const expandedNormals = [];
  const expandedColors = [];

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
    expandedColors.push(
      colors[index * 3],
      colors[index * 3 + 1],
      colors[index * 3 + 2]
    );
  }

  return {
    vertices: expandedVertices,
    normals: expandedNormals,
    colors: expandedColors,
    count: expandedVertices.length / 3,
  };
}

// Helper para unir geometrías
function mergeMesh(target, source, translation = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
  // Matrices de transformación simples
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

    // Traslación
    target.vertices.push(x + translation[0], y + translation[1], z + translation[2]);

    // Transformar normales (solo rotación, sin escala/traslación)
    let nx = source.normals[i];
    let ny = source.normals[i + 1];
    let nz = source.normals[i + 2];

    // Rotación X
    ry = ny * cx - nz * sx;
    rz = ny * sx + nz * cx;
    ny = ry; nz = rz;

    // Rotación Y
    rx = nx * cy + nz * sy;
    rz = -nx * sy + nz * cy;
    nx = rx; nz = rz;

    // Rotación Z
    rx = nx * cz - ny * sz;
    ry = nx * sz + ny * cz;
    nx = rx; ny = ry;

    // Normalizar normal resultante
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0) {
      nx /= len; ny /= len; nz /= len;
    }

    target.normals.push(nx, ny, nz);
    target.colors.push(source.colors[i], source.colors[i + 1], source.colors[i + 2]);
  }
  target.count += source.count;
}

// Crear geometría para diferentes tipos de piezas (ESTILO STAUNTON)
function createPieceGeometry(pieceType, color) {
  const segments = 24; // Mayor calidad
  const mesh = { vertices: [], normals: [], colors: [], count: 0 };

  // Base común para la mayoría de piezas
  const addBase = () => {
    mergeMesh(mesh, createCylinder(0.35, 0.4, 0.1, segments, color), [0, 0.05, 0]); // Base ancha
    mergeMesh(mesh, createCylinder(0.3, 0.35, 0.1, segments, color), [0, 0.15, 0]); // Escalón
    mergeMesh(mesh, createCylinder(0.25, 0.3, 0.4, segments, color), [0, 0.4, 0]); // Cuerpo bajo
  };

  switch (pieceType) {
    case PieceType.PAWN:
      // Peón: Base + Cuerpo cónico + Collar + Cabeza
      mergeMesh(mesh, createCylinder(0.3, 0.35, 0.15, segments, color), [0, 0.075, 0]); // Base
      mergeMesh(mesh, createCylinder(0.15, 0.3, 0.5, segments, color), [0, 0.4, 0]); // Cuerpo cónico
      mergeMesh(mesh, createTorus(0.16, 0.04, 8, 16, color), [0, 0.65, 0]); // Collar
      mergeMesh(mesh, createSphere(0.18, segments, color), [0, 0.8, 0]); // Cabeza
      break;

    case PieceType.ROOK:
      // Torre: Base + Cuerpo + Anillo + Torreta + Almenas
      addBase();
      mergeMesh(mesh, createCylinder(0.22, 0.28, 0.6, segments, color), [0, 0.6, 0]); // Cuerpo
      mergeMesh(mesh, createTorus(0.23, 0.03, 8, 16, color), [0, 0.9, 0]); // Anillo cuello
      mergeMesh(mesh, createCylinder(0.3, 0.22, 0.25, segments, color), [0, 1.05, 0]); // Torreta (copa)

      // Almenas (4 cubos)
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI * 2) / 4;
        const x = Math.cos(angle) * 0.22;
        const z = Math.sin(angle) * 0.22;
        mergeMesh(mesh, createCube(0.12, color), [x, 1.25, z]);
      }
      break;

    case PieceType.KNIGHT:
      // Caballo: Base + Cuerpo inclinado + Cabeza modelada
      addBase();

      // Cuello y cabeza simplificados pero distintivos
      // Usamos cilindros y esferas distorsionados
      mergeMesh(mesh, createCylinder(0.15, 0.28, 0.7, segments, color), [0, 0.7, 0.1], [1, 1, 1], [-0.2, 0, 0]); // Cuello inclinado

      // Cabeza (Cubo suavizado/Esfera alargada)
      mergeMesh(mesh, createSphere(0.22, segments, color), [0, 1.1, 0.2], [1, 1.5, 2.5], [0.3, 0, 0]); // Cabeza alargada

      // Orejas
      mergeMesh(mesh, createCone(0.06, 0.2, 8, color), [-0.1, 1.4, 0], [1, 1, 1], [0.2, 0, -0.2]);
      mergeMesh(mesh, createCone(0.06, 0.2, 8, color), [0.1, 1.4, 0], [1, 1, 1], [0.2, 0, 0.2]);
      break;

    case PieceType.BISHOP:
      // Alfil: Base + Cuerpo largo + Collar + Cabeza ovalada + Corte
      addBase();
      mergeMesh(mesh, createCylinder(0.12, 0.28, 0.8, segments, color), [0, 0.8, 0]); // Cuerpo
      mergeMesh(mesh, createTorus(0.15, 0.03, 8, 16, color), [0, 1.2, 0]); // Collar

      // Cabeza ovalada (Mitra)
      mergeMesh(mesh, createSphere(0.18, segments, color), [0, 1.35, 0], [1, 1.8, 1]);

      // Pequeña bola arriba
      mergeMesh(mesh, createSphere(0.05, 8, color), [0, 1.65, 0]);
      break;

    case PieceType.QUEEN:
      // Reina: Base + Cuerpo curvo + Collar múltiple + Corona con puntas
      addBase();
      mergeMesh(mesh, createCylinder(0.12, 0.3, 1.0, segments, color), [0, 0.9, 0]); // Cuerpo
      mergeMesh(mesh, createTorus(0.18, 0.04, 8, 16, color), [0, 1.45, 0]); // Collar 1
      mergeMesh(mesh, createCylinder(0.25, 0.12, 0.2, segments, color), [0, 1.55, 0]); // Copa base

      // Corona (Esfera truncada + puntas)
      mergeMesh(mesh, createSphere(0.15, segments, color), [0, 1.6, 0]);
      mergeMesh(mesh, createCylinder(0.22, 0.1, 0.15, 8, color), [0, 1.7, 0]); // Corona plana
      mergeMesh(mesh, createSphere(0.06, 8, color), [0, 1.8, 0]); // Bola tope
      break;

    case PieceType.KING:
      // Rey: Base + Cuerpo curvo + Collar + Copa + Cruz
      addBase();
      mergeMesh(mesh, createCylinder(0.14, 0.32, 1.1, segments, color), [0, 0.95, 0]); // Cuerpo alto
      mergeMesh(mesh, createTorus(0.2, 0.05, 8, 16, color), [0, 1.55, 0]); // Collar grueso

      // Copa/Corona del Rey
      mergeMesh(mesh, createCylinder(0.25, 0.12, 0.25, segments, color), [0, 1.7, 0]);

      // Cruz
      mergeMesh(mesh, createCube(0.08, color), [0, 1.95, 0], [1, 3, 1]); // Vertical
      mergeMesh(mesh, createCube(0.08, color), [0, 1.95, 0], [2.5, 1, 1]); // Horizontal
      break;
  }

  return mesh;
}






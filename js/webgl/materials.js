// ========================================
// MATERIALS.JS - Biblioteca de Materiales
// ========================================

const Materials = {
  // Materiales para piezas blancas (Mate/Cerámica)
  WhiteMarble: {
    mat_ambient: [0.9, 0.9, 0.9],
    mat_diffuse: [0.9, 0.9, 0.9],
    mat_specular: [0.2, 0.2, 0.2], // Bajo specular para efecto mate
    alpha: 10.0
  },

  WhitePorcelain: { /* ... */ },

  // Materiales para piezas negras (Metálico/Brillante)
  BlackObsidian: {
    mat_ambient: [0.1, 0.1, 0.1],
    mat_diffuse: [0.1, 0.1, 0.1],
    mat_specular: [0.9, 0.9, 0.9], // Alto specular para brillo metálico
    alpha: 50.0 // Brillo concentrado
  },

  BlackEbony: { /* ... */ },

  // Materiales para tablero (Madera)
  LightWood: {
    mat_ambient: [0.60, 0.45, 0.30], // Marrón claro
    mat_diffuse: [0.60, 0.45, 0.30],
    mat_specular: [0.1, 0.1, 0.1],
    alpha: 5.0
  },

  DarkWood: {
    mat_ambient: [0.25, 0.15, 0.10], // Marrón oscuro
    mat_diffuse: [0.25, 0.15, 0.10],
    mat_specular: [0.1, 0.1, 0.1],
    alpha: 5.0
  },

  // Materiales adicionales
  Gold: {
    mat_ambient: [0.24725, 0.1995, 0.0745],
    mat_diffuse: [0.75164, 0.60648, 0.22648],
    mat_specular: [0.628281, 0.555802, 0.366065],
    alpha: 51.2
  },

  Silver: {
    mat_ambient: [0.19225, 0.19225, 0.19225],
    mat_diffuse: [0.50754, 0.50754, 0.50754],
    mat_specular: [0.508273, 0.508273, 0.508273],
    alpha: 51.2
  },

  Emerald: {
    mat_ambient: [0.0215, 0.1745, 0.0215],
    mat_diffuse: [0.07568, 0.61424, 0.07568],
    mat_specular: [0.633, 0.727811, 0.633],
    alpha: 76.8
  },

  Ruby: {
    mat_ambient: [0.1745, 0.01175, 0.01175],
    mat_diffuse: [0.61424, 0.04136, 0.04136],
    mat_specular: [0.727811, 0.626959, 0.626959],
    alpha: 76.8
  },

  Chrome: {
    mat_ambient: [0.25, 0.25, 0.25],
    mat_diffuse: [0.4, 0.4, 0.4],
    mat_specular: [0.774597, 0.774597, 0.774597],
    alpha: 76.8
  }
};

console.log("✓ Biblioteca de materiales cargada");
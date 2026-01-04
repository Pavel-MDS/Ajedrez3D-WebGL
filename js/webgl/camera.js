function lookAt(eye, center, up) {
  const zx = eye[0] - center[0];
  const zy = eye[1] - center[1];
  const zz = eye[2] - center[2];
  let zLen = Math.hypot(zx, zy, zz);
  if (zLen === 0) zLen = 1;
  const z = [zx / zLen, zy / zLen, zz / zLen];

  const xx = up[1] * z[2] - up[2] * z[1];
  const xy = up[2] * z[0] - up[0] * z[2];
  const xz = up[0] * z[1] - up[1] * z[0];
  let xLen = Math.hypot(xx, xy, xz);
  if (xLen === 0) xLen = 1;
  const x = [xx / xLen, xy / xLen, xz / xLen];

  const y = [
    z[1] * x[2] - z[2] * x[1],
    z[2] * x[0] - z[0] * x[2],
    z[0] * x[1] - z[1] * x[0],
  ];

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
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
    -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
    -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
    1,
  ];
}

// Clase Camera
class Camera {
  constructor() {
    this.radius = 14;
    this.theta = Math.PI / 4; // ángulo horizontal
    this.phi = Math.PI / 3; // ángulo vertical (ajustado para mejor vista)

    this.minRadius = 8;
    this.maxRadius = 25;

    this.target = [0, 0, 0];
    this.position = [0, 0, 0];

    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.canvas = null;

    // Actualizar posición inicial
    this.update();
  }

  attach(canvas) {
    this.canvas = canvas;

    canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return; // Solo botón izquierdo
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.canvas) {
          this.canvas.style.cursor = "grab";
        }
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;

      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      // Rotar cámara
      this.theta -= dx * 0.005;
      this.phi -= dy * 0.005;

      // Límites verticales para evitar gimbal lock
      this.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.phi));

      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();

        // Zoom
        this.radius += e.deltaY * 0.01;
        this.radius = Math.max(
          this.minRadius,
          Math.min(this.maxRadius, this.radius)
        );
      },
      { passive: false }
    );

    // Cursor inicial
    canvas.style.cursor = "grab";

    console.log(
      "✓ Controles de cámara activados (arrastra para rotar, rueda para zoom)"
    );
  }

  update() {
    // Calcular posición de la cámara en coordenadas esféricas
    this.position[0] = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.position[1] = this.radius * Math.cos(this.phi);
    this.position[2] = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
  }

  getViewMatrix() {
    return lookAt(this.position, this.target, [0, 1, 0]);
  }

  // Método para resetear la cámara
  reset() {
    this.radius = 14;
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 3;
    this.update();
  }
}

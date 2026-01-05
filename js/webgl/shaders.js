// ========================================
// SHADERS.JS - Sistema de Iluminación Phong
// ========================================

// Vertex Shader: Phong Shading (Implementación del usuario)
const vertexShaderSource = `
    attribute vec3 VertexPosition;
    attribute vec3 VertexNormal;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 normalMatrix;

    varying vec3 colorOut;

    struct LightData {
        vec3 Position; // Posición en coordenadas del ojo
        vec3 La;       // Ambiente
        vec3 Ld;       // Difusa
        vec3 Ls;       // Especular
    };
    uniform LightData Light;

    struct MaterialData {
        vec3 Ka;    // Ambiente
        vec3 Kd;    // Difusa
        vec3 Ks;    // Especular
        float alpha; // Brillo
    };
    uniform MaterialData Material;

    vec3 phong(vec3 N, vec3 L, vec3 V) {
        vec3 ambient = Material.Ka * Light.La;
        vec3 diffuse = vec3(0.0);
        vec3 specular = vec3(0.0);

        float NdotL = dot(N, L);

        if (NdotL > 0.0) {
            vec3 R = reflect(-L, N);
            float RdotV_n = pow(max(0.0, dot(R, V)), Material.alpha);
            diffuse = NdotL * (Light.Ld * Material.Kd);
            specular = RdotV_n * (Light.Ls * Material.Ks);
        }

        return (ambient + diffuse + specular);
    }

    void main() {
        // Aseguramos que la normal y la matriz sean compatibles (vec3 vs mat4/mat3)
        // El usuario usa mat3 normalMatrix en su ejemplo, pero aquí pasamos mat4 normalMatrix.
        // Adaptamos para usar la submatriz 3x3.
        
        vec3 N = normalize(mat3(normalMatrix) * VertexNormal);
        
        vec4 ecPosition = modelViewMatrix * vec4(VertexPosition, 1.0);
        vec3 ec = vec3(ecPosition);
        
        vec3 L = normalize(Light.Position - ec);
        vec3 V = normalize(-ec);
        
        colorOut = phong(N, L, V);
        
        gl_Position = projectionMatrix * ecPosition;
    }
`;

// Fragment Shader
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 colorOut;

    void main() {
        gl_FragColor = vec4(colorOut, 1.0);
    }
`;

// ========================================
// Funciones de compilación de shaders
// ========================================

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("❌ Error compilando shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createShaderProgram(gl) {
  console.log("Compilando shaders Phong...");

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    console.error("❌ Error: No se pudieron compilar los shaders");
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("❌ Error enlazando programa:", gl.getProgramInfoLog(program));
    return null;
  }

  console.log("✓ Shaders Phong compilados exitosamente");
  return program;
}

console.log("✓ Sistema de shaders Phong cargado");
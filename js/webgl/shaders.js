// Vertex Shader Source
const vertexShaderSource = `
    attribute vec4 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;
    
    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vPosition;
    
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
        vNormal = (uNormalMatrix * vec4(aNormal, 0.0)).xyz;
        vColor = aColor;
        vPosition = (uModelViewMatrix * aPosition).xyz;
    }
`;

// Fragment Shader Source
const fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vPosition;
    
    uniform vec3 uLightPosition;
    uniform vec3 uViewPosition;
    uniform vec3 uHighlightColor; // Reemplaza a uIsSelected
    
    void main() {
        // Normalizar vectores
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightPosition - vPosition);
        vec3 viewDir = normalize(uViewPosition - vPosition);
        vec3 reflectDir = reflect(-lightDir, normal);
        
        // 1. Componente Ambiental
        vec3 ambient = vColor * 0.3;
        
        // 2. Componente Difusa
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = vColor * diff * 0.7;
        
        // 3. Componente Especular
        float specularStrength = 0.5;
        float shininess = 32.0;
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specular = vec3(1.0, 1.0, 1.0) * spec * specularStrength;
        
        vec3 finalColor = ambient + diffuse + specular;
        
        // Aplicar resaltado si existe color
        if (length(uHighlightColor) > 0.0) {
            finalColor += uHighlightColor * 0.5; // Mezclar con un 50% de intensidad
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Función para compilar shaders
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compilando shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Función para crear programa de shaders
function createShaderProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error enlazando programa:", gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

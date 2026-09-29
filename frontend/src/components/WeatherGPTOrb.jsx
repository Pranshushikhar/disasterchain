import React, { useRef, useEffect, useState } from 'react';

/**
 * WeatherGPTOrb — 3D Atmospheric Earth & Disaster-Intelligence Visual
 * 
 * Features:
 * - Ultra-lightweight WebGL sphere with atmospheric Fresnel limb glow (cyan/blue rim)
 * - Animated weather system / cyclone spiral disturbance
 * - Equatorial and orbital satellite track with telemetry ping
 * - Automatic pause on tab blur, window minimize, or prefers-reduced-motion
 * - High-fidelity vector SVG fallback if WebGL is unavailable
 */
export default function WeatherGPTOrb({
  size = 56,
  className = '',
  status = 'active', // 'active' | 'idle' | 'warning'
  showOrbit = true,
  onClick,
}) {
  const canvasRef = useRef(null);
  const [webGlFailed, setWebGlFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let gl;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    } catch (e) {
      gl = null;
    }

    if (!gl) {
      setWebGlFailed(true);
      return;
    }

    // High DPI scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Vertex Shader
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aTexCoord;

      uniform mat4 uMatrix;
      uniform mat3 uNormalMatrix;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vTexCoord;

      void main() {
        vNormal = normalize(uNormalMatrix * aNormal);
        vTexCoord = aTexCoord;
        vec4 pos = uMatrix * vec4(aPosition, 1.0);
        vPosition = pos.xyz;
        gl_Position = pos;
      }
    `;

    // Fragment Shader
    const fsSource = `
      precision mediump float;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vTexCoord;

      uniform float uTime;
      uniform vec3 uAccent;
      uniform vec3 uSecondary;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = vec3(0.0, 0.0, 1.0);

        // Dark planetary surface with longitude/latitude lines
        float latLines = step(0.92, sin(vTexCoord.y * 37.699));
        float lonLines = step(0.92, sin((vTexCoord.x + uTime * 0.04) * 62.831));
        float grid = max(latLines * 0.35, lonLines * 0.35);

        // Base dark graphite sphere with subtle terrain shading
        vec3 deepOcean = vec3(0.04, 0.07, 0.11);
        vec3 landShade = vec3(0.07, 0.12, 0.17);
        vec3 surfaceColor = mix(deepOcean, landShade, grid);

        // Luminous technical grid highlights in primary cyan
        surfaceColor += uAccent * grid * 0.45;

        // Animated weather disturbance / cyclone storm formation
        vec2 stormCenter = vec2(0.55, 0.58);
        vec2 stormOffset = vTexCoord - stormCenter;
        float distToStorm = length(stormOffset);
        float angle = atan(stormOffset.y, stormOffset.x);
        float spiral = sin(angle * 3.0 - distToStorm * 18.0 + uTime * 2.2);
        float stormMask = smoothstep(0.24, 0.02, distToStorm) * smoothstep(-0.2, 0.7, spiral);
        surfaceColor += vec3(0.95, 0.98, 1.0) * stormMask * 0.75;
        surfaceColor += uAccent * stormMask * 0.5;

        // Second subtle cloud band across middle latitudes
        float cloudBand = sin(vTexCoord.y * 14.0 + sin(vTexCoord.x * 8.0 + uTime * 0.15)) * 0.5 + 0.5;
        cloudBand = smoothstep(0.68, 0.88, cloudBand) * 0.28;
        surfaceColor += vec3(0.6, 0.85, 0.95) * cloudBand;

        // Atmospheric Fresnel Rim Glow (Cyan / Electric Blue limb)
        float NdotV = max(0.0, dot(normal, viewDir));
        float rim = pow(1.0 - NdotV, 2.6);
        vec3 atmosphere = mix(uAccent, uSecondary, 0.4) * rim * 1.5;

        // Directional illumination from upper-left
        vec3 lightDir = normalize(vec3(-0.6, 0.7, 0.9));
        float diff = max(0.12, dot(normal, lightDir) * 0.88 + 0.12);

        vec3 finalColor = surfaceColor * diff + atmosphere;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Helper: compile shader
    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) {
      setWebGlFailed(true);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebGlFailed(true);
      return;
    }
    gl.useProgram(program);

    // Build UV Sphere Geometry (Lat/Lon mesh: 24 lat bands, 28 long bands = low poly, highly performant)
    const latBands = 22;
    const lonBands = 26;
    const radius = 0.78;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = (lon * 2 * Math.PI) / lonBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        const u = 1 - lon / lonBands;
        const v = 1 - lat / latBands;

        normals.push(x, y, z);
        uvs.push(u, v);
        positions.push(radius * x, radius * y, radius * z);
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    // Buffers
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Attribute Locations
    const aPos = gl.getAttribLocation(program, 'aPosition');
    const aNorm = gl.getAttribLocation(program, 'aNormal');
    const aTex = gl.getAttribLocation(program, 'aTexCoord');

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNorm);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTex);

    // Uniform Locations
    const uMatrix = gl.getUniformLocation(program, 'uMatrix');
    const uNormalMatrix = gl.getUniformLocation(program, 'uNormalMatrix');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAccent = gl.getUniformLocation(program, 'uAccent');
    const uSecondary = gl.getUniformLocation(program, 'uSecondary');

    // Color tokens: Cyan #42D9C8 & Blue #4DA3FF
    gl.uniform3f(uAccent, 66 / 255, 217 / 255, 200 / 255);
    gl.uniform3f(uSecondary, 77 / 255, 163 / 255, 255 / 255);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    let animationFrameId;
    let startTime = performance.now();
    let isPaused = false;

    // Pause animation when tab is hidden to conserve system resources
    const handleVisibilityChange = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Simple 4x4 matrix helpers (orthographic projection + slight axial tilt)
    const render = (now) => {
      if (!isPaused) {
        const elapsed = prefersReducedMotion ? 0 : (now - startTime) * 0.001;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Rotation matrix (tilt 23.4 degrees, slow rotation around Y)
        const tilt = 0.38; // ~22 deg
        const rotY = elapsed * 0.45;
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosT = Math.cos(tilt);
        const sinT = Math.sin(tilt);

        // Combined Rotation Matrix
        const mat = [
          cosY, sinY * sinT, sinY * cosT, 0,
          0,    cosT,        -sinT,       0,
          -sinY, cosY * sinT, cosY * cosT, 0,
          0,    0,           0,           1,
        ];

        const normMat = [
          cosY, sinY * sinT, sinY * cosT,
          0,    cosT,        -sinT,
          -sinY, cosY * sinT, cosY * cosT,
        ];

        gl.uniformMatrix4fv(uMatrix, false, new Float32Array(mat));
        gl.uniformMatrix3fv(uNormalMatrix, false, new Float32Array(normMat));
        gl.uniform1f(uTime, elapsed);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (gl) {
        gl.deleteBuffer(posBuffer);
        gl.deleteBuffer(normBuffer);
        gl.deleteBuffer(uvBuffer);
        gl.deleteBuffer(indexBuffer);
        gl.deleteProgram(program);
      }
    };
  }, [size]);

  // Fallback to stylized SVG Earth + Weather Cyclone visual if WebGL fails
  if (webGlFailed) {
    return (
      <div
        className={`weathergpt-orb-container svg-fallback ${className}`}
        style={{ width: size, height: size, position: 'relative' }}
        onClick={onClick}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="fallbackGlow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#0B131C" />
              <stop offset="92%" stopColor="#112233" />
              <stop offset="100%" stopColor="#42D9C8" stopOpacity="0.8" />
            </radialGradient>
            <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#42D9C8" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#4DA3FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Planet Sphere */}
          <circle cx="50" cy="50" r="38" fill="url(#fallbackGlow)" stroke="#42D9C8" strokeWidth="1.2" />

          {/* Graticule Latitude/Longitude lines */}
          <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="#42D9C8" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 3" />
          <ellipse cx="50" cy="50" rx="14" ry="38" fill="none" stroke="#42D9C8" strokeWidth="0.75" strokeOpacity="0.3" />

          {/* Animated Weather Cyclone Eye */}
          <circle cx="58" cy="42" r="5" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.8" />
          <path
            d="M 58 37 C 64 36 67 43 63 47 C 59 50 52 46 54 40"
            fill="none"
            stroke="#42D9C8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Satellite Orbit */}
          {showOrbit && (
            <>
              <ellipse
                cx="50"
                cy="50"
                rx="46"
                ry="18"
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="1"
                transform="rotate(-26 50 50)"
              />
              <circle cx="86" cy="35" r="2.5" fill="#42D9C8">
                <animate
                  attributeName="opacity"
                  values="1;0.4;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`weathergpt-orb-container ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          display: 'block',
          borderRadius: '50%',
        }}
      />

      {/* Orbit ring overlay with pulsing satellite node */}
      {showOrbit && (
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            top: '-14%',
            left: '-14%',
            width: '128%',
            height: '128%',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <ellipse
            cx="50"
            cy="50"
            rx="52"
            ry="19"
            fill="none"
            stroke="rgba(66, 217, 200, 0.45)"
            strokeWidth="0.85"
            strokeDasharray="4 3"
            transform="rotate(-24 50 50)"
          />
          {/* Orbiting Satellite Node */}
          <g transform="rotate(-24 50 50)">
            <circle cx="98" cy="50" r="2.2" fill="#42D9C8">
              <animate
                attributeName="r"
                values="2.2;3.2;2.2"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="98" cy="50" r="5" fill="none" stroke="#42D9C8" strokeWidth="0.6" opacity="0.6">
              <animate
                attributeName="r"
                values="3;8;3"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.8;0;0.8"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      )}
    </div>
  );
}

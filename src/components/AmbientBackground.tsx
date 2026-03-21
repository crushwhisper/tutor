'use client'

import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;

uniform vec2  u_res;
uniform float u_time;

// Avalon palette
// #fcf6ef  cream base        0.988 0.965 0.937
// #f0e3d7  warm beige        0.941 0.890 0.843
// #dab697  warm tan          0.855 0.714 0.592
// #e8f4ff  whisper cyan      0.910 0.957 1.000
// #f8f1ea  pale blush        0.973 0.945 0.918

void main() {
  // Normalize coords, keep aspect ratio
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 st = vec2(uv.x * aspect, uv.y);

  float t = u_time * 0.042;

  // Five drifting control points
  vec2 p0 = vec2((0.18 + 0.14 * sin(t * 0.71))  * aspect,  0.28 + 0.11 * cos(t * 0.53));
  vec2 p1 = vec2((0.78 + 0.10 * cos(t * 0.63))  * aspect,  0.22 + 0.13 * sin(t * 0.81));
  vec2 p2 = vec2((0.52 + 0.09 * sin(t * 0.44 + 1.2)) * aspect, 0.72 + 0.11 * cos(t * 0.37));
  vec2 p3 = vec2((0.88 + 0.07 * cos(t * 0.89))  * aspect,  0.58 + 0.10 * sin(t * 0.55 + 2.1));
  vec2 p4 = vec2((0.28 + 0.11 * sin(t * 0.52 + 0.8)) * aspect, 0.82 + 0.08 * cos(t * 0.68));

  // Control point colors
  vec3 c0 = vec3(0.941, 0.890, 0.843); // warm beige
  vec3 c1 = vec3(0.910, 0.957, 1.000); // whisper cyan
  vec3 c2 = vec3(0.882, 0.761, 0.651); // warm tan (lighter than #dab697)
  vec3 c3 = vec3(0.980, 0.960, 0.945); // near-white cream
  vec3 c4 = vec3(0.973, 0.945, 0.918); // pale blush

  // Inverse-distance-weighted (Shepard) blend
  float eps = 0.008;
  float w0 = 1.0 / (dot(st - p0, st - p0) + eps);
  float w1 = 1.0 / (dot(st - p1, st - p1) + eps);
  float w2 = 1.0 / (dot(st - p2, st - p2) + eps);
  float w3 = 1.0 / (dot(st - p3, st - p3) + eps);
  float w4 = 1.0 / (dot(st - p4, st - p4) + eps);

  float wt = w0 + w1 + w2 + w3 + w4;
  vec3 color = (c0*w0 + c1*w1 + c2*w2 + c3*w3 + c4*w4) / wt;

  // Very subtle grain (keeps it from looking digital)
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time * 0.3) * 43758.5453);
  color += (grain - 0.5) * 0.012;

  gl_FragColor = vec4(color, 1.0);
}
`

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

function createProgram(gl: WebGLRenderingContext) {
  const prog = gl.createProgram()!
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  return prog
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    const prog = createProgram(gl)
    gl.useProgram(prog)

    // Fullscreen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const resLoc  = gl.getUniformLocation(prog, 'u_res')
    const timeLoc = gl.getUniformLocation(prog, 'u_time')

    let raf = 0
    let start = performance.now()

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas!.width  = w * dpr
      canvas!.height = h * dpr
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
    }

    function render() {
      const t = (performance.now() - start) / 1000
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height)
      gl!.uniform1f(timeLoc, t)
      gl!.drawArrays(gl!.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}

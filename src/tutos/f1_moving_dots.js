let gl = document.querySelector("canvas").getContext("webgl2");

const vs = `#version 300 es
uniform int numVerts;
uniform float time;

void main() {
  float u = float(gl_VertexID) / float(numVerts);  // goes from 0 to 1
  float x = u * 2.0 - 1.0;                         // -1 to 1
  float y = fract(time + u) * -2.0 + 1.0;          // 1.0 ->  -1.0

  gl_Position = vec4(x, y, 0, 1);
  gl_PointSize = 5.0;
}
`;

const fs = `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(0, 0, 1, 1);
}
`;

// setup GLSL program
const program = twgl.createProgramFromSources(gl, [vs, fs]);
const numVertsLoc = gl.getUniformLocation(program, 'numVerts');
const timeLoc = gl.getUniformLocation(program, 'time');

// Make a buffer with just a count in it.

const numVerts = 20;

// draw
function render(time) {
  time *= 0.001;  // convert to seconds

//   twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);

  // tell the shader the number of verts
  gl.uniform1i(numVertsLoc, numVerts);
  // tell the shader the time
  gl.uniform1f(timeLoc, time);

  const offset = 0;
  gl.drawArrays(gl.POINTS, offset, numVerts);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
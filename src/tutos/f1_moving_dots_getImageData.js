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


const innerCanvas = document.createElement("canvas", { antialias: false });
innerCanvas.width = 1000;
innerCanvas.height = 1000;
const innerCtx = innerCanvas.getContext("webgl2");
const innerCtx2D = innerCanvas.getContext("2d");
window.innerCanvas = innerCanvas;

// setup GLSL program
const program = twgl.createProgramFromSources(innerCtx, [vs, fs]);
const numVertsLoc = innerCtx.getUniformLocation(program, 'numVerts');
const timeLoc = innerCtx.getUniformLocation(program, 'time');

// Make a buffer with just a count in it.

const numVerts = 20;

// draw
function render(time) {
  time *= 0.001;  // convert to seconds

//   twgl.resizeCanvasToDisplaySize(gl.canvas);
  innerCtx.viewport(0, 0, innerCtx.canvas.width, innerCtx.canvas.height);

  innerCtx.useProgram(program);

  // tell the shader the number of verts
  innerCtx.uniform1i(numVertsLoc, numVerts);
  // tell the shader the time
  innerCtx.uniform1f(timeLoc, time);

  const offset = 0;
  innerCtx.drawArrays(innerCtx.POINTS, offset, numVerts);
  // let image = innerCtx2d.getImageData(0, 0, innerCtx.canvas.width, innerCtx.canvas.height);
  // let image = innerCtx.createImageData(innerCtx.canvas.width, innerCtx.canvas.height);
  let image = innerCtx2D.getImageData(0, 0, innerCtx2D.canvas.width, innerCtx.canvas.height);
  gl.putImageData(image, 0, 0);


  requestAnimationFrame(render);
}
requestAnimationFrame(render);
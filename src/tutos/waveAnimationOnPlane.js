const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

const m4 = twgl.m4;

const program = twgl.createProgramFromSources(gl, [

`
precision mediump float;

attribute vec2 a_position;
varying vec2 v_pos;

void main () {
    gl_Position = vec4(a_position, 0, 1);
    v_pos = a_position;
}
`,
`
precision mediump float;

uniform float u_phase;
varying vec2 v_pos;


float waveAlpha(float r) {
    return abs( cos((2.0*r - u_phase) * 3.14159 * 2.0) );
}

void main () {
    float r = length(v_pos);
    if (r > 1.0) { discard; }
    gl_FragColor = vec4(0.4, 0.5, 1.0, waveAlpha(r));
}
`
]);


gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    -1, 1,
    1, -1,
    1, 1
]), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


gl.useProgram(program);

const phaseLocation = gl.getUniformLocation(program, "u_phase");

gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


var phase = 0.0;

const render = function() {
    phase = new Date().getTime() % 10000 / 10000.0;
    gl.uniform1f(phaseLocation, phase);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}
render();
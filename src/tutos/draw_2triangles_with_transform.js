const gl = document.getElementById("canvas").getContext("webgl");

const vertexShader = `
precision mediump float;

attribute vec2 a_position;
uniform vec3 u_translation;

void main () {
    vec3 pos = vec3(a_position, 0) + u_translation;
    gl_Position = vec4( pos, 1);

    gl_PointSize = 1.0;
}
`;

const fragmentShader = `
precision mediump float;
uniform vec4 u_color;

void main () {
    gl_FragColor = u_color;
}
`;


const program = twgl.createProgramFromSources(gl, [vertexShader, fragmentShader]);

if (!program) {
    console.log("failed to compile shader");
}

gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, "a_position");
const colorLocation = gl.getUniformLocation(program, "u_color");
const translationLocation = gl.getUniformLocation(program, "u_translation");

console.log(positionLocation, colorLocation, translationLocation);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    0, 0.5,
    0.7, 0,
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.uniform4fv(colorLocation, [0, 0, 0, 1]);

gl.uniform3fv(translationLocation, [0, 0, 0]);

gl.drawArrays(gl.TRIANGLES, 0, 3);

gl.uniform3fv(translationLocation, [0.5, 0, 0]);
gl.uniform4fv(colorLocation, [1, 0, 0, 1]);
gl.drawArrays(gl.TRIANGLES, 0, 3);


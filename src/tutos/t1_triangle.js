var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");
if (!gl) {
    alert("no webgl for you");
}
let vertexShaderSource = `
attribute vec4 a_position;
varying vec4 v_position;
void main() {
    v_position = a_position;
    gl_Position = a_position;
}
`;
let fragmentShaderSource = `
precision mediump float;
varying vec4 v_position;
void main() {
    gl_FragColor = vec4( abs(v_position.x), abs(v_position.y),  abs(v_position.x) * abs(v_position.y)  , 1.0);
}
`;
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
let program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);
let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
let positions = [
0, 0,
0, 0.5,
0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.TRIANGLES, 0, 3);
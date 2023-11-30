const vertexShaderSource =  `
precision lowp float;
attribute vec3 vertexPos;
attribute vec4 colorPos;


varying vec4 vColorPos;
void main(void) {
     gl_Position= vec4(vertexPos, 1.0);
     vColorPos = colorPos;
}
`

const fragmentShaderCode = `
precision lowp float;
varying vec4 vColorPos;
void main() {
        gl_FragColor = vColorPos;
}
`
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

const program = twgl.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderCode]);

gl.linkProgram(program);
gl.useProgram(program);


const vertexPos = gl.getAttribLocation(program, 'vertexPos');
const colorPos = gl.getAttribLocation(program, 'colorPos');

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 0,
    1, 0, 0,
    1, 1, 0,
    0, 0, 0,
    -1, 0, 0,
    -1, -1, 0
]), gl.STATIC_DRAW);

gl.enableVertexAttribArray(vertexPos);
gl.vertexAttribPointer(vertexPos, 3, gl.FLOAT, false, 0, 0);


const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1,
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorPos);
gl.vertexAttribPointer(colorPos, 4, gl.FLOAT, false, 0, 0);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// gl.drawArrays(gl.TRIANGLES, 0, 6);
// gl.drawArrays(gl.TRIANGLES, 3, 3);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);

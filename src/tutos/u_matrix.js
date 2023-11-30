let vertexShader = `
precision mediump float;

attribute vec2 pos;
// umatrix
uniform mat3 u_matrix;

varying vec2 v_pos;

void main() {
    gl_Position = vec4((u_matrix * vec3(pos, 1)).xy, 0, 1);
    v_pos = pos;
}`;

let fragmentShader = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_pos;

void main() {
    gl_FragColor = texture2D(u_texture, v_pos);
}`;


let gl = document.querySelector("canvas").getContext("webgl");
let program = twgl.createProgramFromSources(gl, [vertexShader, fragmentShader]);

let positionAttributeLocation = gl.getAttribLocation(program, "pos");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 
    0, 0, 
    1, 0, 
    0, 1,
    0, 1, 
    1, 0, 
    1, 1]), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

let matrixLocation = gl.getUniformLocation(program, "u_matrix");
let matrix = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1];

function setMatrix(m) {
    gl.uniformMatrix3fv(matrixLocation, false, m);
}

gl.useProgram(program);

setMatrix(matrix);


function render(image) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

let image = new Image();
image.src = "wind/2016112000.png";

image.onload = function() {
    render(image);
}


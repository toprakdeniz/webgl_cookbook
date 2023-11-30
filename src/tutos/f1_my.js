let vertexShaderSource = `
attribute vec2 a_position;
varying vec2 coords;

void main() {
    gl_Position = vec4(a_position.xy, 0, 1);
    coords = a_position.xy;
}`;

let initialFragmentShaderSource = `
precision mediump float;

varying vec2 coords;

void main() {
    gl_FragColor = vec4(1, 1, 0, 1);
}`;

let moveLeftFragmentShaderSource = `
precision mediump float;

uniform sampler2D positions;
varying vec2 coords;

// function that get data on the left pixel
vec4 left() {
    return texture2D(positions, coords + vec2(-1, 0));
}

void main() {
    gl_FragColor = left();
}`;


let gl = document.querySelector("canvas").getContext("webgl");

let initial_program = twgl.createProgramFromSources(gl, [vertexShaderSource, initialFragmentShaderSource]);
let moveLeft_program = twgl.createProgramFromSources(gl, [vertexShaderSource, moveLeftFragmentShaderSource]);

// create buffer rectangle
let positionAttributeLocation = gl.getAttribLocation(initial_program, "a_position");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
let positions = [
    -1, -1,
    -1, 1,
    1, -1,
    1, 1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

let tf = createTextureAndFramebuffer(gl, 100, 100);
let tf2 = createTextureAndFramebuffer(gl, 100, 100);

gl.useProgram(initial_program);
gl.bindFramebuffer(gl.FRAMEBUFFER, tf.fb);
gl.viewport(0, 0, 1, 1);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


gl.useProgram(moveLeft_program);
// bind texture
let positionsLocation = gl.getUniformLocation(moveLeft_program, "positions");
gl.uniform1i(positionsLocation, 0);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, tf.tex);
// bind framebuffer
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, 1, 1);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


function createTextureAndFramebuffer(gl,  width, height){
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
       gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    // gl.clearColor(0, 0, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    return {tex: tex, fb: fb};
}


function setAttributes(buf, positionLoc) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  }
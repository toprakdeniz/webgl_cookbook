let vertexShaderSource = `
attribute vec3 a_position;

void main() {
    gl_Position = vec4(a_position.xy, 0, 1);    
    gl_PointSize = 10.0;
}`;

let fragmentShaderSource = `
precision mediump float;

void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
}`;

let canvas = document.getElementById("canvas");
let gl = canvas.getContext("webgl");

// create program
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
let program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// create buffer
let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
let positions = [
    0, 0, 0, 
    0, 0.5, 0,
    0.7, 0, 0, 
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.POINTS, 0, 3);
gl.activeTexture(gl.TEXTURE0);
gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, 1, 1, 0);
gl.bindBuffer(gl.FRAMEBUFFER, null);

// use the output of the probram about to be executed as input for the next program

// create program
let vertexShaderSource2 = `
attribute vec3 a_position;

varying vec2 coords;
void main() {
    gl_Position = vec4(a_position.xy, 0, 1);    
    coords = a_position.xy;
}`;

let fragmentShaderSource2 = `
precision mediump float;

varying vec2 coords;
uniform sampler2D u_texture;

void main() {
    vec4 color = texture2D(u_texture, coords);
    gl_FragColor = vec4( color.rgb / 2.0 + 0.5, 1);
}`;

let vertexShader2 = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vertexShader2, vertexShaderSource2);
gl.shaderSource(fragmentShader2, fragmentShaderSource2);
gl.compileShader(vertexShader2);
gl.compileShader(fragmentShader2);
let program2 = gl.createProgram();
gl.attachShader(program2, vertexShader2);
gl.attachShader(program2, fragmentShader2);
gl.linkProgram(program2);
gl.useProgram(program2);

// create texture
let texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
gl.frameBufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

// create buffer
let positionAttributeLocation2 = gl.getAttribLocation(program2, "a_position");
let positionBuffer2 = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
let positions2 = [
    0, 0, 
    0, 0.5,
    0.7, 0,
    0.7, 0.5,
    0.7, 0,
    0, 0.5, 
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions2), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation2);



gl.vertexAttribPointer(positionAttributeLocation2, 2, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.TRIANGLES, 0, 6);

let vertexSource = `
precision mediump float;

attribute float a_index;
uniform float u_particles_res;
uniform mat4 u_matrix;

varying vec2 v_pos;

float y_to_theta(float y) {
    return y * 3.1415926535;
}


float x_to_phi(float x) {
    return x * 3.1415926535 * 2.0;
}

vec3 sphere_coords(float x, float y) {
    float theta = y_to_theta(y);
    float phi = x_to_phi(x);
    return vec3(
        sin(theta) * cos(phi),
        cos(theta) * 0.99,
        sin(theta) * sin(phi)
    );
}

void main () {
    vec2 pos = vec2(
        fract(a_index / u_particles_res),
       (floor(a_index / u_particles_res) / u_particles_res)
    );
    
    vec3 coords = sphere_coords(pos.x, pos.y);
    vec4 out_pos = u_matrix * vec4(coords, 1);
    vec3 out_pos3 = vec3(out_pos.xy, (1.5 + out_pos.z) / 20.0) * 0.7 ;//+ vec3(0.0, 0.0, 0.19);

    gl_Position = vec4(out_pos3, 1.0);
    // gl_Position = out_pos;
    gl_PointSize = 3.;
    v_pos = pos;
}
`;

let fragmentSource = `
precision mediump float;

uniform sampler2D image;

varying vec2 v_pos;

void main () {
    gl_FragColor = texture2D(image, v_pos);
}
`;

let m4 = twgl.m4;
window.twgl = twgl;

let res = 1000;
let particles = new Float32Array(res * res);
for (let i = 0; i < particles.length; i++) particles[i] = i;

let gl = document.querySelector("canvas").getContext("webgl");

var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
var zNear = 0.01;
var zFar = 4.0;
var fieldOfViewRadians = 80 * Math.PI / 180;
var viewProjectionMatrix_base = m4.perspective( fieldOfViewRadians, aspect, zNear, zFar);
var viewProjectionMatrix = m4.perspective( fieldOfViewRadians, aspect, zNear, zFar);


var cameraAngleRadians = 0;
var cameraMatrix = m4.rotationY(cameraAngleRadians);

var viewMatrix = m4.inverse(cameraMatrix);


let program = twgl.createProgramFromSources(gl, [vertexSource, fragmentSource]);

let positionAttributeLocation = gl.getAttribLocation(program, "a_index");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 1, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

let u_particles_res = gl.getUniformLocation(program, "u_particles_res");
gl.uniform1f(u_particles_res, res);
let u_matrix = gl.getUniformLocation(program, "u_matrix");

gl.uniformMatrix4fv(u_matrix, false, viewProjectionMatrix);


gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// create a slider for the camera angle and place it above the canvas
var cameraAngleSlider = document.createElement("input");
cameraAngleSlider.type = "range";
cameraAngleSlider.min = "0";
cameraAngleSlider.max = "180";
cameraAngleSlider.value = "0";
cameraAngleSlider.style.position = "absolute";
cameraAngleSlider.style.top = "10px";
cameraAngleSlider.style.left = "10px";
document.body.appendChild(cameraAngleSlider);
// listen input chage and update camera angle
cameraAngleSlider.addEventListener("input", function() {
    cameraAngleRadians = this.value * Math.PI / 180;
    cameraMatrix = m4.rotationY(cameraAngleRadians);
    viewMatrix = m4.inverse(cameraMatrix);

    viewProjectionMatrix = m4.multiply(viewProjectionMatrix, viewMatrix);
    drawScene();
    viewProjectionMatrix = viewProjectionMatrix_base
});


function drawScene(){
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.uniformMatrix4fv(u_matrix, false, viewProjectionMatrix);
    gl.drawArrays(gl.POINTS, 0, particles.length);
}


function loadImage(image){
    let u_image = gl.getUniformLocation(program, "image");
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(u_image, 0);
    console.log("image loaded");
}

let image = new Image();
image.src = "wind/2016112000.png";
image.onload = function(){
    loadImage(image);
    drawScene();
}
// The target is earth lat long coordinates. So I can Make use of degree. 
// the radius of the earth is 6371 km.
// I need another matrix to convert world coordinates to clip coordinates. which is the projection matrix.
// the camera is stationay.. 
// The goal is to construct a matrix that represents translation, rotation and scaling.


const m4 = twgl.m4;
const createModelMatrix = function(lat, long, radiusOfEarth, ) {
    const { m4, v3 } = twgl;

    const latRad = (lat * Math.PI) / 180;
    const longRad = (long * Math.PI) / 180;

    const x = radiusOfEarth * Math.cos(latRad) * Math.cos(longRad);
    const y = radiusOfEarth * Math.sin(latRad);
    const z = radiusOfEarth * Math.cos(latRad) * Math.sin(longRad);

    const translationMatrix = m4.translation(v3.create(x, y, z));
    return translationMatrix;
}

const createModelMatrix2 = function( lat, long, radius, ) {
    let modelMatrix = m4.identity();
    m4.rotateX(modelMatrix, lat, modelMatrix);
    m4.rotateY(modelMatrix, long, modelMatrix);
    m4.translate(modelMatrix, [0, 0, -radius], modelMatrix);

    return modelMatrix;

}

const createProjectionMatrix = function(fov, aspect, near, far) {
    let projectionMatrix = m4.perspective(fov, aspect, near, far);
    return projectionMatrix;
}



const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


const program = twgl.createProgramFromSources(gl, [

`
precision mediump float;

attribute vec2 a_position;

uniform mat4 u_modelMatrix;
uniform mat4 u_projectionMatrix;

uniform vec3 u_translation;


varying vec2 v_pos;

void main () {
    gl_Position = u_projectionMatrix * 
        (( u_modelMatrix * vec4(a_position, 0, 1) ) // this is the retation and scaling.
        - vec4(u_translation, 0)); // this is the tranlation to the center of the earth.
    // gl_Position = vec4(a_position, 0, 1);
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
    -10, -10,
    -10, 10,
    10, -10,
    10, 10
]), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


gl.useProgram(program);

const phaseLocation = gl.getUniformLocation(program, "u_phase");

gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


var phase = 0.0;




var lat = 0.0;
var long = 0.0;

var container = document.createElement("div");
document.body.appendChild(container);
function createSlider(title, minimum, maximum, step, value, callback){
    
    let slider = document.createElement("input");
    slider.type = "range";
    slider.min = minimum;
    slider.max = maximum;
    slider.step = step;
    slider.value = value;
    slider.oninput = callback;

    let label = document.createElement("label");
    label.innerHTML = title;

    container.appendChild(label);
    container.appendChild(slider);

    return slider;
}

var radius = 10.0;

var scale = 1.0;

const refreshModalMatrix = function() {
    console.log("lat: " + lat + " long: " + long + " radius: " + radius + " scale: " + scale);
    const latRad = (lat * Math.PI) / 180;
    const longRad = -(long * Math.PI) / 180;
    let modelMatrix = createModelMatrix2(latRad, longRad, radius);
    modelMatrix = m4.scale(modelMatrix, [scale, scale, scale]);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    console.log(modelMatrix);
}

createSlider("scale", 0.1, 10.0, 0.1, scale, function(e) {
    scale = parseFloat(this.value);
    refreshModalMatrix();

});



createSlider("radius", 0, 10, 1, radius, function(e) {
    radius = parseFloat(this.value);
    refreshModalMatrix();

});

createSlider("lat", -180, 180, 0.1, 0.0, function(e) {
    lat = parseFloat(this.value);
    refreshModalMatrix();
});

createSlider("long", -180, 180, 0.1, 0.0, function(e) {
    long = parseFloat(this.value);
    refreshModalMatrix();

});


const modelMatrixLocation = gl.getUniformLocation(program, "u_modelMatrix");
const projectionMatrixLocation = gl.getUniformLocation(program, "u_projectionMatrix");
const translationLocation = gl.getUniformLocation(program, "u_translation");

gl.uniform3f(translationLocation, 0, 0, 100);

const projectionMatrix = createProjectionMatrix(0.5 * Math.PI, 1.0, 0.1, 120);
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

let modelMatrix = createModelMatrix(lat, long, 100, 10000);
gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

const render = function() {
    phase = new Date().getTime() % 10000 / 10000.0;
    gl.uniform1f(phaseLocation, phase);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}
render();
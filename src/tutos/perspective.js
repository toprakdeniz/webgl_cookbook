const m4 = twgl.m4;

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

const vertexShader = `
precision mediump float;

attribute vec3 a_position;
uniform mat4 u_modelMatrix;
uniform vec3 u_translation;
uniform float u_fudgeFactor;

varying vec3 v_pos;

void main () {

    vec4 pos = u_modelMatrix * vec4(a_position, 1) + vec4(u_translation, 0);
    float zToDivideBy = 1.0 + pos.z * u_fudgeFactor;

    gl_Position = vec4( vec3(pos.xy / zToDivideBy, pos.z), 1);
    v_pos = a_position;
}`;

const fragmentShader = `
precision mediump float;

varying vec3 v_pos;

void main () {
    vec3 abs_pos = abs(v_pos);
    gl_FragColor = vec4(abs_pos, 1);
}`;

const program = twgl.createProgramFromSources(gl, [vertexShader, fragmentShader]);

gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 0,
    0, 0.5, 0,
    0.7, 0, 0,
    0.7, 0.5, 0,
    0.0,0.5,0,
    0.7,0,0
]), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

const fudgeFactorLocation = gl.getUniformLocation(program, "u_fudgeFactor");
const translationLocation = gl.getUniformLocation(program, "u_translation");
const modelMatrixLocation = gl.getUniformLocation(program, "u_modelMatrix");

var fudgeFactor = 1.0;


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
    label.innerText = title;
    label.appendChild(slider);
    
    container.appendChild(label);

    return label;
}

var x = 0.0;
var y = 0.0;
var z = 0.0;

createSlider("x", -1, 1, 0.01, x, function(e){
    x = parseFloat(e.target.value);
    gl.uniform3f(translationLocation, x, y, z);
    render();
});

createSlider("y", -1, 1, 0.01, y, function(e){
    y = parseFloat(e.target.value);
    gl.uniform3f(translationLocation, x, y, z);
    render();
});

createSlider("z", -1, 1, 0.01, z, function(e){
    z = parseFloat(e.target.value);
    gl.uniform3f(translationLocation, x, y, z);
    render();
});


var xRotation = 0.0;
var yRotation = 0.0;
var zRotation = 0.0;

createSlider("x rotation", 0, 360, 1.2, 0, function(e){
    xRotation = parseFloat(e.target.value) * Math.PI / 180;
    update();
});

createSlider("y rotation", 0, 360, 1.2, 0, function(e){
    yRotation = parseFloat(e.target.value) * Math.PI / 180;
    update();
});

createSlider("z rotation", 0, 360, 1.2, 0, function(e){
    zRotation = parseFloat(e.target.value) * Math.PI / 180;
    update();
});





var slider = createSlider("fudge factor", 0, 2, 0.01, fudgeFactor, function(e){
    fudgeFactor = parseFloat(e.target.value);
    gl.uniform1f(fudgeFactorLocation, fudgeFactor);
    render();
});



gl.uniform1f(fudgeFactorLocation, fudgeFactor);
gl.uniform3f(translationLocation, x, y, z);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


function update(){
    let modelMatrix = m4.identity();
    m4.rotateX(modelMatrix, xRotation, modelMatrix);
    m4.rotateY(modelMatrix, yRotation, modelMatrix);
    m4.rotateZ(modelMatrix, zRotation, modelMatrix);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);


    modelMatrix = m4.identity();
    m4.rotateX(modelMatrix, xRotation, modelMatrix);
    m4.rotateY(modelMatrix, yRotation, modelMatrix);
    let zTwo = (zRotation + Math.PI / 2 ) % (2 * Math.PI);
    m4.rotateZ(modelMatrix, zTwo, modelMatrix);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function render(){
    let modelMatrix = m4.identity();
    m4.rotateX(modelMatrix, xRotation, modelMatrix);
    m4.rotateY(modelMatrix, yRotation, modelMatrix);
    m4.rotateZ(modelMatrix, zRotation, modelMatrix);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    let zTwo = (zRotation + Math.PI / 2 ) % (2 * Math.PI);
    m4.rotateZ(modelMatrix, zTwo, modelMatrix);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

update();
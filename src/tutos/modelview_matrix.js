const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

const vertexShader = `
precision mediump float;

attribute vec3 a_position;
uniform mat4 u_modelMatrix;

varying vec3 v_pos;

void main () {
    gl_Position = u_modelMatrix * vec4(a_position, 1);
    v_pos = a_position;
}
`;

const fragmentShader = `
precision mediump float;

varying vec3 v_pos;

void main () {
    vec3 abs_pos = abs(v_pos);
    gl_FragColor = vec4(abs_pos, 1);
}
`;

const program = twgl.createProgramFromSources(gl, [vertexShader, fragmentShader]);
const m4 = twgl.m4;
window.twgl = twgl;
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
    0.7, 0, 0,
    0, 0.5, 0
]), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

const modelMatrixLocation = gl.getUniformLocation(program, "u_modelMatrix");

let modelMatrix = m4.identity();
gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

var xRotation = 0.0;
var yRotation = 0.0;
var zRotation = 0.0;

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

var container = document.createElement("div");
document.body.appendChild(container);

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


function update(){
    let modelMatrix = m4.identity();
     m4.rotateX(modelMatrix, xRotation, modelMatrix);

     m4.rotateY(modelMatrix, yRotation, modelMatrix);

     m4.rotateZ(modelMatrix, zRotation, modelMatrix);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
update();
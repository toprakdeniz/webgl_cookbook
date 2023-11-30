const m4 = twgl.m4;

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

const program = twgl.createProgramFromSources(gl, [
    `
    precision mediump float;

    attribute vec3 a_position;
    uniform mat4 u_matrix;
    
    void main () {
        gl_Position = u_matrix * vec4(a_position, 1.0);
    }`,
    `
    precision mediump float;
    void main () {
        gl_FragColor = vec4(0.4, 0.5, 1.0, 1.0);
    }
    `
]);

gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}



const bezier = function(t, p0, p1, p2, p3){
    var cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;
  
    var cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;
  
    
    var cZ = 3 * (p1.z - p0.z),
        bZ = 3 * (p2.z - p1.z) - cZ,
        aZ = p3.z - p0.z - cZ - bZ;

    const t2 = Math.pow(t, 2);
    const t3 = Math.pow(t, 3);
    var x = (aX * t3) + (bX * t2) + (cX * t) + p0.x;
    var y = (aY * t3) + (bY * t2) + (cY * t) + p0.y;
    var z = (aZ * t3) + (bZ * t2) + (cZ * t) + p0.z;
    return  [x, y, z];
  };

const bezierCurve = function(p0, p1, p2, p3, accuracy) {

    const cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;

    const cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;


    const cZ = 3 * (p1.z - p0.z),
        bZ = 3 * (p2.z - p1.z) - cZ,
        aZ = p3.z - p0.z - cZ - bZ;

    const points = [];
    for (let t = 0; t < 1; t += accuracy) {
        let t2 = Math.pow(t, 2);
        let t3 = Math.pow(t, 3);
        let x = (aX * t3) + (bX * t2) + (cX * t) + p0.x;
        let y = (aY * t3) + (bY * t2) + (cY * t) + p0.y;
        let z = (aZ * t3) + (bZ * t2) + (cZ * t) + p0.z;
        points.push(x, y, z);
    }
    return points;
}





const points = bezierCurve(
    {x: -0.5, y: -0.5, z: 0},
    {x: -0.5, y: 0.5, z: 0},
    {x: 0.5, y: 0.5, z: 0},
    {x: 0.5, y: -0.5, z: 0},
    0.01
);


const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.drawArrays(gl.LINE_STRIP, 0, points.length / 3);


// create sliders for x, y, z rotations
var x = 0.0;
var y = 0.0;
var z = 0.0;

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


var xRotation = 0.0;
var yRotation = 0.0;
var zRotation = 0.0;

createSlider("x rotation", 0, 360, 1.2, 0, function(e){
    xRotation = parseFloat(e.target.value) * Math.PI / 180;
    render();
});

createSlider("y rotation", 0, 360, 1.2, 0, function(e){
    yRotation = parseFloat(e.target.value) * Math.PI / 180;
    render();
});

createSlider("z rotation", 0, 360, 1.2, 0, function(e){
    zRotation = parseFloat(e.target.value) * Math.PI / 180;
    render();
});


const modelMatrixLocation = gl.getUniformLocation(program, "u_matrix");

function render(){
    let modelMatrix = m4.identity();
    m4.rotateX(modelMatrix, xRotation, modelMatrix);
    m4.rotateY(modelMatrix, yRotation, modelMatrix);
    m4.rotateZ(modelMatrix, zRotation, modelMatrix);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 3);


}


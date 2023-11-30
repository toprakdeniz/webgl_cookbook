const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");



const program = twgl.createProgramFromSources(gl, [
`
precision mediump float;

attribute vec2 a_position;
uniform vec3 translation;

void main () {
    vec3 pos = vec3(a_position, 0.0);
    gl_Position = vec4( pos + translation, 1.0);
}`, 
`
precision mediump float;
void main () {
    gl_FragColor = vec4(0.4, 0.5, 1.0, 1.0);
}
`]);

gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    0, 0.5,
    0.7, 0
]), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

const translationLocation = gl.getUniformLocation(program, "translation");
gl.uniform3f(translationLocation, 0, 0, 0);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.drawArrays(gl.TRIANGLES, 0, 3);


// create sliders for x, y, z positions
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


let xSlider = createSlider("x", -1, 1, 0.01, x, function(e){
    x = parseFloat(e.target.value);
    render();
});

let ySlider = createSlider("y", -1, 1, 0.01, y, function(e){
    y = parseFloat(e.target.value);
    render();
});

let zSlider = createSlider("z", -1, 1, 0.01, x, function(e){
    z = parseFloat(e.target.value);
    render();
});



function render(){
    gl.uniform3f(translationLocation, x, y, z);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
let vectexShaderSource = `
precision mediump float;

attribute vec2 pos;

void main() {
    gl_Position = vec4(pos, 0, 1);
}
`;

// use mix for color selection
let fragmentShaderSource = `

precision mediump float;

uniform float u_mix;



const vec3 orange = vec3(1.0, 0.5, 0.0);

const vec3 indigo = vec3(0.0, 0.0, 0.5);

void main() {
    vec3 color = mix(orange, indigo, abs(u_mix));
    gl_FragColor = vec4(color, 1.0);
}
`;


let gl = document.querySelector("canvas").getContext("webgl");

let program = twgl.createProgramFromSources(gl, [vectexShaderSource, fragmentShaderSource]);

let positionAttributeLocation = gl.getAttribLocation(program, "pos");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 
    0, 0, 
    1, 0, 
    0, 1,
    0, 1, 
    1, 0, 
    1, 1]), gl.STATIC_DRAW);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


let mixUniformLocation = gl.getUniformLocation(program, "u_mix");

function set_mix(mix) {
    gl.uniform1f(mixUniformLocation, mix);
}

gl.useProgram(program);


function render() {
    set_mix(Math.random());
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

render();
// call rander periodically
setInterval(render, 1000);

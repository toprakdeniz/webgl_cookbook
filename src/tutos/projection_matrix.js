const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

const vertexShader = `
precision mediump float;

attribute vec3 a_position;
uniform mat3 u_transformMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 v_pos;

void main () {
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position + u_transformMatrix, 1);
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

const transformMatrixLocation = gl.getUniformLocation(program, "u_transformMatrix");


var x = 0.0;
var y = 0.0;
var z = 0.0;

function updateTransformMatrix() {
    let transformMatrix = m4.identity();

    gl.uniformMatrix3f(transformMatrixLocation, false, transformMatrix);
}
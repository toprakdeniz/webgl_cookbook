const vertexShader = `
precision mediump float;

attribute vec2 a_pos;
varying vec2 v_pos;
void main () {
    gl_Position = vec4(a_pos, 0, 1);
    v_pos = a_pos;
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 v_pos;
uniform sampler2D u_image;

void main () {
    gl_FragColor = texture2D(u_image, v_pos / 2.0 + 0.5);
}
`;

const rectangle = new Float32Array([
    -1, -1,
    -1, 1,
    1, -1,
    1, -1,
    -1, 1,
    1, 1,
]);

const canvas = document.createElement("canvas");
// const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");


const program = twgl.createProgram(gl, [vertexShader, fragmentShader]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, rectangle, gl.STATIC_DRAW);

gl.useProgram(program);

const positionAttributeLocation = gl.getAttribLocation(program, "a_pos");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const image = new Image();
image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
image.crossOrigin = "";
image.onload = () => {

    canvas.width = image.width;
    canvas.height = image.height;
    gl.viewport(0, 0, gl.canvas.width , gl.canvas.height);
    const texture = twgl.createTexture(gl, {
        src: image,
        mag: gl.NEAREST,
        min: gl.NEAREST,
    });
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}




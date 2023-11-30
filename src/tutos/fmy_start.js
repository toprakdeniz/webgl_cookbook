// gives 2d coordinates 
let vertexTextureToPosition = `
precision mediump float;

attribute float a_index;

uniform sampler2D u_particles;
uniform float u_particles_res;

varying vec2 v_particle_pos;

void main() {
    vec4 color = texture2D(u_particles, vec2(
        fract(a_index / u_particles_res),
        floor(a_index / u_particles_res) / u_particles_res));

    // decode current particle position from the pixel's RGBA value
    v_particle_pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a);

    gl_PointSize = 10.0;
    gl_Position = vec4(2.0 * v_particle_pos.x - 1.0, 1.0 - 2.0 * v_particle_pos.y, 0, 1);
}

`
// we need to calculate 3d coordinates in another vertex shader
// or we need map 3d coortinates to 2d texture in fragment shader that updates positions


let drawFragmantShader = `

precision mediump float;
varying vec2 v_particle_pos;
void main() {
    gl_FragColor = vec4(1.0 , 0.0,0.0 ,1.0);
}
`

let width = 100;
let height = 100;

let gl = document.querySelector("canvas").getContext("webgl");
let program = twgl.createProgramFromSources(gl, [vertexTextureToPosition, drawFragmantShader]);
gl.linkProgram(program);

let positionAttributeLocation = gl.getAttribLocation(program, "a_index");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
let positions = generate_index_2d(width, height);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 1, gl.FLOAT, false, 0, 0);

let texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
// fill texture with random data
let data = generate_texture_data(width, height);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

gl.useProgram(program);

let u_particles_res = gl.getUniformLocation(program, "u_particles_res");
gl.uniform1f(u_particles_res, width);

let u_particles = gl.getUniformLocation(program, "u_particles");
gl.uniform1i(u_particles, 0);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);

gl.viewport(0, 0, 100, 100);

gl.drawArrays(gl.POINTS, 0, width * height);




function generate_texture_data(width, height){
    let data = new Uint8Array(width * height * 4);
    // fill data with random pixels
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 255;
    }
    return data;
}

function generate_index_2d(width, height){
    let index = new Float32Array(width * height * 4);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; i++) {
            index[i * width + j] = (i * width + j) * 1.0;
        }
    }
    return index;
}
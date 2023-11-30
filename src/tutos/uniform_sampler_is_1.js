let vertexShaderSource = `
precision mediump float;

attribute float a_index;
uniform sampler2D u_particles;
uniform float u_particles_res;

varying vec4 v_particle_pos;

void main() {
    vec4 color = texture2D(u_particles, vec2(
        fract(a_index / u_particles_res),
        floor(a_index / u_particles_res) / u_particles_res));
    
        v_particle_pos = color;

    gl_PointSize = 5.0;
    gl_Position = vec4(2.0 * v_particle_pos.x - 1.0, 1.0 - 2.0 * v_particle_pos.y, 0, 1);
}`;

let fragmentShaderSource = `

precision mediump float;

varying vec4 v_particle_pos;

void main() {
    gl_FragColor = v_particle_pos;
}`;

let x_dim = 100;
let y_dim = 100;
let number_of_particles = x_dim * y_dim;

let particlesState = new Uint8Array(number_of_particles * 4);
// randomize particles
for (let i = 0; i < number_of_particles; i++) {
    particlesState[i*4] = Math.floor(Math.random() * 256);
    particlesState[i*4+1] = Math.floor(Math.random() * 256);
    particlesState[i*4+2] = Math.floor(Math.random() * 256);
    particlesState[i*4+3] = 255;
}

console.log(particlesState.slice(particlesState.length - 100,particlesState.length - 1))

let gl = document.querySelector("canvas").getContext("webgl");

let particle_texture = createTexture(gl, gl.NEAREST, particlesState, x_dim, y_dim);
bindTexture(gl, particle_texture, 1);

let program = twgl.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

let positionAttributeLocation = gl.getAttribLocation(program, "a_index");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

let positions = [];
for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++){
        positions.push(i);
        positions.push(j);}
};

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);

gl.vertexAttribPointer(positionAttributeLocation, 1, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

// set 
// uniform sampler2D u_particles;
let u_particles = gl.getUniformLocation(program, "u_particles");
gl.uniform1i(u_particles, 1);


//uniform float u_particles_res;
let u_particles_res = gl.getUniformLocation(program, "u_particles_res");
gl.uniform1f(u_particles_res, 100);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.drawArrays(gl.Points, 0, number_of_particles);


function createTexture(gl, filter, data, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    if (data instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

export function bindTexture(gl, texture, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}
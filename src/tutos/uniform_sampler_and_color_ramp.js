let vertexShaderSource = `

precision mediump float;

attribute float a_index;
uniform sampler2D u_particles;
uniform float u_particles_res;


varying vec2 v_particle_pos;

void main() {
    vec4 color = texture2D(u_particles, vec2(
        fract(a_index / u_particles_res),
        floor(a_index / u_particles_res) / u_particles_res));
    
    v_particle_pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a);

    gl_PointSize = 5.0;
    gl_Position = vec4(2.0 * v_particle_pos.x - 1.0 , 1.0 - 2.0 * v_particle_pos.y, 0, 1);
}`;

let fragmentShaderSource = `
precision mediump float;

uniform sampler2D u_color_ramp;
uniform sampler2D u_wind;
uniform float max_wind_speed;

varying vec2 v_particle_pos;

void main() {
    vec2 velocity = texture2D(u_wind, v_particle_pos).rg;

    float speed_t = length(velocity) / max_wind_speed;

    // color ramp is encoded in a 16x16 texture
    vec2 ramp_pos = vec2(
        fract(16.0 * speed_t),
        floor(16.0 * speed_t) / 16.0);

    // gl_FragColor = texture2D(u_color_ramp, ramp_pos);
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);

}`;


const defaultRampColors = {
    0.0: '#3288bd',
    0.1: '#66c2a5',
    0.2: '#abdda4',
    0.3: '#e6f598',
    0.4: '#fee08b',
    0.5: '#fdae61',
    0.6: '#f46d43',
    1.0: '#d53e4f'
};



// initilize parameters 
function render(image, windData){
    let x_dim = 100;
    let y_dim = 100;
    let number_of_particles = x_dim * y_dim;

    let gl = document.querySelector("canvas").getContext("webgl");

    // create program

    let program = twgl.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);


    // create indexes
    const a_index = new Float32Array(number_of_particles);
    for (let i = 0; i < number_of_particles; i++) a_index[i] = i;
    let a_index_buffer = gl.createBuffer();
    let a_index_buffer_pos = gl.getAttribLocation(program, "a_index");

    gl.bindBuffer(gl.ARRAY_BUFFER, a_index_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, a_index, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(a_index_buffer_pos);
    gl.vertexAttribPointer(a_index_buffer_pos, 1, gl.FLOAT, false, 0, 0);


    // uniform float u_particles_res
    let u_particles_res = gl.getUniformLocation(program, "u_particles_res");
    gl.uniform1f(u_particles_res, 100);

    // create random particles

    let u_particles_data = new Uint8Array(number_of_particles * 4);
    for ( let i=0 ; i < u_particles_data.length ; i++) {
        u_particles_data[i] = Math.floor(Math.random() * 256);
        // u_particles_data[i*4] = Math.floor(Math.random() * 256);
        // u_particles_data[i*4 + 1] = Math.floor(Math.random() * 256);
        // u_particles_data[i*4 + 2] = Math.floor(Math.random() * 256);
        // u_particles_data[i*4 + 3] = Math.floor(Math.random() * 256);
    }
    // -> use program
    gl. useProgram(program);
    // <- continue

    // create texture from random particles
    let u_particles_texture = createTexture(gl, gl.NEAREST, u_particles_data, x_dim, y_dim);
    let u_particles_texture_pos = gl.getUniformLocation(program, "u_particles");
    let u_particle_texture_unit = 0;
    bindTexture(gl, u_particles_texture, u_particle_texture_unit);
    gl.uniform1i(u_particles_texture_pos, u_particle_texture_unit);


    // create texture from wind data (image)
    let u_wind_texture = createTexture(gl, gl.NEAREST, image, image.width, image.height);
    let u_wind_texture_pos = gl.getUniformLocation(program, "u_wind");
    let u_wind_texture_unit = 1;
    bindTexture(gl, u_wind_texture, u_wind_texture_unit);
    gl.uniform1i(u_wind_texture_pos, u_wind_texture_unit);

    // calculate maximum wind speed from wind data

    let max_wind_speed = Math.hypot(windData.uMax, windData.vMax);
    let max_wind_speed_pos = gl.getUniformLocation(program, "max_wind_speed");
    gl.uniform1f(max_wind_speed_pos, max_wind_speed);

    // create color ramp texture

    let u_color_ramp_data = getColorRamp(defaultRampColors);
    let u_color_ramp_texture = createTexture(gl, gl.LINEAR, u_color_ramp_data, 16, 16);
    let u_color_ramp_texture_pos = gl.getUniformLocation(program, "u_color_ramp");
    let u_color_ramp_texture_unit = 2;
    bindTexture(gl, u_color_ramp_texture, u_color_ramp_texture_unit);

    // draw particles
    
    gl.viewport(0, 0, x_dim, y_dim);
    gl.drawArrays(gl.POINTS , 0, number_of_particles);

}

    // UTIL

function createTexture(gl, filter, data, width, height) {
    let texture = gl.createTexture();
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


function bindTexture(gl, texture, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}


function getColorRamp(colors) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 256;
    canvas.height = 1;

    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    for (const stop in colors) {
        gradient.addColorStop(+stop, colors[stop]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);

    return new Uint8Array(ctx.getImageData(0, 0, 256, 1).data);
}

function getJSON(url, callback) {

    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('get', url, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(xhr.response);
        } else {
            throw new Error(xhr.statusText);
        }
    };
    xhr.send();
}


let data_name = "2016112000";

getJSON( "./wind/" + data_name + ".json", function (windData) {
    console.log("windData", windData);
    let image = new Image();
    image.src = "./wind/" + data_name + ".png";
    image.onload = function () {
        render(image, windData);
    };    
});


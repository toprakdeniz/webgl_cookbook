const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

const program = twgl.createProgramFromSources(gl, [
    `
    precision mediump float;
    
    attribute vec2 a_position;
    attribute vec3 a_color;
    attribute float a_size;
    attribute float a_start_time;
    attribute float a_duration;

    uniform float u_delta_time;

    varying vec3 v_color;
    varying float v_alpha;


    void main () {
        if (u_delta_time < a_start_time){
            gl_Position = vec4(-2, -2, 0, 1);
            return;
        }

        float time = mod(u_delta_time - a_start_time, a_duration);
        v_alpha = 1.0 - time / a_duration;
        gl_Position = vec4(a_position, 0, 1);
        gl_PointSize = a_size;
        v_color = a_color;
    }
    `,

    `
    precision mediump float;

    uniform float u_delta_time;

    varying vec3 v_color;
    varying float v_alpha;

    float pi = 3.14159265359;

    void main () {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        if (r > 1.0) { discard; }

        if (v_alpha < 0.0) { discard; }

        float phase = u_delta_time * 0.01 - r * pi ;

        vec2 scxy = vec2(
            sin(phase) * cxy.x + cos(phase) * cxy.y, 
            sin(phase) * cxy.y - cos(phase) * cxy.x 
        );

        vec3 dark_color = vec3(0.0, 0.2, 0.0);
        vec3 color = mix(dark_color, v_color, v_alpha);

        if ( abs(scxy.x * scxy.y) < 0.03165 ) {
            gl_FragColor = vec4( color, v_alpha );
        } else {
            gl_FragColor = vec4( vec3(1.0, 1.0, 1.0) - color, v_alpha * ((r / 4.0) + 0.75 ));
        }
    }
    `
]);




gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, 'a_position');
const colorLocation = gl.getAttribLocation(program, 'a_color');
const sizeLocation = gl.getAttribLocation(program, 'a_size');
const startTimeLocation = gl.getAttribLocation(program, 'a_start_time');
const durationLocation = gl.getAttribLocation(program, 'a_duration');

const deltaTimeLocation = gl.getUniformLocation(program, 'u_delta_time');

const complexBuffer = gl.createBuffer();


const flies = [];

// fly 1: {x: 0, y: 0, color: [1, 0, 0], size: 10, startTime: 0, duration: 1}
// fly 2: {x: 0, y: 0, color: [1, 1, 0], size: 10, startTime: 1, duration: 2}

const totalTime = 7000;

for (let i = 0; i < 5000; i++) {
    const duration = (Math.random() + 0.5) * 2500;
    flies.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        color: [Math.random(), Math.random(), Math.random()],
        size: Math.random() * 40 + 10,
        startTime: Math.random() * (totalTime - duration),
        duration: duration
    });
}

gl.enable(gl.BLEND);

gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function fliesToBuffer() {
    const data = [];

    for (let i = 0; i < flies.length; i++) {
        const fly = flies[i];
        data.push(fly.x, fly.y);
        data.push(...fly.color);
        data.push(fly.size);
        data.push(fly.startTime);
        data.push(fly.duration);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, complexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}

fliesToBuffer();


gl.useProgram(program);


gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(colorLocation);
gl.enableVertexAttribArray(sizeLocation);
gl.enableVertexAttribArray(startTimeLocation);
gl.enableVertexAttribArray(durationLocation);

gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 4 * 8, 0);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 4 * 8, 4 * 2);
gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 4 * 8, 4 * 5);
gl.vertexAttribPointer(startTimeLocation, 1, gl.FLOAT, false, 4 * 8, 4 * 6);
gl.vertexAttribPointer(durationLocation, 1, gl.FLOAT, false, 4 * 8, 4 * 7);

let lastTime = new Date().getTime();

function render(time) {
    const now = new Date().getTime();
    const deltaTime = now - lastTime;
    if (deltaTime > 1000) {
        lastTime = now;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(deltaTimeLocation, time);

    gl.drawArrays(gl.POINTS, 0, flies.length);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);



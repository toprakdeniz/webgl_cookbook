let vertexShader = `

precision mediump float;

attribute float a_index;
uniform float resolution;
uniform float u_fudgeFactor;

varying vec2 v_pos;


float x_to_theta(float x) {
    return x * 2.0 * 3.1415926535;
}

float y_to_phi(float y) {
    return y * 3.1415926535;
}

vec3 sphere_coords(float x, float y) {
    float theta = x_to_theta(x);
    float phi = y_to_phi(y);
    return vec3(
        sin(theta) * cos(phi),
        sin(theta) * sin(phi),
        cos(theta) 
    );
}

void main () {
        vec2 pos = vec2(
            fract(a_index / resolution),
            floor(a_index / resolution) / resolution
        );


        vec3 coords = sphere_coords(pos.x, pos.y);
        float zToDivideBy = 1.0 + coords.z * u_fudgeFactor;
        
        gl_Position = vec4(coords.xy / zToDivideBy, coords.z, 1);
        gl_PointSize = 1.0;
        v_pos = pos;
    }
`;


let fragmentShader = `
precision mediump float;

uniform sampler2D image;

varying vec2 v_pos;

void main () {
    gl_FragColor = texture2D(image, v_pos);
}
`;
let fudgeFactor = 1.0;
let resolution = 2000.0;
let edgeCount = resolution * resolution;


let gl = document.querySelector("canvas").getContext("webgl");

let program = twgl.createProgramFromSources(gl, [vertexShader, fragmentShader]);

let positionAttributeLocation = gl.getAttribLocation(program, "a_index");

let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
let a_index_data = [];
for (let i = 0; i < edgeCount; i++){
    a_index_data.push(i);
}
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a_index_data), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 1, gl.FLOAT, false, 0, 0);

let resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
gl.useProgram(program);
gl.uniform1f(resolutionUniformLocation, resolution);

let fudgeFactorUniformLocation = gl.getUniformLocation(program, "u_fudgeFactor");
gl.uniform1f(fudgeFactorUniformLocation, fudgeFactor);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


// function load image and render it


function render(image){
    let imageTexture = twgl.createTexture(gl, {
        src: image,
        mag: gl.NEAREST,
        min: gl.NEAREST,
    });
    twgl.bindFramebufferInfo(gl, null);
    gl.useProgram(program);
    twgl.setBuffersAndAttributes(gl, program, positionBuffer);
    twgl.setUniforms(program, {
        image: imageTexture,
    });
    gl.drawArrays(gl.POINTS, 0, edgeCount);
}


let image = new Image();
image.src = "wind/2016112000.png";

image.onload = function(){
    render(image);
}


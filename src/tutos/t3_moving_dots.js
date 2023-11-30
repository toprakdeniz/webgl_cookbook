
// Title: Fading dots
// Generate random dots employing vec4 texture
//vec2 encode(float value) {
//     value = value * scale + OFFSET;
//     float x = mod(value, BASE);
//     float y = floor(value / BASE);
//     return vec2(x, y) / BASE;
// }
// float decode(vec2 channels) {
//     return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
// } 
// in a seperate texture hold color
// in each iteration decrease alpha
// once alpha hits 0, reset alpha and generate new dot

let vertexShaderSource = `
attribute vec2 index;

uniform sampler2D positions;
uniform sampler2D velocities;
uniform vec2 statesize;
uniform vec2 scale;

vec4 sample(vec2 index, sampler2D tex) {
    return texture2D(tex, index / statesize);
}

void main(void)
{
    coords = texture2D(positions, index / statesize).xy;
    
    gl_Position = vec4(aCorner, 0, 1);
}`;


let fragmentShaderSource = `
precision mediump float;

varying vec2 coords;

const FADING_RATE = 1.0;

void main(){

    
}
`;



function create_index_buffer(gl, width, height){
    let index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, index_buffer);
    let indices = new Float32Array(width * height * 2);
    for(let i = 0; i < width; i++){
        for( let j = 0; j < height; j++){
            var index = i * height * 2 + j * 2;
            indices[index] = i;
            indices[index + 1] = j;
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indices), gl.STATIC_DRAW);
    return index_buffer;
}


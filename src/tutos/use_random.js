let vertexShader = `
precision mediump float;

attribute float a_index;
uniform float u_random_seed;

void main () {

    vec2 pos = vec2(
        fract(a_index / 100.0),
        floor(a_index / 100.0) / 100.0
    );

    vec2 seed = ()

    vec2 random_pos = vec2(
        rand(seed + 1.3),
        rand(seed + 2.1)
    );

    gl_PointSize = 5.0;

    gl_Position = 
}
`;
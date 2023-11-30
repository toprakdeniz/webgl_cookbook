import * as util from "../util";

function render( image) {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        alert("no webgl for you");
    }
    // util.say_hello();
    let vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    varying vec2 v_texcoord;
    void main() {
        gl_Position = a_position;
        v_texcoord = a_texcoord;
    }
    `;

    let fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    
    float circle(in vec2 _st, in float _radius){
        vec2 dist = _st-vec2(0.5);
        return 1.-smoothstep(_radius-(_radius*0.01),
                             _radius+(_radius*0.01),
                             dot(dist,dist)*4.0);
    }
    
    void main() {
        
        float alpha = circle(v_texcoord, 0.99);
        gl_FragColor = vec4(texture2D(u_texture, v_texcoord).rgb, alpha);
    }
    `;


    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);



    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(texcoordAttributeLocation);

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let positions = [
        -1, -1,
        -1, 1,
        1, -1,
        1, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    let texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    let texcoords = [
        0, 0,
        0, 1,
        1, 0,
        1, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Create a texture.
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    util.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    // lookup the sampler locations.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let image = new Image();
image.crossOrigin = "";
image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
image.onload =  function() {
    render(image)
};


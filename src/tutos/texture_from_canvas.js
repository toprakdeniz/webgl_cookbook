const vertexShader = `
precision mediump float;

attribute vec2 a_pos;
varying vec2 v_pos;

void main () {
    gl_Position = vec4(a_pos, 0, 1);
    v_pos = a_pos;
}
`;

const fragmentHorizontalDifferenceShader = `
precision mediump float;

varying vec2 v_pos;
uniform sampler2D u_image;
uniform float u_resolution;

vec3 horizontal_difference( vec2 pos ) {
    vec4 left = texture2D(u_image, pos + vec2(-1.0, 0.0) / u_resolution );
    vec4 right = texture2D(u_image, pos + vec2(1.0, 0.0) / u_resolution );
    return vec3(right.r - left.r, right.g - left.g) / 2.0;
}

void main () {
    vec3 diff = horizontal_difference(v_pos);
    gl_FragColor = vec4(diff, 1.0);
}
`;


const fragmentDisplayShader = `

precision mediump float;

varying vec2 v_pos;
uniform sampler2D u_image;

void main () {
    gl_FragColor = texture2D(u_image, v_pos);
}
`;

const rectangle = new Float32Array([
    -1, -1,
    -1, 1,
    1, 1,
    1, 1,
    1, -1,
    -1, -1
]);



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



const draw = (image) => {

    const backendCanvas = document.createElement('canvas',{antialias: false});
    // const backendCanvas = document.querySelector('canvas');


    backendCanvas.width = image.width;
    backendCanvas.height = image.height;

    const backendGl = backendCanvas.getContext('webgl', {antialias: false});
    // const differenceProgram = createProgram(backendGl, vertexShader, fragmentHorizontalDifferenceShader);
    const differenceProgram = twgl.createProgramFromSources(backendGl, [vertexShader, fragmentDisplayShader]);
    backendGl.useProgram(differenceProgram);
    backendGl.viewport(0, 0, backendCanvas.width, backendCanvas.height);
    const backendTexture = createTexture(backendGl, backendGl.NEAREST, image, image.width, image.height);
    const backendTexturePos = backendGl.getUniformLocation(differenceProgram, "u_image");
    const backendTextureUnit = 0;
    backendGl.activeTexture(backendGl.TEXTURE0 + backendTextureUnit);
    backendGl.bindTexture(backendGl.TEXTURE_2D, backendTexture);
    backendGl.uniform1i(backendTexturePos, backendTextureUnit);


    
    // bind width to u_resolution

    // const resolutionUniformLocation = backendGl.getUniformLocation(differenceProgram, "u_resolution");
    // backendGl.uniform1f(resolutionUniformLocation, backendCanvas.width);


    const backendBuffer = backendGl.createBuffer();
    backendGl.bindBuffer(backendGl.ARRAY_BUFFER, backendBuffer);
    backendGl.bufferData(backendGl.ARRAY_BUFFER, rectangle, backendGl.STATIC_DRAW);
    backendGl.enableVertexAttribArray(differenceProgram.a_pos);
    backendGl.vertexAttribPointer(differenceProgram.a_pos, 2, backendGl.FLOAT, false, 0, 0);

    backendGl.drawArrays(backendGl.TRIANGLES, 0, 6);


    const displayCanvas = document.querySelector('canvas');
    const ctx = displayCanvas.getContext('2d');
    // const displayGl = displayCanvas.getContext('webgl', {antialias: false});
    // const displayProgram = twgl.createProgramFromSources(displayGl, [vertexShader, fragmentDisplayShader])
    // displayGl.useProgram(displayProgram);
    // const displayTexture = createTextureFromImageAndBind(displayGl, displayGl.LINEAR, backendCanvas, 0, "u_image", displayProgram);

    // backendGl.bindBuffer(backendGl.ARRAY_BUFFER, backendBuffer);
    // backendGl.enableVertexAttribArray(displayProgram.a_pos);
    // backendGl.vertexAttribPointer(displayProgram.a_pos, 2, backendGl.FLOAT, false, 0, 0);

    // backendGl.drawArrays(backendGl.TRIANGLES, 0, 6);
    // let backctx = backendCanvas.getContext('2d');/
    let imageData = backendGl.getImageData(0, 0, backendCanvas.width, backendCanvas.height);
    ctx.putImageData(imageData, 0, 0);
}


const img = new Image();
img.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
img.crossOrigin = "";
img.onload = () => {
    draw(img);
}


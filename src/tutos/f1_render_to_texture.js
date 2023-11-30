function main() {
    const gl = document.querySelector('canvas').getContext('webgl2');
    if (!gl) {
      return alert('need webgl2');
    }
  
    const vs1 = `#version 300 es
    void main () {
      gl_Position = vec4(0, 0, 0, 1);
      gl_PointSize = 64.0;
    }
    `;
    
    const fs1 = `#version 300 es
    precision highp float;
    out vec4 myOutColor;
    void main() {
      myOutColor = vec4(fract(gl_PointCoord * 4.), 0, 1);
    }
    `;
    
    const vs2 = `#version 300 es
    in vec4 position;
    void main () {
      gl_Position = position;
      gl_PointSize = 32.0;
    }
    `;
    
    const fs2 = `#version 300 es
    precision highp float;
    uniform sampler2D tex;
    out vec4 myOutColor;
    void main() {
      myOutColor = texture(tex, gl_PointCoord);
    }
    `;
  
    // make 2 programs
    const prg1 = twgl.createProgramFromSources(gl, [vs1, fs1]);
    const prg2 = twgl.createProgramFromSources(gl, [vs2, fs2]);
  
    // make a texture
    const tex = gl.createTexture();
    const texWidth = 64;
    const texHeight = 64;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, texWidth, texHeight, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
    // attach texture to framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                            gl.TEXTURE_2D, tex, 0);
  
    // render to texture
    gl.viewport(0, 0, texWidth, texHeight);
    gl.useProgram(prg1);
    gl.drawArrays(gl.POINTS, 0, 1);
    
    // render texture (output of prg1) to canvas using prg2
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(prg2);
    // note: the texture is already bound to texture unit 0
    // and uniforms default to 0 so the texture is already setup
    const posLoc = gl.getAttribLocation(prg2, 'position')
    const numDraws = 12
    for (let i = 0; i < numDraws; ++i) {
      const a = i / numDraws * Math.PI * 2;
      gl.vertexAttrib2f(posLoc, Math.sin(a) * .7, Math.cos(a) * .7);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }
  main();
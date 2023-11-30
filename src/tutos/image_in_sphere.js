// image on sphere 

let vertexShader = `
attribute vec3 aPosition;
uniform mat4 uMatrix;

varying vec3 xyz;


void main() {
  gl_Position = uMatrix * vec4(aPosition, 1);
  xyz = aPosition;
}
`;

let fragmentShader = `
precision mediump float;

varying vec3 xyz;

const vec3 orange = vec3(1.0, 0.5, 0.0);
const vec3 indigo = vec3(0.0, 0.0, 0.5);

void main() {
    vec3 color = mix(orange, indigo, (xyz.x / 2.0 + 0.5) + (xyz.y / 4.0 + 0.25));
    gl_FragColor = vec4(color, 1.0);
}
`;




// 3d shpere coordinates
// x*x + y*y + z*z = 1
// x = sin(theta) * cos(phi)
// y = sin(theta) * sin(phi)
// z = cos(theta)
// theta is the angle from the z axis
// phi is the angle from the x axis



function sphereVerticesAndIndices(SPHERE_DIV){

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
    var vertices = [],indices = [];
    for (j = 0; j <= SPHERE_DIV; j++) 
    {
      aj = j * Math.PI / SPHERE_DIV;
      sj = Math.sin(aj);
      cj = Math.cos(aj);
      for (i = 0; i <= SPHERE_DIV; i++) 
      {
        ai = i * 2 * Math.PI / SPHERE_DIV;
        si = Math.sin(ai);
        ci = Math.cos(ai);
        vertices.push(si * sj);  // X
        vertices.push(cj);       // Y
        vertices.push(ci * sj);  // Z
      }
    }

    for (j = 0; j < SPHERE_DIV; j++)
    {
      for (i = 0; i < SPHERE_DIV; i++)
      {
        p1 = j * (SPHERE_DIV+1) + i;
        p2 = p1 + (SPHERE_DIV+1);
        indices.push(p1);
        indices.push(p2);
        indices.push(p1 + 1);
        indices.push(p1 + 1);
        indices.push(p2);
        indices.push(p2 + 1);
      }
    }
    return [vertices, indices];
}



let gl = document.querySelector("canvas").getContext("webgl");

let program = twgl.createProgramFromSources(gl, [vertexShader, fragmentShader]);


let [vertices, indices] = sphereVerticesAndIndices(100);
let positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
let positionIndicesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, positionIndicesBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttributeLocation);

gl.useProgram(program);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


// for (var ii = 0; ii < numFs; ++ii) {
//     var angle = ii * Math.PI * 2 / numFs;
//     var x = Math.cos(angle) * radius;
//     var y = Math.sin(angle) * radius
   
//     // starting with the view projection matrix
//     // compute a matrix for the F
//     var matrix = m4.translate(viewProjectionMatrix, x, 0, y);
   
//     // Set the matrix.
//     gl.uniformMatrix4fv(matrixLocation, false, matrix);
   

//     gl.drawArrays(primitiveType, offset, count);

//   }
gl.drawArrays(primitiveType, offset, count);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);



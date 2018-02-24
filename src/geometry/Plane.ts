import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Plane extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;
  center: vec4;
  scale: vec3;
  rotation: number;
  color: number[];
// takes in center, scale, and rotation representing rotation about y in degrees
  constructor(center: vec3, scale: vec3, rotation: number, color: number[]) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.scale = scale;
    this.rotation = rotation;
    this.color = color;
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3,
                                  4, 5, 6,
                                  4, 6, 7,
                                  8, 9, 10,
                                  8, 10, 11,
                                  12, 13, 14,
                                  12, 14, 15,
                                  16, 17, 18,
                                  16, 18, 19,
                                  20, 21, 22,
                                  20, 22, 23]);
  this.normals = new Float32Array([0, 0, 1, 0,
                                   0, 0, 1, 0,
                                   0, 0, 1, 0,
                                   0, 0, 1, 0,
                                  
                                   0, 0, -1, 0,
                                   0, 0, -1, 0,
                                   0, 0, -1, 0,
                                   0, 0, -1, 0,
                                  
                                   1, 0, 0, 0,
                                   1, 0, 0, 0,
                                   1, 0, 0, 0,
                                   1, 0, 0, 0,
                                  
                                   -1, 0, 0, 0,
                                   -1, 0, 0, 0,
                                   -1, 0, 0, 0,
                                   -1, 0, 0, 0,
                                  
                                   0, 1, 0, 0,
                                   0, 1, 0, 0,
                                   0, 1, 0, 0,
                                   0, 1, 0, 0,
                                  
                                   0, -1, 0, 0,
                                   0, -1, 0, 0,
                                   0, -1, 0, 0,
                                   0, -1, 0, 0,]);
// transform plane based on inputs
  let positions = new Array<Array<number>>();
  positions = ([[-1, 0, 1, 1],
                                     [1, 0, 1, 1],
                                     [1, 0, 1, 1],
                                     [-1, 0, 1, 1],

                                     [-1, 0, -1, 1],
                                     [1, 0, -1, 1],
                                     [1,0, -1 , 1], 
                                     [-1,0 , -1, 1],

                                     [1, 0, 1, 1],
                                    [1, 0, -1, 1],
                                      [1, 0, -1, 1],
                                      [1, 0, 1, 1],

                                      [-1, 0, 1, 1],
                                      [-1, 0, -1, 1],
                                      [-1, 0, -1, 1],
                                      [-1, 0, 1, 1],

                                      [-1 ,0, 1, 1],
                                      [1, 0, 1, 1],
                                      [1, 0, -1, 1],
                                      [-1, 0, -1, 1],

                                      [-1, 0, 1, 1],
                                      [1, 0, 1, 1],
                                      [1 ,0, -1, 1],
                                      [-1,0, -1, 1]]);
    let finalPos = new Array();
    let finalCol = new Array();
    for(let i = 0; i < positions.length; i++) {
        let pos = vec4.fromValues(positions[i][0], positions[i][1], positions[i][2], 1);
        pos[0] *= this.scale[0];
        pos[1] *= this.scale[1];
        pos[2] *= this.scale[2];
        let rotationMat = mat4.create();
        mat4.rotate(rotationMat, rotationMat, this.toRadians(this.rotation), vec3.fromValues(0, 1, 0));
        vec4.transformMat4(pos, pos, rotationMat);
        finalPos = finalPos.concat([pos[0], pos[1], pos[2], 1]);
        // make array of colors 
        finalCol = finalCol.concat(this.color);
    }
    this.positions = Float32Array.from(finalPos);

    this.colors = Float32Array.from(finalCol);
    // just use as a type to assign color
    this.uvs = new Float32Array([2, 2,
      2, 2,
      2, 2,
      2, 2,
   
      2, 2,
      2, 2,
      2, 2,
      2, 2,
   
      2, 2,
      2, 2,
      2, 2,
      2, 2,

      2, 2,
      2, 2,
      2, 2,
      2, 2,

     2, 2,
     2, 2,
     2, 2,
     2, 2,

     2, 2,
     2, 2,
     2, 2,
     2, 2]);
   

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateUVs();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUVs);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    console.log("PLane");
  }


  toRadians(d: number): number {
    return d * Math.PI / 180.0;
  }
};

export default Plane;

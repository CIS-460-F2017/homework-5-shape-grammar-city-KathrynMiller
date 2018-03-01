import {vec3, vec4, mat4} from 'gl-matrix';
import Geometry from './Geometry';

class Roof3 extends Geometry{
// static member variables for holding obj file data
    static vertices: Array<Array<number>> = new Array<Array<number>>();
    static normals: Array<Array<number>> = new Array<Array<number>>();
    static indices: Array<number> = new Array();

// takes in center, scale, and rotation representing rotation about y in degrees
  constructor(center: vec3, scale: vec3, rotation: number, color: vec3) {
    super();
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.scale = scale;
    this.rotation = rotation;
    this.color = color;
    this.create();
  }

  // use to set static variables before using any instance of the class
  static setObjData(mesh: any) {
    for(let i = 0; i < mesh.vertices.length; i+=3) {
        Roof3.vertices = Roof3.vertices.concat([[mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2]]]);
        Roof3.normals = Roof3.normals.concat([[mesh.vertexNormals[i], mesh.vertexNormals[i + 1], mesh.vertexNormals[i + 2]]]);
    }
    for(let i = 0; i < mesh.indices.length; i++) {
        Roof3.indices = Roof3.indices.concat(mesh.indices[i]);
    }
  }

  create() {
    this.finalPos = new Array();
    this.finalNor = new Array();
    this.finalCol = new Array();
    this.finalIndices = Roof3.indices;
    for(let i = 0; i < Roof3.vertices.length; i++) {
        let pos = vec4.create();
        let nor = vec4.create();
        pos = vec4.fromValues(Roof3.vertices[i][0], Roof3.vertices[i][1], Roof3.vertices[i][2], 1);
        nor = vec4.fromValues(Roof3.normals[i][0], Roof3.normals[i][1], Roof3.normals[i][2], 0);
        pos[0] *= this.scale[0];
        pos[1] *= this.scale[1];
        pos[2] *= this.scale[2];
        let rotationMat = mat4.create();
        mat4.rotate(rotationMat, rotationMat, this.rotation, vec3.fromValues(0, 1, 0));
        vec4.transformMat4(pos, pos, rotationMat);
        vec4.transformMat4(nor, nor, rotationMat);
        // move position to the input center
        vec4.add(pos, this.center, pos);
        this.finalPos = this.finalPos.concat([pos[0], pos[1], pos[2], 1]);
        this.finalNor = this.finalNor.concat([nor[0], nor[1], nor[2], 0]);
        // make array of colors 
        this.finalCol = this.finalCol.concat(this.color[0], this.color[1], this.color[2], 1);
    }
  }

};

export default Roof3;
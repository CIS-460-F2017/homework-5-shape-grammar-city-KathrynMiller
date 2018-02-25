import {vec3, vec4, mat4} from 'gl-matrix';
import Geometry from './Geometry';

class Roof1 extends Geometry{
// static member variables for holding obj file data
    static vertices: Array<Array<number>> = new Array<Array<number>>();
    static normals: Array<Array<number>> = new Array<Array<number>>();
    static indices: Array<number> = new Array();

// takes in center, scale, and rotation representing rotation about y in degrees
  constructor(center: vec3, scale: vec3, rotation: number, color: number[]) {
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
        Roof1.vertices = Roof1.vertices.concat([[mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2], 1]]);
        Roof1.normals = Roof1.normals.concat([[mesh.vertexNormals[i], mesh.vertexNormals[i + 1], mesh.vertexNormals[i + 2], 0]]);
    }
    for(let i = 0; i < mesh.indices.length; i++) {
        Roof1.indices = Roof1.indices.concat(mesh.indices[i]);
    }
    console.log(Roof1.vertices.length);
    console.log(Roof1.normals.length);
    console.log(Roof1.indices);
  }

  create() {
    this.finalIndices = Roof1.indices;
    for(let i = 0; i < Roof1.vertices.length; i++) {
        let pos = vec4.create();
        let nor = vec4.create();
        pos = vec4.fromValues(Roof1.vertices[i][0], Roof1.vertices[i][1], Roof1.vertices[i][2], 1);
        nor = vec4.fromValues(Roof1.normals[i][0], Roof1.normals[i][1], Roof1.normals[i][2], 0);
        pos[0] *= this.scale[0];
        pos[1] *= this.scale[1];
        pos[2] *= this.scale[2];
        let rotationMat = mat4.create();
        mat4.rotate(rotationMat, rotationMat, this.toRadians(this.rotation), vec3.fromValues(0, 1, 0));
        vec4.transformMat4(pos, pos, rotationMat);
        vec4.transformMat4(nor, nor, rotationMat);
        // move position to the input center
        vec4.add(pos, this.center, pos);
        this.finalPos = this.finalPos.concat([pos[0], pos[1], pos[2], 1]);
        this.finalNor = this.finalNor.concat([nor[0], nor[1], nor[2], 1]);
        // make array of colors 
        this.finalCol = this.finalCol.concat(this.color);
    }
    console.log("Roof1");
  }

};

export default Roof1;
import {vec3, vec4, mat4} from 'gl-matrix';

// class representing geometry of city
// differes from drawable in that it doesnt create vbos but returns data to be added to a large vbo in city renderer
abstract class Geometry {

  finalIndices:  Array<number> = new Array();
  finalPos: Array<number> = new Array();
  finalNor: Array<number> = new Array();
  finalCol: Array<number> = new Array();
  center: vec4;
  scale: vec3;
  rotation: number;
  color: number[];


  toRadians(d: number): number {
    return d * Math.PI / 180.0;
  }

  getNormals(): Array<number> {
    return this.finalNor;
  }

  getIndices(): Array<number> {
    return this.finalIndices;
  }

  getPositions(): Array<number> {
    return this.finalPos;
  }

  getColors(): Array<number> {
    return this.finalCol;
  }

  abstract create(): void;
}
export default Geometry;
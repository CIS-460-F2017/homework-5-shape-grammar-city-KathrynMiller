import Shape from './Shape';
import {vec3, vec4, mat4} from 'gl-matrix';

class Grammar {
    buildings: Set<Shape> = new Set();
    axiom: string;

    constructor(a: string) {
        this.axiom = a;
        // add base shapes to set of buildings based on axiom characters representing base layout
        for(let i = 0; i < this.axiom.length; i++) {
            let shape = new Shape(this.axiom[i], false, vec3.fromValues(0, 0, 0), 0, vec3.fromValues(1, 1, 1), vec3.fromValues(1, 1, 1));
        }
    }

    // return new set of builings to replace input building 
    divide(oldBuilding: Shape): Set<Shape> {
        return new Set(); 
    }

    getBuildings(): Set<Shape> {
        return this.buildings;
    }

}

export default Grammar;
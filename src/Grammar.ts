import Shape from './Shape';
import {vec3, vec4, mat4} from 'gl-matrix';

class Grammar {
    buildings: Set<Shape> = new Set();
    axiom: string;

    // TODO: change to not have axiom but number of buildings and place around grid
    constructor(a: string) {
        this.axiom = a;
        // add base shapes to set of buildings based on axiom characters representing base layout
        for(let i = 0; i < this.axiom.length; i++) {
            let shape = new Shape(this.axiom[i], false, vec3.fromValues(0, 0, 0), 0, vec3.fromValues(1, 1, 1), vec3.fromValues(1, 1, 1));
            this.buildings.add(shape);
        }
    }

    // return new set of builings to replace input building 
    divide(oldBuilding: Shape): Set<Shape> {
        let newShapes = new Set<Shape>();
        let r = Math.random();
        if(r < .33) {
            newShapes = this.divideX(oldBuilding);
        } else if (r < .67) {
            newShapes = this.divideY(oldBuilding);
        } else {
            newShapes = this.divideZ(oldBuilding);
        }
        return newShapes; 
    }
    // base next character off of former
    divideX(oldBuilding: Shape): Set<Shape> {
        // offset amount from current centers
        let offset = oldBuilding.getScale()[1] / 2.0;
        let newCenter = vec3.fromValues(oldBuilding.getCenter()[0], oldBuilding.getCenter()[1] + offset, oldBuilding.getCenter()[2]);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0], oldBuilding.getScale()[1], oldBuilding.getScale()[2]);

        let newLayer = new Shape("c", false, newCenter, oldBuilding.getRotation(), newScale, vec3.fromValues(0, 0, 1));
        let newShapes = new Set<Shape>();
        newShapes.add(newLayer);
        newShapes.add(oldBuilding);
        return newShapes;
    }

    divideZ(oldBuilding: Shape): Set<Shape> {
        // offset amount from current centers
        let offset = oldBuilding.getScale()[0] / 4.0 + .007;
        let newCenter1 = vec3.fromValues(oldBuilding.getCenter()[0], oldBuilding.getCenter()[1], oldBuilding.getCenter()[2] - offset);
        let newCenter2 = vec3.fromValues(oldBuilding.getCenter()[0], oldBuilding.getCenter()[1], oldBuilding.getCenter()[2] + offset);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0], oldBuilding.getScale()[1], oldBuilding.getScale()[2] / 2.0 - .014);

        let b1 = new Shape("c", false, newCenter1, oldBuilding.getRotation(), newScale, vec3.fromValues(0, 0, 1));
        let b2 = new Shape("c", false, newCenter2, oldBuilding.getRotation(), newScale, vec3.fromValues(1, 0, 0));
        let newShapes = new Set<Shape>();
        newShapes.add(b1);
        newShapes.add(b2);
        return newShapes;
    }

    // choose random character to represent different building slices or tops
    divideY(oldBuilding: Shape): Set<Shape> {
        // offset amount from current centers
        let offset = oldBuilding.getScale()[0] / 4.0 + .05;
        let newCenter1 = vec3.fromValues(oldBuilding.getCenter()[0] - offset, oldBuilding.getCenter()[1], oldBuilding.getCenter()[2]);
        let newCenter2 = vec3.fromValues(oldBuilding.getCenter()[0] + offset, oldBuilding.getCenter()[1], oldBuilding.getCenter()[2]);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0] / 2.0 - .1, oldBuilding.getScale()[1], oldBuilding.getScale()[2]);

        let b1 = new Shape("c", false, newCenter1, oldBuilding.getRotation(), newScale, vec3.fromValues(0, 0, 1));
        let b2 = new Shape("c", false, newCenter2, oldBuilding.getRotation(), newScale, vec3.fromValues(1, 0, 0));
        let newShapes = new Set<Shape>();
        newShapes.add(b1);
        newShapes.add(b2);
        return newShapes;
    }

    getBuildings(): Set<Shape> {
        return this.buildings;
    }

}

export default Grammar;
import Shape from './Shape';
import {vec3, vec4, mat4} from 'gl-matrix';
import Roof1 from './geometry/Roof1';

class Grammar {
    buildings: Set<Shape> = new Set();
    axiom: string;
    color: vec3 = vec3.fromValues(153 / 255, 0 / 255, 76 / 255);

    // TODO: change to not have axiom but number of buildings and place around grid
    constructor(a: string) {
        this.axiom = a;
        // add base shapes to set of buildings based on axiom characters representing base layout
        for(let i = 0; i < this.axiom.length; i++) {
            let shape = new Shape(this.axiom[i], false, vec3.fromValues(0, 0, 0), 0, vec3.fromValues(1, 1, 1), vec3.fromValues(1, 1, 1), false);
            this.buildings.add(shape);
        }
    }

    // return new set of builings to replace input building 
// terminalXZ based on population density and surface area of roof
// Determine if terminal y based on population density
// If max y, and no roof, add roof
// Terminal if max in all directions then add roof
    divide(oldBuilding: Shape): Set<Shape> {
        let newShapes = new Set<Shape>();
        //let r = .6;
        let r = Math.random();
        // TODO base these on population density and oldBuilding center
        let areaMin = .2;
        // creates a falloff based on distance of building from the center
        let heightMax = 2.5 / Math.pow(1.2, vec3.length(oldBuilding.getCenter()));
        if(r < .2) {
            newShapes = this.type1(oldBuilding);
        } else if (r < .4) {
            newShapes = this.type2(oldBuilding);
        } else if (r < .6) {
            newShapes = this.type3(oldBuilding);
        } else if (r < .8) {
            newShapes = this.type4(oldBuilding);
        } else {
            let newCol = this.getColor(oldBuilding.getCenter());
            oldBuilding.setColor(newCol);
            newShapes.add(oldBuilding);
        }
        for(let shape of newShapes) {
            r = Math.random();
            r -= .5;
            let height = heightMax + r;
            shape.scaleY(height);
            shape.makeTerminal();
        }
        return newShapes;
    }
    // returns color for an object based on its distance from the center
    getColor(pos: vec3): vec3 {
        let col = vec3.create();
        col = vec3.scale(col, this.color, vec3.length(pos) / 4.0);
        return col;
    }

    //divide random side, divide random half in other direction, scale all up a little
    type1(oldBuilding: Shape): Set<Shape> {
        let r = Math.random();
        let divisionAxis = "";
        let newShapes = new Set<Shape>();
        let halves = new Set<Shape>();
        if(r < .5) {
            halves = this.divideX(oldBuilding);
            divisionAxis = "x";
        } else {
            halves = this.divideZ(oldBuilding);
            divisionAxis = "z";
            
        }
        // pick random half and divide it in other direction
        let i = 0;
        r = Math.floor(Math.random() + 1); // 0 or 1
        for(let half of halves) {
            if(i == r) {
                if(divisionAxis == "z") {
                    for(let s of this.divideX(half)) {
                        newShapes.add(s);
                    }
                } else {
                    for(let s of this.divideZ(half)) {
                        newShapes.add(s);
                    }
                }
            } else {
                newShapes.add(half);
            }
            i++;
        }
        return newShapes;
    }
    // divide in both x and z (creates 4 square little towers)
    type2(oldBuilding: Shape): Set<Shape> {
        let r = Math.random();
        let divisionAxis = "";
        let newShapes = new Set<Shape>();
        let halves = new Set<Shape>();
        if(r < .5) {
            halves = this.divideX(oldBuilding);
            divisionAxis = "x";
        } else {
            halves = this.divideZ(oldBuilding);
            divisionAxis = "z";
            
        }
        // divide both halves in other direction
        for(let half of halves) {
            if(divisionAxis == "z") {
                for(let s of this.divideX(half)) {
                    newShapes.add(s);
                }
            } else {
                for(let s of this.divideZ(half)) {
                        newShapes.add(s);
                }
            }
        }
        return newShapes;
    }
    // divide in half in either x or z
    type3(oldBuilding: Shape): Set<Shape> {
        let r = Math.random();
        let halves = new Set<Shape>();
        if(r < .5) {
            halves = this.divideX(oldBuilding);
        } else {
            halves = this.divideZ(oldBuilding);   
        }
        return halves;
    }
    // creates one building with two pillars in the front
    type4(oldBuilding: Shape): Set<Shape> {
        let newShapes = new Set<Shape>();
        let forward = vec3.create();
        let tangent = vec3.create();
        vec3.normalize(forward, oldBuilding.getCenter());
        vec3.cross(tangent, forward, vec3.fromValues(0, 1, 0));

        let baseOffset = vec3.create();
        let offset = oldBuilding.getScale()[0] / 4.0 + .05;
        vec3.scale(baseOffset, forward, offset);
        let baseCenter = vec3.create();
        vec3.subtract(baseCenter, oldBuilding.getCenter(), baseOffset);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0], oldBuilding.getScale()[1], oldBuilding.getScale()[2] / 2.0 - .01);
        // set colors based on distance from center
        let baseCol = this.getColor(baseCenter);
        let base = new Shape("c", false, baseCenter, oldBuilding.getRotation(), newScale, baseCol, false);
        
        vec3.scale(tangent, tangent, offset);
        let p1Center = vec3.create();
        vec3.subtract(p1Center, oldBuilding.getCenter(), tangent);
        let p2Center = vec3.create();
        vec3.add(p2Center, oldBuilding.getCenter(), tangent);

        let pillarScale = vec3.fromValues(newScale[0] / 3.0 - .01, newScale[1], newScale[2] / 1.5);
        let color1 = this.getColor(p1Center);
        let color2 = this.getColor(p2Center);
        let p1 = new Shape("c", false, p1Center, oldBuilding.getRotation(), pillarScale, color1, false);
        let p2 = new Shape("c", false, p2Center, oldBuilding.getRotation(), pillarScale, color2, false);

        newShapes.add(p1);
        newShapes.add(p2);
        newShapes.add(base);
 
        return newShapes;
    }

    // scales building in y direction
    scaleY(oldBuilding: Shape){
        oldBuilding.scaleY(1.5);
    }

    divideZ(oldBuilding: Shape): Set<Shape> {
        // offset amount from current centers
        let offset = oldBuilding.getScale()[2] / 4.0 + .07;
        let forward = vec3.create();
        // get forward vector and move forward and backwards along this instead of always z
        vec3.normalize(forward, oldBuilding.getCenter());
        vec3.scale(forward, forward, offset);
        let newCenter1 = vec3.create();
        vec3.subtract(newCenter1, oldBuilding.getCenter(), forward);
        let newCenter2 = vec3.create();
        vec3.add(newCenter2, oldBuilding.getCenter(), forward);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0], oldBuilding.getScale()[1], oldBuilding.getScale()[2] / 2.0 - .01);

        let color1 = this.getColor(newCenter1);
        let color2 = this.getColor(newCenter2);
        let b1 = new Shape("c", false, newCenter1, oldBuilding.getRotation(), newScale, color1, false);
        let b2 = new Shape("c", false, newCenter2, oldBuilding.getRotation(), newScale, color2, false);
        let newShapes = new Set<Shape>();
        newShapes.add(b1);
        newShapes.add(b2);
        return newShapes;
    }

    // choose random character to represent different building slices or tops
    divideX(oldBuilding: Shape): Set<Shape> {
        // offset amount from current centers
        let offset = oldBuilding.getScale()[0] / 4.0 + .07;
        let forward = vec3.create();
        let tangent = vec3.create();
        // get forward vector and move forward and backwards along this instead of always z
        vec3.normalize(forward, oldBuilding.getCenter());
        vec3.cross(tangent, forward, vec3.fromValues(0, 1, 0));
        vec3.scale(tangent, tangent, offset);
        let newCenter1 = vec3.create();
        vec3.subtract(newCenter1, oldBuilding.getCenter(), tangent);
        let newCenter2 = vec3.create();
        vec3.add(newCenter2, oldBuilding.getCenter(), tangent);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0] / 2.0 - .01, oldBuilding.getScale()[1], oldBuilding.getScale()[2]);

        let color1 = this.getColor(newCenter1);
        let color2 = this.getColor(newCenter2);;
        let b1 = new Shape("c", false, newCenter1, oldBuilding.getRotation(), newScale, color1, false);
        let b2 = new Shape("c", false, newCenter2, oldBuilding.getRotation(), newScale, color2, false);
        let newShapes = new Set<Shape>();
        newShapes.add(b1);
        newShapes.add(b2);
        return newShapes;
    }

    addRoof(oldBuilding: Shape): Shape {
        oldBuilding.roof = true;
        let r = Math.random();
        let roof: Shape;
        let newCenter = vec3.fromValues(oldBuilding.getCenter()[0],  oldBuilding.getCenter()[1] + oldBuilding.getScale()[1] / 2, oldBuilding.getCenter()[2]);
        let newScale = vec3.fromValues(oldBuilding.getScale()[0], oldBuilding.getScale()[1] - .7, oldBuilding.getScale()[2])
        if(r < .33) {
            roof = new Shape("r1", true, newCenter, oldBuilding.getRotation(), newScale, oldBuilding.getColor(), true);
        } else if (r < .67) {
            roof = new Shape("r2", true, newCenter, oldBuilding.getRotation(), newScale, oldBuilding.getColor(), true);
        } else {
            roof = new Shape("r3", true, newCenter, oldBuilding.getRotation(), newScale, oldBuilding.getColor(), true);
        }
        return roof;
    }

    getBuildings(): Set<Shape> {
        return this.buildings;
    }

}

export default Grammar;
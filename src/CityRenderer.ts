import Shape from './Shape';
import Roads from './Roads';
import Grammar from './Grammar';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';
import {vec3, vec4, mat4} from 'gl-matrix';

class CityRenderer extends Drawable {
    iterations: number;
    grammar: Grammar;
    buildings: Set<Shape> = new Set();
    lastIdx: number;
    roads: Set<Shape> = new Set();
    centerCity: vec3 = vec3.fromValues(0, 0, 0);

    constructor(a: string, i: number) {
        super();
        this.lastIdx = 0;
        this.iterations = i;
        this.grammar = new Grammar(a);
        this.buildings = new Set<Shape>();
        //this.buildings.add(new Shape("c", false, vec3.fromValues(0, 0, 0), 0, vec3.fromValues(1, 1, 1), vec3.fromValues(1, 1, 1), false));
        this.createStreets();
        this.placeBuildings();
        this.parseShapeGrammar();
    }

    parseShapeGrammar() {
        this.iterations = 1;
        for(let i = 0; i < this.iterations; i++) {
            let newShapes = new Set<Shape>();
            for(let s of this.buildings) {
                if(!s.isTerminal()) {
                    //divide this building appropriately based on rules and add its new components to the set of buildings
                    let successors = this.grammar.divide(s);
                    // remove the building from our current set
                    this.buildings.delete(s);
                    // add the buildings successors to the set of new buildings
                    for(let newShape of successors) {
                        newShapes.add(newShape);
                    }   
                } else if (s.isTerminal() && !s.hasRoof()) { // if building is terminal in all directions, add roof 
                    console.log("ADD ROOF");
                    let roof = this.grammar.addRoof(s);
                    newShapes.add(roof);
                }
            }
            // add all new shapes to the current set of buildings
            for(let newShape of newShapes) {
                this.buildings.add(newShape);
            }
        }
    } 

    createStreets() {
        let changeTheta = this.toRadians(3.0);
        // rotate about some center point and place small square planes to build multiple concentric roads
        let r = 5;
        let roadScale = vec3.fromValues(.5, .5, .5);
        let roadColor = vec3.fromValues(.2, .6, 1);
        for(let i = 0; i < 2 * Math.PI; i += changeTheta) {
            let roadCenter = vec3.fromValues(this.centerCity[0] + r * Math.cos(i), -.21, this.centerCity[2] + r * Math.sin(i));
            let newRoad = new Shape("r", true, roadCenter, 0, roadScale, roadColor, true);
            this.roads.add(newRoad);
        }
        
    }
    // place buildings as radially outward streets are added. 
    // for now, buildings are just 1x1 blocks that will be subdivided in the parse method before behind drawn
    placeBuildings() {
        let changeTheta = this.toRadians(18.0);
        // rotate about some center point and place small square planes to build multiple concentric roads
        let r = 5;
        let roadScale = vec3.fromValues(.5, .5, .5);
        let roadColor = vec3.fromValues(.2, .6, 1);
        // place buildings within initial circle
        // TODO add unique landmarks in center of city and within this circle
        for(let i = 0; i < 2 * Math.PI; i += changeTheta) {
            let buildingCenter = vec3.fromValues(this.centerCity[0] + r * Math.cos(i), 0, this.centerCity[2] + r * Math.sin(i));
            // bring geometry in from the river then use this vector to rotate towards the center
            let rayDir = vec3.create();
            // ray from object to center (needs to be altered if centerCity is not origin)
            rayDir = vec3.normalize(rayDir, buildingCenter);
            let offset = vec3.create();
            offset = vec3.scale(offset, rayDir, 1);
            buildingCenter = vec3.subtract(buildingCenter, buildingCenter, offset);
            // calculate rotation by assuming forward vector of block is +z and take dot product of this and rayDir
            let rotation = 0;
            vec3.scale(rayDir, rayDir, -1)
            let dot = vec3.dot(rayDir, vec3.fromValues(0, 0, 1));
            rotation = Math.acos(dot);
             // fix wonky rotations on one half of the circle
             if(buildingCenter[0] >= 0) {
                 rotation *= -1;
            }

            let newBuilding = new Shape("c", false, buildingCenter, rotation, vec3.fromValues(1, 1, 1), roadColor, false);
            this.buildings.add(newBuilding);
        }   
    }

    // adds planes to set of roads that draw a line between two input points
    drawLine(start: vec3, end: vec3, scale: number) {
        let slope = (start[0] - end[0]) / (start[2] - end [2]);
        let stepSize = .2;
    }


    toRadians(d: number): number {
        return d * Math.PI / 180.0;
      }
    
    create() {
        let finalPos = new Array();
        let finalNor = new Array();
        let finalIdx = new Array();
        let finalCol = new Array();
        this.lastIdx = 0;
        // add vbo data from each shape to final vbo data
        for(let shape of this.buildings) {
            shape.getGeometry().create();
            finalPos = finalPos.concat(shape.getGeometry().getPositions());
            finalNor = finalNor.concat(shape.getGeometry().getNormals());
            finalCol = finalCol.concat(shape.getGeometry().getColors());
            let n = shape.getGeometry().getIndices().length;
            for(let j = 0; j < n; j++) {
                finalIdx.push(shape.getGeometry().getIndices()[j] + this.lastIdx);
            }
            this.lastIdx += shape.getGeometry().getPositions().length / 4;
        }
        // add road geometry
        for(let shape of this.roads) {
            finalPos = finalPos.concat(shape.getGeometry().getPositions());
            finalNor = finalNor.concat(shape.getGeometry().getNormals());
            finalCol = finalCol.concat(shape.getGeometry().getColors());
            let n = shape.getGeometry().getIndices().length;
            for(let j = 0; j < n; j++) {
                finalIdx.push(shape.getGeometry().getIndices()[j] + this.lastIdx);
            }
            this.lastIdx += shape.getGeometry().getPositions().length / 4;
        }
        // pass all shape information to gpu
        let positions = Float32Array.from(finalPos);
        let normals = Float32Array.from(finalNor);
        let colors = Float32Array.from(finalCol);
        let indices = Uint32Array.from(finalIdx);
        
        this.generateIdx();
        this.generatePos();
        this.generateNor();
        this.generateCol();

        this.count = indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    }


 }

export default CityRenderer;
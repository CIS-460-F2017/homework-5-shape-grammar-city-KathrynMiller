import Shape from './Shape';

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
    roadColor: vec3 = vec3.fromValues(204 / 255, 229 / 255, 255 / 255);

    constructor() {
        super();
        this.lastIdx = 0;
        this.grammar = new Grammar();
        this.buildings = new Set<Shape>();
        //this.buildings.add(new Shape("c", false, vec3.fromValues(0, 0, 0), 0, vec3.fromValues(1, 1, 1), vec3.fromValues(1, 1, 1), false));
        this.innerCircle();
        this.buildingRing(7, 13.0);
        this.buildingRing(8.3, 12.0);
        this.roadRing(8.5, 3.0);
        this.buildingRing(10.5, 12.0);
        this.buildingRing(12, 10.0);
        this.roadRing(12, 2.0);
        this.buildingRing(13.8, 8.0);
        this.parseShapeGrammar();
    }

    parseShapeGrammar() {
        this.iterations = 2;
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

    roadRing(r: number, theta: number) {
        theta = this.toRadians(theta);
        let roadScale = vec3.fromValues(.5, .5, .5);
        for(let i = 0; i < 2 * Math.PI; i += theta) {
            let roadCenter = vec3.fromValues(this.centerCity[0] + r * Math.cos(i), 0, this.centerCity[2] + r  * Math.sin(i));
            let newRoad = new Shape("r", true, roadCenter, 0, roadScale, this.roadColor, true);
            this.roads.add(newRoad);
        }
    }

    buildingRing(r: number, theta: number) {
        theta = this.toRadians(theta);
        for(let i = 0; i < 2 * Math.PI; i += theta) {
            this.radialBuilding(r, i);
        }   
    }


    innerCircle() {
        let changeTheta = this.toRadians(3.0);
        // rotate about some center point and place small square planes to build multiple concentric roads
        let r = 5;
        let roadScale = vec3.fromValues(.5, .5, .5);
        for(let i = 0; i < 2 * Math.PI; i += changeTheta) {
            let roadCenter = vec3.fromValues(this.centerCity[0] + r * Math.cos(i), 0, this.centerCity[2] + r * Math.sin(i));
            let newRoad = new Shape("r", true, roadCenter, 0, roadScale, this.roadColor, true);
            this.roads.add(newRoad);
        }
        changeTheta = this.toRadians(18.0);
        // TODO add unique landmarks in center of city and within this circle
        for(let i = 0; i < 2 * Math.PI; i += changeTheta) {
            this.radialBuilding(r, i);
        }  
        // add fountain to center of city
        let fountain = new Shape("f", true, vec3.fromValues(0, .5, 0), 0, vec3.fromValues(1, 1, 1), this.roadColor, true); 
        this.buildings.add(fountain); 
    }

    // helper that adds a building at angle theta and radius r from the center
    radialBuilding(r: number, theta: number) {
        let buildingCenter = vec3.fromValues(this.centerCity[0] + r * Math.cos(theta), 0, this.centerCity[2] + r * Math.sin(theta));
        // bring geometry in from the river then use this vector to rotate towards the center
        let rayDir = vec3.create();
        // ray from object to center (needs to be altered if centerCity is not origin)
        rayDir = vec3.normalize(rayDir, buildingCenter);
        let offset = vec3.create();
        offset = vec3.scale(offset, rayDir, 1);
        buildingCenter = vec3.subtract(buildingCenter, buildingCenter, offset);
        // calculate rotation by assuming forward vector of block is +z and take dot product of this and rayDir
        let rotation = 0;
        vec3.scale(rayDir, rayDir, -1);
        let dot = vec3.dot(rayDir, vec3.fromValues(0, 0, 1));
        rotation = Math.acos(dot);
        // fix wonky rotations on one half of the circle
        if(buildingCenter[0] >= 0) {
            rotation *= -1;
        }
        let newBuilding = new Shape("c", false, buildingCenter, rotation, vec3.fromValues(1, 1, 1), this.roadColor, false);
        this.buildings.add(newBuilding);
    }

    /* not working yet
    // draw inner radius as well as buildings extending to outer radius for a ring around the city
    outerRings(innerR: number, outerR: number, changeTheta: number) {
        changeTheta = this.toRadians(changeTheta);
        let r = Math.random();
        let theta = 0;
        r += 3;
        let streetThetas = new Array();
        // create a list of 0 - 10 thetas representing where radial streets will be placed for this innerR to outerR
        for(let i = 0; i < r; i++) {
            theta = Math.random() * 2 * Math.PI;
            streetThetas.push(theta);
        }

        for(let i = 0; i < 2 * Math.PI; i += changeTheta) {
            let drawStreet = false;
            // for each angle where a street should
            for(let j = 0; j < streetThetas.length; j++) {
                let currTheta = streetThetas[j];
                // if this angle is in the range of some street theta, draw a line and set drawStreet to true
                if((i - changeTheta / 2 <  currTheta) && (i + changeTheta / 2 >  currTheta) && !drawStreet) {
                    drawStreet = true;
                    let start = vec3.fromValues(this.centerCity[0] + innerR * Math.cos(i), 0, this.centerCity[2] + innerR * Math.sin(i));
                    let end = vec3.fromValues(this.centerCity[0] + outerR * Math.cos(i), 0, this.centerCity[2] + outerR * Math.sin(i));
                    //TODO: vary line width
                    this.drawLine(start, end, .7);
                    console.log(start);
                    console.log(end);
                }
            }
            
            // if there shouldn't be a street through this angle, place building
            if(!drawStreet)  {
                this.radialBuilding(outerR, i);
            }
            
            this.radialBuilding(outerR, i);
        }   
    } 
    */

    // adds planes to set of roads that draw a line between two input points
    drawLine(start: vec3, end: vec3, scale: number) {
        let slope = (start[0] - end[0]) / (start[2] - end [2]);
        let stepSize = .1;
        let planeCenter = vec3.create();
        let roadColor = vec3.fromValues(.2, .6, 1);
        let rayDir = vec3.create();
        let rotation = 0;
        for(let x = start[0]; x < end[0]; x+= stepSize) {
            planeCenter[0] = x;
            planeCenter[2] = slope * x;
            // rotate plant to avoid stepping in lines
            rayDir = vec3.normalize(rayDir, planeCenter);
            let dot = vec3.dot(rayDir, vec3.fromValues(0, 0, 1));
            rotation = Math.acos(dot);
            let plane = new Shape("r", true, planeCenter, rotation, vec3.fromValues(scale, scale, scale), roadColor, false);
            this.roads.add(plane);
        }
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
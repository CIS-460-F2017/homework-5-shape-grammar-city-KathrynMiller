import Shape from './Shape';
import Grammar from './Grammar';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';

class CityRenderer extends Drawable {
    iterations: number;
    grammar: Grammar;
    buildings: Set<Shape> = new Set();

    constructor(a: string, i: number) {
        super();
        this.iterations = i;
        this.grammar = new Grammar(a);
        this.buildings = this.grammar.getBuildings();
        this.parseShapeGrammar();
    }

    parseShapeGrammar() {
        let newShapes = new Set<Shape>();
        for(let i = 0; i < this.iterations; i++) {
            for(let s of this.buildings.values()) {
                if(!s.isTerminal()) {
                    //divide this building appropriately based on rules and add its new components to the set of buildings
                    let successors = this.grammar.divide(s);
                    // remove the building from our current set
                    this.buildings.delete(s);
                    // add the buildings successors to the set of new buildings
                    for(let newShape of successors) {
                        newShapes.add(newShape);
                    }
                }
            }
        }
        // add all new shapes to the current set of buildings
        for(let newShape of newShapes) {
            this.buildings.add(newShape);
        }
        this.create();
    } 
    
    create() {
        let finalPos = new Array();
        let finalNor = new Array();
        let finalIdx = new Array();
        let finalCol = new Array();
        // add vbo data from each shape to final vbo data
        for(let shape of this.buildings) {
            finalPos = finalPos.concat(shape.getGeometry().getPositions());
            finalNor = finalNor.concat(shape.getGeometry().getNormals());
            finalIdx = finalIdx.concat(shape.getGeometry().getIndices());
            finalCol = finalCol.concat(shape.getGeometry().getColors());
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
        console.log("CITY");
    }


 }

export default CityRenderer;
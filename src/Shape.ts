import {vec3, vec4, mat4} from 'gl-matrix';
import Cube from './geometry/Cube';
import Geometry from './geometry/Geometry';

class Shape {
    symbol: string;
    terminal: boolean;
    position: vec3;
    rotation: number;
    scale: vec3;
    geometry_type: Geometry;
    color: vec3;

    constructor(symbol: string, t: boolean, p: vec3, r: number, s: vec3, c: vec3) {
        this.symbol = symbol;
        this.terminal = t;
        this.position = p;
        this.rotation = r;
        this.scale = s;
        this.color = c;
        if(symbol == "c") {
            this.geometry_type = new Cube(p, s, r, [c[0], c[1], c[2], 1]);
        }
    }

    isTerminal(): boolean {
        return this.terminal;
    }

    getGeometry(): Geometry {
        console.log("GET GEO");
        return this.geometry_type;
    }
}

export default Shape;
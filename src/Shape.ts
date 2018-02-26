import {vec3, vec4, mat4} from 'gl-matrix';
import Cube from './geometry/Cube';
import Geometry from './geometry/Geometry';
import Roof1 from './geometry/Roof1';
import Roof2 from './geometry/Roof2';
import Roof3 from './geometry/Roof3';
import Plane from './geometry/Plane';

class Shape {
    symbol: string;
    terminal: boolean;
    position: vec3;
    rotation: number;
    scale: vec3;
    geometry_type: Geometry;
    color: vec3;
    // keep track of how many building slabs are stacked beneath 
    // edit: not using yet unless want to add window layers later
    height: number;
    roof: boolean;

    constructor(symbol: string, t: boolean, p: vec3, r: number, s: vec3, c: vec3, roof: boolean) {
        this.symbol = symbol;
        this.terminal = t;
        this.position = p;
        this.rotation = r;
        this.scale = s;
        this.color = c;
        this.roof = roof;
        if(symbol == "c") {
            this.geometry_type = new Cube(p, s, r, [c[0], c[1], c[2], 1]);
        } else if (symbol == "r1") {
            this.geometry_type = new Roof1(p, s, r, [c[0], c[1], c[2], 1]);
        } else if (symbol == "r2") {
            this.geometry_type = new Roof2(p, s, r, [c[0], c[1], c[2], 1]);
        } else if (symbol == "r3") {
            this.geometry_type = new Roof3(p, s, r, [c[0], c[1], c[2], 1]);
        } else if (symbol == "p") {
            this.geometry_type = new Plane(p, s, r, [c[0], c[1], c[2], 1]);
        }
    }

    scaleY(h: number) {
        this.scale[1] += h;
        // reset vbo data
        this.geometry_type.create();
    }

    isTerminal(): boolean {
        return this.terminal;
    }

    makeTerminal() {
        this.terminal = true;
    }

    getGeometry(): Geometry {
        return this.geometry_type;
    }

    getCenter(): vec3 {
        return this.position;
    }

    getRotation(): number {
        return this.rotation;
    }

    getScale(): vec3 {
        return this.scale;
    }

    getSymbol(): string {
        return this.symbol;
    }

    getColor(): vec3 {
        return this.color;
    }

    getHeight(): number {
        return this.scale[1];
    }

    hasRoof(): boolean {
        return this.roof;
    }

    // return top plane surface area to track if a building is getting too small
    getArea(): number {
        return this.scale[0] * this.scale[2];
    }
}

export default Shape;
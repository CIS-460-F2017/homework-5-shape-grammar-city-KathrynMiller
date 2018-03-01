import {vec3, vec4, mat4} from 'gl-matrix';
import Cube from './geometry/Cube';
import Geometry from './geometry/Geometry';
import Roof1 from './geometry/Roof1';
import Roof2 from './geometry/Roof2';
import Roof3 from './geometry/Roof3';
import Plane from './geometry/Plane';

class Shape {
    symbol: string = "";
    terminal: boolean;
    position: vec3 = vec3.create();
    rotation: number = 0;
    scale: vec3 = vec3.create();
    geometry_type: Geometry;
    color: vec3 = vec3.create();
    // keep track of how many building slabs are stacked beneath 
    // edit: not using yet unless want to add window layers later
    height: number;
    roof: boolean;

    constructor(symbol: string, t: boolean, p: vec3, r: number, s: vec3, c: vec3, roof: boolean) {
        this.symbol = symbol;
        this.terminal = t;
        vec3.copy(this.position, p);
        this.rotation = r;
        vec3.copy(this.scale, s);
        vec3.copy(this.color, c);
        this.roof = roof;
        if(symbol == "c") {
            this.geometry_type = new Cube(this.position, this.scale, this.rotation, this.color);
        } else if (symbol == "r1") {
            this.geometry_type = new Roof1(this.position, this.scale, this.rotation, this.color);
        } else if (symbol == "r2") {
            this.geometry_type = new Roof2(this.position, this.scale, this.rotation, this.color);
        } else if (symbol == "r3") {
            this.geometry_type = new Roof3(this.position, this.scale, this.rotation, this.color);
        } else if (symbol == "r") {
            this.geometry_type = new Plane(this.position, this.scale, this.rotation, this.color);
        }
    }

    scaleY(h: number) {
        this.scale[1] += h;
        // reset vbo data
        this.geometry_type.scale[1] += h;
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

    setColor(color: vec3) {
        this.color = color;
        this.geometry_type.setColor(color);
    }

    getCenter(): vec3 {
        return this.position;
    }

    getRotation(): number {
        return this.geometry_type.getRotation();
    }

    getScale(): vec3 {
        return this.geometry_type.getScale();
    }

    getSymbol(): string {
        return this.symbol;
    }

    getColor(): vec3 {
        return this.geometry_type.getColor();
    }

    setRotation(degree: number) {
        this.geometry_type.setRotation(degree);
    }

    getHeight(): number {
        return this.geometry_type.getScale()[1];
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
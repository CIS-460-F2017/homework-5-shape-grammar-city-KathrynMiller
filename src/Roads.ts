import Shape from './Shape';
import {gl} from './globals';
import {vec3, vec4, mat4} from 'gl-matrix';

class Roads {
    // set of planes representing roads
    plane: Shape;
    directon: vec3;
    hasBuildingRight: boolean;
    hasBuildingLeft: boolean;
    roadSet: Set<Shape> = new Set<Shape>();

    /*
    want to rotate it such that the direction is a direction in which a driver would go
    cross product of this and 0, 1, 0 should yield a direction to displace the house and orient towards (negative direction)
    how do you find how to space houses relative to eachother?
         - each block is 1x1 in x and z
        -  map of all house positions?

    */


}

export default Roads;
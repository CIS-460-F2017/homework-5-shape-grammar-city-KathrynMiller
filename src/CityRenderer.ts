import Shape from './Shape';
import Grammar from './Grammar';

class CityRenderer {
    iterations: number;
    grammar: Grammar;
    buildings: Set<Shape> = new Set();

    constructior(a: string, i: number) {
        this.iterations = i;
        this.grammar = new Grammar(a);
        this.buildings = this.grammar.getBuildings();
    }

    parseShapeGrammar() {
        for(let i = 0; i < this.iterations; i++) {
            for(let s of this.buildings.values()) {
                if(!s.isTerminal()) {
                    //divide this building appropriately based on rules and add its new components to the set of buildings

                }
            }
        }
    }           
 }

export default CityRenderer;
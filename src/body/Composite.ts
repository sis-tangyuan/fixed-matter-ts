import Constraint from "../constraint/Constraint";
import { Common } from "../core/Common";
import Body from "./Body";

export interface CompositeCache {
    allBodies: Body[];
    allConstraints: Constraint[];
    allComposites: Composite[];
}

export default class Composite {

    id: number = Common.nextId();
    type: string = 'composite'
    parent?: Composite
    isModified: boolean = false;
    bodies: Body[] = []
    constraints: Constraint[] = [];
    composites: Composite[] = [];
    lable: string = 'Composite';
    plugin = {};
    cache?: CompositeCache | null

    static create(options: any): Composite {
        let composite = new Composite();
        Common.extend(composite, options);
        return composite;
    }

    setModified(isModified: boolean, updateParents: boolean = false, updateChildren: boolean = false) {
        this.isModified = isModified;

        if (isModified && this.cache) {
            this.cache = null;
        }

        if (updateParents && this.parent) {
            this.parent.setModified(isModified, updateParents, updateChildren)
        }

        if (updateChildren) {
            for (let i = 0; i < this.composites.length; i++) {
                let childComposite = this.composites[i];
                childComposite.setModified(isModified, updateParents, updateChildren)
            }
        }
    }

    addComposite(composite: Composite): this {
        this.composites.push(composite)
        composite.parent = this;
        this.setModified(true, true, false);
        return this;
    }

    removeComposite(composite: Composite, deep: boolean): Composite {
        let position = Common.indexOf(this.composites, composite)
        if (position === -1) {
            this.removeCompositeAt(position);
        }

        if (deep) {
            for (let i = 0; i < this.composites.length; i++) {
                this.composites[i].removeComposite(composite, true);
            }
        }
        return this;
    }

    removeCompositeAt(position: number): Composite {
        this.composites.splice(position, 1)
        this.setModified(true, true, false);
        return this;
    }

    addBody(body: Body): Composite {
        this.bodies.push(body)
        this.setModified(true, true, false);
        return this;
    }

    removeBody(body: Body, deep: boolean): Composite {
        const position = Common.indexOf(this.bodies, body);
        if (position !== -1) {
            this.removeBodyAt(position)
        }

        if (deep) {
            for(let i = 0; i < this.composites.length; i++) {
                this.composites[i].removeBody(body, true);
            }
        }
        return this;
    }

    removeBodyAt(position: number): Composite {
        this.bodies.splice(position, 1);
        this.setModified(true, true, false);
        return this;
    }

    addConstraint(constraint: Constraint): Composite {
        this.constraints.push(constraint)
        this.setModified(true, true, false)
        return this;
    }

    removeConstraint(constraint: Constraint, deep: boolean): Composite {
        const position = Common.indexOf(this.constraints, constraint);
        if (position !== -1) {
            this.removeConstraintAt(position);
        }

        if (deep) {
            for (let i = 0; i < this.composites.length; i++ ){
                this.composites[i].removeConstraint(constraint, true);
            }
        }
        return this;
    }

    removeConstraintAt(position: number): Composite {
        this.composites.splice(position, 1);
        this.setModified(true, true, false)
        return this;
    }

    clear(keepStatic: boolean, deep: boolean): Composite {
        if (deep) {
            for(let i = 0; i < this.composites.length; i++) {
                this.composites[i].clear(keepStatic, true);
            }
        }

        if (keepStatic) {
            this.bodies = this.bodies.filter((body: Body) => {
                return body.isStatic;
            })
        } else {
            this.bodies.length = 0;
        }

        this.constraints.length = 0;
        this.composites.length = 0;
        this.setModified(true, true, false)
        return this;
    }
}
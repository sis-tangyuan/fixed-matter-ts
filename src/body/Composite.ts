import Decimal from "decimal.js";
import { Vector } from "..";
import Constraint from "../constraint/Constraint";
import { Common } from "../core/Common";
import Events, {IEvent} from "../core/Events";
import Bounds from "../geometry/Bounds";
import Body from "./Body";

export interface CompositeCache {
    allBodies: Body[];
    allConstraints: Constraint[];
    allComposites: Composite[];
}

export interface CompositeOpt {
    label?: string;
}

export default class Composite implements IEvent {

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

    events?: Map<string, Function[]>

    static create(options?: CompositeOpt): Composite {
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

    add(object: any): Composite {
        var objects: any[] = [];
        objects = objects.concat(object);

        Events.trigger(this, 'beforeAdd', {object: object});

        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];

            switch(obj.type) {
                case 'body':
                    if (obj.parent != obj) {
                        Common.warn('Composite.add: skipped adding a compound body part (you must add its parent instead)');
                        break;
                    }
                    this.addBody(obj)
                    break;

                case 'constraint':
                    this.addConstraint(obj);
                    break;
                case 'composite':
                    this.addComposite(obj);
                    break;
                case 'mouseConstraint':
                    this.addConstraint(obj.constraint);
                    break;

            }
        }

        Events.trigger(this, 'afterAdd', { object: object });

        return this;
    }

    remove(object: any, deep: boolean = false): Composite {
        var objects: any[] = [].concat(object);

        Events.trigger(this, 'beforeRemove', { object: object });

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];

            switch (obj.type) {

            case 'body':
                this.removeBody(obj, deep);
                break;
            case 'constraint':
                this.removeConstraint(obj, deep);
                break;
            case 'composite':
                this.removeComposite(obj, deep);
                break;
            case 'mouseConstraint':
                this.removeConstraint(obj.constraint);
                break;

            }
        }

        Events.trigger(this, 'afterRemove', { object: object });

        return this;
    };

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

    removeConstraint(constraint: Constraint, deep: boolean = false): Composite {
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

    allBodies(): Body[] {
        if (this.cache && this.cache.allBodies) {
            return this.cache.allBodies;
        }
        let bodies: Body[] = [];
        bodies = bodies.concat(this.bodies)

        for(let i = 0; i < this.composites.length; i++) {
            bodies = bodies.concat(this.composites[i].allBodies());
        }

        if (this.cache) {
            this.cache.allBodies = bodies;
        }

        return bodies
    }

    allConstraints(): Constraint[] {
        if (this.cache && this.cache.allConstraints) {
            return this.cache.allConstraints;
        }

        var constraints: Constraint[] = [];
        constraints = constraints.concat(this.constraints);

        for (var i = 0; i < this.composites.length; i++)
            constraints = constraints.concat(this.composites[i].allConstraints());

        if (this.cache) {
            this.cache.allConstraints = constraints;
        }

        return constraints;
    }

    allComposites(): Composite[] {
        if (this.cache && this.cache.allComposites) {
            return this.cache.allComposites;
        }

        var composites: Composite[] = [];
        composites = composites.concat(this.composites);

        for (var i = 0; i < this.composites.length; i++)
            composites = composites.concat(this.composites[i].allComposites());

        if (this.cache) {
            this.cache.allComposites = composites;
        }

        return composites;
    };

    get(id: number, type: string): any {
        var objects: any[] = [],
            object;

        switch (type) {
        case 'body':
            objects = this.allBodies();
            break;
        case 'constraint':
            objects = this.allConstraints();
            break;
        case 'composite':
            objects = this.allComposites().concat(this);
            break;
        }

        // if (!objects)
        //     return null;

        object = objects.filter(function(object: any) { 
            return object.id.toString() === id.toString(); 
        });

        return object.length === 0 ? null : object[0];
    }

    move(objects: any, compositeB: Composite): Composite {
        this.remove(objects);
        compositeB.add(objects);
        return this;
    }

    rebase(): Composite {
        var objects: any[] = this.allBodies();
        objects = objects.concat(this.allConstraints())
        objects = objects.concat(this.allComposites());

        for (var i = 0; i < objects.length; i++) {
            objects[i].id = Common.nextId();
        }

        return this;
    }

    translate(translation: Vector, recursive: boolean = true): Composite {
        var bodies = recursive ? this.allBodies() : this.bodies;

        for (var i = 0; i < bodies.length; i++) {
            bodies[i].translate(translation);
        }

        return this;
    }

    rotate(rotation: Decimal, point: Vector, recursive: boolean = true): Composite {
        var cos = rotation.cos(),
            sin = rotation.sin(),
            bodies = recursive ? this.allBodies() : this.bodies;

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                dx = body.position.x.sub(point.x),
                dy = body.position.y.sub(point.y);
                
            body.setPosition(new Vector(
                point.x.add(dx.mul(cos).sub(dy.mul(sin))),
                point.y.add(dx.mul(sin).add(dy.mul(cos)))
            ));

            body.rotate(rotation);
        }

        return this;
    };

    scale(scaleX: Decimal, scaleY: Decimal, point: Vector, recursive: boolean = true): Composite {
        var bodies = recursive ? this.allBodies() : this.bodies;

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                dx = body.position.x.sub(point.x),
                dy = body.position.y.sub(point.y);
                
                body.setPosition(new Vector(
                    point.x.add(dx.mul(scaleX)),
                    point.y.add(dy.mul(scaleY))
                ));

            body.scale(scaleX, scaleY);
        }

        return this;
    }

    bounds(): Bounds {
        var bodies = this.allBodies(),
            vertices = [];

        for (var i = 0; i < bodies.length; i += 1) {
            var body = bodies[i];
            vertices.push(body.bounds.min, body.bounds.max);
        }

        return Bounds.create(vertices);
    };
}
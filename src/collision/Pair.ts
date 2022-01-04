import Decimal from "decimal.js";
import Body from "../body/Body";
import { Common } from "../core/Common";
import MathUtil from "../math/MathUtil";
import Collision from "./Collision";
import Contact from "./Contact";

export default class Pair {
    id: string;
    bodyA: Body;
    bodyB: Body;
    collision: Collision;
    contacts: Contact[];
    activeContacts: Contact[];
    separation: Decimal
    isActive: boolean
    confirmedActive: boolean
    isSensor: boolean
    timeCreated: Decimal
    timeUpdateed: Decimal
    inverseMass: Decimal
    friction: Decimal
    frictionStatic: Decimal
    restitution: Decimal
    slop: Decimal

    constructor(collision: Collision, timestamp: Decimal) {
        const bodyA = collision.bodyA,
            bodyB = collision.bodyB;
        this.id = Pair.genID(bodyA, bodyB);
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.collision = collision;
        this.contacts = [];
        this.activeContacts = [];
        this.separation = MathUtil.ZERO;
        this.isActive = true;
        this.confirmedActive = true;
        this.isSensor = bodyA.isSensor || bodyB.isSensor;
        this.timeCreated = timestamp.add(MathUtil.ZERO);
        this.timeUpdateed = timestamp.add(MathUtil.ZERO)
        this.inverseMass = MathUtil.ZERO;
        this.friction = MathUtil.ZERO;
        this.frictionStatic = MathUtil.ZERO;
        this.restitution = MathUtil.ZERO;
        this.slop = MathUtil.ZERO;
    }

    static create(collission: Collision, timestamp: Decimal): Pair {
        const pair = new Pair(collission, timestamp) ;
        pair.update(collission, timestamp)
        return pair;
    }

    static genID(bodyA: Body, bodyB: Body) {
        if (bodyA.id < bodyB.id) {
            return "A" + bodyA.id + "B" + bodyB.id;
        } else {
            return "A" + bodyB.id + "B" + bodyA.id;
        }
    }


    update(collission: Collision, timestamp: Decimal) {
        var contacts = this.contacts,
            supports = collission.supports,
            activeContacts = this.activeContacts,
            parentA = collission.parentA,
            parentB = collission.parentB,
            parentAVerticesLength = parentA?.vertices.length
        this.isActive = true
        this.timeUpdateed = timestamp.add(MathUtil.ZERO)
        this.collision = collission
        this.separation = collission.depth
        this.inverseMass = parentA.inverseMass.add(parentB.inverseMass)
        this.friction = parentA.friction.lt(parentB.friction) ? parentA.friction : parentB.friction
        this.frictionStatic = parentA.frictionStatic > parentB.frictionStatic ? parentA.frictionStatic : parentB.frictionStatic;
        this.restitution = parentA.restitution > parentB.restitution ? parentA.restitution : parentB.restitution;
        this.slop = parentA.slop > parentB.slop ? parentA.slop : parentB.slop;

        collission.pair = this;
        activeContacts.length = 0;

        for(let i = 0; i < supports.length; i++) {
            let support = supports[i],
                contactId = support.body === parentA ? support.index : parentAVerticesLength + support.index,
                contact = contacts[contactId]
            if (contact) {
                activeContacts.push(contact)
            } else {
                activeContacts.push(contacts[contactId] = new Contact(support))
            }
        }
    }

    setActive(isActive: boolean, timestamp: Decimal) {
        if (isActive) {
            this.isActive = true;
            this.timeUpdateed = timestamp.add(MathUtil.ZERO)
        } else {
            this.isActive = false;
            this.activeContacts.length = 0;
        }
    }
}
import Decimal from "decimal.js";
import Collision from "./Collision";
import Pair from "./Pair";


export default class Pairs {
    table: Map<string, Pair> = new Map();

    list: Pair[] = []

    collisionStart: Pair[] = [];

    collisionActive: Pair[] = [];

    collisionEnd: Pair[] = [];
    
    update(collisions: Collision[], timestamp: Decimal) {
        let pairsList = this.list,
            pairsLength = this.list.length,
            pairsTable = this.table,
            collisionLength = collisions.length,
            collisionStart = this.collisionStart,
            collisionEnd = this.collisionEnd,
            collisionActive = this.collisionActive,
            collision: Collision,
            pairIndex: number,
            pair: Pair | undefined,
            i: number;
        
        collisionStart.length = 0;
        collisionEnd.length = 0;
        collisionActive.length = 0;


        for(i = 0; i < pairsLength; i++) {
            pairsList[i].confirmedActive = false;
        }

        for (i = 0; i < collisionLength; i++) {
            collision = collisions[i]
            pair = collision.pair
            if (pair) {
                if (pair.isActive) {
                    collisionActive.push(pair)
                } else {
                    collisionStart.push(pair)
                }
                pair.update(collision, timestamp);
                pair.confirmedActive = true;
            } else {
                pair = Pair.create(collision, timestamp);
                pairsTable.set(pair.id, pair)

                collisionStart.push(pair)
                pairsList.push(pair);
            }

        }

        let removePairIndex = [];
        
        for (i = 0; i < pairsList.length; i++) {
            pair = pairsList[i];

            if (!pair.confirmedActive) {
                pair.setActive(false, timestamp);
                collisionEnd.push(pair);

                if (!pair.collision.bodyA.isSleeping && !pair.collision.bodyB.isSleeping) {
                    removePairIndex.push(i);
                }
            }
        }
        for (i = 0; i < removePairIndex.length; i++) {
            pairIndex = removePairIndex[i] - i;
            pair = pairsList[pairIndex];
            pairsList.splice(pairIndex, 1);
            pairsTable.delete(pair.id);
        }
    }

    clear(): Pairs {
        this.table = new Map();
        this.list.length = 0;
        this.collisionStart.length = 0;
        this.collisionActive.length = 0;
        this.collisionEnd.length = 0;
        return this;
    }
}
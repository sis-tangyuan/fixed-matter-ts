import Pair from "./Pair";


export default class Pairs {
    table: Map<string, Pair> = new Map();

    list: Pair[] = []

    collisionStart: Pair[] = [];

    collisionActive: Pair[] = [];

    collisionEnd: Pair[] = [];
    
}
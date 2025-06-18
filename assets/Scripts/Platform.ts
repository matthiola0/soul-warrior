const { ccclass, property } = cc._decorator;

@ccclass
export default class Platform extends cc.Component {

    private moveSpeed: number = 100;
    private moveDuration: number = 5;

    start() {
        this.randomMove();
        this.schedule(this.randomMove, this.moveDuration);
    }

    randomMove() {
        let direction = Math.random() < 0.5 ? 1 : -1;
        let moveAction = cc.moveBy(this.moveDuration, cc.v2(0, direction * this.moveSpeed));
        this.node.runAction(moveAction);
    }
}

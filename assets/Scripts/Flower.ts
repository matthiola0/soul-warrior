import Player from "./Knight";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Enemy extends cc.Component {
    @property(Player)
    player: Player = null;
    private isSchedule: boolean = false;
    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    start() { }
    createJumpAction() {
        let action = cc.sequence(
            cc.moveBy(1.7, 0, 40), 
            cc.delayTime(1.2), 
            cc.moveBy(1.7, 0, -40)
        );
        return action;
    }

    checkPlayerStatus() {
        if (this.player.isDead) {
            var anim = this.getComponent(cc.Animation);
            anim.pause();
            this.node.stopAllActions();
            return true;
        }
        return false;
    }

    update(dt) {
        if (this.checkPlayerStatus()) return;

        if (!this.isSchedule && 600 >this.node.x - cc.find("Canvas/Main Camera").x ) {
            this.isSchedule = true;
            this.schedule(() => {
                this.node.runAction(this.createJumpAction());
            }, 7);
        }
    }
}

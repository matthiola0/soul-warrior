// playerMovement
const {ccclass, property} = cc._decorator;

@ccclass
export default class Knight extends cc.Component {
    private anim = null; //this will use to get animation component
    private animateState = null; //this will use to record animationState

    private fallDown: boolean = false;

    onLoad () {
        this.anim = this.getComponent(cc.Animation);
    }

    start () {
        this.animateState = this.anim.play('knight_attack');
    }

    public playEffect(SE: cc.AudioClip){
        cc.audioEngine.playEffect(SE, false);
    }
}

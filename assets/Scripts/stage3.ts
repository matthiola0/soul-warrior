// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit;
        //cc.director.getPhysicsManager().gravity = cc.v2(0, -20);
    }

    start () {
        this.playBGM();
    }

    public playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    public quit(){
        cc.director.loadScene("stage_select");
    }


    // update (dt) {}
}

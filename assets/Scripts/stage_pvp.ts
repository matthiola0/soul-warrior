// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import Player1 from "./pvp_player1";
import Player2 from "./pvp_player2";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property(Player1)
    player1: Player1 = null;

    @property(Player2)
    player2: Player2 = null;

    @property({type:cc.AudioClip})
    enemyDamage: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    enemyDeath: cc.AudioClip = null;

    @property(cc.Prefab)
    diedPage1: cc.Prefab = null;

    @property(cc.Prefab)
    diedPage2: cc.Prefab = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    // LIFE-CYCLE CALLBACKS:

    update (dt) {
        //console.log(this.player2.attacking);
        this.player1Attack(dt);
        this.player2Attack(dt);
    }

    start () {
        this.playBGM();
    }

    public playEffect(SE: cc.AudioClip){
        cc.audioEngine.playEffect(SE, false);
    }

    public playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    public quit(){
        cc.director.loadScene("start_menu_pvp");
    }

    private player1Attack(dt){
        if(this.player2.node.y >= this.player1.node.y - 60 && this.player2.node.y <= this.player1.node.y + 60){
            if(this.player1.attacking){
                if(this.player1.direct){
                    if(this.player2.node.x <= this.player1.node.x + this.player1.attack_distance*3 && this.player2.node.x >= this.player1.node.x){
                        // this.createBloodEffect()
                        if(this.player2.soul == 1){
                            this.playEffect(this.enemyDeath);
                            this.shakeScreen();
                            this.player2.soul--;
                            var page = cc.instantiate(this.diedPage2);
                            page.setPosition(0, 0);
                            cc.find("Canvas/Main Camera").addChild(page);
            
                            var enterBtnEvent = new cc.Component.EventHandler();
                            enterBtnEvent.target = this.node;
                            enterBtnEvent.component = "stage_pvp";
                            enterBtnEvent.handler = "BackToSelect";
                            page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
                        }
                        else if(this.player2.soul > 1){
                            this.playEffect(this.enemyDamage);
                            this.player2.soul -= this.player1.attack_value;
                            this.player2.node.x += 30;
                        }
                        
                    }
                }
                else{
                    if(this.player2.node.x >= this.player1.node.x - this.player1.attack_distance*3 && this.player2.node.x <= this.player1.node.x){
                        
                        // this.createBloodEffect()
                        if(this.player2.soul == 1){
                            this.playEffect(this.enemyDeath);
                            this.shakeScreen();
                            this.player2.soul--;
                            var page = cc.instantiate(this.diedPage2);
                            page.setPosition(0, 0);
                            cc.find("Canvas/Main Camera").addChild(page);
            
                            var enterBtnEvent = new cc.Component.EventHandler();
                            enterBtnEvent.target = this.node;
                            enterBtnEvent.component = "stage_pvp";
                            enterBtnEvent.handler = "BackToSelect";
                            page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
                        }
                        else if(this.player2.soul > 1){
                            this.playEffect(this.enemyDamage);
                            this.player2.soul -= this.player1.attack_value;
                            this.player2.node.x -= 30;
                        }
                    }
                }
            }
        }
        
    }

    private player2Attack(dt){
        if(this.player1.node.y >= this.player2.node.y - 60 && this.player1.node.y <= this.player2.node.y + 60){
            if(this.player2.attacking){
                if(this.player2.direct){
                    if(this.player1.node.x <= this.player2.node.x + this.player2.attack_distance*3 && this.player1.node.x >= this.player2.node.x){
                        
                        // this.createBloodEffect()
                        if(this.player1.soul == 1){
                            this.playEffect(this.enemyDeath);
                            this.shakeScreen();
                            this.player1.soul--;
                            var page = cc.instantiate(this.diedPage1);
                            page.setPosition(0, 0);
                            cc.find("Canvas/Main Camera").addChild(page);
            
                            var enterBtnEvent = new cc.Component.EventHandler();
                            enterBtnEvent.target = this.node;
                            enterBtnEvent.component = "stage_pvp";
                            enterBtnEvent.handler = "BackToSelect";
                            page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
                        }
                        else if(this.player1.soul > 1){
                            this.playEffect(this.enemyDamage);
                            this.player1.soul -= this.player2.attack_value;
                            this.player1.node.x += 30;
                        }                        
                    }
                }
                else{
                    if(this.player1.node.x >= this.player2.node.x - this.player2.attack_distance*3 && this.player1.node.x <= this.player2.node.x){
                        this.playEffect(this.enemyDamage);
                        // this.createBloodEffect()
                        if(this.player1.soul == 1){
                            this.playEffect(this.enemyDeath);
                            this.shakeScreen();
                            this.player1.soul--;
                            var page = cc.instantiate(this.diedPage1);
                            page.setPosition(0, 0);
                            cc.find("Canvas/Main Camera").addChild(page);
            
                            var enterBtnEvent = new cc.Component.EventHandler();
                            enterBtnEvent.target = this.node;
                            enterBtnEvent.component = "stage_pvp";
                            enterBtnEvent.handler = "BackToSelect";
                            page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
                        }
                        else if(this.player1.soul > 1){
                            this.playEffect(this.enemyDamage);
                            this.player1.soul -= this.player2.attack_value;
                            this.player1.node.x -= 30;
                        }
                    }
                }
            }
        }
        
    }

    shakeScreen() {
        let shake = cc.tween().by(0.05, { position: cc.v3(10, 10) })
            .by(0.05, { position: cc.v3(-20, -20) })
            .by(0.05, { position: cc.v3(20, 20) })
            .by(0.05, { position: cc.v3(-10, -10) });
        cc.tween(cc.Camera.main.node).then(shake).start();
    }

    public BackToSelect(event, nodeName){
        this.playEffect(this.click);
        cc.director.loadScene("start_menu_pvp");
    }
}

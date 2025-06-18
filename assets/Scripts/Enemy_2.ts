import Player from "./Knight";
const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
    
    private anim = null;
    @property(Player)
    player: Player = null;
    private die: boolean = false;
    private turtle_state: number = 1;
    private enemySpeed: number = -100;
    private enemyhealth: number = 11;
    private ifattack: boolean = false;
    bloodEffectPrefab: cc.Prefab = null;

    @property
    x: number = 0;

    //goomba的y座標位置
    @property
    y: number = 0;

    @property({type:cc.AudioClip})
    enemyDamage: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    enemyDeath: cc.AudioClip = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled=true;
        this.anim = this.getComponent(cc.Animation);
    }

    update(dt) {
        this.playerAttack(dt);
        //console.log("health : " + this.enemyhealth);
        //console.log(this.node.x, this.node.y);
        //console.log(this.player.node.x, this.player.node.y);
    }

    start() {
        /*
        if("Goomba" === this.node.name  ) {
            this.schedule(() =>  { this.node.scaleX =- this.node.scaleX;}, 0.1);
        }
        */
        this.node.setPosition(this.x, this.y);
        this.goombaMove();
    }

    onBeginContact(contact, self, other) {
        console.log("tag : " + other.tag);
        switch (other.tag) {
            case 20: // 子彈的tag為20
                this.handleBulletCollision();
                break;
        }
    }

    public playEffect(SE: cc.AudioClip){
        cc.audioEngine.playEffect(SE, false);
    }

    public goombaMove(){

        //讓goomba在1.5秒內在x軸移動100單位
        var action = cc.sequence(cc.moveBy(3, 200, 0), cc.moveBy(3, -200, 0)).repeatForever();

        //設定延遲時間
        var delayTime = Math.random()*3;

        //每次只執行一次
        this.scheduleOnce(() => {
            this.node.runAction(action);

             //經過延遲時間才執行下一個
        }, delayTime);
        this.schedule(() => {
            this.node.scaleX = -this.node.scaleX;
        }, 0.1);
    }

    private playerAttack(dt){
        if(this.node.y >= this.player.node.y - 60 && this.node.y <= this.player.node.y + 60){
            if(this.player.attacking){
                if(this.player.direct){
                    if(this.node.x <= this.player.node.x + this.player.attack_distance*3 && this.node.x >= this.player.node.x){
                        this.playEffect(this.enemyDamage);
                        // this.createBloodEffect()
                        this.enemyhealth -= this.player.attack_value;
                        this.node.x += 30;
                        this.enemylife();
                    }
                }
                else{
                    if(this.node.x >= this.player.node.x - this.player.attack_distance*3 && this.node.x <= this.player.node.x){
                        this.playEffect(this.enemyDamage);
                        // this.createBloodEffect()
                        this.enemyhealth -= this.player.attack_value;
                        this.node.x -= 30;
                        this.enemylife();
                    }
                }
            }
        }
        
    }
    
    private enemylife(){
        if(this.enemyhealth <= 0){
            this.player.getScore(100);
            this.player.getCoin(10);
            this.player.getSoul(1);
            this.playEffect(this.enemyDeath);
            this.node.destroy();
        }
    }

    handleBulletCollision() {
        this.enemyhealth -= this.player.attack_value;
        this.playEffect(this.enemyDamage);
        cc.log("hit by bullet");
        this.enemylife();
    }
    
    createBloodEffect() {
        let bloodEffect = cc.instantiate(this.bloodEffectPrefab);
        bloodEffect.position = this.node.position;
        this.node.parent.addChild(bloodEffect);
    
        // 停止粒子系统
        this.scheduleOnce(() => {
            let particleSystem = bloodEffect.getComponent(cc.ParticleSystem);
            if (particleSystem) {
                particleSystem.stopSystem();
            }
        }, 0.5);  // 在秒后停止粒子系统
    
        // 销毁血液效果节点
        this.scheduleOnce(() => {
            bloodEffect.destroy();
        }, 0.5);  // 在秒后销毁节点
    }
    /*
    checkNodeDestroy() {
        if(this.node.x - cc.find("Canvas/Main Camera").x > 480 || this.node.x - cc.find("Canvas/Main Camera").x < -480 || this.node.y - cc.find("Canvas/Main Camera").y > 320 || this.node.y - cc.find("Canvas/Main Camera").y < -320)
            this.node.destroy();
    }

    update(dt) {
        const mainCameraNode = cc.find("Canvas/Main Camera");
        console.log("enemy speed : " + this.enemySpeed);

        if (2!==this.turtle_state && !this.die && !this.player.isDead && !this.player.isPause) {
            if (300!==this.node.x ) {
                const cameraOffset = this.node.x - mainCameraNode.x;
                if (800>cameraOffset ) {
                    this.node.x += this.enemySpeed * dt;
                }
            }
        }
        if(this.turtle_state === 3) {
            this.checkNodeDestroy();
        }
    }
    
    onBeginContact(contact, self, other) {
        console.log("tag : " + other);
        switch(other.tag) {
            case 0:
            case 1:
                this.handleBoundCollision(contact);
                break;
            case 10:
                this.handlePlayerCollision(contact, self, other);
                break;
            case 4:
            case 5:
                this.handleOtherCollision(contact, other);
                break;
            default:
                if(other.tag != 3) contact.disabled = true;
        }
    }

    handleBoundCollision(contact) {//碰到邊界
        if(-1==contact.getWorldManifold().normal.x && -0==contact.getWorldManifold().normal.y) { 
            
            this.enemySpeed = -this.enemySpeed;
            this.node.scaleX = -3;
        }
        else if(-0 == contact.getWorldManifold().normal.y && 1==contact.getWorldManifold().normal.x) { 
            
            this.enemySpeed = -this.enemySpeed;
            this.node.scaleX = 3;
        }
    }

    handlePlayerCollision(contact, self, other) {
        const normal = contact.getWorldManifold().normal;

        if (this.player.isDead || this.player.isStrong || this.die) {
            contact.disabled = true;
            return;
        }

        switch (this.node.name) {
            case "Goomba":
                this.handleGoombaCollision(normal, self);
                break;
            default:
                this.handleTurtleCollision(normal, self, other);
        }
    }

    handleGoombaCollision(normal, self) {
        if (normal.x === 0 && normal.y === 1) {
            this.die = true;
            // this.anim.play("goomba_die");
            // this.player.stompEnemy_100(self);
            self.node.destroy(); 
        } else {
            this.player.decrease();
        }
    }

    handleTurtleCollision(normal, self, other) {
        if (normal.x === 0 && normal.y === 1) {
            switch (this.turtle_state) {
                case 1:
                    this.turtle_state = 2;
                    this.anim.play("turtle_shrink");
                    this.player.stompEnemy_100(self);
                    break;
                case 3:
                    this.turtle_state = 2;
                    this.anim.play("turtle_shrink");
                    // this.player.jump();
                    break;
                default:
                    break;
            }
        } else {
            if (this.turtle_state === 2) {
                this.kickTurtle(self, other);
            } else {
                this.player.decrease();
            }
        }
    }

    kickTurtle(self, other) {
        if (self.node.x <= other.node.x) { 
            this.enemySpeed = -500;
        } else if (self.node.x > other.node.x) {
            this.enemySpeed = 500;
        }

        this.turtle_state = 3;
        //播放动画
        this.anim.play("turtle_shrink_move");
        this.player.playEffect(this.player.kickSound);
        //播放音效
        this.player.jump();
    }

    
    handleOtherCollision(contact, other) {
        if(this.turtle_state == 3) {
            this.player.enemyDie_100(other);
            other.node.destroy();
        }
        else {
            contact.disabled = true;
        }
    }
*/
   
}

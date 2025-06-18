import Player from "./Knight";
import Bullet from "./Bullet";
const {ccclass, property} = cc._decorator;

@ccclass
export default class Boss2 extends cc.Component {

    @property(Player)
    player: Player = null;

    @property(cc.Prefab)
    warningLinesPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    bombPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    bloodEffectPrefab: cc.Prefab = null;
    private isDashing: boolean = false;
    private dashCooldown: number = 4.0;
    private enemyhealth: number = 50; // Boss血量
    private die: boolean = false;
    private speed: number = 100;
    private jumpHeight: number = 200;
    private jumpDuration: number = 2;
    private attackDamage: number = 1;
    private isJumping: boolean = false;
    public anim = null;

    @property({type:cc.AudioClip})
    enemyDamage: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    enemyDeath: cc.AudioClip = null;

    @property(cc.Prefab)
    victoryPage: cc.Prefab = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;
        // this.schedule(this.doJump, this.jumpDuration); // Boss每2秒跳一次
        this.anim = this.getComponent(cc.Animation);
    }

    doJump() {
        if (!this.die && !this.isJumping) {
            this.isJumping = true;
            // 跳躍動作
            let jumpUp = cc.tween().by(this.jumpDuration / 2, {y: this.jumpHeight}, {easing: 'sineOut'});
            let jumpDown = cc.tween().by(this.jumpDuration / 2, {y: -this.jumpHeight}, {easing: 'sineIn'});
            let seq = cc.tween().sequence(jumpUp, jumpDown);
            cc.tween(this.node).then(seq).call(() => { this.isJumping = false; }).start();
        }
    }

    update(dt) {
        if (!this.die && !this.player.isDead) {
            // let direction = this.player.node.position.sub(this.node.position).normalize();
            // this.node.position = this.node.position.add(direction.mul(this.speed * dt));
            if(!this.isDashing){
                this.boss2Attack();
            }
            // this.boss2Attack();
            // 计算Boss与玩家之间的距离
            // let distance = this.node.position.sub(this.player.node.position).mag();
            // if (distance < 300 && !this.isDashing) {
            //     // 如果玩家离Boss太近，那么Boss就发动攻击
            //     this.boss2Attack();
            // }
        }
    }

    public playEffect(SE: cc.AudioClip){
        cc.audioEngine.playEffect(SE, false);
    }

    boss2Attack() {
        this.isDashing = true;
        let warningLines = cc.instantiate(this.warningLinesPrefab);
        let bomb = cc.instantiate(this.bombPrefab);
        
        warningLines.position = this.player.node.position;
        bomb.position = this.player.node.position;

        this.node.parent.addChild(warningLines);
        

        cc.tween(this.node)
            // .to(speed, { position: targetPosition })
            .call(() => {
                
                //开始计时，冷却时间结束后再将isDashing设为false
                // this.node.parent.addChild(bomb);
                this.scheduleOnce(() => { this.isDashing = false,warningLines.destroy(),this.node.parent.addChild(bomb); }, this.dashCooldown);
                // bomb.destroy();
                // 在冲锋结束后，播放boss1_attack动画
                // this.anim.play('boss1_attack');
            })
            .start();
    }
    


    
    onBeginContact(contact, self, other) {
        switch (other.tag) {
            case 10: // 玩家的tag為10
                this.handlePlayerCollision(contact);
                break;
            case 20: // 子彈的tag為20
                this.handleBulletCollision();
                break;
        }
    }

    // 當Boss受到攻擊時，產生噴血效果
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
    

    // 當Boss死亡時，震動畫面
    shakeScreen() {
        let shake = cc.tween().by(0.05, { position: cc.v3(10, 10) })
            .by(0.05, { position: cc.v3(-20, -20) })
            .by(0.05, { position: cc.v3(20, 20) })
            .by(0.05, { position: cc.v3(-10, -10) });
        cc.tween(cc.Camera.main.node).then(shake).start();
    }

    public BackToSelect(event, nodeName){
        cc.audioEngine.stopMusic();
        this.playEffect(this.click);
        cc.director.loadScene("video_2");
    }

    handlePlayerCollision(contact) {
        const normal = contact.getWorldManifold().normal;
        // 
        cc.log(this.player.isAttacking)
        if (this.player.isAttacking) {
            this.enemyhealth -= this.player.attack_value;
            this.playEffect(this.enemyDamage);
            this.createBloodEffect();
            cc.log("hit by player");
            if (this.enemyhealth <= 0) {
                this.die = true;
                this.playEffect(this.enemyDeath);
                this.player.getScore(1000);
                this.player.getCoin(100);
                this.shakeScreen();
                this.player.update_rank();

                var page = cc.instantiate(this.victoryPage);
                page.setPosition(0, 0);
                cc.find("Canvas/Main Camera").addChild(page);

                var enterBtnEvent = new cc.Component.EventHandler();
                enterBtnEvent.target = this.node;
                enterBtnEvent.component = "Boss2";
                enterBtnEvent.handler = "BackToSelect";
                page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);

                //this.node.destroy();
            }
            else {
                // 產生衝擊波震開玩家
                this.pushPlayerAway();
            }
        }

    }

    handleBulletCollision() {
        this.enemyhealth -= this.player.attack_value;
        this.createBloodEffect();
        this.playEffect(this.enemyDamage);
        cc.log("hit by bullet");

        if (this.enemyhealth <= 0) {
            this.die = true;
            this.playEffect(this.enemyDeath);
            this.shakeScreen();
            this.player.getScore(1000);
            this.player.getCoin(100);
            this.player.update_rank();

            var page = cc.instantiate(this.victoryPage);
            page.setPosition(0, 0);
            cc.find("Canvas/Main Camera").addChild(page);

            var enterBtnEvent = new cc.Component.EventHandler();
            enterBtnEvent.target = this.node;
            enterBtnEvent.component = "Boss2";
            enterBtnEvent.handler = "BackToSelect";
            page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);

            //this.node.destroy();
        }
        // else {
        //     // 產生衝擊波震開玩家
        //     this.pushPlayerAway();
        // }
    }


    private playerAnimation()
    {
        // this.node.scaleX = (this.zDown) ? -1 : (this.xDown) ? 1 : this.node.scaleX;
        
        // }
    }

    pushPlayerAway() {
        let direction = this.player.node.position.sub(this.node.position).normalize();
        let distance = 100;  // change this value to control the intensity of the push
    
        let targetPosition = this.player.node.position.add(direction.mul(distance));
        cc.tween(this.player.node)
            .to(0.5, { position: targetPosition })  // change 0.2 to control the speed of the push
            .start();
    }
    

}

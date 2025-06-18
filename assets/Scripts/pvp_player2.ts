
const {ccclass, property} = cc._decorator;

@ccclass
export default class Knight extends cc.Component {
    @property
    x: number = 0;

    @property
    y: number = 0;

    @property(cc.AudioClip)
    walkSE: cc.AudioClip = null;

    @property(cc.AudioClip)
    jumpSE: cc.AudioClip = null;

    @property(cc.AudioClip)
    twojumpSE: cc.AudioClip = null;

    @property(cc.AudioClip)
    attackSE: cc.AudioClip = null;

    @property(cc.Prefab)
    diedPage: cc.Prefab = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    enemyDamage: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    enemyDeath: cc.AudioClip = null;

    @property(cc.Prefab)
    private bulletPrefab: cc.Prefab = null;

    private bulletPool = null;

    private attack_consume: number = 1;
    private shootCooldown: number = 1.5; // 冷却时间（秒）
    private canShoot: boolean = true;
    public anim = null; //this will use to get animation component
    isStrong: boolean = false; 
    public animateState = null; //this will use to record animationState
    private playerSpeed: number = 0;

    private jump_remain: number;
    private jump_tap_time: number = 0;
    public isAttacking :boolean =false;
    private leftDown: boolean = false;          // left
    private rightDown: boolean = false;          // right
    private upDown: boolean = false;          // jump
    private kDown: boolean = false;          // attack
    private jDown: boolean = false;          // shoot

    isDead: boolean = false;
    private onGround: boolean = false;
    isPause: boolean = false;

    public soul: number = 10;
    private max_jump: number = 2;               // 二段跳
    private soul_attack: number = 1;            // 靈魂砲
    public attack_distance: number = 50;        // 攻擊範圍
    public attack_value: number = 1;           // 攻擊傷害
    private speed: number = 300;                  // 移動速度
    
    private justBorn: boolean = false;
    private physicMgr: cc.PhysicsManager = null;
    public direct: boolean = false;
    public attacking: boolean = false;

    onLoad () {
        this.physicMgr = cc.director.getPhysicsManager();
        this.physicMgr.enabled = true;
        this.anim = this.getComponent(cc.Animation);
        this.bulletPool = new cc.NodePool('Bullet');
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        cc.director.getPhysicsManager().enabled = true;

        this.bulletPool = new cc.NodePool('Bullet');

        let maxBulletNum = 5;

        for(let i: number = 0; i < maxBulletNum; i++)
        {
            let bullet = cc.instantiate(this.bulletPrefab);

            this.bulletPool.put(bullet);
        }
    }

    start () {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; 
        clickEventHandler.component = "pvp_player2";
        clickEventHandler.handler = "pause";

        cc.find(`Canvas/Main Camera/pauseBtn`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    pause(){
        if(!this.isPause){
            cc.audioEngine.pauseMusic();
            cc.director.pause();
            this.isPause = true;
        }
        else if(this.isPause){
            cc.director.resume();
            cc.audioEngine.resumeMusic();
            this.isPause = false;
        } 
    }

    update (dt) {
        this.playerMovement(dt);
        this.playerAnimation();
        //this.playerAttack(dt);
        
        //console.log("direct : " + this.direct);

        if (this.soul_attack != 0) {
            if (this.jDown && this.canShoot && this.soul > this.attack_consume) {
                this.animateState = this.anim.play('knight_shoot');
                this.createBullet();
                this.soul--;
                
                // 禁用子弹发射，进入冷却状态
                this.canShoot = false;

                // 冷却时间结束后重新启用子弹发射
                this.scheduleOnce(() => {
                    this.canShoot = true;
                }, this.shootCooldown);
            }
        }

        cc.find("Canvas/Main Camera/soul_num_player2").getComponent(cc.Label).string = String(this.soul);
        if(this.anim.getAnimationState('knight_attack_ingame').isPlaying){
            this.isAttacking = true;
        }
        else{
            this.isAttacking = false;
        }

        if(this.node.y <= -400){
            if(this.soul > 1){
                this.soul--;
                this.playEffect(this.enemyDamage);
                this.node.setPosition(this.x, this.y);

                this.justBorn = true;
                this.physicMgr.enabled = false;
                this.scheduleOnce(this.setJustBornToFalse, 1.5);
            }
            else if(this.soul == 1){
                this.soul--;
                this.playEffect(this.enemyDeath);
                this.shakeScreen();
                var page = cc.instantiate(this.diedPage);
                page.setPosition(0, 0);
                cc.find("Canvas/Main Camera").addChild(page);

                var enterBtnEvent = new cc.Component.EventHandler();
                enterBtnEvent.target = this.node;
                enterBtnEvent.component = "pvp_player2";
                enterBtnEvent.handler = "BackToSelect";
                page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
            }
        }
    }

    public playEffect(SE: cc.AudioClip){
        cc.audioEngine.playEffect(SE, false);
    }

    onKeyDown(event) {
        switch(event.keyCode) {
            case cc.macro.KEY.left:
                this.leftDown = true;
                this.direct = false;
                this.rightDown = false;
                //this.playEffect(this.walkSE);
                break;
            case cc.macro.KEY.right:
                this.rightDown = true;
                this.direct = true;
                this.leftDown = false;
                //this.playEffect(this.walkSE);
                break;
            case cc.macro.KEY.up:
                this.upDown = true;
                this.jump_tap_time++;
                if (!this.onGround && this.jump_remain >= 1) {
                    this.jump_remain--;
                    this.jump();
                }
                break;
            case cc.macro.KEY.k:    
                this.kDown = true;
                // this.isAttacking = true;
                // this.playParticleEffect();
                break;
            case cc.macro.KEY.j:
                this.jDown = true;
                break;
        }
    }

    onKeyUp(event) {
        switch(event.keyCode) {
            case cc.macro.KEY.left:
                this.leftDown = false;
                break;
            case cc.macro.KEY.right:
                this.rightDown = false;
                break;
            case cc.macro.KEY.up:
                this.upDown = false;
                break;
            case cc.macro.KEY.k:    
                this.kDown = false;
                // this.isAttacking = false;
                break;
            case cc.macro.KEY.j:
                this.jDown = false;
                break;
        }
    }

    // private isAttacking

    private createBullet()
    {
        let bullet = null;

        if (this.bulletPool.size() > 0) 
            bullet = this.bulletPool.get(this.bulletPool);

        if(bullet != null)
            bullet.getComponent('Bullet').init(this.node);
    }

    private playerMovement(dt) {
        if(this.onGround) {
            this.jump_remain = this.max_jump;
            this.jump_tap_time = 0;
        }
        if(this.upDown && this.onGround && this.jump_remain >= 1) {
            this.jump_remain--;
            this.playerSpeed = 0;
            this.jump();
        }
        else if(this.leftDown)
            this.playerSpeed = -this.speed;
        else if(this.rightDown)
            this.playerSpeed = this.speed;
        else
            this.playerSpeed = 0;

        this.node.x+=this.playerSpeed*dt;
    }

    private playerAnimation()
    {
        // this.node.scaleX = (this.zDown) ? -1 : (this.xDown) ? 1 : this.node.scaleX;
        this.node.scaleX = (this.leftDown) ? 1 : (this.rightDown) ? -1 : this.node.scaleX;
            if(this.justBorn){
                if(!this.anim.getAnimationState("knight_reborn").isPlaying) this.anim.play("knight_reborn");
            }  
            else if(this.kDown && !this.anim.getAnimationState('knight_attack_ingame').isPlaying){
                this.playEffect(this.attackSE);
                this.attacking = true;
                this.animateState = this.anim.play('knight_attack_ingame');
                // cc.log("py att")
                
            }
            else if(this.anim.getAnimationState('knight_attack_ingame').isPlaying){
                //console.log("attatck playing");
                this.attacking = false;
            }
            else if(this.upDown && this.jump_tap_time == 1 && this.max_jump == 2)
            {   
                if(!this.anim.getAnimationState('knight_du_jump').isPlaying){
                    this.playEffect(this.twojumpSE);
                }
                this.animateState = this.anim.play('knight_du_jump');
                // this.jump();
                //console.log("2jump");
            }
            else if(this.upDown && this.jump_tap_time == 0)
            {
                this.animateState = this.anim.play('knight_jump');
                // this.jump();
            }
            
            else if(this.leftDown || this.rightDown)
            {
                if(this.animateState == null || this.animateState.name != 'knight_walk') // when first call or last animation is not move
                    this.animateState = this.anim.play('knight_walk');
            }
            else
            {
                //if no key is pressed and the player is on ground, stop all animations and go back to idle
                if(this.animateState == null || this.animateState.name != 'knight_idle')
                    this.animateState = this.anim.play('knight_idle');
            }
        // }
    }

    private jump() {
        this.onGround = false;
        this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1200);
        this.playEffect(this.jumpSE);
    }

    enemyDie_100(other) {
        // this.playEffect(this.kickSound);
        let sequence = cc.sequence(
            cc.spawn(cc.moveBy(0.5, 0, 50), cc.fadeOut(0.5)),
            // cc.callFunc(() => {
            //     this.score += 100;
            // })
        );
        // let score = cc.instantiate(this.score100Prefab);
        // score.parent = cc.find("Canvas");
        // score.setPosition(other.node.x, other.node.y+50);

        // score.runAction(sequence);
    }

    stompEnemy_100(other) {
        let destroy = cc.callFunc(function(target) {
            other.node.destroy(); 
        }, this);
        //const score = cc.find("Canvas/Main Camera/score").getComponent(cc.Label);
        // let score = cc.instantiate(this.score100Prefab);
        //score.string = "100";
        // this.playEffect(this.stompSound);
        // score.parent = cc.find("Canvas");
        // score.setPosition(other.node.x, other.node.y+50);
        // this.jump();
        // let add100 = cc.callFunc(function(target) {
        //     this.score += 100;
        // }, this);
        // if(4===other.tag)
        // {
        //     score.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5, 0, 50), cc.fadeOut(0.5)), add100, destroy));
        // }
        // else{
        //     score.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5, 0, 50), cc.fadeOut(0.5)), add100));
        // }
    }

  

    decrease() {
        if(!this.isStrong) {
            // if(this.isPower) {
                let finished = cc.callFunc(function(target) {
                    this.isPause = false;
                    this.node.scaleX *= 3/2;
                    this.getComponent(cc.PhysicsBoxCollider).size.weight = 11.5;
                    this.node.scaleY *= 3/2; 
                    this.getComponent(cc.PhysicsBoxCollider).size.height = 15;
                    this.scheduleOnce(function() {
                        this.isStrong = false;
                    }, 1);
                }, this);
                // this.isPower = false;
                // this.isPause = true;
                this.isStrong = true;
                this.node.runAction(cc.sequence(
                    cc.repeat(cc.sequence(cc.scaleBy(0.2, 20/23),cc.hide(),cc.delayTime(0.1),cc.show()), 3), finished));
        }   
    }

    onBeginContact(contact, self, other) {
        console.log("self : " + self.tag + " tag : " + other.tag);
        if(this.isDead) {
            contact.disabled = true;
            return;
        }

        if(other.tag == 0) {            // ground
            this.onGround = true;
        }
        else if(other.tag == 1) {       //platform
            if (contact.getWorldManifold().normal.y == -1 && contact.getWorldManifold().normal.x == 0) {
                this.onGround = true;
            }
        }
        else if(other.tag == 100) {
            if(this.soul > 1){
                this.soul--;
                this.playEffect(this.enemyDamage);

                this.justBorn = true;
                this.physicMgr.enabled = false;
                this.scheduleOnce(this.setJustBornToFalse, 1.5);
            }
            else if(this.soul == 1){
                this.soul--;
                this.playEffect(this.enemyDeath);
                this.shakeScreen();
                var page = cc.instantiate(this.diedPage);
                page.setPosition(0, 0);
                cc.find("Canvas/Main Camera").addChild(page);

                var enterBtnEvent = new cc.Component.EventHandler();
                enterBtnEvent.target = this.node;
                enterBtnEvent.component = "pvp_player2";
                enterBtnEvent.handler = "BackToSelect";
                page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
            }
        }
    }

    public setJustBornToFalse(){
        this.justBorn = false;
        this.physicMgr.enabled = true;
    }

    public BackToSelect(event, nodeName){
        this.playEffect(this.click);
        cc.director.loadScene("start_menu_pvp");
    }

    shakeScreen() {
        let shake = cc.tween().by(0.05, { position: cc.v3(10, 10) })
            .by(0.05, { position: cc.v3(-20, -20) })
            .by(0.05, { position: cc.v3(20, 20) })
            .by(0.05, { position: cc.v3(-10, -10) });
        cc.tween(cc.Camera.main.node).then(shake).start();
    }
}

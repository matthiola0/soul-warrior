
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

    @property(cc.Node)
    scoreText: cc.Node = null;

    @property(cc.Node)
    coinText: cc.Node = null;

    @property(cc.Node)
    soulText: cc.Node = null;

    @property(cc.Prefab)
    diedPage: cc.Prefab = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    playerDeath: cc.AudioClip = null;

    @property(cc.Prefab)
    private bulletPrefab: cc.Prefab = null;

    private bulletPool = null;

    isStrong: boolean = false; 
    private canShoot: boolean = true;
    private shootCooldown: number = 1.5; // 冷却时间（秒）
    public anim = null; //this will use to get animation component

    public animateState = null; //this will use to record animationState
    private playerSpeed: number = 0;
    private jump_remain: number;
    private jump_tap_time: number = 0;
    public isAttacking :boolean =false;
    private aDown: boolean = false;          // left
    private dDown: boolean = false;          // right
    private wDown: boolean = false;          // jump
    private kDown: boolean = false;          // attack
    private jDown: boolean = false;          // shoot

    isDead: boolean = false;
    private onGround: boolean = false;
    isPause: boolean = false;

    private name: string = "";
    private uid: string = "";
    private score: number;
    private coin: number;
    private soul: number;
    private max_jump: number;               // 二段跳
    private soul_attack: number;            // 靈魂砲
    private max_soul: number;               // 最大生命值
    public attack_distance: number;        // 攻擊範圍
    public attack_value: number;           // 攻擊傷害
    private speed: number;                  // 移動速度

    private cur_stage: number; 

    private init_score: number = 0;
    private init_coin: number = 0;
    private init_soul: number = 8;
    private init_max_jump: number = 1;
    private init_soul_attack: number = 0;
    private init_max_soul: number = 8;
    private init_attack_distance: number = 50;
    private init_attack_value: number = 10;
    private init_speed: number = 300;   
    private attack_consume: number = 2;

    private justBorn: boolean = false;
    private physicMgr: cc.PhysicsManager = null;
    public direct: boolean = false;
    public attacking: boolean = false;

    private timer: number = 0;

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
        
        this.uid = firebase.auth().currentUser.uid;
        const userListRef = firebase.database().ref("userList/" + this.uid);

        userListRef.once("value").then((snapshot) => {
            const userData = snapshot.val();

            if (userData) {
                // 資料存在，從 Firebase 中讀取並指派給對應的變數
                this.coin = userData.coin;
                this.soul = userData.soul;
                this.cur_stage = userData.cur_stage;
                this.max_jump = userData.max_jump;
                this.soul_attack = userData.soul_attack;
                this.max_soul = userData.max_soul;
                this.attack_distance = userData.attack_distance;
                this.attack_value = userData.attack_value;
                this.speed = userData.speed;
                this.name = userData.name;
            } else {
                // 資料不存在，設定預設值並將其寫入 Firebase
                this.initData();

                userListRef.set({
                    coin: this.coin,
                    soul: this.soul,
                    max_jump: this.max_jump,
                    soul_attack: this.soul_attack,
                    max_soul: this.max_soul,
                    attack_distance: this.attack_distance,
                    attack_value: this.attack_value,
                    speed: this.speed
                });
            }
        })
        .catch((error) => {
            // 資料讀取或寫入過程中出現錯誤
            console.error("Firebase data access error:", error);
        });
        //播放攻擊動畫時，isattack為true
        
        this.score = 0;
    }

    initData() {
        this.coin = this.init_coin;
        this.soul = this.init_soul;
        this.max_jump = this.init_max_jump;
        this.soul_attack = this.init_soul_attack;
        this.max_soul = this.init_max_soul;
        this.attack_distance = this.init_attack_distance;
        this.attack_value = this.init_attack_value;
        this.speed = this.init_speed;

        this.score = 0;
    }

    start () {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; 
        clickEventHandler.component = "Knight";
        clickEventHandler.handler = "pause";

        this.schedule(this.updateTimer, 1);
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
                this.minusSoul(this.attack_consume);

                this.animateState = this.anim.play('knight_shoot');
                this.createBullet();
                
                // 禁用子弹发射，进入冷却状态
                this.canShoot = false;

                // 冷却时间结束后重新启用子弹发射
                this.scheduleOnce(() => {
                    this.canShoot = true;
                }, this.shootCooldown);
            }
        }

        cc.find("Canvas/Main Camera/score_num").getComponent(cc.Label).string = String(this.score);
        cc.find("Canvas/Main Camera/coin_num").getComponent(cc.Label).string = String(this.coin);
        cc.find("Canvas/Main Camera/soul_num").getComponent(cc.Label).string = String(this.soul);
        if(this.anim.getAnimationState('knight_attack_ingame').isPlaying){
            this.isAttacking = true;
        }
        else{
            this.isAttacking = false;
        }

        if(this.node.y <= -400){
            if(this.soul > 1){
                this.soul--;
                this.node.setPosition(this.x, this.y);

                this.justBorn = true;
                this.physicMgr.enabled = false;
                this.scheduleOnce(this.setJustBornToFalse, 1.5);
            }
            else if(this.soul == 1){
                this.soul--;
                this.playEffect(this.playerDeath);
                this.shakeScreen();
                var page = cc.instantiate(this.diedPage);
                page.setPosition(0, 0);
                cc.find("Canvas/Main Camera").addChild(page);

                var enterBtnEvent = new cc.Component.EventHandler();
                enterBtnEvent.target = this.node;
                enterBtnEvent.component = "Knight";
                enterBtnEvent.handler = "BackToSelect";
                page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
            }
        }
    }

    public playEffect(SE: cc.AudioClip){
        cc.audioEngine.playEffect(SE, false);
    }

    public minusSoul(soul: number){
        console.log("minus Soul!");

        //firebase的database更新
        firebase.database().ref("userList/"+this.uid+"/soul").once('value', snapShot => {
            this.soul = snapShot.val();
            this.soul -= soul;

            firebase.database().ref("userList/"+this.uid+"/soul").set(this.soul);
        });

        if (this.soul <= 0) {
            cc.log("dead");
            const userListRef = firebase.database().ref("userList/" + this.uid);
            userListRef.once("value").then((snapshot) => {
                this.initData();
                userListRef.set({
                    coin: this.coin,
                    soul: this.soul,
                    max_jump: this.max_jump,
                    soul_attack: this.soul_attack,
                    max_soul: this.max_soul,
                    attack_distance: this.attack_distance,
                    attack_value: this.attack_value,
                    speed: this.speed
                });
            })

        }
    }

    public getSoul(soul: number){
        console.log("Get Soul!");

        //firebase的database更新
        if (this.soul < this.max_soul) {
            firebase.database().ref("userList/"+this.uid+"/soul").once('value', snapShot => {
                this.soul = snapShot.val();
                this.soul += soul;

                firebase.database().ref("userList/"+this.uid+"/soul").set(this.soul);
            });
        }
    }

    public getCoin(coin: number){
        console.log("Get Coin!");

        //firebase的database更新
        firebase.database().ref("userList/"+this.uid+"/coin").once('value', snapShot => {
            this.coin = snapShot.val();
            this.coin += coin;

            firebase.database().ref("userList/"+this.uid+"/coin").set(this.coin);
        });
    }

    public getScore(score: number){
        console.log("Get Coin!");
        
        this.score += score;
    }

    onKeyDown(event) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.aDown = true;
                this.direct = false;
                this.dDown = false;
                //this.playEffect(this.walkSE);
                break;
            case cc.macro.KEY.d:
                this.dDown = true;
                this.direct = true;
                this.aDown = false;
                //this.playEffect(this.walkSE);
                break;
            case cc.macro.KEY.w:
                this.wDown = true;
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
            case cc.macro.KEY.a:
                this.aDown = false;
                break;
            case cc.macro.KEY.d:
                this.dDown = false;
                break;
            case cc.macro.KEY.w:
                this.wDown = false;
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

    public update_rank() {
        var higestScore = 0;

        firebase.database().ref("userList/" + this.uid).once("value").then((snapshot) => {
            const userData = snapshot.val();

            const score1 = userData.score_one;
            const score2 = userData.score_two;
            const score3 = userData.score_three;

            switch (this.cur_stage) {
                case 1:
                    if (this.score > score1) {
                        console.log("cur_stage : " + this.cur_stage);
                        console.log("1");
                        firebase.database().ref("userList/" + this.uid +'/score_one').set(this.score);
                    }
                    break;
                case 2:
                    if (this.score > score2) {
                        console.log("cur_stage : " + this.cur_stage);
                        console.log("2");
                        firebase.database().ref("userList/" + this.uid +'/score_two').set(this.score);
                    }
                    break;
                case 3:
                    if (this.score > score3) {
                        console.log("cur_stage : " + this.cur_stage);
                        console.log("3");
                        firebase.database().ref("userList/" + this.uid +'/score_three').set(this.score);
                    }
                    break;
                default:
                    break;
            }
            higestScore = Math.max(score1, score2, score3, this.score);
        })

        firebase.database().ref('rank/' + this.uid + '/score_highest').once('value').then(snapshot => {
            firebase.database().ref('rank/' + this.uid + '/score_highest').set(higestScore)
        });
    }

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
        if(this.wDown && this.onGround && this.jump_remain >= 1) {
            this.jump_remain--;
            this.playerSpeed = 0;
            this.jump();
        }
        else if(this.aDown)
            this.playerSpeed = -this.speed;
        else if(this.dDown)
            this.playerSpeed = this.speed;
        else
            this.playerSpeed = 0;

        this.node.x+=this.playerSpeed*dt;
        this.cameraMove(dt);
    }

    private cameraMove(dt) {
        var camera_x = cc.find("Canvas/Main Camera").x;
        var camera_y = cc.find("Canvas/Main Camera").y;

        var x_max = cc.find("Canvas/map").width;
        if(this.node.x < 0) cc.find("Canvas/Main Camera").x = 0;
        else if(this.node.x > x_max - 960) cc.find("Canvas/Main Camera").x = x_max - 960;
        else cc.find("Canvas/Main Camera").x = this.node.x;

        var y_max = cc.find("Canvas/map").height;
        if(this.node.y < 0) cc.find("Canvas/Main Camera").y = 0;
        else if(this.node.y > y_max - 640) cc.find("Canvas/Main Camera").y = y_max - 640;
        else cc.find("Canvas/Main Camera").y = this.node.y;
   
    }

    private playerAnimation()
    {
        // this.node.scaleX = (this.zDown) ? -1 : (this.xDown) ? 1 : this.node.scaleX;
        this.node.scaleX = (this.aDown) ? 1 : (this.dDown) ? -1 : this.node.scaleX;
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
            else if(this.wDown && this.jump_tap_time == 1 && this.max_jump == 2)
            {   
                if(!this.anim.getAnimationState('knight_du_jump').isPlaying){
                    this.playEffect(this.twojumpSE);
                }
                this.animateState = this.anim.play('knight_du_jump');
                // this.jump();
                //console.log("2jump");
            }
            else if(this.wDown && this.jump_tap_time == 0)
            {
                this.animateState = this.anim.play('knight_jump');
                // this.jump();
            }
            
            else if(this.aDown || this.dDown)
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

    updateTimer() {
        this.timer += 1;
        let minutes = Math.floor(this.timer / 60);
        let seconds = this.timer % 60;

        cc.find("Canvas/Main Camera/time_num_min").getComponent(cc.Label).string = String(minutes);
        cc.find("Canvas/Main Camera/time_num_sec").getComponent(cc.Label).string = String(seconds);
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
        else if(other.tag == 4) { //goomba
            cc.log("Player hits the goomba");
            if(this.soul > 1){
                this.soul--;

                this.justBorn = true;
                this.physicMgr.enabled = false;
                this.scheduleOnce(this.setJustBornToFalse, 1.5);
            }
            else if(this.soul == 1){
                this.soul--;
                this.playEffect(this.playerDeath);
                this.shakeScreen();
                var page = cc.instantiate(this.diedPage);
                page.setPosition(0, 0);
                cc.find("Canvas/Main Camera").addChild(page);

                var enterBtnEvent = new cc.Component.EventHandler();
                enterBtnEvent.target = this.node;
                enterBtnEvent.component = "Knight";
                enterBtnEvent.handler = "BackToSelect";
                page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
            }
        }
        else if(other.tag == 6 && !this.isAttacking) { //boss
            cc.log("Player hits the boss");
            if(this.soul > 1){
                this.soul--;

                this.justBorn = true;
                this.physicMgr.enabled = false;
                this.scheduleOnce(this.setJustBornToFalse, 1.5);
            }
            else if(this.soul == 1){
                this.soul--;
                this.playEffect(this.playerDeath);
                this.shakeScreen();
                //console.log(this.diedPage);
                
                var page = cc.instantiate(this.diedPage);
                page.setPosition(0, 0);
                cc.find("Canvas/Main Camera").addChild(page);

                var enterBtnEvent = new cc.Component.EventHandler();
                enterBtnEvent.target = this.node;
                enterBtnEvent.component = "Knight";
                enterBtnEvent.handler = "BackToSelect";
                page.getChildByName("New Button").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
            }
        }
        else if(other.tag == 23) { //boss
            cc.log("boss2 hit the player");
            if(this.soul > 1){
                this.soul--;
                cc.moveBy(0.5, 0, 50)
                this.justBorn = true;
                this.physicMgr.enabled = false;
                this.scheduleOnce(this.setJustBornToFalse, 1.5);

            }
            else if(this.soul == 1){
                this.soul--;
                //console.log(this.diedPage);
                
                var page = cc.instantiate(this.diedPage);
                page.setPosition(0, 0);
                cc.find("Canvas/Main Camera").addChild(page);

                var enterBtnEvent = new cc.Component.EventHandler();
                enterBtnEvent.target = this.node;
                enterBtnEvent.component = "Knight";
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
        cc.director.loadScene("stage_select");
    }

    shakeScreen() {
        let shake = cc.tween().by(0.05, { position: cc.v3(10, 10) })
            .by(0.05, { position: cc.v3(-20, -20) })
            .by(0.05, { position: cc.v3(20, 20) })
            .by(0.05, { position: cc.v3(-10, -10) });
        cc.tween(cc.Camera.main.node).then(shake).start();
    }
}

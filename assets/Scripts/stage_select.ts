const {ccclass, property} = cc._decorator;

@ccclass
export default class StageSelect extends cc.Component {

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    private uid: string = "";
    private coin: number;

    private buttonNames: string[] = ["stage1", "stage2", "stage3", "storeBtn"];

    private init_score: number = 0;
    private init_coin: number = 0;
    private init_soul: number = 8;
    private init_max_jump: number = 1;
    private init_soul_attack: number = 0;
    private init_max_soul: number = 8;
    private init_attack_distance: number = 50;
    private init_attack_value: number = 10;
    private init_speed: number = 300;

    private two_jump_cost: number = 100;
    private soul_attack_cost: number = 150;
    private max_soul_cost: number = 100;
    private attack_distance_cost: number = 100;
    private attack_value_cost: number = 100;
    private speed_cost: number = 100;

    onLoad() {
        this.uid = firebase.auth().currentUser.uid;
        firebase.database().ref("userList/" + this.uid + "/coin").once("value").then((snapshot) => {
            this.coin = snapshot.val();
        }).catch((error) => {
            console.error("Firebase data access error:", error);
        });

        const userListRef = firebase.database().ref("userList/" + this.uid);
        userListRef.once("value").then((snapshot) => {
            const userData = snapshot.val();

            const score1 = userData.score_one;
            const score2 = userData.score_two;
            const score3 = userData.score_three;
            
            console.log("score1 : " + score1);

            cc.find("Canvas/background/Stage1_score").getComponent(cc.Label).string = String(score1);
            cc.find("Canvas/background/Stage2_score").getComponent(cc.Label).string = String(score2);
            cc.find("Canvas/background/Stage3_score").getComponent(cc.Label).string = String(score3);
        })

        // firebase.database().ref("userList/"+this.uid+"/coin").once('value', snapShot => {
        //     firebase.database().ref("userList/"+this.uid+"/coin").set(this.coin);
        // });
    }

    start () {
        // cc.audioEngine.playMusic(this.bgm, true);
        this.initButton("returnBtn", "back_select");
        this.initButton("stage1", "stage1_select");
        this.initButton("stage2", "stage2_select");
        this.initButton("stage3", "stage3_select");
        this.initButton("storeBtn", "storeBtn_select"); // 設定storeBtn的事件處理器為toggleStorePage

        this.initStorePageButton("backBtn", "storeBtn_select");
        this.initStorePageButton("two_jump", "two_jump_handle");
        this.initStorePageButton("soul_attack", "soul_attack_handle");
        this.initStorePageButton("max_soul_add", "max_soul_add_handle");
        this.initStorePageButton("attack_distance_add", "attack_distance_add_handle");
        this.initStorePageButton("attack_value_add", "attack_value_add_handle");
        this.initStorePageButton("speed_add", "speed_add_handle");

        this.playBGM();
    }

    update(dt) {
        cc.find("Canvas/storePage/coin_num").getComponent(cc.Label).string = String(this.coin);
    }

    public playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    playEffect(){
        cc.audioEngine.playEffect(this.click, false);
    }

    initButton(buttonName, handlerName) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // This refers to the component where the event handler is being added
        clickEventHandler.component = "stage_select"; // The name of the component script
        clickEventHandler.handler = handlerName; // The function to run when the event is triggered

        // Add the created event handler to the button's click events list
        cc.find(`Canvas/background/${buttonName}`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    initStorePageButton(buttonName, handlerName) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // This refers to the component where the event handler is being added
        clickEventHandler.component = "stage_select"; // The name of the component script
        clickEventHandler.handler = handlerName; // The function to run when the event is triggered

        // Add the created event handler to the button's click events list
        cc.find(`Canvas/storePage/${buttonName}`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    // 依據storePage的狀態，設定按鈕的interactable屬性
    setButtonsInteractable(interactable: boolean) {
        for (let buttonName of this.buttonNames) {
            cc.find(`Canvas/background/${buttonName}`).getComponent(cc.Button).interactable = interactable;
        }
    }

    back_select() {
        this.playEffect();
        cc.director.loadScene("start_menu");
    }

    stage1_select() {
        cc.audioEngine.stopMusic();
        this.playEffect();
        firebase.database().ref("userList/" + this.uid + "/cur_stage").once("value")
        .then((snapshot) => {
            firebase.database().ref("userList/" + this.uid + "/cur_stage").set(1);
        })
        .then(() => {
            setTimeout(() => {
                cc.director.loadScene("video_1");
            }, 1000);  // 1000毫秒 = 1秒
        })
    }

    stage2_select() {
        this.playEffect();
        firebase.database().ref("userList/" + this.uid + "/cur_stage").once("value")
        .then((snapshot) => {
            firebase.database().ref("userList/" + this.uid + "/cur_stage").set(2);
        })
        .then(() => {
            setTimeout(() => {
                cc.director.loadScene("stage2");
            }, 1000);  // 1000毫秒 = 1秒
        })
    }

    stage3_select() {
        this.playEffect();
        firebase.database().ref("userList/" + this.uid + "/cur_stage").once("value")
        .then((snapshot) => {
            firebase.database().ref("userList/" + this.uid + "/cur_stage").set(3);
        })
        .then(() => {
            setTimeout(() => {
                cc.director.loadScene("stage3");
            }, 1000);  // 1000毫秒 = 1秒
        })
    }

    storeBtn_select() {
        this.playEffect();
        var storePage = cc.find("Canvas/storePage");
        storePage.active = !storePage.active; // 切換storePage的active屬性

        this.setButtonsInteractable(!storePage.active);
    }

    two_jump_handle() {
        firebase.database().ref("userList/" + this.uid + "/max_jump").once("value")
        .then((snapshot) => {
        const maxJumpValue = snapshot.val();
        if (maxJumpValue !== 2 && this.coin >= this.two_jump_cost) {
            this.minusCoin(this.two_jump_cost);
            firebase.database().ref("userList/" + this.uid + "/max_jump").set(2);
        }
        })
        .catch((error) => {
            console.error("Firebase data access error:", error);
        });
    }

    soul_attack_handle() {
        firebase.database().ref("userList/" + this.uid + "/soul_attack").once("value")
        .then((snapshot) => {
        if (snapshot.val() == this.init_soul_attack && this.coin >= this.soul_attack_cost) {
            this.minusCoin(this.soul_attack_cost);
            firebase.database().ref("userList/" + this.uid + "/soul_attack").set(1);
        }
        })
        .catch((error) => {
            console.error("Firebase data access error:", error);
        });
    }

    max_soul_add_handle() {
        firebase.database().ref("userList/" + this.uid).once("value")
        .then((snapshot) => {
            const userData = snapshot.val();
            if (this.coin >= this.max_soul_cost) {
            this.minusCoin(this.max_soul_cost);
            const newMaxSoul = userData.max_soul + 1;
            const newSoul = userData.soul + 1;
            firebase.database().ref("userList/" + this.uid).update({
                max_soul: newMaxSoul,
                soul: newSoul
            });
            }
        })
        .catch((error) => {
            console.error("Firebase data access error:", error);
        });
    }

    attack_distance_add_handle() {
        firebase.database().ref("userList/" + this.uid + "/attack_distance").once("value")
        .then((snapshot) => {
        if (snapshot.val() == this.init_attack_distance && this.coin >= this.attack_distance_cost) {
            this.minusCoin(this.attack_distance_cost);
            firebase.database().ref("userList/" + this.uid + "/attack_distance").set(snapshot.val()*1.2);
        }
        })
        .catch((error) => {
            console.error("Firebase data access error:", error);
        });
    }

    attack_value_add_handle() {
        firebase.database().ref("userList/" + this.uid + "/attack_value").once("value")
        .then((snapshot) => {
        if (snapshot.val() == this.init_attack_value && this.coin >= this.attack_value_cost) {
            this.minusCoin(this.attack_value_cost);
            firebase.database().ref("userList/" + this.uid + "/attack_value").set(snapshot.val()*1.2);
        }
        })
        .catch((error) => {
            console.error("Firebase data access error:", error);
        });
    }

    speed_add_handle() {
        firebase.database().ref("userList/" + this.uid + "/speed").once("value")
        .then((snapshot) => {
        if (snapshot.val() == this.init_speed && this.coin >= this.speed_cost) {
            this.minusCoin(this.speed_cost);
            firebase.database().ref("userList/" + this.uid + "/speed").set(snapshot.val()*1.5);
        }
        })
        .catch((error) => {
            console.error("Firebase data access error:", error);
        });
    }

    private minusCoin(coin: number){
        //firebase的database更新
        firebase.database().ref("userList/"+this.uid+"/coin").once('value', snapShot => {
            // this.coin = snapShot.val();
            if (snapShot.val() >= coin) {
                this.coin -= coin;

                firebase.database().ref("userList/"+this.uid+"/coin").set(this.coin);
            }
        });
    }
}

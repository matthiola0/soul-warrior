const {ccclass, property} = cc._decorator;

declare const firebase: any;

@ccclass
export default class Menu extends cc.Component {

    private isPageOn: boolean = false;

    @property(cc.Prefab)
    loginPage: cc.Prefab = null;

    @property(cc.Prefab)
    signupPage: cc.Prefab = null;

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    start () {
        this.playBGM();
    }

    public playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    playEffect(){
        cc.audioEngine.playEffect(this.click, false);
    }
    
    public quitbtn(){
        if(this.isPageOn){
            return;
        }
        this.playEffect();
        this.isPageOn = true;
        cc.game.end();
    }

    public closePage(event, nodeName){
        this.playEffect();
        this.isPageOn = false;
        cc.find("Canvas/"+nodeName).destroy();
    }

    public handlelogin(){
        this.playEffect();
        var emailBox = cc.find("Canvas/loginPage/email").getComponent(cc.EditBox);
        var passwordBox = cc.find("Canvas/loginPage/password").getComponent(cc.EditBox);
        var email = emailBox.string;
        var password = passwordBox.string;
        //console.log(email, password);

        firebase.auth().signInWithEmailAndPassword(email, password).then(e => {
            this.enterGame();
        }).catch(e => {
            alert("Error! "+e.message);
            emailBox.string = "";
            passwordBox.string = "";
        });
    }

    public handleSignUp(){
        this.playEffect();
        var nameBox = cc.find("Canvas/signupPage/username").getComponent(cc.EditBox);
        var emailBox = cc.find("Canvas/signupPage/email").getComponent(cc.EditBox);
        var passwordBox = cc.find("Canvas/signupPage/password").getComponent(cc.EditBox);
        var name = nameBox.string;
        var email = emailBox.string;
        var password = passwordBox.string;
        if(name == ""){
            alert('Error! Must input user name!');
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password).then(e => {
            var uid = firebase.auth().currentUser.uid;
            firebase.database().ref("userList/" + uid).set({
                name: name,
                email: email,
                score_one: 0,
                score_two: 0,
                score_three: 0,
                coin: 0,
                soul: 8,
                max_jump: 1,
                soul_attack: 0,
                max_soul: 8,
                attack_distance: 50,
                attack_value: 10,
                speed: 300
            });
            firebase.database().ref("rank/" + uid).set({
                name: name,
                score_highest: 0,
            });
            this.enterGame();

        }).catch(e => {
            alert("Error! "+e.message);
            nameBox.string = "";
            emailBox.string = "";
            passwordBox.string = "";
        });
    }

    public loginBtn(){
        if(this.isPageOn) return;
        this.isPageOn = true;

        this.playEffect();
        var page = cc.instantiate(this.loginPage);
        page.setPosition(0, 0);
        cc.find("Canvas").addChild(page);

        var closeBtnEvent = new cc.Component.EventHandler();
        closeBtnEvent.target = this.node;
        closeBtnEvent.component = "menu";
        closeBtnEvent.handler = "closePage";
        closeBtnEvent.customEventData = "loginPage";
        page.getChildByName("backBtn").getComponent(cc.Button).clickEvents.push(closeBtnEvent);

        var enterBtnEvent = new cc.Component.EventHandler();
        enterBtnEvent.target = this.node;
        enterBtnEvent.component = "menu";
        enterBtnEvent.handler = "handlelogin";
        page.getChildByName("loginPageBtn").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
    }

    public signUpBtn(){
        if(this.isPageOn) return;
        this.isPageOn = true;
        //console.log("Sign Up!");

        this.playEffect();
        var page = cc.instantiate(this.signupPage);
        page.setPosition(0, 0);
        cc.find("Canvas").addChild(page);

        var closeBtnEvent = new cc.Component.EventHandler();
        closeBtnEvent.target = this.node;
        closeBtnEvent.component = "menu";

        closeBtnEvent.handler = "closePage";
        closeBtnEvent.customEventData = "signupPage";
        page.getChildByName("backBtn").getComponent(cc.Button).clickEvents.push(closeBtnEvent);

        var enterBtnEvent = new cc.Component.EventHandler();
        enterBtnEvent.target = this.node;
        enterBtnEvent.component = "menu";
        enterBtnEvent.handler = "handleSignUp";
        page.getChildByName("signupPageBtn").getComponent(cc.Button).clickEvents.push(enterBtnEvent);
    }

    public enterGame(){
        //alert("login sucess");
        cc.director.loadScene("mode_select");
    }
}
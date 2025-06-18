const {ccclass, property} = cc._decorator;

@ccclass
export default class StartMenu extends cc.Component {

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    @property(cc.Prefab)
    teachPage: cc.Prefab = null;

    private isPageOn: boolean = false;

    start () {
        // cc.audioEngine.playMusic(this.bgm, true);
        //this.initButton("startBtn", "stage_pvp");
        this.initButton("logoutBtn", "logout");
        this.playBGM();
   }

    playEffect(){
        cc.audioEngine.playEffect(this.click, false);
    }

    public playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }
    
    public quitbtn(){
        if(this.isPageOn){
            return;
        }
        this.isPageOn = true;
        this.playEffect();
        cc.director.loadScene("mode_select");
    }

    initButton(buttonName, handlerName) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // This refers to the component where the event handler is being added
        clickEventHandler.component = "start_menu"; // The name of the component script
        clickEventHandler.handler = handlerName; // The function to run when the event is triggered

        // Add the created event handler to the button's click events list
        cc.find(`Canvas/background/${buttonName}`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    stage_select() {
        this.playEffect();
        cc.director.loadScene("stage_select");
    }

    logout() {
        this.playEffect();
        cc.director.loadScene("menu");
    }

    public option() {
        this.playEffect();
        cc.director.loadScene("option_pvp");
    }

    public stage_pvp() {
        this.playEffect();
        cc.director.loadScene("stage_pvp");
    }

    public teach(){
        if(this.isPageOn) return;
        this.isPageOn = true;

        this.playEffect();
        var page = cc.instantiate(this.teachPage);
        page.setPosition(0, 0);
        cc.find("Canvas").addChild(page);

        var closeBtnEvent = new cc.Component.EventHandler();
        closeBtnEvent.target = this.node;
        closeBtnEvent.component = "start_menu_pvp";
        closeBtnEvent.handler = "closePage";
        closeBtnEvent.customEventData = "teachBoard_pvp";
        page.getChildByName("backBtn").getComponent(cc.Button).clickEvents.push(closeBtnEvent);
    }

    public closePage(event, nodeName){
        this.playEffect();
        this.isPageOn = false;
        cc.find("Canvas/"+nodeName).destroy();
    }

    // update (dt) {}
}

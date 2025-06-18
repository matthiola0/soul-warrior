const {ccclass, property} = cc._decorator;

@ccclass
export default class StartMenu extends cc.Component {

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    private isPageOn: boolean = false;

    start () {
        // cc.audioEngine.playMusic(this.bgm, true);
        //this.initButton("singleBtn", "start_menu");
        //this.initButton("logoutBtn", "logout");
   }

    playEffect(){
        cc.audioEngine.playEffect(this.click, false);
    }

    initButton(buttonName, handlerName) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // This refers to the component where the event handler is being added
        clickEventHandler.component = "start_menu"; // The name of the component script
        clickEventHandler.handler = handlerName; // The function to run when the event is triggered

        // Add the created event handler to the button's click events list
        cc.find(`Canvas/background/${buttonName}`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    public start_menu() {
        this.playEffect();
        cc.director.loadScene("start_menu");
    }

    public start_menu_pvp() {
        this.playEffect();
        cc.director.loadScene("start_menu_pvp");
    }

    public logout() {
        this.playEffect();
        cc.director.loadScene("menu");
    }

    // update (dt) {}
}

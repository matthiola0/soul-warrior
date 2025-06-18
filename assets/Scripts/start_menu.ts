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
        this.initButton("startBtn", "stage_select");
        this.initButton("logoutBtn", "logout");
   }

    playEffect(){
        cc.audioEngine.playEffect(this.click, false);
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

    public leaderboard() {
        this.playEffect();
        cc.find("Canvas/background/rank_text").active = true;
        firebase.database().ref('rank/').orderByChild("score_highest").once("value", function (snapshot) {
            // set variables
            var user = [];
            var score = [];
    
            // For each item in the snapshot, push the name and score to respective arrays
            snapshot.forEach(function (item) {
                user.push(item.val().name);
                score.push(item.val().score_highest);
            })
    
            // Reverse the order of the users and scores so highest is first
            user.reverse();
            score.reverse(); 
    
            // For the top 10 (or less if there are less than 10 users), set the rank, user, and score in the UI
            for (var i = 1; i <= 5 && i <= user.length; i++) {
                cc.find("Canvas/background/rank_text/"+String(i)).getComponent(cc.Label).string = String(i);         
                cc.find("Canvas/background/rank_text/user"+String(i)).getComponent(cc.Label).string = user[i-1];     
                cc.find("Canvas/background/rank_text/score"+String(i)).getComponent(cc.Label).string = score[i-1];   
            }
        });
    }

    public leaderboard_back() {
        cc.find("Canvas/background/rank_text").active = false;
    }

    public option() {
        this.playEffect();
        cc.director.loadScene("option");
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
        closeBtnEvent.component = "start_menu";
        closeBtnEvent.handler = "closePage";
        closeBtnEvent.customEventData = "teachBoard";
        page.getChildByName("backBtn").getComponent(cc.Button).clickEvents.push(closeBtnEvent);
    }

    public closePage(event, nodeName){
        this.playEffect();
        this.isPageOn = false;
        cc.find("Canvas/"+nodeName).destroy();
    }

    // update (dt) {}
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class StartMenu extends cc.Component {

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    click: cc.AudioClip = null;

    @property({type:cc.Slider})
    volume: cc.Slider = null;

    start () {

   }

   onLoad(){
       
   }

    playEffect(){
        cc.audioEngine.playEffect(this.click, false);
    }

    public back() {
        this.playEffect();
        cc.director.loadScene("start_menu");
    }

    public change_sound(){
        //console.log(this.volume.progress);
        cc.audioEngine.setMusicVolume(this.volume.progress);
    }

    // update (dt) {}
}

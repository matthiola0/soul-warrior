cc.Class({
    extends: cc.Component,

    properties: {
        graphics: cc.Graphics,
        duration: 3,
    },

    start() {
        // 在start方法中，绘制警告线
        this.graphics.moveTo(-cc.winSize.width / 2, 0);
        this.graphics.lineTo(cc.winSize.width / 2, 0);
        this.graphics.stroke();
        
        this.graphics.moveTo(0, -cc.winSize.height / 2);
        this.graphics.lineTo(0, cc.winSize.height / 2);
        this.graphics.stroke();

        // 设置警告线的持续时间
        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.duration);
    },
});

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    

    start () {
        this.getComponent(cc.Animation).on('stop',function(){
            this.node.destroy();
        },this);  // 这里面on是动画的回调函数. stop表示结束之后开启后面这个函数.后面这个就是消除这个爆炸node节点.

    }

    // update (dt) {}
}

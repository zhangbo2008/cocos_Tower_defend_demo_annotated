// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

// @ts-ignore

const {ccclass, property} = cc._decorator;//这个代码是用于切换关卡时候用的.
@ccclass
export default class NewClass extends cc.Component {

    @property({
        displayName:"当前第几关",
        type:cc.Integer,
    })
    levelNum=1;


    @property(
        {
            displayName:"要隐藏的内容",
            type:cc.Node
        }
        
    )disappearItem:cc.Node=null;

   
  
    // LIFE-CYCLE CALLBACKS:

     onLoad () {

        
     }



    isAvailable : boolean;//是否可进入；
    
   
    start () {
      
    }
    changeToLevel()
    {
       // cc.audioEngine.stopMusic();
        let levelName:string="level";
       //console.log("level name1:"+levelName);
        levelName=levelName+(this.levelNum-1).toString();
       // console.log("level name2:"+levelName);
       
        let temp1=cc.sequence(cc.fadeOut(0.7),cc.callFunc(function(){
            cc.director.loadScene(levelName); //根据名字读取scene. scene文件放哪里都行.都能找到.

        })        ,  cc.callFunc(()=>cc.audioEngine.stopMusic()));
        console.log(111,this.disappearItem)
        this.disappearItem.runAction(temp1);
       this.schedule(this.musicDisappear,0.2,5,0);
        
    }





    musicDisappear() {
        let volume=cc.audioEngine.getMusicVolume()-0.2;
        cc.audioEngine.setMusicVolume(volume);
    }
    update(dt)
    {
    
    }


}

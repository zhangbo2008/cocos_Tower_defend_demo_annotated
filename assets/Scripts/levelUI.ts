//  设置ui界面.  也是每一个scene都对应一个ui.

const {ccclass, property} = cc._decorator;
import introducText from "./introducText"
@ccclass
export default class UI extends cc.Component {

    @property({
        displayName:"关卡等级",
        type:cc.Integer,
    })
    levelNumber:number=1;



    @property({
        displayName:"胜利音效",
        type:cc.AudioClip,
    })
    winMusic:cc.AudioClip=null;


    @property({
        displayName:"失败音效",
        type:cc.AudioClip,
    })
    loseMusic:cc.AudioClip=null;



    @property({
        displayName:"背景音乐",
        type:cc.AudioClip,
    })
    bgm:cc.AudioClip=null;



    @property(
        {
            displayName:"暂停按钮",
            type:cc.Node,
        }
    )
    menuButton:cc.Node=null;



    @property(
        {
            displayName:"胜利",
            type:cc.Node,
        }
    )
    winPanel:cc.Node=null;



    @property(
        {
            displayName:"暂停",
            type:cc.Node,
        }
    )
    pausePanel:cc.Node=null;



    @property(
        {
            displayName:"失败",
            type:cc.Node,
        }
    )losePanel:cc.Node=null;

    @property(
        {
            displayName:"新手引导框",
            type:cc.Node,
        }
    )introductionPanel:cc.Node=null;



    @property({
        displayName:"关卡文字内容",
        type:cc.Node,
    })levelText:cc.Node=null;



    @property({
        displayName:"关卡节点",
        type:cc.Node,
    })level:cc.Node=null;



    levelTextPoint:number=0;


    start () {
        this.openIntroductionPanel();  //显示这个新手指导框.
        this.levelTextPoint=0;
        this.nextText();
       
        cc.director.once("游戏成功",this.openWinMenu,this); //注册事件. once  注册事件目标的特定事件类型回调，回调会在第一时间被触发后删除自身。  在creator.d.ts里面 7059行. 找源码. 点击director找到Director类然后找方法,找不到就找他的父类.然后就找到了这个once方法. 这个once 代码注释里写了,只运行一次.
        cc.director.once("游戏失败",this.openLoseMenu,this);

        this.node.getComponent(cc.AudioSource).loop=true; //循环播放音频.
        this.node.getComponent(cc.AudioSource).clip=this.bgm;
        this.node.getComponent(cc.AudioSource).play();
    }







    openPauseMenu(e)
    {
        cc.director.pause();
       this.pausePanel.active=true;
    }






    closePauseMenu(e)
    {
        cc.director.resume();
        this.pausePanel.active=false;
    }






    openWinMenu()
    {
        this.winPanel.active=true;
        this.node.getComponent(cc.AudioSource).pause();
        this.node.getComponent(cc.AudioSource).clip=this.winMusic;
        this.node.getComponent(cc.AudioSource).loop=false;
        this.node.getComponent(cc.AudioSource).play();

       

    }






     openLoseMenu()
     {
         
         //cc.director.pause();
         this.losePanel.active=true;
         this.node.getComponent(cc.AudioSource).pause();
         this.node.getComponent(cc.AudioSource).clip=this.loseMusic;
         this.node.getComponent(cc.AudioSource).loop=false;
         this.node.getComponent(cc.AudioSource).play();

         
     }




     restart(e,name:string)
     {
         cc.director.resume();
         cc.director.loadScene(name);
     }





     nextText()
     {
        
         let textLength:number=this.levelText.getComponent(introducText).levelText.length;
         if(this.levelTextPoint>=textLength){
             this.closeIntroductionPanel();
             return;
         }
         let nextTextTemp:string=this.levelText.getComponent(introducText).levelText[this.levelTextPoint];
         this.levelTextPoint++;
         //this.levelText.getComponent(cc.RichText).string=nextTextTemp;
         this.levelText.getComponent(cc.Label).string=nextTextTemp;
         
     }






     openIntroductionPanel()
     {
         cc.director.pause();
         this.introductionPanel.active=true;
     }




     closeIntroductionPanel()
     {
         
         this.introductionPanel.active=false;
         cc.director.resume();
     }



     backToMenu()
     {
         cc.director.resume();
         this.loadMenu();
     }




     onDisable()
     {
         
     
     }


     returnToMenu(e)
     {
         
     }




     loadMenu()
     {

        this.level.runAction(cc.fadeOut(0.7));
        let temp1=cc.sequence(cc.fadeOut(0.7),cc.callFunc(function(){
            cc.director.loadScene("chooseLevel");
        }));
        this.node.runAction(temp1);
        
        //this.schedule(this.musicDisappear,0.2,5,0);
     }





     musicDisappear() {
        let volume=cc.audioEngine.getMusicVolume()-0.2;
        cc.audioEngine.setMusicVolume(volume);
    }
     
    
}

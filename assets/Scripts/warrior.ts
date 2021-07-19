 import bullet from "./bullet"
import enemy from "./enemy"
import level from "./level"
// 来看战士脚本的写法.
const {ccclass, property} = cc._decorator;

@ccclass
export default class warrior extends cc.Component {


    @property({
        displayName:"攻击速度",
    })speed:number=1;



    @property({
        displayName:"子弹生命长度",
        tooltip:"子弹可以持续多久消失"
    })
    bulletLife:number=0.7;



    @property({
        displayName:"小怪种类",
        visible:true,
        type:cc.String,
    })
    kind:string[]=["酸","碱"];



    @property({
        tooltip:"对应不同小怪的攻击力",
        displayName:"攻击力",
        visible:true,
        type:cc.Integer,
    })
    power:number[]=[1,2]; //攻击酸是1, 攻击减是2



    @property({
        displayName:"子弹",
        type:cc.Prefab,
    })
    bullet:cc.Prefab=null;



    @property({
        displayName:"攻击频率",
        tooltip:"一秒钟攻击几次",
        type:cc.Integer,
    })
    attackRate=0;



    @property({
        displayName:"攻击范围",
        type:cc.Integer,
    })attackRange=500;



    @property({
        displayName:"攻击次数",
        type:cc.Integer,
    })life=5;




    curLevel:level=null;



    curTarget:cc.Node=null;


    bulletSpeedRate:number=4;


    isLose=false;


    warriorNumber:number=0;


    wholeLife:number=0;


    attack(enemyNode:cc.Node)
    {
        if(enemyNode==null)return;

        //如果进来敌人了.生成子弹
        let realBullet=cc.instantiate(this.bullet);
       
        realBullet.parent=cc.director.getScene();
        realBullet.setSiblingIndex(2);
        realBullet.position=this.node.convertToWorldSpaceAR(cc.Vec3.ZERO);// 得到世界坐标系



        let tempPower:string=enemyNode.getComponent(enemy).attribute;//获得敌人的类型
        let ii=0;


        for(let i=0;i<this.kind.length;i++)
        if(this.kind[i]==tempPower)// 必须相同类型才行.其实warrior的类型表示的是他可以消灭的类型. 比如CaOh.他输出的是酸.
        {
            ii=i;break;
        }


//通过这里面动态修改bullet的属性. 也就是说bullet被warrior控制了.
        realBullet.getComponent(bullet).setPower(this.power[ii]);
        realBullet.getComponent(bullet).setKind(this.kind);
        realBullet.getComponent(bullet).life=this.bulletLife;


        let bulletMoveTime=cc.v2(enemyNode.position.x,enemyNode.position.y).sub(cc.v2(realBullet.position.x,realBullet.position.y)).mag();// 计算bullet运行距离.敌人剪去warrior即可. 得到一个从warrior指向敌人的向量.
        bulletMoveTime=bulletMoveTime/(this.speed*this.bulletSpeedRate); //然后除以酸度即可
        realBullet.runAction(cc.moveTo(bulletMoveTime,enemyNode.position.x,enemyNode.position.y)); //然后runAction播放动画.

    }






    start()
    {
        this.wholeLife=this.life;
        cc.director.once("游戏失败",this.onGameLose,this);//每一个warrior都监控游戏失败
        this.schedule(function(){
            //如果当前是一个关卡,还没有输,剩余生命不是0
            if(this.curLevel!=null&&this.isLose==false&&this.life>0)
            {
                let attackTarget;//那么就开始找目标
                attackTarget=this.curLevel.searchForEnemy(this.node,this.curTarget);
                if(attackTarget!=null)//
                {
                    let flag:number=0;
                    let attribute=attackTarget.getComponent(enemy).attribute;//获取敌人的属性
                    for(let i=0;i<this.kind.length;i++)
                    {
                        if(this.kind[i]==attribute)
                        {
                            flag=1;
                            break;
                        }
                    }//如果匹配.我们就继续.否则flag=0,就什么也不干,等下一个调用.schedule是死循环这里面.
                    if(flag==1)
                    {



                        let startPos=cc.v2(this.node.x,this.node.y);
                    let endPos=cc.v2(attackTarget.x,attackTarget.y);
                    let dis=startPos.sub(endPos).mag();
                    if(attackTarget.active==true&&dis<=this.attackRange)
                    {
                        this.attack(attackTarget);
                        this.life--;
                        this.curLevel.slider[this.warriorNumber].getComponent(cc.ProgressBar).progress-=1.0/this.wholeLife;
                    }





                    }
                    
                   
                }
            }
            
           
        },1/this.attackRate);
        
    }







    onGameLose()
    {
        this.isLose=true;
    }







    update(dt)
    {
        if(this.life<=0)
        {
            this.curLevel.isCreateWarrior[this.warriorNumber]=false;
             this.curLevel.slider[this.warriorNumber].active=false;     
            this.node.destroy();
        }
         
    }








}

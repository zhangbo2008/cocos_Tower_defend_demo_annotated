import enemy from "./enemy"
import warrior from "./warrior"
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
//脚本挂载在level0里面.
//#region 属性面板里赋值的参数
    @property({
        displayName:"放置战士音效",
        type:cc.AudioClip,
    })
    placeMusic:cc.AudioClip=null;



    @property({
        displayName:"战士出生点",
        type:[cc.Node],
        tooltip:"放置战士的位置"
    })
    warriorPoses:cc.Node[]=[];




    @property({
        displayName:"选择战士按钮",
        type:[cc.Node],
        tooltip:"选择战士的按钮位置"
    })
    warriorChoosePoses:cc.Node[]=[];       // 战士展示框.用于购买战士

    
    @property({
        displayName:"战士",
        type:[cc.Prefab],
        tooltip:"战士"
    })
    warriors:cc.Prefab[]=[];





    @property({
        displayName:"取消选中按钮",
        type:cc.Node,
        tooltip:"取消选中战士的按钮",
    })
    notChooseBtn:cc.Node=null; // 就是包含整个游戏的一个框.点到这个框就会取消选中.
    //学习代码时候, 按住这个物品中间的框移动一下.就能看出来了.





    @property({
        displayName:"小怪出生点",
        type:cc.Vec2,
        tooltip:"小怪出生点",
    })
    enemyBirthPlace:cc.Vec2=null;  // 一个二维坐标表示







    @property({
        displayName:"小怪",
        type:[cc.Prefab],
        tooltip:"小怪",
    })
    enemies:cc.Prefab[]=[];  // 小怪的类型数组. 数组里面有几个,代表小怪有几个类型.








    @property({
        displayName:"路线节点",
        type:[cc.Vec2],
        tooltip:"小怪移动路线",
    })
    enemyRoad:cc.Vec2[]=[];





    @property({
        displayName:"UI管理",
        type:cc.Node,
    })
    UIManager:cc.Node=null;






// 修改成上来就是20.
    @property({
        displayName:"部署点数",
        type:cc.Node,
    })moneyNode:cc.Node=null;





    @property({
        displayName:"战士点数列表",
        tooltip:"在本场战斗中出现的战士部署点数，需要按照顺序填写",
        type:cc.Integer,
    })moneyList:number[]=[];

    @property({
        displayName:"小怪顺序",
        tooltip:"小怪出现顺序",
        type:cc.Integer,
    })enemySequence:number[]=[];  // 0,1,2组成的数组, 表示出小怪的对应类型的索引.这个数组里面的数据是在cocos面板上设置好的.

    @property({
        displayName:"战士顺序",
        tooltip:"每一个战士选择框对应prefab中的哪个战士",
        type:cc.Integer,
    })warriorMap:number[]=[];

    @property({
        displayName:"滑动条",
        type:cc.Node,
    })
    slider:cc.Node[]=[];// cocos里面加上property的东西,才会在cocos面板上显示并可以设置数值.

//#endregion

//#region 脚本内赋值的参数

    //当前鼠标选中的战士
    curWarrior:cc.Prefab=null;
   

    //小怪对象池
    enemyPools:Array<cc.NodePool>=[];
    
    //在场上的小怪数组
    enemyQueue:Array<cc.Node>=[];

    //剩余活着的小怪数目
    leftEnemyNum:number=0;

    //战士出生点是否有放置战士
    isCreateWarrior:boolean[]=[];

    //没有被打死的小怪数目
    unKilledEnemyNum:number=0;

    //剩余没生成的小怪个数
    createEnemyNum:number=0;

    //部署点数
    money:number=5;
    

//#endregion

//#region 关卡逻辑部分
     onLoad () {       // =============游戏加载部分.
         //0.开启物理引擎
         cc.director.getPhysicsManager().enabled=true;
         cc.director.getCollisionManager().enabled=true;
         //cc.director.getCollisionManager().enabledDebugDraw=true;
         //cc.director.getCollisionManager().enabledDrawBoundingBox=true;
          //1.生成小怪对象池
          for(let i=0;i<this.enemies.length;i++)
          {
              this.enemyPools[i]=new cc.NodePool();
          }
          this.unKilledEnemyNum=0;
          //console.log(this.unKilledEnemyNum);
          console.log("场景加载到了onLoad");
         
     }







     start () {
//0.按照顺序生成小怪
         let enemyNum=0;
         this.createEnemyNum=0;
         this.leftEnemyNum=0;
         //写一个定时器.
         this.schedule(function(){
             let temp;
                temp=this.createEnemy(this.enemySequence[enemyNum]);//传入需要生成的eney类型编号.给createEnemy函数.
                console.log("create完了一个小怪");
              temp.getComponent(enemy).move(this.enemyRoad);//调用enemy脚本的move方法.
              console.log("取到了这个小怪的脚本");
              enemyNum++;
              this.enemyQueue.push(temp);  //场上的小怪用一个queue来维护.因为我们需要puush的 pop所以适合用queue这个结构,效率高.现在底层还是array就行.后期可以改queue提升效能.
              //console.log("1");
              // this.enemyQueue[enemyNum]=temp;  //感觉这句是废话.跟上一句重复了.
              //console.log("2");
              this.createEnemyNum++;
              //console.log("3");
              this.leftEnemyNum++;
              //console.log("4");
              
         },2,this.enemySequence.length-1,0);  // 2表示2秒触发一次这个函数,也就是生成一个敌人,
         //  第三个参数+1表示运行这个函数总共的次数.  第四个参数表示第一次运行需要的延迟时间.
         //1.注册小怪函数


         cc.director.on("小怪死亡",this.onEnemyKilled,this);  //绑定都用director绑定.这个变量在游戏里面是各个脚本公用的. 用起来最方便.
         cc.director.on("小怪逃跑",this.onEnemyLeft,this);



         //2.战士出生点是否放置战士初始化
         for(let i=0;i<this.warriorPoses.length;i++)
            this.isCreateWarrior[i]=false;



        //3.定时改变部署点数
        this.schedule(function(){ 
            this.money++;

        },1);
//  战士的弹药量都设置为不显示.
        for(let i=0;i<this.slider.length;i++)
        {
            this.slider[i].active=false;
        }
        console.log("场景加载到了start");
    }













    update(dt)
    {
        if(this.unKilledEnemyNum>=3)
        {
            console.log("游戏失败");
            /*
            for(let i=0;i<this.enemyQueue.length;i++)
            if(this.enemyQueue[i]!=null)
            this.enemyQueue[i].active=false;
            */
            cc.director.emit("游戏失败");
            
        }
       //每一帧都检测是否已经游戏成功.
        if(this.createEnemyNum==this.enemySequence.length&&this.leftEnemyNum==0&&this.unKilledEnemyNum<3)
        {
            console.log("游戏成功");
            cc.director.emit("游戏成功");// 发送游戏成功信号.

        }

        //每一帧我们都更新money里面的钱数.
        this.moneyNode.getComponent(cc.Label).string=this.money.toString();
        
    }
    //#endregion







//#region 进入战士选中状态函数 选中屏幕右下角购买塔的按钮.-----这个函数绑定在button上,然后button上面会设置传入传入什么参数给这个函数.
     enterWarriorState(e,customData:number)  //e是传过来的按钮事件.
     {
         let i:number=customData;
      let node1=e.target;  //e.target表示触摸到的东西. 这里面是战士的框,为什么不是战士.因为战士上没有加button事件.所以就不会响应.等价于点到他的父物体上.就是战士框上面.
       this.curWarrior=this.warriors[i]; // 记录一下选中弄的战士是什么,给其他函数用.
//展示框里面都设置白色.  这里面是为了取消之前的选中.为了防止用户连续点2个战士.
       for(let ii=0;ii<this.warriorChoosePoses.length;ii++)
       {

            this.warriorChoosePoses[ii].color=cc.color(255,255,255);
       }
       node1.color=cc.Color.GRAY;//当前节点设置为灰色.
     }  














//#region 取消选中战士状态函数   //地图上套一层空物体,上面设置一个button触发这个函数.这样带你空白地方就等于按了取消按钮.   //战士就是我们的塔.取消选中状态就是颜色换一下就行了.
     exitWarriorState(e)
     {
         //取消的时候,要把全部的框都设置为白色. 这样才是取消的效果.
        for(let ii=0;ii<this.warriorChoosePoses.length;ii++)
        {

             this.warriorChoosePoses[ii].color=cc.color(255,255,255);
        }
        this.curWarrior=null;
     }
     //#endregion










//#region 生成战士函数
     createWarrior(e)
     {
        if(this.curWarrior==null)return;
         let flag:number=0;
        let father=e.target;// 点击塔的底座位置.
        let curCreateWarriorPos=0;
        for(let ii=0;ii<this.warriorPoses.length;ii++)// 遍历所有的塔的底座
        {
            
            
             if(this.warriorPoses[ii]==father)  //如果遍历到的就是点击的底座
             {
                 if(this.isCreateWarrior[ii]==true)  //this.isCreateWarrior 表示当前位置是否有战士.
                 {
                     flag=1;
                 }
                 else curCreateWarriorPos=ii;
             }
        }


        if(flag==1)return;
        let curWarriorNum=0;


        for(let ii=0;ii<this.warriors.length;ii++)
        if(this.curWarrior==this.warriors[ii])
        {
              curWarriorNum=ii;
              break;
        }// 找到当前选中的战士,在战士列表里面的索引.



        if(this.money<this.moneyList[curWarriorNum])return;
        this.money-=this.moneyList[curWarriorNum];
        this.isCreateWarrior[curCreateWarriorPos]=true;
        
         let warriorNode=cc.instantiate(this.curWarrior);
         
         warriorNode.setParent(cc.director.getScene());// 生成战士节点,放入根节点下面.
         //warriorNode.scale=warriorNode.scale/father.scale;
         warriorNode.position=father.position;//设置位置.和siblingindex
         warriorNode.setSiblingIndex(2);//  他的parent是scene. 里面第一个元素是cavas, 第二个元素是level0.所以我们修改第三个元素为我们这个东西.然后其他的东西按照顺序向后排序即可.这么设置的好处是.然战士的层在下面,不影响其他东西的显示. cocos同一级的东西,越下面越强显示.覆盖掉之前层的重叠部分.
         warriorNode.getComponent(warrior).curLevel=this;
         warriorNode.getComponent(warrior).warriorNumber=curCreateWarriorPos;


         this.curWarrior=null;// 让所有战士展示栏背景色为白色
         for(let ii=0;ii<this.warriorChoosePoses.length;ii++)
       {
           
            this.warriorChoosePoses[ii].color=cc.color(255,255,255);  
       }

         //播放放置东西音效.  播放音效需要先赋值给node节点的audioSource组件,然后组件才能播放.
       this.node.getComponent(cc.AudioSource).clip=this.placeMusic;
       this.node.getComponent(cc.AudioSource).play();

//设置弹药slider
       this.slider[curCreateWarriorPos].active=true;//开启显示
       this.slider[curCreateWarriorPos].getComponent(cc.ProgressBar).progress=1;  //当前的进度值是1, 进度值是一个0到1之间的数字. 1表示满弹药

     }












//#region 小怪部分
    createEnemy(i:number)
    {   // i 传入的是怪物类型的编号索引
         let enemyNode:cc.Node=null;
         //if(this.enemyPools[i]==null)return;
         let length=this.enemyPools[i].size();   //所以第几类的怪物我们就让他放入enemyPools里面第几个数组里面.
         if(length>0)
         {
             enemyNode=this.enemyPools[i].get();//如果池子中已经有了,那么我们就直接get就用了. pool底层应该是要给queue实现的.
         }
         else{
             enemyNode=cc.instantiate(this.enemies[i]);  //如果没有那么我们就用instantiate,从prefab变出来对象.
         }
         //console.log("生成了小怪"+i);
         if(enemyNode!=null)
         console.log(enemyNode.name);
         else console.log("null");
         enemyNode.active=true;
         console.log("active");
         let temppp=cc.director.getScene(); //获取当前场景,也就是当前关卡的根节点.
         console.log("scene");
         enemyNode.parent=temppp;
         console.log("parent");
         enemyNode.setSiblingIndex(2);  //setSiblingIndex函数是设置同级父节点下的子节点顺序
         console.log("sibling");
         enemyNode.position=new cc.Vec3(this.enemyBirthPlace.x,this.enemyBirthPlace.y,0);//放到初始位置.
        // this.enemyBirthPlace;
         console.log("i:"+i+"position:"+enemyNode.position);
         return enemyNode;
    }










    onEnemyKilled()
    {
        this.leftEnemyNum--;
        
    }

    onEnemyLeft()
    {

        this.unKilledEnemyNum=this.unKilledEnemyNum+1;
    }
//#endregion








//#region 战士寻找攻击的小怪AI


    searchForEnemy(warriorPos:cc.Node,curTarget:cc.Node)// 传入2个node, 一个是战士位置.一个是当前被塔攻击的敌人.
    {
        if(curTarget!=null)
        {
            let startPos=cc.v2(curTarget.x,curTarget.y);
            let endPos=cc.v2(warriorPos.x,warriorPos.y);
            let dis=startPos.sub(endPos).mag();  //mag 算大小.
            if(dis<=400)//如果距离还没超过400,我们就继续打他,如果超过400我们下面就找一个目标然后打他
            return curTarget;
        }
        if(this.leftEnemyNum<=0)return null;
        if(this.enemyQueue.length<=0)return null;
        let minLength:number=100000;
        let ii=0;
        for(let i=0;i<this.enemyQueue.length;i++)// 找到距离炮塔最近的敌人.然后开炮.
        {
            if(this.enemyQueue[i]==null)continue;
            if(this.enemyQueue[i].active==false)continue;
            let startPos=cc.v2(this.enemyQueue[i].x,this.enemyQueue[i].y);
            let endPos=cc.v2(warriorPos.x,warriorPos.y);
            let dis=startPos.sub(endPos).mag();
            if(dis<minLength)
            {
                minLength=dis;
                ii=i;
            }
        }




        return this.enemyQueue[ii];//返回敌人的引用.
    }















//#endregion


}

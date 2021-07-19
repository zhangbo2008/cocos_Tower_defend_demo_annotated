import bullet from "./bullet"
const {ccclass, property} = cc._decorator;


//看敌人模块.

@ccclass
export default class NewClass extends cc.Component {

    hurtMusic:cc.AudioClip=null;  //设置音频
   @property({
       tooltip:"小怪属性,分为酸性，碱性，和重金属离子",
       displayName:"属性",
       type:cc.String,
   })
   attribute:string="酸";
   //设置一个属性




   @property(
       {
           displayName:"速度",
           type:cc.Integer,
       }
   )
   speed:number=100;









   @property(
    {
        type:cc.Integer,
        displayName:"生命",
    }
    )
    life:number=10;






   
    audioComponent:cc.AudioSource[]=[];




   move(points:cc.Vec2[])  //给一个vec2的数组.
   {
        let length=points.length;
        let moveAction:Array<cc.FiniteTimeAction>=new Array<cc.FiniteTimeAction>();
//数组里面存的是一个限定播放时间的动作.也就是move, 并且要多久到.

        for(let i=0;i<length;i++)
        {
            
            let moveTime:number=0;
            if(i==0)
            moveTime=points[0].sub(cc.v2(this.node.position.x,this.node.position.y)).mag();// 移动到第一个点的距离.
            else{
                moveTime=points[i].sub(points[i-1]).mag();
            } //移动到后面每一个点的距离
            moveTime=moveTime/this.speed; //除以速度等于时间
            moveAction.push(cc.moveTo(moveTime,points[i])); // 用这个时间,向下走
        }
        this.node.runAction(cc.sequence(moveAction));// 然后按照顺序运行动画即可.

   }








   die() //每一帧检测是否死亡.
   {
       if(this.life<=0)
       {
            cc.director.emit("小怪死亡");
            this.node.destroy();
       }
       if(this.node.position.y<=-30&&this.life>0)
       {
            cc.director.emit("小怪死亡");//走出了屏幕也就是y小于-30了就触发.
            cc.director.emit("小怪逃跑");
            this.node.destroy();
       }
       

   }







   onCollisionEnter(other, self) //被子弹进入时候的逻辑. other就是子弹
   {
        if(other.node.active==false)return; //子弹是否显示.
        if(other.getComponent(cc.Collider).tag!=1)return;
        let tempKind:string[]=other.getComponent(bullet).kind; //获取子弹的类型
        let flag:number=0;
        for(let i=0;i<tempKind.length;i++)
        {
             if(tempKind[i]==this.attribute)
             {
                 flag=1;break;//子弹必须跟这个类型相同才进行碰撞
             }
        }
        if(flag==0)return;

        // 碰撞开始, 先弄一个boom特效.
        let temp:cc.Node=cc.instantiate(other.getComponent(bullet).boom);
        temp.setParent(cc.director.getScene()); //特效设置好位置.
        temp.setSiblingIndex(this.node.getSiblingIndex()+1);// 放在这个节点的下面.
        temp.position=this.node.position;//位置就是这个节点.

        let bulletPower=other.node.getComponent(bullet).power;//获取他的伤害值
        other.node.destroy();
        this.life-=bulletPower;// 小怪扣血

        this.node.color=cc.Color.RED;//小怪变色.表示被击中了.

        this.schedule(function(){this.node.color=cc.Color.WHITE},1,1,0.2);//然后过段时间变回来白色.

        for(let i=0;i<this.audioComponent.length;i++)//所有audio组件都播放.
        this.audioComponent[i].play();
   }







   onLoad()
   {
   }





    start () {
        this.audioComponent=this.node.getComponents(cc.AudioSource);
    }




     update (dt) {
         this.die();
    }







}

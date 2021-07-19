
// 子弹是一个运动的物体,所以我们需要在上面加刚体和碰撞器.碰撞器用circle 碰撞器.因为我们子弹是一个球.  刚体上设置. bullet , type dynamic
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({
        displayName:"爆炸特效",
        type:cc.Prefab,
    })boom:cc.Prefab=null;
    
    power:number=0;

    life:number=0.6;

    kind:string[]=[];



    setPower(temp:number)
    {
        this.power=temp;
    }



    setKind(temp:string[])
    {
        this.kind=temp;
    }



    start () {

    }



    killSelf()
    {
        this.node.destroy();
    }



     update (dt) {
        this.schedule(this.killSelf,2,1,this.life); //子弹只能飞0.6秒. 每隔2秒调用一次这个函数. 后面的1随便写.因为调用一次这个字典就已经没了.写0也行.
     }





}

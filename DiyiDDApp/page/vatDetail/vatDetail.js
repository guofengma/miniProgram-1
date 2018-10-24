import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
       id:"",//缸id
    },
    onLoad(options){
       var _this = this;
      var id=options.id
      var title=options.title
       // 修改页面标题
      dd.setNavigationBar({
          title:"缸号"+title
      })

      _this.setData({
        id:id,//缸id
      })
      _this.getFlowLog()
    },
     // 预览图片
  previewImage:function(e){
    var dataset=e.currentTarget.dataset
    var index=dataset.index
    var type=dataset.type
    if(type==1){
      var imgSrc=this.data.imgSrc
    }else{
       var imgSrc=dataset.list
    }
    dd.previewImage({
      current: index,
      urls: imgSrc,
    });
  },
     // 获取跟进流水
  getFlowLog:function(){
    var _this = this;
    var id=_this.data.id
    var url=app.globalData.servsers+"/dy/ordersdye/flowLogs"
    var method="get"
    var data={
        "dyeid": id
    }
    DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list=data.list
            list.forEach(item=>{
             var details=item.details
             if(details){
               details=JSON.parse(details)
               item.checkType=details.checkType
               item.isHuixiu=details.isHuixiu
             }
             var createByUserName=item.createByUserName
             if(createByUserName)item.nameFirst=createByUserName.slice(0,1)
            })
            
            _this.setData({
              flowLog:list
            })
          }else{
            exceptionHandle(res.data)
          }
         
        }
    })
  }
})
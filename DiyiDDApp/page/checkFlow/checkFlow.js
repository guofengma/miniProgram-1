import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
       id:"",//缸id
       title:"",//页面标题
       flowList:[],//流程
       isCheck:false,//是否可以验收
       cType:"",//状态
       remarks:"",//备注
       checkType:[
          {value: '1', name: '正常', checked: true  },
          {value: '2', name: '异常', checked: false },
          {value: '3', name: '损坏', checked: false },
       ],
      inputValue:"fiehfueif ",
       imgSrc:[],//图片
       flowLog:[]//跟进流水
    },
    onLoad(options){
      var _this = this;
      var id=options.id
      var title=options.title
      var flowList=JSON.parse(options.flowList)
      // console.log(flowList)
      var nowFlow=""
      var flag = false
      flowList.forEach(item=>{
        if (item.checkType == 0 && !flag) {
          nowFlow = item.flowName
          flag=true
        }
        
      })
      if (!flag) nowFlow="验收"
       // 修改页面标题
      dd.setNavigationBar({
        title: "缸号" + title + "--" + nowFlow
      })

      _this.setData({
        id:id,//缸id
        title:title,
        flowList:flowList//流程
      })
      _this.getFlowLog()
      _this.isFinishFlow()
     
    },
  changeValue:function(e){
    console.log(e)
    this.setData({
      inputValue:""
    })
  },
    init:function(){
      var _this=this
      _this.setData({
        cType:"1",//状态
        remarks:"",//备注
        imgSrc:[],//图片
        inputValue: "",
        checkType: [
          { value: '1', name: '正常', checked: true },
          { value: '2', name: '异常', checked: false },
          { value: '3', name: '损坏', checked: false },
        ],
      })
      
      _this.refreshFlowList()
      // _this.refreshPreList()
      _this.getFlowLog()
    },
    // 单选按钮
    radioChange:function(e){
      var val=e.detail.val
      this.setData({
        cType:val
      })
    },
    // 备注
    setRemarks:function(e){
      var val=e.detail.val
      this.setData({
        remarks:val
      })
    },
      // 选择图片
  choseImg:function(){
    var _this=this
    app.choseImg(_this)
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
  // 删除图片
  deleteImage:function(e){
    console.log(e)
    var index=e.currentTarget.dataset.index
    var imgSrc=this.data.imgSrc
    imgSrc.splice(index,1)
    this.setData({
      imgSrc:imgSrc
    })
  },
  // 保存跟进情况
   saveType:function(e){
    console.log(e)
    var type=e.currentTarget.dataset.type;
    this.setData({
      saveType:type
    })
  },
  saveForm:function(e){
     dd.showLoading({
        content: '刷新中...'
      });
    console.log(e)
    var _this=this;
    var id=_this.data.id
    var val=e.detail.value
    var type=_this.data.saveType
    var imgSrc=_this.data.imgSrc
    // dd.navigateBack({
    //   delta: 1
    // })
    if(type=="2"){
      _this.uploadCheckFlow(id,val,imgSrc)//下一步
    }else{
      _this.uploadHuiXiu(id,val,imgSrc)//回修
    }
    // dd.hideLoading();
  },
  // 下一步
  uploadCheckFlow:function(id,val,imgSrc){
    var _this=this;
    var url=app.globalData.servsers+"/dy/orders/checkFlow"
    var method="post"
    var data={
          "checkType":val.checkType,
          "images":imgSrc,
          "dodvId":id,
          "remarks":val.remarks
    }

    DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            // 刷新
            // _this.init()
            dd.navigateBack({
              delta: 1
            })
            dd.hideLoading()
          }else{
            exceptionHandle(res.data)
          }
         
        }
    })
  },
  // 回修
  uploadHuiXiu:function(id,val,imgSrc){
     var _this=this;
    var url=app.globalData.servsers+"/dy/ordersdye/huixiu"
    var method="post"
    var data={
          "images":imgSrc,
          "dodvId":id,
          "remarks":val.remarks
    }
    DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            // 刷新
            // _this.init()
            dd.navigateBack({
              delta: 1
            })
          }else{
            exceptionHandle(res.data)
          }
         
        }
    })
  },
  // 进入验收界面
  toCheck:function(){
    var id=this.data.id
    var title=this.data.title
    
    dd.navigateTo({
      url: '../acceptance/acceptance?title=' + title + '&id=' + id + '&type=save'
        
    })
  },
  // 刷新缸列表
  refreshPreList:function(){
     // 刷新上一页数据
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];
      prePage.getVatList(0)//未完成
    // end刷新上一页数据
  },
  // 刷新步骤
  refreshFlowList:function(){
    var _this = this;
    var id=_this.data.id
    var flowList=_this.data.flowList
    var url=app.globalData.servsers+"/dy/orders/getCheckedStep"
    var method="get"
    var data={
        "dyeid": id
    }
    
    DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list=data.list
            list.forEach((item,index)=>{
             flowList[index].checkType=item.checkType
             flowList[index].isHuixiu=item.isHuixiu
             
            })
            
            _this.setData({
              flowList:flowList
            })
            _this.isFinishFlow()
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
    })
  },
  // 判断流程是否走完
  isFinishFlow:function(){
    var flowList=this.data.flowList
    var flag=true
    console.log(flowList)
    
    flowList.forEach(item=>{
      if(item.checkType==0){
        flag=false
      }
    })
    if(flag){
      this.setData({
        isCheck:true
      })
    }
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
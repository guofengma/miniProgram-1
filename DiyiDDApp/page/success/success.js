import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
       title:""
    },
    onLoad(){
      var _this = this;
       var warehouseInfo=dd.getStorageSync({ key: "warehouseInfo" }).data;
       console.log(warehouseInfo)
      var type = warehouseInfo.type//0面料，1坯布
       var numlabel=type=="1"?"坯布":"面料"
       var fabricNum=type=="1"?warehouseInfo.formData.clothNum:warehouseInfo.formData.fabricNum
       var fabricType=warehouseInfo.formData.type
       var unit=fabricType=="1"?"千克":"米"
       var now=app.dateFormat(new Date())
       var title = warehouseInfo.title
       if(title=="入库"){
         var saveType = warehouseInfo.saveType//入库类型  0--直接入库  1--成检入库
         if (type==1){
           title="等待检验"
         }else if(saveType==1){
           title = "等待成检"
         }else{
           title="入库成功"
         }

       }else{
         title="出库成功"
       }
       _this.setData({
         title:title,
         unit:unit,
         numlabel:numlabel,
         warehouse:warehouseInfo.detailList,
         fabricNum:fabricNum,
         time:now
       })
    },
     onReady: function () {
      
      setTimeout(function(){
        dd.navigateBack({
          delta: 1
        })
        // dd.reLaunch({
        //   url: "../menu/menu"
        // })
      },3000)
    },
  onUnload() {
    // 刷新上一页数据
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    prePage.init()
       // end刷新上一页数据
    // 页面被关闭
  },
})
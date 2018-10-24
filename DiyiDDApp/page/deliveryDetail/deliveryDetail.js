import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
        id:"",//发货记录id
        deliveryInfo:{},
        finishTally:false
    },
    onLoad(options){
      var _this = this;
      // 修改页面标题
      dd.setNavigationBar({
        title: "客户编号："+options.title
      })
      var id=options.id
      var deliveryInfo = dd.getStorageSync({ key: 'deliveryInfo'}).data.info;
      console.log(deliveryInfo)
      var finishTally = _this.isFinish(deliveryInfo.detail)
      _this.setData({
        id:id,
        deliveryInfo: deliveryInfo,
        finishTally: finishTally
      })
    },
    // 判断是否全部点完
    isFinish(list){
      var flag=true
      list.forEach(item=>{
        console.log(item)
        
        if(item.checkStatus==0)flag=false
      })
      console.log(flag)
      return flag
    },
    // 点货
    tally:function(e){
      var id=e.currentTarget.id
      var dataset = e.currentTarget.dataset
      var status = dataset.status == 0 ? 1 : 0
      var number = dataset.number
      var index=dataset.index

      var _this = this
      var deliveryInfo = _this.data.deliveryInfo
      var url = app.globalData.servsers + "/shipments/shipments/tallying"
      var method = "post"
      if (number) {//如果有缸号传dyeVatId
        var data = {
          "dyeVatId": id,
          "status": status
        }
      } else {//没有就传contractFabricDetailId
        var data = {
          "contractFabricDetailId": id,
          "status": status
        }
      }
      dd.showLoading({
        content: '刷新中...'
      });
      DDhttpRequest({
        url, method, data,
        success(res) {
          dd.hideLoading()
          var data = res.data;
          if (data.code == 0) {
            deliveryInfo.detail[index].checkStatus = status
            var finishTally = _this.isFinish(deliveryInfo.detail)
            
            _this.setData({
              deliveryInfo: deliveryInfo,
              finishTally: finishTally
            })
            // 刷新上一页数据
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 2];
            prePage.init()
            prePage.getList()
            
              // end刷新上一页数据
          } else {
            exceptionHandle(res.data)
          }

        }
      })
    },
    finishCheck:function(e){

      dd.navigateTo({
        url: '../deliveryForm/deliveryForm'
      })
    }
})
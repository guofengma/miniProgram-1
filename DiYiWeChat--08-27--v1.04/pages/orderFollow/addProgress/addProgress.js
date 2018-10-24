var app = getApp()

Page({
  data: {
    items: [
      { id:"1", value: '1', name: '正常', checked: 'true'  },
      { id: "2",value: '2', name: '异常', checked: false },
      { id: "3",value: '3', name: '损坏', checked: false },

    ],
    img_arr:[],
    img_url: [],
    process:[],
    token: "",
    servsers: ""
  },
  onLoad: function (option) {
    var that = this;
    var servsers = app.globalData.servsers;
    var token = wx.getStorageSync("token");//获取token值
    //流程数据处理
    var flowList = wx.getStorageSync("process");
    if (flowList) {
      for (var j = 0; j < flowList.length; j++) {
        if (flowList[j].checkType == 0) {
          flowList[j].iconType = "cancel";
          flowList[j].iconColor = "#999";
        } else {
          flowList[j].iconType = "success";
          flowList[j].iconColor = "#1498F7";
        }
      }
    }
    console.log(flowList)
      //end流程数据处理
    that.setData({
      process: flowList,
      token: token,
      servsers: servsers
    })
    // 修改页面标题
    wx.setNavigationBarTitle({
      title: option.title
    })
  }, 
  radioChange: function (e) {
    var list = this.data.items;
    var val=e.detail.value;
    for (var i = 0; i < list.length; i++) {
      var listVal = this.data.items[i].value
      if(val==listVal){
        list[i].checked=true;
      }else{
        list[i].checked = false;
      }
    }
    this.setData({
      items: list
    })
  },
  // 选择上传图片
  upimg: function () {
    var that = this;
    app.upimg(that);
  }, 
  // 删除图片
  deleteImg:function(e){
   var that=this;
   app.deleteImg(e,that)
  },
  // 预览图片
  previewImg: function (e) {
    var that = this;
    app.previewImg(e, that)
  },
  formSubmit: function (e) {
    wx.showLoading({
      title: '提交中',
      icon: "none",
      mask: true
    })
    var that=this,
      url = that.data.servsers +"dy/orders/checkFlow",
      token=that.data.token,
      val=e.detail.value,
      formId=e.detail.formId,
      vatId = wx.getStorageSync("vatId");
    console.log(formId)
    wx.request({
      url: url,
      header: {
        'content-type': 'application/json',
        'token': that.data.token
      },
      method: "POST",
      data:{
        "checkType": val.status,
        "images": that.data.img_url,
        "dodvId": vatId,
        "remarks": val.remark
      },
      success:function(){
        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 1000,
          success:function(){
            // if (val.status!==1){//若状态不为正常时
            //   app.sendMessage()// 发送小程序通知
            // }
          }

        })
         // 刷新上一页数据
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 2]; 
        console.log(pages)
        console.log(prePage)
        prePage.setData({
          page:1,
          list: [],
          scrollTop: 0
        })
        prePage.getList(prePage)
        // end刷新上一页数据
        wx.navigateBack({
          delta: 1
        })
      }
    })
   
  }
})
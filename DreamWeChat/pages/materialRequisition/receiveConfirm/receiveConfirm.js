//获取应用实例
const app = getApp()

Page({
  data: {
    applyId:"",
    info: ""
  },
  onLoad:function(options){
    var id=options.id;
    this.setData({
      applyId:id
    });
    this.getList(id)
  },
  // 获取数据
  getList: function (id) {
    var that = this;
    var url = app.globalData.servsers + "rz/apply/info/" + id;
    var token = wx.getStorageSync("token");//获取token值

    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',// 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          that.dataProcessing(data)
        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    })
  },
  dataProcessing: function (data) {
    var data = data.data;

    // 图片
    var applyMaterialList = data.applyMaterialList,
      l = applyMaterialList.length;
    var realNum=0,
        realPrice=0;
    for (var i = 0; i < l; i++) {
      // 图片
      var imgList = applyMaterialList[i].materielImgList;
      if (imgList == null || imgList.length < 1) {
        applyMaterialList[i].img = "/images/notUpload_sm.png"
      } else {
        applyMaterialList[i].img = imgList[0].imgUrl
      }
      // 数量和实际金额
      realNum += applyMaterialList[i].realNum
      realPrice = applyMaterialList[i].realNum * applyMaterialList[i].price + realPrice;
      
    }



    this.setData({
      info: data,
      realNum: realNum,
      realPrice: realPrice

    })
  },
  // 确认领用
  receiveConfirm:function(){
    var that = this;
    var url = app.globalData.servsers + "rz/apply/receive";
    var token = wx.getStorageSync("token");//获取token值
    var applyId = that.data.applyId;//申请id
    wx.showLoading({
      title: '上传中',
      icon: "none",
      mask: true
    })
    wx.request({
      url: url,
      data: {
        "applyId": applyId
      },
      header: {
        'content-type': 'application/json',// 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.setData({
            page: 1,
            msgList: [],
            scrollTop: 0
          })
          prePage.getList(prePage)
          // end刷新上一页数据

          wx.navigateBack({
            delta:1
          })
        } else {
          app.exceptionHandle(data, "../../login/login")
        }
        wx.hideLoading()
      }
    })
  },
  imgError: function (e) {
    var that = this;
    app.imgError2(e, that)
  },
  // 预览图片
  previewImg(e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  }
})  
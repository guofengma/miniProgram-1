//获取应用实例
const app = getApp()

Page({
  data: {
    info:""
  },
  onLoad:function(options){
    var id=options.id;
    console.log(id)
    this.getList(id)
  },
  getList:function(id){
    var that = this;
    var url = app.globalData.servsers + "rz/apply/info/"+id;
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
  dataProcessing:function(data){
    var data=data.data;

    // 状态
    var status = data.status;//0-待审核，1-物料准备，2-准备就绪，3-使用中，4-订单完成，5-订单驳回，6-订单取消
    switch (status) {
      case 0:
        data.statusStr = "等待审核";
        break;
      case 1:
        data.statusStr = "物料准备";
        break;
      case 2:
        data.statusStr = "准备就绪";
        break;
      case 3:
        data.statusStr = "使用中";
        break;
      case 4:
        data.statusStr = "订单完成";
        break;
      case 5:
        data.statusStr = "订单驳回";
        break;
      case 6:
        data.statusStr = "订单取消";
        break;
      default:
        data.statusStr = "等待审核";
    }

    // 图片
    var applyMaterialList = data.applyMaterialList,
      l = applyMaterialList.length;
    for(var i=0;i<l;i++){
      var imgList = applyMaterialList[i].materielImgList;
      if (imgList == null || imgList.length < 1) {
        applyMaterialList[i].img = "/images/notUpload_sm.png"
      } else {
        applyMaterialList[i].img = imgList[0].imgUrl
      }
    }
   

    this.setData({
      info: data
    })
  },
  imgError:function(e){
    var that=this;
    app.imgError2(e,that)
  },
  // 预览图片
  previewImg(e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  }
})  
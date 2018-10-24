//获取应用实例
const app = getApp()

Page({
  data: {
    scan:false,
    list:[],
    noData:true
  },
  onLoad:function(){

  },
  // 扫码
  scan:function(e){
    var that=this;
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        that.setData({
          scan: true
        })
        console.log(res)
        var result = JSON.parse(res.result);
        var id=result.id;
        console.log(id);
        that.getShelfInfo(id)
      }
    })
  },
  // 获取单个货架信息
  getShelfInfo: function (id) {
    var that = this;
    var url = app.globalData.servsers + "/rz/warehouse/shelvesFabric";//接口地址
    var token = wx.getStorageSync("token")
    wx.request({
      url: url,
      data: {
        "shelvesId":id
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          console.log(data)

          that.dataProcessing(data)
          var l = data.list.length;
          if (l<1) {
            that.setData({
              noData:false
            })
          }else{
            that.setData({
              noData: true
            })
          }
         
          // that.setData({
          //   detail: info
          // })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  dataProcessing(data){
    var list=data.list;
    for(var i=0,l=list.length;i<l;i++){

    }

    this.setData({
      list:list
    })
  }

})  
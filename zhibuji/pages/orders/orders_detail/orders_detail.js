
Page({
  data: {
    tType:"",//0:发布订单，1:已接订单
    status:"",//0：待确认,1：寻布中,2：已关闭
    imgUrls: ["/images/1.png", "/images/1.png","/images/1.png"],
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.title,
    })
    var tType = options.type
    var status = options.status

    this.setData({
      tType: tType,
      status: status
    })
    

  },
  
});
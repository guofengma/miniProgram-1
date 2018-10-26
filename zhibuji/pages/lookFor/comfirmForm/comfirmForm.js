
Page({
  data: {
    imgList: ["/images/1.png", "/images/1.png"]
  },
  onLoad: function () {
    
  },
  // 预览图片
  previewImage: function (e) {
    var dataset=e.currentTarget.dataset
    var list = dataset.list
    var src = dataset.src
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: list // 需要预览的图片http链接列表
    })
  },
  // 点击提交，选择支付方式
  chosePayWay:function(e){
    wx.showActionSheet({
      itemList: ['微信支付', '钱包余额支付'],
      success(res) {
      console.log(res)
      var payType=res.tapIndex
      if (payType==0){//微信支付
        wx.requestPayment({
          timeStamp: '',
          nonceStr: '',
          package: '',
          signType: 'MD5',
          paySign: '',
          success(res) { },
          fail(res) { }
        })
      }else{
        wx.navigateTo({
          url: '../paySuccess/paySuccess',
        })
      }
      //  。。。
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  
});
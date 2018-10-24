//获取应用实例
const app = getApp()

Page({
  data: {
    url:"",
    warehouse:[],
    time:""
  },
  onLoad:function(){
    var value = wx.getStorageSync('warehouseInfo');
    console.log(value)
    
    
    this.setData({
      url:value.url,
      warehouse: value.warehouse,
      value:value
    })

    
    console.log(this.data.url)
    this.data.time = app.CurentTime()
    console.log(app.CurentTime())
    this.setData({
      time: app.CurentTime()
    })
  },
  onReady: function () {
    var pages = getCurrentPages() //获取加载的页面
    console.log(pages)
    var url = this.data.url;
    console.log(url)
    setTimeout(function(){
      wx.navigateBack({
        delta:1
        // url: url
      })
    },2000)
  },
})  
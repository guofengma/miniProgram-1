//获取应用实例
const app = getApp()

Page({
  data: {
    num:"",
    label:"",
    unit:"",
    url:"",
    warehouse:[],
    time:""
  },
  onLoad:function(){
    var value = wx.getStorageSync('warehouseInfo');
    console.log(value)
    this.setData({
      num: value.num,
      numlabel: value.numlabel,
      unit:value.unit,
      label:value.label,
      url:value.url,
      warehouse: value.warehouse
    })
    console.log(this.data.url)
    this.data.time = app.CurentTime()
    console.log(app.CurentTime())
    this.setData({
      time: app.CurentTime()
    })
  },
  onReady: function () {
    var url = this.data.url;
    console.log(url)
    setTimeout(function(){
      wx.redirectTo({
        url: url
      })
    },3000)
  },
})  
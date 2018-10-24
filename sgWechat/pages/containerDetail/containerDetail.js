//获取应用实例
const app = getApp()

Page({
  data: {
    info:{}
  },
  onLoad(){
    var info = wx.getStorageSync("containerDetail")
    this.setData({
      info: info
    })
  }
})  
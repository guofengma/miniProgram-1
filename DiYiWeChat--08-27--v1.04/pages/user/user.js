//获取应用实例
const app = getApp()

Page({
  data: {
    realName: '',
    username: ''
  },
  onLoad:function(){
    var realName=wx.getStorageSync("realName")
    var username = wx.getStorageSync("username")
    this.setData({
      realName: realName,
      username: username
    })
    
  },
  goBack:function(){
    wx.navigateBack({
      delta:1
    })
  },
  logout:function(){
    wx.setStorageSync("token", "")
    wx.setStorageSync("status", "")
    wx.reLaunch({
      url: '../login/login',
    })
  }
})  
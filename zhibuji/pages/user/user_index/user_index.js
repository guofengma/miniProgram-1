import { formatTime} from "../../../utils/util.js"

Page({
  data: {
    userInfo:{
      avatarUrl:"/images/1.png"
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authorization:false,//是否授权
  },
  onLoad: function () {
    var _this=this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            withCredentials:true,
            success: res => {
              console.log(res)
              // 可以将 res 发送给后台解码出 unionId
              _this.setData({
                authorization:true,
                userInfo:res.userInfo
              })
              wx.setStorageSync("userInfo", res.userInfo)
            }
          })
        }
      }
    })
  },
  bindGetUserInfo(e) {
    console.log(e)
    var errMsg = e.detail.errMsg
    if (errMsg =="getUserInfo:ok"){
      this.setData({
        authorization: true,
        userInfo: e.detail.userInfo
      })
      wx.setStorageSync("userInfo", e.detail.userInfo)
    }else{

    }
    
  }
  
});
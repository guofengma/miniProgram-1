//app.js
App({
  data: {
    deviceInfo: {}
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    this.data.deviceInfo = wx.getSystemInfoSync();
    console.log(this.data.deviceInfo);

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

        var code=res.code;
        console.log(code)

        // wx.request({
        //   url: 'https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=' + code + '&grant_type=authorization_code',
        //   data: {},
        //   header: {
        //     'content-type': 'application/json'
        //   },
        //   success: function (res) {
        //    var  openid = res.data.openid //返回openid
        //     console.log(res)
        //     console.log(openid)
        //   }
        // })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow:function(){
    console.log(this)

  },
  globalData: {
    userInfo: null
  }
})


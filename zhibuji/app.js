//app.js
App({
  onLaunch: function () {
    var _this=this
    // 检查登录态是否过期
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            console.log(res)
            _this.globalData.code = res.code
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
          }
        })
      }
    })
    
    
  },
  globalData: {
    userInfo: null,
    code:null,
    servsers:"https://shiguang.ruiztech.cn/ruiz/"
  },
 
  
  
})
//获取应用实例
const app = getApp()

Page({
  data: {
    "password": "",
    "newPassword": ""
  },
  formSubmit: function (e) {
    var val=e.detail.value;
    console.log(val)
    var that = this;
    var url = app.globalData.servsers + "sys/user/password";//接口地址
    var token = wx.getStorageSync("token");//获取token值
    if (val.new_psd !== val.confirm_psd){
      wx.showModal({
        title: '提示',
        content: '两次密码输入不一致',
      })
    } else if (val.new_psd==""){
      wx.showModal({
        title: '提示',
        content: '密码不能为空',
      })
    } else if (val.new_psd == val.old_psd) {
      wx.showModal({
        title: '提示',
        content: '原密码和新密码不得重复',
      })
    }else{
      wx.showLoading({
        title: '提交中',
        mask: true,
      })
      wx.request({
        url: url, //仅为示例，并非真实的接口地址
        method:"POST",
        data: {
          "password": val.old_psd,
          "newPassword": val.new_psd
        },
        header: {
          'content-type': 'application/json', // 默认值
          "token": token
        },
        success: function (res) {
          var data = res.data;
          console.log(data)
          if (data.code == 0) {
            wx.hideLoading()
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              mask: true,
              duration: 1500,
              success:function(){
                
              }
            })
            setTimeout(function(){
              wx.navigateBack({
                delta: 1
              })
            },1000)
            
            

          }else if(data.code==500){
            wx.showModal({
              title: '提示',
              content: data.msg
            })
          }
        }
      })


      
    }
    
  }
})  
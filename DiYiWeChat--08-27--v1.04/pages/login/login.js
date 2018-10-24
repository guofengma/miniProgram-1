//获取应用实例
const app = getApp()

Page({
  data: {
    url: app.globalData.servsers +"sys/login2",//访问服务器地址
    phone: '',
    password: '',
    roles: [
      { value: '0', name: '客户',checked:false },
      { value: '1', name: '员工', checked: 'true'}

    ],
  },
  onLoad: function (options) {
    var token = wx.getStorageSync("token");
    var status = wx.getStorageSync("status");//角色状态

    // console.log(token)
    var url = app.globalData.servsers;
    if (token) {//如果有存储的token访问刷新token接口
      wx.request({
        url: url + "sys/user/refreshToken", //仅为示例，并非真实的接口地址
        data: {},
        header: {
          'content-type': 'application/json', // 默认值
          'token': token
        },
        success: function (res) {
          // console.log(res.data)
          var code = res.data.code;
          if (code == 401) {//如果token过期就重新登录
            wx.showToast({
              title: "请重新登录",
              icon: 'none',
              duration: 2000
            })
          } else if (code == 0) {//token未过期，重新存储token
            // console.log(res.data)
            var token = res.data.token
            wx.setStorageSync("token", token)
            var customerId = wx.getStorageSync("customerId");//客户id
            if (customerId > 0) {//根据角色状态跳转到不同页面  客户>0
              wx.reLaunch({
                url: '../contractFollow/contractFollow',
              })
            } else {//0==员工
              wx.reLaunch({
                url: '../menu/menu',
              })
            }

          }


          
        }
      })
    }
  },
  // 传formId到后台
  submitFormId: function (e) {
    var formId = e.detail.formId;
    console.log(formId)
    // if (formId !== "the formId is a mock one") {
    //   app.postFormId(formId)
    // }

  },
  // 绑定openID
  bindOpenId: function () {
    var code = wx.getStorageSync("code");
    console.log(code)
    var token = wx.getStorageSync("token");
    var url = app.globalData.servsers + "sys/wechat/bindOpenId"
    wx.request({
      url: url,
      data: {
        "code": code
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': token
      },
      success: function (res) {

      }
    })
  },
  // 分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    return {
      title: '',
      path: 'pages/login/login'
    }
  },
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    var list = this.data.roles;
   for(var i=0;i<list.length;i++){
     list[i].checked = !list[i].checked
   }
    this.setData({
      roles:list
    })
  },

  // 获取输入账号  
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 获取输入密码  
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  formSubmit: function (e) {
    var that=this;
    var url = that.data.url;
    var val = e.detail.value;
    var formId = e.detail.formId;
    console.log(formId)
    console.log(val.phone)
    if (0) {//!(/^1[345789]\d{9}$/.test(val.phone))
      wx.showToast({
        title: '手机格式错误',
        image:"../../images/warn.png",
        duration: 2000
      })
    }else{
      // 提交数据
      wx.showLoading({
        title: '登录中',
        mask:true
      })
      wx.request({
        url: url, //仅为示例，并非真实的接口地址
        data: {
          "username": val.phone,
          "password": val.password
        },
        method: "POST",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          // console.log(res.data)
          var code = res.data.code;
          var token = res.data.token;
          var msg = res.data.msg;
          if (code === 0) {//
            wx.hideLoading()
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 3000

            })
            wx.setStorageSync('token', token)//存储返回的token。。。。
            wx.setStorageSync('status', val.status)//存储用户角色
            that.getInfo(token)//获取用户信息
            // if(val.status==1){//员工
            //   wx.redirectTo({
            //     url: '../menu/menu'
            //   })
            // }else{//客户
            //   wx.redirectTo({
            //     url: '../contractFollow/contractFollow'
            //   })
            // }

          } else{
            wx.hideLoading()
            app.exceptionHandle(res.data)

          }

        }
      })
     
     
    }
   
  },
  validate:function(data){
      var phone=data.phone;
      if (!(/^1[345789]\d{9}$/.test(phone))){
        wx.showToast({
          title: '手机格式错误',
          icon: 'warn',
          duration: 2000
        })
      }
  },
  getInfo:function(token){
    var that=this;
    var url = app.globalData.servsers + "sys/user/info";//接口地址
    wx.request({
      url: url, //仅为示例，并非真实的接口地址
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        var customerId = data.user.customerId;//客户id
        if (data.code == 0) {
          // ....
          // data.user.roleNameList = [{ name: "测试", id: "1" }, { name: "跟单员", id: "2" }, { name: "管理人员", id: "1" }]
          // ....
          wx.setStorageSync("realName", data.user.realName)
          wx.setStorageSync("username", data.user.username)
          wx.setStorageSync("roleList", data.user.roleNameList)
          wx.setStorageSync("customerId", data.user.customerId)
          wx.setStorageSync("userId", data.user.userId)
          
          // console.log(res.data)

          var openId = data.user.openId;
          if (!openId) {
            that.bindOpenId()
            console.log(openId)
          }
          
          if (customerId>0){//客户>0
              wx.redirectTo({
                url: '../contractFollow/contractFollow'
              })
          }else{//员工==0
            wx.redirectTo({
                url: '../menu/menu'
              })
          }

        }
        // console.log(res.data)
      }
    })
  }

  
})  
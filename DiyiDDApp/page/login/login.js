import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

//内网穿透工具介绍:
// https://open-doc.dingtalk.com/microapp/debug/ucof2g
//替换成开发者后台设置的安全域名
let servsers = app.globalData.servsers;

Page({
    data:{
        corpId: '',
        servsers:'',
        authCode:"",
      form:{
        phone:"",
        password:""
      }
    },
    onLoad(){
        let _this = this;
        _this.setData({
            corpId: app.globalData.corpId,
            servsers: app.globalData.servsers
        })
     var token = dd.getStorageSync({key:'token'}).data;
          
     if(token){
       _this.refreshToken()
     }
      // 获取authCode传给后台
      dd.getAuthCode({
        success:(res)=>{
          _this.setData({authCode:res.authCode})
        },
        fail: (err)=>{
          console.log(err)
        }
    })
    },
  // onInput: function(e) {
  //   var name = e.currentTarget.dataset.name
  //   var val = e.detail.value
  //   var form = this.data.form
  //   form[name] = val
  //   this.setData({
  //     form: form
  //   })
  // },
    // 刷新token
    refreshToken:function(){
      var url=this.data.servsers+"sys/user/refreshToken"
      var method="get"
      var data={}
      DDhttpRequest({url,method,data,
        success(res){
          var data=res.data
          var code=data.code
           if (code == 401) {//如果token过期就重新登录
            dd.showToast({
              type: 'fail',
              content: '请重新登录',
              duration: 3000,
              success: () => {
              
              },
            })
          }else if(code==0){
             dd.setStorageSync({
                    key: 'token',
                    data: {
                        token: data.token,
                    }
              })//存储返回的token
            var customerId = dd.getStorageSync({key:'userInfo'}).data.customerId;
            if (customerId > 0) {//根据角色状态跳转到不同页面  客户>0
              dd.redirectTo({
                url: '../contractFollow/contractFollow',
              })
            } else {//0==员工
              dd.redirectTo({
                url: '../menu/menu',
              })
            }
          }
        }
      })

    },
    // 登录表单提交
    formSubmit: function (e) {
        var that=this;
        var url = that.data.servsers+"sys/login2";
        var val = e.detail.value;
        
        if (0) {//!(/^1[345789]\d{9}$/.test(val.phone))
         dd.showToast({
            type: 'fail',
            content: '手机号格式错误',
            duration: 3000,
            success: () => {
                   
             },
          });
        }else{
        // 提交数据
        dd.showLoading({
            content: '登录中',
       })
        var data={
          username: val.phone,// "zhangmin",
          password: val.password//"000000"
        }
        var method='post'
        DDhttpRequest({url,method,data,
          success(res){
                var code = res.data.code;
                var token = res.data.token;
                var msg = res.data.msg;
                console.log(code)
                if (code === 0) {//
                console.log(222)
                dd.hideLoading()
                dd.showToast({
                  type: 'success',
                  content: '登录成功',
                  duration: 3000,
                  success: () => {
                   
                  },
                });
                dd.setStorageSync({
                    key: 'token',
                    data: {
                        token: token,
                    }
                })//存储返回的token
                that.getInfo(token)//获取用户信息
                } else{
                    exceptionHandle(res.data)
                }
          }
        })
        // var data={
        //     "username": "zhangmin",//val.phone,
        //     "password": "000000"//val.password
        //     }
        //     data=JSON.stringify(data)

        // dd.httpRequest({
        //     url: url, //仅为示例，并非真实的接口地址
        //     data: data,
        //     method: "POST",
        //     dataType: 'json',
        //     headers:  {'Content-Type': 'application/json'},
        //     success: function (res) {
        //         console.log(res.data)
        //         var code = res.data.code;
        //         var token = res.data.token;
        //         var msg = res.data.msg;
        //         if (code === 0) {//
        //             dd.hideLoading()
        //                 dd.showToast({
        //                 title: '登录成功',
        //                 icon: 'success',
        //                 duration: 3000
        //             })
        //             dd.setStorageSync({
        //                 key: 'token',
        //                 data: {
        //                     token: token,
        //                 }
        //             })//存储返回的token
        //             that.getInfo(token)//获取用户信息
        //         } else{
        //             dd.hideLoading()
        //             app.exceptionHandle(res.data)
        //         }
        //     }
        // })
     
     
    }
   
  },
//   验证手机号
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
//   获取用户信息
  getInfo:function(token){
    var that=this;
    var url = app.globalData.servsers + "sys/user/info";//接口地址
    dd.httpRequest({
      url: url, //仅为示例，并非真实的接口地址
      data: {},
      headers: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        if (data.code == 0) {
          var user=data.user;
          var customerId = user.customerId;//客户id
            
          dd.setStorageSync({
            key: 'userInfo',
            data: {
                realName: user.realName,
                username: user.username,
                roleList: user.roleNameList,
                roleIdList: user.roleIdList,
                customerId: user.customerId,
                userId: user.userId,
            }
        })//存储用户信息
          var ddUserId = data.user.ddUserId;
          if (!ddUserId) {
            that.bindDDUserId()//绑定DDUserId
          }
          
          if (customerId>0){//客户>0
              dd.redirectTo({
                url: '../contractFollow/contractFollow'
              })
          }else{//员工==0
            dd.redirectTo({
                url: '../menu/menu'
              })
          }

        }
      }
    })
  },
  // 绑定ddUserId
  bindDDUserId: function () {
    var code = this.data.authCode;
    var token = dd.getStorageSync({key:'token'}).data.token;
    var url = app.globalData.servsers + "sys/dd/bindDDUserId"
     dd.httpRequest({
      url: url,
      data: {
        "code": code
      },
      headers: {
        'content-type': 'application/json', // 默认值
        'token': token
      },
      success: function (res) {
        
      }
    })
  },
})
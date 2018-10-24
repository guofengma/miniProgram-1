//app.js
App({
  onLaunch: function () {//用户首次打开小程序，触发 onLaunch（全局只触发一次）。
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // console.log(res)
        wx.setStorageSync("code", res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
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
  onShow: function () {//小程序初始化完成后，触发onShow方法，监听小程序显示。小程序从后台进入前台显示，触发 onShow方法。
    this.getUnRead();
  },
  globalData: {
    userInfo: null,
    token:"",
    servsers: "http://dytest.ruiztech.cn/diyiAdmin/"//"http://dytest.ruiztech.cn/"//https://erp.tc6535.com
  },
  // 获取未读条数
  getUnRead:function(){
    var servsers = this.globalData.servsers,
      token = wx.getStorageSync("token"),
      userId = wx.getStorageSync("userId");//获取userId
    wx.request({
      url: servsers + "dy/notify/list",
      data: {
        "uid": userId,
        "page": 1,
        "limit": 100
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          var msg = data.page.list;
          var unRead = 0;
          if (msg.length > 1) {
            for (var i = 0; i < msg.length; i++) {
              var status = msg[i].status;
              if (status == 0) unRead++;
            }
            wx.setStorageSync("unRead", unRead);
          }
        } else {

        }

      }
    });
  },
  // 请求异常处理
  exceptionHandle:function(data,login){
    
    switch (data.code) {
      case 401:
        msg: "登录超时，请重新登录";
        break;
      case 500:
        msg: data.msg;
        break;
    }
    wx.showModal({
      title: '提示',
      content: data.msg,
      duration: 2000,
      success:function(){
        if(data.code==401){
          wx.reLaunch({
            url: login,
          })
        }
      }
    })
  },
  // 获取当前时间
  CurentTime:function()  
    {   
    var now = new Date();  
          
    var year = now.getFullYear();       //年  
    var month = now.getMonth() + 1;     //月  
    var day = now.getDate();            //日  

    var hh = now.getHours();            //时  
    var mm = now.getMinutes();          //分  
    var ss = now.getSeconds();           //秒  

    var clock = year + "-";  
          
    if(month < 10)  
            clock += "0";  
          
    clock += month + "-";  
          
    if(day < 10)  
            clock += "0";  
              
    clock += day + " ";  
          
    if(hh < 10)  
            clock += "0";  
              
    clock += hh + ":";  
    if(mm < 10) clock += '0';   
    clock += mm + ":";   
           
    if(ss < 10) clock += '0';   
    clock += ss;   
    return(clock);
  },
  // 格式化日期时间
  dateFormat: function (date) {
    var year = date.getFullYear();       //年  
    var month = date.getMonth() + 1;     //月  
    var day = date.getDate();            //日  

    var hh = date.getHours();            //时  
    var mm = date.getMinutes();          //分  
    var ss = date.getSeconds();           //秒  

    var clock = year + "-";

    if (month < 10)
      clock += "0";

    clock += month + "-";

    if (day < 10)
      clock += "0";

    clock += day + " ";

    if (hh < 10)
      clock += "0";

    clock += hh + ":";
    if (mm < 10) clock += '0';
    clock += mm + ":";

    if (ss < 10) clock += '0';
    clock += ss;
    return (clock);
  },
  // 数组去重
  distinct: function (arr) {
    // console.log(arr)
    var result = [],
      i,
      j,
      len = arr.length;
    for (i = 0; i < len; i++) {
      for (j = i + 1; j < len; j++) {
        if (arr[i] === arr[j]) {
          j = ++i;
        }
      }
      result.push(arr[i]);
    }
    return result;
  },
  // 选择上传图片
  upimg: function (that) {
    var app=this;
    if (that.data.img_arr.length < 9) {
      wx.chooseImage({
        count: 9,//默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          that.setData({
            img_arr: that.data.img_arr.concat(res.tempFilePaths)
          })
          var tempFilePaths = res.tempFilePaths;
          console.log(tempFilePaths)
          for (var i = 0;i<tempFilePaths.length;i++){
            app.uploadImg(tempFilePaths, that,i)//上传图片
          }
        }
      })

    } else {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'loading',
        duration: 2000
      });
    }
  },
  //上传图片
  uploadImg: function (tempFilePaths,that,i) {
    var url = this.globalData.servsers + "sys/oss/upload";//接口地址
    var token = wx.getStorageSync("token");//获取token值
    wx.showLoading({
      title: '上传中',
      mask:true
    })
    wx.uploadFile({
      url: url, //仅为示例，非真实的接口地址
      filePath: tempFilePaths[i],
      name: 'file',
      formData: {
        'token': token
      },
      success: function (res) {
        var data = JSON.parse(res.data);
        if (data.code == 0) {
          var img_url = that.data.img_url;
          img_url.push(data.url);
          that.setData({
            img_url: img_url
          });
        } else {
          wx.showToast({
            title: '图片上传失败',
          })
        }
        wx.hideLoading()
      }
    })
  },
  // 删除图片
  deleteImg: function (e,that) {
    var img_arr = that.data.img_arr;
    var img_url = that.data.img_url;
    var index = e.currentTarget.dataset.index;
    img_arr.splice(index, 1);
    img_url.splice(index, 1);
    that.setData({
      img_arr: img_arr,
      img_url: img_url
    });
  },
  // 预览图片
  previewImg: function (e,that) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var img_arr = that.data.img_arr;
    wx.previewImage({
      //当前显示图片
      current: img_arr[index],
      //所有图片
      urls: img_arr
    })
  } ,
  isRepeat:function (arr){
    var hash = {};
    for(var i in arr) {
      if (hash[arr[i]])
        return true;
      hash[arr[i]] = true;
    }
    return false;
  },
  // 传formId
  postFormId: function (id) {
    var servsers = this.globalData.servsers,
      token = wx.getStorageSync("token");
    wx.request({
      url: servsers + "sys/wechat/uploadFormId",
      data: {
        "formid": id
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {

        } else {

        }

      }
    });
  },
  // 发送小程序通知
  sendMessage: function (id) {
    var servsers = this.globalData.servsers,
      token = wx.getStorageSync("token");
    wx.request({
      url: servsers + "sys/wechat/sendMessage",
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {

        } else {

        }

      }
    });
  }
 
})
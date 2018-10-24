//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    realName: '',
    roleList: [],
    menuList:[],
    unReadStr:"消息通知",
    isManager:false,
    checked:false
  },
  onLoad:function(){
    var that=this;
    var realName = wx.getStorageSync("realName");//用户真实名字
    var username = wx.getStorageSync("username");//用户名
    var roleList = wx.getStorageSync("roleList");//用户角色
    var roleIdList = wx.getStorageSync("roleIdList");//用户角色id
    var isManager = that.data.isManager;
    for (var i = 0, l = roleIdList.length;i<l;i++){
      if (roleIdList[i] == 1) {  isManager = true;}
    }
    
    //that.getUnRead();
    that.setData({
      realName: realName,
      roleList: roleList,
      isManager: isManager
    });
    that.getMenu();
    that.getSpecialTime();

  },
  // 传formId到后台
  submitFormId:function(e){
    var formId = e.detail.formId;
    console.log(formId);
    var url = e.currentTarget.dataset.src;
    if (url) {
      this.goNext(url);
    }
    if (formId !== "the formId is a mock one") {
      app.postFormId(formId)
    }
  },
  // 获取特殊时间是否开启
  getSpecialTime:function(){
    var that = this;
    var token = wx.getStorageSync("token");//获取token值
    var servsers = app.globalData.servsers;
    wx.request({
      url: servsers + "rz/config/info",
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        console.log(res)
        var data = res.data;
        if (data.code == 0) {
          var isOpen = data.info.isOpen;
          wx.setStorageSync("isOpen", isOpen)
          if (isOpen){
            that.setData({
              checked: true
            })
          }else{
            that.setData({
              checked: false
            })
          }
        } else {
          app.exceptionHandle(data, "../login/login")
        }
      }
    })
  },
  // 特殊时间开关
  switchChange: function (e) {
    console.log('switch 发生 change 事件，携带值为', e.detail.value);
    var that = this;
    var token = wx.getStorageSync("token");//获取token值
    var servsers = app.globalData.servsers;
    var val = e.detail.value;
    var isopen = val?1:0;
    wx.request({
      url: servsers + "rz/config/save",
      data: {
        "isopen": isopen
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        console.log(res)
        var data = res.data;
        var titile = isopen==1?"开启成功":"已关闭"
        if (data.code == 0) {
          wx.showToast({
            title: titile,
            icon:"none",
            mask:true,
            duration:500
          })
        } else {
          app.exceptionHandle(data, "../login/login")
        }
      }
    })

  },
  getUnRead:function(){
    var unRead = Number(wx.getStorageSync("unRead"));//新消息条数
    if (unRead > 0) {
      this.setData({
        unReadStr: "你有" + unRead + "条消息！"
      })
    }else{
      this.setData({
        unReadStr:"消息通知"
      })
    }
  },
  getMenu:function(){
    var that=this;
    var token = wx.getStorageSync("token");//获取token值
    var servsers = app.globalData.servsers;
    wx.request({
      url: servsers +"sys/menu/nav",
      data: {
        "ismobile": 1
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        console.log(res)
        var data=res.data;
        if(data.code==0){
          var list = data.menuList[0].list;
          for(var i=0;i<list.length;i++){
            // switch(list[i].name){
            //     case"订单跟进":
            //     list[i].icon ="sign.png";
            //     break;
            //     case "订单跟踪":
            //     list[i].icon = "itemList.png";
            //       break;
            //     case "入库管理":
            //       list[i].icon = "in.png";
            //       break;
            //     case "出库管理":
            //       list[i].icon = "out.png";
            //       break;
            // }
          }
            that.setData({
              menuList: list
            })
        }else{
          app.exceptionHandle(data, "../../login/login")
        }
      }
    })
  },
  // 进入消息页
  goMessage:function(){
    wx.navigateTo({
      url: '../message/message'
     
    })
  },
  //事件处理函数
  goNext:function(url){
    // // console.log(e)
    // let url = e.currentTarget.dataset.src;
    console.log(url)
    wx.navigateTo({
      url: url
    })
  }
})

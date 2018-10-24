//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    realName: '',
    roleList: [],
    menuList:[],
    unReadStr:"消息通知"
  },
  onLoad:function(){
    var that=this;
    var realName = wx.getStorageSync("realName");//用户真实名字
    var username = wx.getStorageSync("username");//用户名
    var roleList = wx.getStorageSync("roleList");//用户角色
    that.setData({
      realName: realName,
      roleList: roleList
    });
    that.getMenu();
  },
  getMenu: function () {
    var that = this;
    var token = wx.getStorageSync("token");//获取token值
    var servsers = app.globalData.servsers;
    wx.request({
      url: servsers + "sys/menu/nav",
      data: {
        "ismobile": 1
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        console.log(res)
        var data = res.data;
        if (data.code == 0) {
          var list = data.menuList[0].list;
          for (var i = 0; i < list.length; i++) {
            switch (list[i].name) {
              case "订单跟进":
                list[i].icon = "sign.png";
                break;
              case "订单跟踪":
                list[i].icon = "itemList.png";
                break;
              case "入库管理":
                list[i].icon = "in.png";
                break;
              case "出库管理":
                list[i].icon = "out.png";
                break;
            }
          }
          that.setData({
            menuList: list
          })
        } else {
          app.exceptionHandle(data, "../../login/login")
        }
      }
    })
  },
  
  
  // 进入个人中心
  goUser:function(){
    wx.navigateTo({
      url: '/pages/user/user'
     
    })
  },
  //事件处理函数
  goNext:function(e){
    // console.log(e)
    let url = e.currentTarget.dataset.src;
    // console.log(url)
    wx.navigateTo({
      url: url
    })
  }
})

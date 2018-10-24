//获取应用实例
const app = getApp()

Page({
  data: {
    hidden: true,
    noData: "hide",
    display: "hide",
    scrollHeight: 0,
    list:[],
    page:1
  },
  onLoad:function(){
    var that=this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight:res.windowHeight
        })
      },
    });
   
  },
  onShow: function () {
    var that = this;
    this.getList(that);
  },
  onPullDownRefresh: function () {
    console.log("下拉");
    var that = this;
    that.setData({
      page: 1,
      list: [],
      scrollTop: 0
    });
    that.getList(that)
  },
  onReachBottom: function () {
    console.log("上拉");
    var that = this;
    that.getList(that);
  },
  // 获取数据
  getList: function (that) {
    var url = app.globalData.servsers + "dy/notify/list";
    var token = wx.getStorageSync("token");//获取token值
    var userId = wx.getStorageSync("userId");//获取userId
    
    var page = that.data.page;
    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "uid": userId,
        "page": page,
        "limit": 10
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          that.dataProcessing(data, page)//数据处理
          wx.stopPullDownRefresh();
        } else {
          app.exceptionHandle(data, "../login/login")
        }

      }
    });
    // 已读
    wx.request({
      url: app.globalData.servsers +"dy/notify/read",
      data: {
        "uid": userId
     
      },
      method:"POST",
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        if (data.code == 0) {
          wx.setStorageSync("unRead", 0)
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.getUnRead(prePage)
         // end刷新上一页数据
        } else {
          app.exceptionHandle(data, "../login/login")
        }

      }
    });
     // 已读end
  },
  // 数据处理
  dataProcessing: function (data, page) {
    var that = this,
      l = that.data.list,
      noData = that.data.noData,
      dataList = data.page.list;
    if (page == 1 && dataList.length < 1) { noData = "show" } else { noData = "hide" }
    if (dataList.length < 1) {
      that.setData({
        display: "show"
      });
    } else {
      that.setData({
        display: "hide"
      });
    }
    for (var i = 0; i < dataList.length; i++) {
      l.push(dataList[i])
    }

    that.setData({
      list: l
    });
    page++;
    that.setData({
      page: page,
      hidden: true,
      noData:noData
    });
  }
})  
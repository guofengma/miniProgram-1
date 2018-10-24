//获取应用实例
const app = getApp()

Page({
  data: {
    hidden: true,
    noData: "hide",
    display: "hide",
    scrollTop: 0,
    scrollHeight: 0,
    winWidth: 0,
    page: 1,
    list: [],
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight,
          winWidth: res.windowWidth
        });
      }
    });
    that.getList(that)
  },
  goAddForm: function () {
    wx.navigateTo({
      url: '../addStaff/addStaff',
    })
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
    var url = app.globalData.servsers + "sys/user/list";
    var token = wx.getStorageSync("token");//获取token值
    var page = that.data.page;
    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "page": page,
        "limit": 20
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
      noData: noData
    });
  }
})  
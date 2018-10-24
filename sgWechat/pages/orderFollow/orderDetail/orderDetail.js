//获取应用实例
const app = getApp()

Page({
  data: {
    hidden: true,
    noData: "hide",
    display: "hide",
    page: 1,
    list: [],
    scrollTop: 0,
    scrollHeight: 0,
    winWidth: 0

  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight,
          winWidth: res.windowWidth,
          id: options.id
        });
      }
    });
    that.getList(that)
  },
  // 一级菜单折叠
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
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
  // onReachBottom: function () {
  //   console.log("上拉");
  //   var that = this;
  //   that.getList(that);
  // },
  // 获取数据
  getList: function (that) {
    var id = that.data.id;//订单id
    var url = app.globalData.servsers + "rz/order/info/"+id;
    var token = wx.getStorageSync("token");//获取token值
    var page = that.data.page;
    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {},
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
          app.exceptionHandle(data, "../../login/login")
        }

      }
    });
  },
  // 数据处理
  dataProcessing: function (data, page) {
    var that = this,
      l = that.data.list,
      noData = that.data.noData,
      dataList = data.order.productList;
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
      var productInfo = JSON.parse(dataList[i].productInfo)
      console.log(productInfo)
      dataList[i].productInfoObj = productInfo;
      // 进度计算
      var winWidth = that.data.winWidth,
        progress = dataList[i].progress;
      dataList[i].progressLine = progress * winWidth;

      // 当前阶段
      var flowList = dataList[i].orderProductFlowList;
      for (var j = flowList.length-1;j>-1;j--){
        var status = flowList[j].status;
        console.log(j)
        console.log(flowList[j])
        if (status == 0) { dataList[i]["nowFlow"] = flowList[j].flowElement.flowName}
      }

      l.push({
        id: dataList[i].id,
        createUser: data.order.createUser.realName,
        open: false,
        data: dataList[i]
      })
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
 
});

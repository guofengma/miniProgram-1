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
  // 传formId到后台
  submitFormId: function (e) {
    var formId = e.detail.formId;
    var id = e.currentTarget.dataset.id;
    console.log(formId)
    if (id) {
      this.goDetail(id);
    }
    if (formId !== "the formId is a mock one") {
      app.postFormId(formId)
    }
  },
  goDetail: function (id) {
    wx.navigateTo({
      url: '../taskDetail/taskDetail?id='+id,
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
    var url = app.globalData.servsers + "rz/orderproductflow/list";
    var token = wx.getStorageSync("token");//获取token值
    var contractid = wx.getStorageSync("contractid");//合同id
    var page = that.data.page;
    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "status": 0,//0未完成
        "page": page,
        "limit": 15
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
      var predictCompleteDate = dataList[i].predictCompleteDate;
        
      dataList[i].predictCompleteDate = predictCompleteDate.slice(0,10)
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
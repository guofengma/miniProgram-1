//获取应用实例
const app = getApp()

Page({
  data: {
    hidden: true,
    noData: "hide",
    display: "hide",
    page: 1,
    list: [],
    contractInfo: "",

    scrollTop: 0,
    scrollHeight: 0,
    winWidth:0
  },
  onLoad: function (option) {
    var that = this,
      contractid = option.id;//合同id
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight,
          winWidth: res.windowWidth,
          contractid: contractid
          
        });
      }
    });
  },
  onShow: function () {
    var that = this;
    this.getList(that)
    that.getContractInfo(that)
  },
  // 传formId到后台
  submitFormId: function (e) {
    var formId = e.detail.formId;
    console.log("formId", formId);
    if (formId !== "the formId is a mock one") {
      app.postFormId(formId)
    }
  },
  // 获取合同信息
  getContractInfo: function (that) {
    // var contractid = wx.getStorageSync("contractid");//合同id
    var contractid = that.data.contractid;//合同id
    var url = app.globalData.servsers + "dy/contract/info/" + contractid;
    var token = wx.getStorageSync("token");//获取token值
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
          that.setData({
            contractInfo: data.entity
          })
        } else {
          app.exceptionHandle(data, "../../login/login")
        }
      }
    });
  },
  // 跳转到详情页
  goDetail: function (e) {
    console.log(e)
    var dataset = e.currentTarget.dataset;
    var id = dataset.id;//订单id
    wx.setStorageSync("orderId", id)
    var fabricType = dataset.type;//面料类型1针织 2梭织
    wx.setStorageSync("fabricType", fabricType)
    var orderNum = dataset.ordernum;//订单编号
    wx.setStorageSync("orderNum", orderNum)
    var subTitle = dataset.title;//详情页标题
    var order=dataset.order;
    wx.setStorageSync("order", order)//订单信息
    wx.navigateTo({
      // url: "../orderTrackingDetail/orderTrackingDetail?title=" + subTitle
      url: "../orderTrackingDetail/orderTrackingDetail?id=" + id
      
    })
  },
  // // 上滑加载
  // bindDownLoad: function () {
  //   var that = this;
  //   that.getList(that);
  // },
  // scroll: function (event) {
  //   this.setData({
  //     scrollTop: event.detail.scrollTop
  //   });
  // },
  // // 下拉刷新
  // refresh: function (event) {
  //   var that = this;
  //   that.setData({
  //     page: 1,
  //     list: [],
  //     scrollTop: 0
  //   });
  //   that.getList(that)
  // },
  // onPullDownRefresh: function () {
  //   console.log("下拉")
  //   var that = this;
  //   that.setData({
  //     page: 1,
  //     list: [],
  //     scrollTop: 0
  //   });
  //   that.getList(that)
  // },
  onReachBottom: function () {
    console.log("上拉");
    var that = this;
    that.getList(that);
  },
  // 获取数据
  getList: function (that) {
    var url = app.globalData.servsers + "dy/orders/list";
    var token = wx.getStorageSync("token");//获取token值
    // var contractid = wx.getStorageSync("contractid");//合同id
    var contractid = that.data.contractid;//合同id
    var page = that.data.page;
    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "isMe": 0,
        "contractid": contractid,
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
      var urgencyDegree = dataList[i].urgencyDegree; //紧急程度 1.普通 2.紧急 3.非常紧急
      switch (urgencyDegree) {
        case 1:
          dataList[i].urgency = "";
          break;
        case 2:
          dataList[i].urgency = "orange";
          break;
        case 3:
          dataList[i].urgency = "red";
          break;
        default:
          dataList[i].urgency = "";
      }
      var realityNum = dataList[i].realityNum;
      if (realityNum > 0) dataList[i].urgency = "blue";
      var fabricInfo = JSON.parse(dataList[i].fabricInfo);//面料信息
      var winWidth = that.data.winWidth;
      dataList[i].fabricName = fabricInfo.fabricName;
      dataList[i].fabricType = fabricInfo.fabricType;
      dataList[i].progress = dataList[i].progress * winWidth; //进度
      dataList[i].estimateDate = dataList[i].estimateDate.slice(0, 10)//预计完成时间
      dataList[i].unit = fabricInfo.fabricType == "1" ? "kg" : "m";//单位
      // 进度计算
      var hasCompleteNum = dataList[i].hasCompleteNum,
        estimateProduction = dataList[i].estimateProduction;
      dataList[i].process = (hasCompleteNum / estimateProduction)* 100
      dataList[i].process = dataList[i].process.toFixed(2) 
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
//获取应用实例
const app = getApp()
Page({
  data: {
    token: "",
    navbar: ['非现货', '现货'],
    currentTab: 0,
    hidden: true,
    noData: "hide",
    display: "hide",
    page: 1,
    list: [],
    scrollTop: 0,
    scrollHeight: 0,
    winWidth: 0

  },
  onLoad: function (option) {
    var that = this,
      cType = option.type;
    var currentTab = cType == 3 ? 1 : 0;
    var token = wx.getStorageSync("token");//获取token值
    that.setData({
      token: token,
      currentTab: currentTab
    })
    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight,
          winWidth: res.windowWidth
        });
      }
    });

  },
  onShow: function () {
    var that = this;
    this.getList(that)
  },
  navbarTap: function (e) {
    var data = this.data
    // console.log(data)
    this.setData(data)
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      page: 1,
      list: []
    })

    this.getList(this)
  },
  // 传formId到后台
  submitFormId: function (e) {
    var formId = e.detail.formId;
    console.log("formId", formId);
    if (formId !== "the formId is a mock one") {
      app.postFormId(formId)
    }
   
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
  // 跳转到订单跟踪列表
  goOrderList: function (e) {
    var id = e.currentTarget.dataset.id;//合同id
    wx.setStorageSync("contractid", id);
    wx.navigateTo({
      url: "../orderTracking/orderTrackingList/orderTrackingList?id=" + id
    })
  },
  // 跳转到详情页
  goDetail: function (e) {
    console.log(e)
    var id = e.currentTarget.dataset.id;//订单id
    wx.setStorageSync("orderId", id)
    var fabricType = e.currentTarget.dataset.type;//面料类型1针织 2梭织
    wx.setStorageSync("fabricType", fabricType)
    var orderNum = e.currentTarget.dataset.ordernum;//订单编号
    wx.setStorageSync("orderNum", orderNum)
    var subTitle = e.currentTarget.dataset.title;//详情页标题
    wx.navigateTo({
      url: "../orderTracking/orderTrackingDetail/orderTrackingDetail?id=" + id
    })
  },
  // 获取数据
  getList: function (that) {
    var token = wx.getStorageSync("token");//获取token值
    var page = that.data.page;
    var currentTab = this.data.currentTab;
    if (currentTab == 1) {
      var url = app.globalData.servsers + "dy/orders/list";
      var params = {
        "isMe": 0,
        "contractid": 0,//现货订单0
        "page": page,
        "limit": 10
      }
    } else {
      var url = app.globalData.servsers + "dy/contract/list";
      var params = {
        "isMe": 0,
        "page": page,
        "limit": 10,
        // "hideComplete": 0
      }
    }

    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: params,
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
      currentTab = that.data.currentTab,
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

    if (currentTab == 1) {
      that.processingCashSale(that, dataList, l)//现货数据处理
    } else {
      that.processingNotCashSale(that, dataList, l)//非现货数据处理
    }
    page++;
    that.setData({
      page: page,
      hidden: true,
      noData: noData
    });
  },
  processingNotCashSale: function (that, dataList, l) {
    for (var i = 0; i < dataList.length; i++) {
      // var contractStatus = dataList[i].contractStatus;//准备中12 生产中34 已完成5 作废6
      // console.log(contractStatus)
      // switch (contractStatus) {
      //   case 0:
      //   case 1:
      //   case 2:
      //     dataList[i].status = "orange";
      //     dataList[i].statusStr = "准备中";
      //     break;
      //   case 3:
      //   case 4:
      //     dataList[i].status = "green";
      //     dataList[i].statusStr = "生产中";
      //     break;
      //   case 5:
      //     dataList[i].status = "grey";
      //     dataList[i].statusStr = "已完成";
      //     break;
      //   default:
      //     dataList[i].status = "grey";
      //     dataList[i].statusStr = "已完成";
      // }
      // var predictDate = dataList[i].predictDate;//预计交付时间
      // var T = new Date(predictDate); // 将指定日期转换为标准日期格式。Fri Dec 08 2017 20:05:30 GMT+0800 (中国标准时间)
      // predictDate = T.getTime() // 将转换后的标准日期转换为时间戳。
      // var CurentTime = new Date();//当前时间
      // CurentTime = CurentTime.getTime(CurentTime)

      // if (CurentTime > predictDate && contractStatus !== 5 && contractStatus !== 6) {
      //   dataList[i].status = "red";
      //   dataList[i].statusStr = "延迟";
      // }
      // 进度计算
      var fabricSum = dataList[i].fabricSum,
        completeNum = dataList[i].completeNum;
      if (fabricSum>0){
        dataList[i].process = (completeNum / fabricSum) * 100;
        dataList[i].process = dataList[i].process.toFixed(2)
      }else{
        dataList[i].process =0.00
      }
     

      // 优先级
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
      dataList[i].predictDate = dataList[i].predictDate.slice(0, 10)//预计完成时间
      var fabricList = dataList[i].fabricList;
      var fabricLength = fabricList.length;
      var fabricName = [];
      for (var j = 0; j < fabricLength; j++) {
        var fabricInfo = JSON.parse(fabricList[j].fabricInfo);
        fabricName.push(fabricInfo.fabricName)
        dataList[i].unit = fabricInfo.fabricType == "1" ? "kg" : "m";//单位
      }
      var fabricNameStr = fabricName.join(",");
      dataList[i].fabricNameStr = fabricNameStr
      l.push(dataList[i])
    }

    that.setData({
      list: l
    });
  },
  processingCashSale: function (that, dataList, l) {
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
      var status = dataList[i].status;
     //订单状态(0.生产中 1.已完成 2.质检完成)
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
      dataList[i].process = (hasCompleteNum / estimateProduction) * 100
      dataList[i].process = dataList[i].process.toFixed(2)

      l.push(dataList[i])
    }

    that.setData({
      list: l
    });
  }


})  
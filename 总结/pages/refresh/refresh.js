var app = getApp()


Page({
  data: {
    hidden: true,
    noData: "hide",
    page: 1,
    list: [],
    finishedList: [],
    scrollTop: 0,
    scrollHeight: 0,
    navbar: ['未完成', '已完成'],
    status: 0,//状态号，未完成0 已完成1
    currentTab: 0,
    winWidth: 0,
    winHeight: 0,
    touch_start: "",
    touch_end: "",
    subTitle: "",
    showAmountModal: {
      showModal: 'hideModal',
      showMask: 'hideMask',
    },
    cloth_img: "cloth_black.png",
    cloth_inferior_img: "cloth_inferior_black.png"
  },
  onLoad: function (option) {
    var that = this;
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    // 修改页面标题
    wx.setNavigationBarTitle({
      title: "下拉刷新上拉加载"
    })
    
  },
  onShow: function () {
    var that = this;
    this.getList(that)
  },
  navbarTap: function (e) {
    console.log(e)
    var s = e.target.dataset.idx;
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      status: s,
      page: 1,
      list: [],
      scrollTop: 0
    });
    this.getList(this)
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  bindDownLoad: function () {
    var that = this;
    var status = this.data.status;
    this.getList(that);
  },
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  refresh: function (e) {
    console.log(e)
    var status = this.data.status;
    var that = this;
    that.setData({
      page: 1,
      list: [],
      scrollTop: 40
    });
    that.getList(that, status)
  },
  onPullDownRefresh: function () {
    console.log("下拉")
    var status = this.data.status;
    var that = this;
    that.setData({
      page: 1,
      list: [],
      scrollTop: 40
    });
    that.getList(that, status)

  },
  onReachBottom: function () {
    console.log("上拉");
    var that = this;
    var status = this.data.status;
    this.getList(that);

  },
  // 获取数据
  getList: function (that) {
    var status = that.data.status;
    var url =  "http://118.31.22.55/diyiAdmin/dy/orders/dyelist";
    var token = "4092bac2c8b821aa7657ad0bf35b343d";//获取token值
    var orderId = "5";//获取订单id
    var page = that.data.page;
    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "status": status,
        "orderid": orderId,
        "page": page,
        "limit": 5
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          that.dataProcessing(data, page, status)//数据处理
          wx.stopPullDownRefresh();
        } else {
          // app.exceptionHandle(data, "../../login/login")
        }

      }
    });
  },
  // 数据处理
  dataProcessing: function (data, page, status) {
    var that = this,
      l = that.data.list,
      noData = that.data.noData,
      dataList = data.page.list;
    if (page == 1 && dataList.length < 1) { noData = "show" } else { noData = "hide" }
    // console.log(noData)

    for (var i = 0; i < dataList.length; i++) {
      if (dataList[i].numIn !== 0) { dataList[i].weight = (dataList[i].numIn / dataList[i].boltIn).toFixed(2); } else { dataList[i].weight = 0 }

      //流程数据处理
      var flowList = dataList[i].flowList;
      var process = 1;
      if (flowList) {
        for (var j = 0; j < flowList.length; j++) {
          if (flowList[j].checkType == 0) {
            flowList[j].iconType = "cancel";
            flowList[j].iconColor = "#999";
            process = 0;
          } else {
            flowList[j].iconType = "success";
            flowList[j].iconColor = "#1498F7";
          }
        }
      }
      //end流程数据处理
      dataList[i].processFinish = process;//流程是否走完状态0未完 1已完
      if (dataList[i].numOut !== 0) { dataList[i].weightOut = (dataList[i].numOut / dataList[i].boltOut).toFixed(2); } else { dataList[i].weightOut = 0 }
      if (dataList[i].inferiorNum !== 0) { dataList[i].inferiorweight = (dataList[i].inferiorNum / dataList[i].inferiorBolt).toFixed(2); } else { dataList[i].inferiorweight = 0 }
      var level = dataList[i].level;
      console.log(dataList[i].level)
      if (level == "B" || level == "C") {
        that.setData({
          cloth_img: "cloth_white.png",
          cloth_inferior_img: "cloth_inferior_white.png"
        })
      }
      l.push(dataList[i])
    }
    if (status == 0) {//未完成
      that.setData({
        list: l,
        noData: noData
      });
    } else {//已完成
      that.setData({
        finishedList: l,
        noData: noData
      });
    }
    page++;
    that.setData({
      page: page,
      hidden: true
    });
  },
  addVat: function () {
    wx.navigateTo({
      url: "../addVat/addVat"
    })
  },

  // 长按删除分缸信息
  deleteVat: function (e) {
    var that = this;
    var url = app.globalData.servsers + "dy/orders/deleteDye";
    var token = wx.getStorageSync("token");//获取token值
    var id = e.currentTarget.dataset.id;//缸id
    console.log(id)
    wx.showModal({
      title: '提示',
      content: '是否删除该条信息',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          // 提交数据
          wx.request({
            url: url,
            data: {
              "dyeid": id
            },
            header: {
              'content-type': 'application/json', // 默认值
              "token": token
            },
            success: function (res) {
              var data = res.data;
              console.log(data)
              if (data.code == 0) {
                that.setData({
                  page: 1,
                  list: [],
                  scrollTop: 0
                });
                that.getList(that, status)

              } else {
                app.exceptionHandle(data, "../../login/login")
              }

            }
          });

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  goAddP: function (e) {
    var dataset = e.currentTarget.dataset;
    var process = dataset.process;
    wx.setStorageSync("process", process)//流程list
    var title = dataset.title;//子页标题
    var id = dataset.id;//这一缸的id
    wx.setStorageSync("vatId", id)
    var finishStatus = dataset.finish;//流程是否走完状态值
    this.setData({
      subTitle: title
    })
    var finishStatus = dataset.finish;
    // 如果流程全部走完---验收
    if (finishStatus) {
      this.setData({
        showAmountModal: {
          showModal: 'showModal',
          showMask: 'showMask',
        }
      })
      return;
    }

    wx.navigateTo({
      url: "../addProgress/addProgress?title=" + this.data.subTitle
    })
  },
  goProgress: function (e) {
    var id = e.currentTarget.dataset.id;//这一缸的id
    wx.setStorageSync("vatId", id)
    var title = e.currentTarget.dataset.title;//子页标题
    this.setData({
      subTitle: title
    })
    wx.navigateTo({
      url: "../progressDetail/progressDetail?title=" + this.data.subTitle
    })
  },
  // 验收表单提交
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var that = this;
    var url = app.globalData.servsers + "dy/orders/checkDye";
    var token = wx.getStorageSync("token");//获取token值
    var vatId = wx.getStorageSync("vatId");//获取缸id
    var val = e.detail.value;
    var flag = true;
    var warn = "";
    if (val.boltOut == "") {
      warn = "请输入成品匹数";
      flag = false;
    } else if (val.numOut == "") {
      warn = "请输入成品数量";
      flag = false;
    } else if (val.inferiorBolt == "") {
      warn = "请输入次品匹数";
      flag = false;
    } else if (val.inferiorNum == "") {
      warn = "请输入次品数量";
      flag = false;
    }
    console.log(flag)
    if (!flag) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    } else {
      wx.request({
        url: url,
        data: {
          "dyeid": vatId,
          "boltOut": val.boltOut,
          "numOut": val.numOut,
          "inferiorBolt": val.inferiorBolt,
          "inferiorNum": val.inferiorNum
        },
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          "token": token
        },
        success: function (res) {
          var data = res.data;
          console.log(data)
          if (data.code == 0) {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1000

            });
            that.setData({
              showAmountModal: {
                showModal: 'hideModal',
                showMask: 'hideMask',
              },
              page: 1,
              list: [],
              scrollTop: 0
            })
            that.getList(that)
          } else {
            app.exceptionHandle(data, "../../login/login")
            that.setData({
              showAmountModal: {
                showModal: 'hideModal',
                showMask: 'hideMask',
              }
            })
          }

        }
      });
    }
  },
  // 确认完成订单
  confirmCompleted: function () {
    var url = app.globalData.servsers + "dy/orders/completeOrder";
    var token = wx.getStorageSync("token");//获取token值
    var orderId = wx.getStorageSync("orderId");//获取订单id
    wx.request({
      url: url,
      data: {
        "orderid": orderId
      },
      method: "GET",
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          wx.navigateBack({
            "delta": 1
          })
        } else {
          app.exceptionHandle(data, "../../login/login")
        }
      }
    });

  }
}) 
//index.js
//获取应用实例
var util = require('../../../utils/util.js');
var app = getApp()

Page({
  data: {
    hidden: true,
    noData: "hide",
    display: "hide",
    page: 1,
    msgList: [],
    height: 0,
    scrollY: true,
    showAmountModal: {
      showModal: 'hideModal',
      showMask: 'hideMask',
    },
  },
  swipeCheckX: 35, //激活检测滑动的阈值
  swipeCheckState: 0, //0未激活 1激活
  maxMoveLeft: 185, //消息列表项最大左滑距离
  correctMoveLeft: 175, //显示菜单时的左滑距离
  thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
  lastShowMsgId: '', //记录上次显示菜单的消息id
  moveX: 0,  //记录平移距离
  showState: 0, //0 未显示菜单 1显示菜单
  touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动
  onLoad: function () {
    this.pixelRatio = app.data.deviceInfo.pixelRatio;
    var windowHeight = app.data.deviceInfo.windowHeight;
    var height = windowHeight;
    this.getList(this)
    this.setData({
      height: height
    })
    // for (var i = 0; i < 30; i++) {
    //   var msg = {};
    //   msg.userName = '' + '用户' + i + 1;
    //   msg.msgText = '您有新的消息'
    //   msg.id = 'id-' + i + 1;
    //   msg.headerImg = '../../res/img/head.png';
    //   this.data.msgList.push(msg);
    // }
    // this.setData({ msgList: this.data.msgList, height: height });
  },
 
  // 下拉刷新
  onPullDownRefresh: function () {
    console.log("下拉");
    var that = this;
    that.setData({
      page: 1,
      msgList: [],
      scrollTop: 0
    });
    that.getList(that)
  },
  // 上拉加载
  onReachBottom: function () {
    console.log("上拉");
    var that = this;
    that.getList(that);
  },

  // 获取数据
  getList: function () {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/applyList";
    var token = wx.getStorageSync("token");//获取token值
    var page = that.data.page;

    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "page": page,
        "limit": 7,
        "status": 0//未审核
      },
      header: {
        'content-type': 'application/json',// 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        // console.log(data)
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
      l = that.data.msgList,
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
    console.log(dataList)
    for (var i = 0; i < dataList.length; i++) {
      dataList[i].realId = dataList[i].id
      dataList[i].id = 'id-' + i + 1;
      // 状态
      var status = dataList[i].status;
      switch (status) {
        case 0:
          dataList[i].statusClass = "";
          dataList[i].statusStr = "等待审核";
          break;
        case 1:
          dataList[i].statusClass = "green";
          dataList[i].statusStr = "审核通过";

          break;
        case 2:
          dataList[i].statusClass = "red";
          dataList[i].statusStr = "审核失败";
          break;
        default:
          dataList[i].statusClass = "";
          dataList[i].statusStr = "等待审核";
      }
      // 图片
      var imgList = dataList[i].materiel.imgList;
      if (imgList == null || imgList.length < 1) {
        dataList[i].img = "/images/notUpload_sm.png"
      } else {
        dataList[i].img = imgList[0].imgUrl
      }

      l.push(dataList[i])
    }

    that.setData({
      msgList: l
    });
    page++;
    that.setData({
      page: page,
      hidden: true,
      noData: noData
    });
  },


  ontouchstart: function (e) {
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXMsgItem(this.lastShowMsgId, 0, 500);
      this.lastShowMsgId = "";
      return;
    }
    this.firstTouchX = e.touches[0].clientX;
    this.firstTouchY = e.touches[0].clientY;
    if (this.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
    this.lastMoveTime = e.timeStamp;
  },

  ontouchmove: function (e) {
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    var moveX = e.touches[0].clientX - this.firstTouchX;
    var moveY = e.touches[0].clientY - this.firstTouchY;
    //已触发垂直滑动，由scroll-view处理滑动操作
    if (this.swipeDirection === 2) {
      return;
    }
    //未触发滑动方向
    if (this.swipeDirection === 0) {
      console.log(Math.abs(moveY));
      //触发垂直操作
      if (Math.abs(moveY) > 4) {
        this.swipeDirection = 2;

        return;
      }
      //触发水平操作
      if (Math.abs(moveX) > 4) {
        this.swipeDirection = 1;
        this.setData({ scrollY: false });
      }
      else {
        return;
      }

    }
    //禁用垂直滚动
    if (this.data.scrollY) {
      this.setData({scrollY:false});
    }

    this.lastMoveTime = e.timeStamp;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXMsgItem(e.currentTarget.id, moveX, 1000);
  },
  ontouchend: function (e) {
    this.swipeCheckState = 0;
    var swipeDirection = this.swipeDirection;
    this.swipeDirection = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      this.setData({ scrollY: true });
      return;
    }
    //垂直滚动，忽略
    if (swipeDirection !== 1) {
      return;
    }
    if (this.moveX === 0) {
      this.showState = 0;
      //不显示菜单状态下,激活垂直滚动
      this.setData({ scrollY: true });
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
    }
    else {
      this.moveX = 0;
      this.showState = 0;
      //不显示菜单,激活垂直滚动
      this.setData({ scrollY: true });
    }
    this.translateXMsgItem(e.currentTarget.id, this.moveX,1000);
    //this.translateXMsgItem(e.currentTarget.id, 0, 0);
  },
  onAgreeTap: function (e) {
    this.agreeItem(e);
  },
  
  onDisagreeTap: function (e) {
    this.disagreeItem(e);
  },

  getItemIndex: function (id) {
    var msgList = this.data.msgList;
    for (var i = 0; i < msgList.length; i++) {
      if (msgList[i].id === id) {
        return i;
      }
    }
    return -1;
  },
  agreeItem: function (e) {
    console.log(e)
    console.log("点击同意")
    var data = e.currentTarget.dataset.data;
    wx.setStorageSync("materiel", data)//物料信息
    wx.navigateTo({
      url: '../inCheckForm/inCheckForm',
    })
    
    // var animation = wx.createAnimation({ duration: 200 });
    // animation.height(0).opacity(0).step();
    // this.animationMsgWrapItem(e.currentTarget.id, animation);
    // var s = this;
    // setTimeout(function () {
    //   var index = s.getItemIndex(e.currentTarget.id);
    //   s.data.msgList.splice(index, 1);
    //   s.setData({ msgList: s.data.msgList });
    // }, 200);
    // this.showState = 0;
    // this.setData({ scrollY: true });
  },
  disagreeItem: function (e) {
    console.log(e)
    console.log("点击不同意")
    var applyId = e.currentTarget.dataset.id;
    this.setData({
      showAmountModal: {
        showModal: 'showModal',
        showMask: 'showMask',
      },
      applyId: applyId
    })

  },
  hideModal: function (e) {
    this.setData({
      showAmountModal: {
        showModal: 'hideModal',
        showMask: 'hideMask',
      }
    })
  },
  translateXMsgItem: function (id, x, duration) {
    var animation = wx.createAnimation({ duration: duration });
    animation.translateX(x).step();
    this.animationMsgItem(id, animation);
  },
  animationMsgItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'msgList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  animationMsgWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'msgList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  },


  // 拒绝
  // 提交表单
  formSubmit: function (e) {
    var val = e.detail.value;
    var warn = "";
    var flag = true;
    
    
    


    if (val.remarks == "") {
      warn = "请输入备注"
      flag = false;
    } 

    if (!flag) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    } else {
      this.postData(val)

    }

  },
  postData: function (data) {
    wx.showLoading({
      title: '上传中',
      icon: "none",
      mask: true
    })
    console.log(data);
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/save";//入库接口地址
    var token = wx.getStorageSync("token")
    var applyId = this.data.applyId;
    wx.request({
      url: url,
      data: {
        "applyId": applyId,
        "status": 2,
        "remarks": data.remarks
      },
      methond: "POST",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      method: "POST",
      success: function (res) {
        // console.log(res.data)
        wx.hideLoading()
        var code = res.data.code;
        if (code == 0) {//提交成功
          that.hideModal();
          that.setData({
            page: 1,
            msgList: [],
            scrollTop: 0
          });
          that.getList(that)
      

        } else {
          app.exceptionHandle(res.data, "../../login/login")
        }
      }
    })
  },
  imgError: function (e) {
    console.log(e)
    var index = e.target.dataset.index;
    var msgList = this.data.msgList;
    msgList[index]["img"] = "/images/errImg.png"
    this.setData({
      msgList: msgList
    })
  },
  // 预览图片
  previewImg(e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  }
})

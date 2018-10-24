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
  correctMoveLeft: 85, //显示菜单时的左滑距离
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
  // 进入详情页
  goDetail:function(e){
    console.log(e)
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../materialCheckDetail/materialCheckDetail?id='+id,
    })
  },
  // 进入物料申请表单页
  goForm: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '../requisitionForm/requisitionForm',
    })
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
    var url = app.globalData.servsers + "rz/apply/list";
    var token = wx.getStorageSync("token");//获取token值
    var page = that.data.page;
    var userId = wx.getStorageSync("userId");//当前用户id

    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "page": page,
        "limit": 7,
        "status":0
        
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
      // dataList[i].status=6
      // 状态
      var status = dataList[i].status;//0-待审核，1-物料准备，2-准备就绪，3-使用中，4-订单完成，5-订单驳回，6-订单取消
      switch (status) {
        case 0:
          dataList[i].statusClass = "";
          dataList[i].statusStr = "等待审核";
          break;
        case 1:
          dataList[i].statusClass = "blue";
          dataList[i].statusStr = "物料准备";

          break;
        case 2:
          dataList[i].statusClass = "green";
          dataList[i].statusStr = "准备就绪";
          break;
        case 3:
          dataList[i].statusClass = "orange";
          dataList[i].statusStr = "使用中";
          break;
        case 4:
          dataList[i].statusClass = "grey";
          dataList[i].statusStr = "订单完成";
          break;
        case 5:
          dataList[i].statusClass = "red";
          dataList[i].statusStr = "订单驳回";
          break;
        case 6:
          dataList[i].statusClass = "grey";
          dataList[i].statusStr = "订单取消";
          break;
        default:
          dataList[i].statusClass = "";
          dataList[i].statusStr = "等待审核";
      }

      // 时间
      var predictBackDate = dataList[i].predictBackDate
      dataList[i].predictBackDate = predictBackDate.slice(0, 16);

      var nowDate = new Date().getTime();
      predictBackDate = predictBackDate.replace(/-/g, '/'); 
      predictBackDate = new Date(predictBackDate).getTime();
      if ((predictBackDate - nowDate) < 0 && status !== 6 && status !== 4 && status !== 5) {
        dataList[i].timeDelay = "red"
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
      this.translateXMsgItem(this.lastShowMsgId, 0, 200);
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
    // if (this.data.scrollY) {
    //   this.setData({scrollY:false});
    // }

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
    this.translateXMsgItem(e.currentTarget.id, moveX, 0);
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
    this.translateXMsgItem(e.currentTarget.id, this.moveX, 500);
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
    this.setData({
      showAmountModal: {
        showModal: 'showModal',
        showMask: 'showMask',
      }
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
})

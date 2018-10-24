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
    ready:true,
    height: 0,
    scrollY: true,
    showAmountModal: {
      showModal: 'hideModal',
      showMask: 'hideMask',
    },
    showRejectModal: {
      showModal: 'hideModal',
      showMask: 'hideMask',
    },
  },
  swipeCheckX: 35, //激活检测滑动的阈值
  swipeCheckState: 0, //0未激活 1激活
  maxMoveLeft: 185, //消息列表项最大左滑距离
  correctMoveLeft: 75, //显示菜单时的左滑距离
  thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
  lastShowMsgId: '', //记录上次显示菜单的消息id
  moveX: 0,  //记录平移距离
  showState: 0, //0 未显示菜单 1显示菜单
  touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动
  onLoad: function (options) {
    this.pixelRatio = app.data.deviceInfo.pixelRatio;
    var windowHeight = app.data.deviceInfo.windowHeight;
    var height = windowHeight;

    var id = options.id;
    console.log(id)
    this.setData({
      applyId: id,
      height: height
    })
    this.getList(id)
  },

  // 获取数据
  getList: function (id) {
    var that = this;
    var url = app.globalData.servsers + "rz/apply/info/" + id;
    var token = wx.getStorageSync("token");//获取token值

    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',// 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          that.dataProcessing(data)
        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    })
  },
  dataProcessing: function (data) {
    var data = data.data;

    // 图片
    var applyMaterialList = data.applyMaterialList,
      l = applyMaterialList.length;
    for (var i = 0; i < l; i++) {
      applyMaterialList[i].realId = applyMaterialList[i].id
      applyMaterialList[i].id = 'id-' + i + 1;
      // 图片
      var imgList = applyMaterialList[i].materielImgList;
      if (imgList == null || imgList.length < 1) {
        applyMaterialList[i].img = "/images/notUpload_sm.png"
      } else {
        applyMaterialList[i].img = imgList[0].imgUrl
      }

      var status = applyMaterialList[i].status;
      if (status==0){
        this.setData({
          ready:false
        })
      }
    }


    this.setData({
      info: data,
      msgList: data.applyMaterialList
    })
  },

  ontouchstart: function (e) {
    var status = e.currentTarget.dataset.status;
    console.log(status)
    if (status ==0) { return }//不需要左滑
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
    this.translateXMsgItem(e.currentTarget.id, this.moveX, 1000);
    //this.translateXMsgItem(e.currentTarget.id, 0, 0);
  },
  // 出库
  onAgreeTap: function (e) {
    this.agreeItem(e);
  },
  // 拒绝
  onDisagreeTap: function (e) {
    this.disagreeItem(e);
  },
  // 长按取消
  onCancelTap:function(e){
    var status = e.currentTarget.dataset.status;
    var that=this;
    console.log(status)
    if (!status){
      return
    }else{
      wx.showModal({
        title: '提示',
        content: '是否取消？',
        success:function(res){
          if (res.confirm) {
            that.cancelItem(e)
          }else{
            return
          }
        }
      })
    }
    
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
    console.log("点击出库")
    var id = e.currentTarget.dataset.id;
    var count = e.currentTarget.dataset.count;
    
    var touchId = e.currentTarget.id;
    this.setData({
      touchId: touchId,
      count: count,
      applyMaterialId:id,
      showAmountModal: {
        showModal: 'showModal',
        showMask: 'showMask',
      }
    })

    
  },
  disagreeItem: function (e) {
    console.log(e)
    console.log("点击拒绝")
    var id = e.currentTarget.dataset.id;
    var touchId = e.currentTarget.id;
    this.setData({
      touchId: touchId,
      applyMaterialId: id,
      showRejectModal: {
        showModal: 'showModal',
        showMask: 'showMask',
      }
    })
    
   

  },
  cancelItem:function(e){
    console.log("点击取消")
    var that = this,
      applyId = that.data.applyId,//申请id
      applyMaterielId = e.currentTarget.dataset.id;
    var touchId = e.currentTarget.id;
    var url = app.globalData.servsers + "rz/apply/cancleOutBound";
    var token = wx.getStorageSync("token")

    wx.request({
      url: url,
      data: {
        "applyMaterielId": applyMaterielId,
      },
      methond: "GET",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
        if (code == 0) {//提交成功
          that.hideModal();
          // 刷新
          var msgList = that.data.msgList;
          var ready=true;
          console.log(applyMaterielId)
          console.log(msgList)
          for (var i = 0, l = msgList.length; i < l; i++) {
            var id = msgList[i].applyMaterialId;
            console.log(id)
            if (id == applyMaterielId) {
              msgList[i].status = 0;
            }
            if (msgList[i].status==0){
              ready=false
            }
          }
          console.log(msgList)
          that.setData({
            msgList: msgList,
            ready: ready
          })
          that.translateXMsgItem(touchId, 0, 0);
        } else {
          app.exceptionHandle(res.data, "../../login/login")
        }
      }
    })

  },
  hideModal: function (e) {
    this.setData({
      showAmountModal: {
        showModal: 'hideModal',
        showMask: 'hideMask',
      },
      showRejectModal: {
        showModal: 'hideModal',
        showMask: 'hideMask',
      }
    })
  },
  translateXMsgItem: function (id, x, duration) {
    console.log(id)
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
  /* 点击减号 */
  bindMinus: function (e) {
    var num = this.data.count;
    // 如果大于1时，才可以减  
    if (num > 0) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1 ? 'disabled' : 'normal';

    // 将数值与状态写回  
    this.setData({
      count: num,
      minusStatus: minusStatus,
    });

  },
  /* 点击加号 */
  bindPlus: function (e) {
    var num = this.data.count;
    // 不作过多考虑自增1
    num++;

    // 将数值与状态写回  
    this.setData({
      count: num
    });


  },
  /* 输入框事件 */
  bindManual: function (e) {
    var val = parseFloat(e.detail.value).toFixed(2);
    console.log(val)
   
    if (val <=0) { return 0 }
    // 将数值与状态写回  
    this.setData({
      count: val
    });

  },
  // 出库表单提交
  formSubmit: function (e) {
    console.log(e)
    var that = this,
      applyId = that.data.applyId,//申请id
      touchId = that.data.touchId,
      applyMaterialId = that.data.applyMaterialId;//物料id
    var count = e.detail.value.count;//实际准备数量

    if (count == "") {
      wx.showToast({
        title: '请输入准备数量',
        icon: "none"
      })
      return

    }

    var url = app.globalData.servsers + "rz/apply/outbound";
    var token = wx.getStorageSync("token")
    wx.showLoading({
      title: '上传中',
      icon:"none",
      mask:true
    })
    wx.request({
      url: url,
      data: {
        "applyMaterialId": applyMaterialId,
        "realNum": count,
      },
      methond: "GET",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
        if (code == 0) {//提交成功
          that.hideModal();
          // 刷新
          var msgList = that.data.msgList;
          var ready = true;
          for (var i=0, l = msgList.length;i<l;i++){
            var id = msgList[i].applyMaterialId;
            if (id == applyMaterialId){
              msgList[i].status=1;
              msgList[i].realNum = count;
            }
            if (msgList[i].status == 0) {
              ready=false;
            }
          }
          that.setData({
            msgList:msgList,
            count:"",
            ready: ready
          })
          that.translateXMsgItem(touchId, 0, 0);
        } else {
          app.exceptionHandle(res.data, "../../login/login")
        }
        wx.hideLoading()
      }
    })
  },
  // 拒绝表单提交
  formRejectSubmit: function (e) {
    var that = this,
      applyId = that.data.applyId,//申请id
      touchId = that.data.touchId,
      applyMaterialId = that.data.applyMaterialId;//物料id
    var url = app.globalData.servsers + "rz/apply/rejectBound";
    var token = wx.getStorageSync("token")
    var remarks = e.detail.value.remarks;//拒绝理由
    wx.showLoading({
      title: '上传中',
      icon: "none",
      mask: true
    })
    wx.request({
      url: url,
      data: {
        "applyMaterialId": applyMaterialId,
        "remarks": remarks
      },
      methond: "GET",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
        if (code == 0) {//提交成功
          that.hideModal();
          // 刷新
          var msgList = that.data.msgList;
          var ready = true;
          for (var i = 0, l = msgList.length; i < l; i++) {
            var id = msgList[i].applyMaterialId;
            if (id == applyMaterialId) {
              msgList[i].status = 2;
              msgList[i].remarks = remarks == "" ? null : remarks;
            }
            if (msgList[i].status == 0) {
                ready=false
            }
          }
          that.setData({
            msgList: msgList,
            remarks:"",
            ready: ready
          })
          that.translateXMsgItem(touchId, 0, 0);



        } else {
          app.exceptionHandle(res.data, "../../login/login")
        }
        wx.hideLoading()
        
      }
    })
  },
  // 准备就绪
  bindReady:function(e){
    var ready=e.currentTarget.dataset.ready;
    if(!ready)return;

    var that = this,
      applyId = that.data.applyId;//申请id
    var url = app.globalData.servsers + "rz/apply/ready";
    var token = wx.getStorageSync("token")
    wx.showLoading({
      title: '上传中',
      icon: "none",
      mask: true
    })
    wx.request({
      url: url,
      data: {
        "applyId": applyId
      },
      header: {
        'content-type': 'application/json',
        'token': token
      },
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
        if (code == 0) {//提交成功
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.setData({
            page: 1,
            msgList: [],
            scrollTop: 0
          })
          prePage.getList(prePage)
          // end刷新上一页数据
          wx.navigateBack({
            delta: 1
          })

        } else {
          app.exceptionHandle(res.data, "../../login/login")
        }
        wx.hideLoading()
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

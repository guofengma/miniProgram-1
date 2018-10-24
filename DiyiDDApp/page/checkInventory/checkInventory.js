import { DDhttpRequest, exceptionHandle } from '../../util/request';
let app = getApp();

Page({
  data: {
    noDataHidden: true,
    list: [],
    personList:[],//人员选项
    canDistribution:false,//分配权限
    interval:{}//定时器
  },
  onLoad() {
    var _this = this;
    var canDistribution = app.isPermission("dy:dyfabricoqa:distributionPeople")
    // _this.init()
    
    _this.setData({
      canDistribution: canDistribution
    })
    // _this.getList()
    if (canDistribution) _this.getPersonList()
  },
  onShow() {
    // 页面显示
    var _this=this
    _this.init()
    _this.getList()

    var interval=this.data.interval
    interval=setInterval(function() {
      _this.init()
      _this.getList()
    }, 300000)
    this.setData({
      interval:interval
    })
  },
  onHide() {
    // 页面隐藏
    var interval = this.data.interval
    clearInterval(interval)//清除定时器
    this.setData({
      interval: interval
    })
  },
  onUnload() {
    // 页面被关闭
    var interval = this.data.interval
    clearInterval(interval)//清除定时器
    this.setData({
      interval: interval
    })
    
  },
  init: function() {
    this.setData({
      noDataHidden: true,
      list: []
    })
  },
  // 分配人员
  chosePerson:function(e){
    var _this=this
    var dataset=e.currentTarget.dataset
    var i=e.detail.value
    var index = dataset.index
    var fabricOqaId=dataset.fabricOqaId
    var orderId = dataset.orderId
    var personList = _this.data.personList
    var userid = personList[i].userId
    var url = app.globalData.servsers + "/dy/dyfabricoqa/distributionPeople"
    var method = "post"
    var data={
      "userid": userid,
      "orderId": orderId,
      "fabricOqaId": fabricOqaId
    }
    dd.showLoading({
      content: '分配中...'
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        console.log(res)
        var data = res.data;
        if (data.code == 0) {
          dd.showToast({
            type: 'success',
            content: "分配成功",
            duration: 2000,
            success: () => {
              _this.getList()
            },
          });
        } else {
          exceptionHandle(res.data)
        }

      }
    })

    
  },
  // 进入检验详情
  toDetail: function(e) {
    var id = e.currentTarget.id//订单id
    var dataset = e.currentTarget.dataset;
    var title = dataset.title;
    var pname=dataset.pname;
    var item = dataset.item;
    var fabricOqaId = dataset.fabricOqaId
    console.log(item)
    dd.setStorageSync({
      key: 'checkInfo',
      data: {
        checkInfo: item
      }
    });
    if(pname){
      dd.navigateTo({
        url: '../checkOperation/checkOperation?title=' + title + '&id=' + id//成检操作列表
      })
    }else{
      dd.navigateTo({
        url: '../examineCargo/examineCargo?title=' + title + '&id=' + fabricOqaId + '&type=' + 1//验货表单页
      })
    }
   
  },
  // 下拉刷新
  onPullDownRefresh() {
    let _this = this;
    _this.setData({
      list: [],
      bottomHidden: true,
      noDataHidden: true,
    })
    _this.getList()
  },
  // //上拉加载
  // onReachBottom() {
  //   this.getList()
  // },
  // 获取列表
  getList: function() {
    var _this = this
    var url = app.globalData.servsers + "/dy/dyfabricoqa/checkList"
    var method = "get"
    var canDistribution = _this.data.canDistribution
    var isMe = canDistribution?0:1
    var data = {
      isMe:isMe
    }
    dd.showLoading({
      content: '加载中...'
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        console.log(res)
        var data = res.data;
        if (data.code == 0) {
          var list = data.list;
          _this.dataProcessing(list)
          
        } else {
          exceptionHandle(res.data)
        }

      }
    })
  },
  // 待检验坯布列表数据处理
  dataProcessing(data) {
    var list = this.data.list
    data=data?data:[]
    console.log(data)
    if ( data.length < 1) {
      var noDataHidden = false
    } else {
      var noDataHidden = true
    }
    data.forEach(item => {
      // 优先级
      var urgentDegree = item.urgentDegree; //紧急程度 1.普通 2.紧急 3.非常紧急
      var isEmergency = item.isEmergency; //是否加急        
      switch (urgentDegree) {
        case 1:
          item.urgency = "green";
          break;
        case 2:
          item.urgency = "orange";
          break;
        case 3:
          item.urgency = "red";
          break;
        default:
          item.urgency = "green";
      }
      if (isEmergency) item.isEmergency = "emergent";
      // 预计完成时间
      var estimateDate = item.estimateDate
      var orderCreateDate = item.orderCreateDate
      if (orderCreateDate){
        console.log(orderCreateDate)
        var dateObj = this.handleDate(estimateDate, orderCreateDate)
        item.estimateDate = estimateDate.slice(0, 10)
        item.dateStatus = dateObj.dateStatus
        item.dateStr = dateObj.dateStr
      }
      // list.push(item)
    })
    this.setData({
      list: data,
      noDataHidden: noDataHidden
    })
    dd.hideLoading();
    dd.stopPullDownRefresh()//停止当前页面的下拉刷新。
  },
  // 处理预计完成时间
  handleDate(estimateDate, createDate) {
    var date = new Date(estimateDate)
    createDate = new Date(createDate)
    var dateObj = {
      dateStr: estimateDate.slice(0, 10) + "交",
      dateStatus: ""
    }
    var now = new Date()
    var diff = date - now;
    var duration = date - createDate;
    if (diff < 0) {
      var day = Math.ceil(-diff / 24 / 3600 / 1000)
      console.log(day)
      dateObj.dateStr = "逾期" + day + "天"
      dateObj.dateStatus = "red"
    } else {
      if (diff < (duration * (1 / 3))) {
        dateObj.dateStatus = "orange"
      }
    }
    return dateObj
  },
  // 获取人员列表
  getPersonList: function() {
    var _this = this
    var url = app.globalData.servsers + "/sys/user/selectUserByRole"
    var method = "get"
    var data = {
      roleId:31//31--仓库操作员
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          console.log(data.list)
          _this.setData({
            personList: data.list
          })
        } else {
          exceptionHandle(res.data)
        }

      }
    })
  }
})
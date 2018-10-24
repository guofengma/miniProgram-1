import { DDhttpRequest, exceptionHandle } from '../../util/request';
let app = getApp();

Page({
  data: {
    page: 1,
    bottomHidden: true,
    noDataHidden: true,
    list: []
  },
  onLoad() {
    var _this = this;
    _this.init()
    _this.getMessageList()
  },
  init:function(){
    var _this = this;
    _this.setData({
      list: [],
      page: 1,
      bottomHidden: true,
      noDataHidden: true,
    })
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    let _this = this;
    _this.init()
    _this.getMessageList()
  },
  //上拉加载
  onReachBottom() {
    this.getMessageList()
  },
  // 获取消息列表
  getMessageList: function() {
    var _this = this
    var bottomHidden = this.data.bottomHidden;
    if (!bottomHidden) return
    var userInfo = dd.getStorageSync({ key: "userInfo" }).data
    var userId=userInfo.userId
    var page = _this.data.page
    var url = app.globalData.servsers + "/notify/notify/list"
    var method = "get"
    var data = {
      page: page,
      limit: 10,
      //status: 0,//0 未读 1 已读
      type: 0,//1 系统消息 2 仓库操作 3 合同订单跟进 4 财务管理
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
          var list = data.page.list;
          _this.dataProcessing(list, page)
          _this.markRead(userId)
        } else {
          exceptionHandle(res.data)
        }

      }
    })
  },
  // 标记已读
  markRead: function(userId){
    var _this = this
    var url = app.globalData.servsers + "/notify/notify/read"
    var method = "get"
    var data = {
      id: 0//消息id 传0为全部设置为已读
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        console.log(res)
        var data = res.data;
        if (data.code == 0) {
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.getUnread()
         // end刷新上一页数据
        } else {
          exceptionHandle(res.data)
        }

      }
    })

  },

  // 待检验坯布列表数据处理
  dataProcessing(data, page) {
    var list = this.data.list
    if (data.length < 10) {
      var bottomHidden = false
    } else {
      var bottomHidden = true
    }
    if (page == 1 && data.length < 1) {
      var noDataHidden = false
    } else {
      var noDataHidden = true
    }
    data.forEach(item => {

      list.push(item)
    })
    page++
    this.setData({
      list: list,
      page: page,
      bottomHidden: bottomHidden,
      noDataHidden: noDataHidden
    })
    dd.hideLoading();
    dd.stopPullDownRefresh()//停止当前页面的下拉刷新。
  },
})
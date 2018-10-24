import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      page: 1,
      bottomHidden: true,
      noDataHidden: true,
      list:[]
    },
    onLoad(){
      // var _this = this;
      // _this.init()
      // _this.getClothList()
    },
    onShow(){
      var _this = this;
      _this.init()
      _this.getClothList()
    },
  init: function() {
    this.setData({
      page: 1,
      bottomHidden: true,
      noDataHidden: true,
      list: []
    })
  },
    // 进入检验详情
  toClothDetail:function(e){
    var id=e.currentTarget.id
    var dataset = e.currentTarget.dataset;
    var title = dataset.title;
    dd.navigateTo({
      url: '../clothCheckDetail/clothCheckDetail?title=' + title + '&id=' + id
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    let _this = this;
    _this.setData({
      list: [],
      page: 1,
      bottomHidden: true,
      noDataHidden: true,
    })
    _this.getClothList()
  },
  //上拉加载
  onReachBottom() {
    this.getClothList()
  },
    // 获取待检验坯布列表
    getClothList: function() {
      var _this = this
      var bottomHidden = this.data.bottomHidden;
      if (!bottomHidden) return
      var page = _this.data.page
      var url = app.globalData.servsers + "/dy/warehouse/selectPage"
      var method = "get"
      var data = {
        page: page,
        limit:10,
        type:"3",//3--坯布
        checkStatus:0//未检验
      }

      dd.showLoading({
        content: '加载中...'
      });
      DDhttpRequest({
        url, method, data,
        success(res) {
          dd.hideLoading()
          var data = res.data;
          if (data.code == 0) {
            var list = data.page.list;
            _this.dataProcessing(list, page)
          } else {
            exceptionHandle(res.data)
          }

        }
      })
    },
  // 待检验坯布列表数据处理
  dataProcessing(data, page) {
    var list=this.data.list
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
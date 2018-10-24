import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      page: 1,
      noDataHidden: true,
      list:[]
    },
    onLoad(){
      // var _this = this;
      // _this.init()
      // _this.getList()
    },
    onShow:function(){
      var _this = this;
      _this.init()
      _this.getList()
    },
  init: function() {
    this.setData({
      page: 1,
      noDataHidden: true,
      list: []
    })
  },
    // 进入点货
  toClothDetail:function(e){
    var id=e.currentTarget.id
    var dataset = e.currentTarget.dataset;
    var title = dataset.title;
    dd.setStorageSync({
      key: 'deliveryInfo',
      data: {
        info: dataset.item
      }
    })
  
    
    dd.navigateTo({
      url: '../deliveryDetail/deliveryDetail?title=' + title + '&id=' + id
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    let _this = this;
    _this.init()
    _this.getList()
  },
  //上拉加载
  // onReachBottom() {
  //   this.getList()
  // },
    // 获取待检验坯布列表
    getList: function() {
      var _this = this
      var url = app.globalData.servsers + "/shipments/shipments/list"
      var method = "get"
      var data = {
        status:0//未发货
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
    var list=this.data.list
    
    if (data.length < 1) {
      var noDataHidden = false
    } else {
      var noDataHidden = true
    }
    data.forEach(item => {
      // 发货时间及状态
      var createDate = item.createDate
      var urgency = item.urgency //紧急程度 1 普通 2 紧急  普通 24小时内发货 紧急 当天凌晨12点前发货
      var now=new Date()
      var arr = createDate.split(/[- :]/);
      var date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);//ios不兼容2012-12-12 12:12:12格式，需特殊转换
      date = date.getTime()
      date = new Date(date + 24 * 3600 * 1000)
      if(urgency==1){
        item.createDate = app.dateFormat(date)
        if(createDate-now<0)item.dateStatus="red"
      }else{
        item.createDate = app.dateFormat(date).split(" ")[0]+" 00:00:00"
        item.dateStatus="red"
      }
     list.push(item)
    })
    this.setData({
      list: list,
      noDataHidden: noDataHidden
    })
    dd.hideLoading();
    dd.stopPullDownRefresh()//停止当前页面的下拉刷新。
  },
})
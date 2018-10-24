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
      var _this = this;
      _this.init()
      _this.getClothList()
    },
    init:function(){
      this.setData({
        page: 1,
        bottomHidden: true,
        noDataHidden: true,
        list: []
      })
    },
 
  // 审核
  toAudit:function(e){
    var _this = this
    var type = e.currentTarget.dataset.type
    var content = type == 'agree' ? '同意' : '拒绝'
    dd.confirm({
      title: '温馨提示',
      content: '是否'+content+'该坯布？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm){
          _this.postData(e)
        }
      },
    });
   
  },
  postData:function(e){
    var id = e.currentTarget.id
    var type = e.currentTarget.dataset.type
    var _this = this
    var url = app.globalData.servsers + "/dy/orderscloth/" + type
    var method = "post"
    var data = [id]
  
    DDhttpRequest({
      url, method, data,
      success(res) {
        console.log(res)
        var data = res.data;
        if (data.code == 0) {
          dd.showToast({
            type: 'success',
            content: "操作成功",
            duration: 2000,
            success: () => {
              _this.setData({
                list: [],
                page: 1,
                bottomHidden: true,
                noDataHidden: true,
              })
              _this.getClothList()
            },
          });

        } else {
          exceptionHandle(res.data)
        }

      }
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    let _this = this;
    _this.setData({
      list:[],
      page:1,
      bottomHidden: true,
      noDataHidden: true,
    })
    _this.getClothList()
  },
  //上拉加载
  onReachBottom() {
    this.getClothList()
  },
    // 获取待审核坯布列表
    getClothList: function() {
      var _this = this
      var bottomHidden = this.data.bottomHidden;
      if (!bottomHidden) return
      var page = _this.data.page
      var url = app.globalData.servsers + "/dy/orderscloth/list"
      var method = "get"
      var data = {
        page: page,
        limit:10,
        orderid:0,
        status:0,//未审核
        isall:0
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
      var clothInfo = JSON.parse(item.clothInfo)
      item.clothInfo = clothInfo
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
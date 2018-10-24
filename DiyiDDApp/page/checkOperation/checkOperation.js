import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      orderId:"" ,
      list:[],
      panels: [
        {
          title: '生产要求',
          content: '',
          expanded: true,
        },
      ],
    },
  onLoad(options){
      var _this = this;
      // 修改页面标题
      dd.setNavigationBar({
        title: options.title
      })
     var orderId = options.id
     _this.setData({
        orderId: orderId,
     })
   

  },
  onShow(){
    var _this = this;
    _this.init()
    _this.getList()
  },
  init:function(){
    this.setData({
      panels: [
        {
          title: '生产要求',
          content: '',
          expanded: true,
        },
      ],
    })
  },
  // 进入验货表单页/生产详情页
  toNext:function(e){
    var dataset=e.currentTarget.dataset
    var toType=dataset.type
    var title=dataset.title
    var id = e.currentTarget.id
    var dyeId = dataset.dyeId
    var status=dataset.status
    
    if (toType =="check"){
      
      dd.navigateTo({
        url: '../examineCargo/examineCargo?title=缸号：' + title + '&id=' + id + '&type=' + 2///验货表单页
      })
    }else if(toType=="detail"){
      console.log(e)
      dd.navigateTo({
        url: '../vatDetail/vatDetail?title=' + title + '&id=' + dyeId//生产详情页
      })
    }
    if (toType == "checkDetail" && status!==0){
      dd.navigateTo({
        url: '../checkDetail/checkDetail?title=' + title + '&id=' + id//成检详情页
      })
    }

  },
  // 折叠面板
  handleTitleTap(e) {
    const { index } = e.currentTarget.dataset;
    const panels = this.data.panels;
    // android does not supprt Array findIndex
    panels[index].expanded = !panels[index].expanded;
    this.setData({
      panels: panels,
    });
  },
  // 获取成检操作列表
  getList(){
    var _this = this
    var url = app.globalData.servsers + "/dy/dyfabricoqa/checkOperation"
    var method = "get"
    var orderId = _this.data.orderId
    var canDistribution = app.isPermission("dy:dyfabricoqa:distributionPeople")
    var isMe = canDistribution ? 0 : 1
    var data = {
      orderId: orderId,
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
          var data = data.data;
          _this.dataProcessing(data)
        } else {
          exceptionHandle(res.data)
        }

      }
    })
  },
  // 数据处理
  dataProcessing:function(data){
    var _this=this
    var panels=_this.data.panels
    panels[0].content=data
    var list = data.fabricOqaList

    _this.setData({
      panels: panels,
      list:list
    })
  }
})
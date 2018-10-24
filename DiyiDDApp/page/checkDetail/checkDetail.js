import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      detail:{},
      fabricOqa:{}
    },
  onLoad(options){
      var _this = this;
      var id = options.id
      var title = options.title
      // 修改页面标题
      dd.setNavigationBar({
        title: "缸号" + title
      })

      _this.setData({
        id: id,//缸id
      })
      _this.getCheckDetail()
    },
  // 获取成检详情
  getCheckDetail: function() {
    var _this = this;
    var id = _this.data.id
    var url = app.globalData.servsers + "/dy/dyfabricoqadetail/info/"+id
    var method = "get"
    var data = {}
    dd.showLoading({
      content: '加载中...',
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        dd.hideLoading()
        var data = res.data;
        if (data.code == 0) {
          var detail = data.entity
          _this.setData({
            fabricOqa: data.fabricOqa
          })
          _this.dataProcessing(detail)
         
        } else {
          exceptionHandle(res.data)
        }

      }
    })
  },
  dataProcessing:function(detail){
    console.log(detail)
    if(!detail){
      this.setData({
        detail: detail
      })
      return
    }
    
    // 克重
    detail.weight = JSON.parse(detail.weight)
    switch (detail.weight.status){
      case 1:
        detail.weightStr="正常";
        break;
      case 2:
        detail.weightStr = "偏轻";
        break;
      case 3:
        detail.weightStr = "偏重";
        break;  
    }
    // 门幅
    detail.width = JSON.parse(detail.width)
    switch (detail.width.status) {
      case 1:
        detail.widthStr = "正常";
        break;
      case 2:
        detail.widthStr = "偏小";
        break;
      case 3:
        detail.widthStr = "偏大";
        break;
    }
    // 其他情况
    if (detail.othersName) detail.othersName = detail.othersName.split("、")
    
    // 图片
    detail.img = JSON.parse(detail.img)
    detail.report = JSON.parse(detail.report)
    

    console.log(detail)
    
    this.setData({
      detail: detail
    })
  },
  // 预览图片
  previewImage: function(e) {
    var dataset = e.currentTarget.dataset
    var index = dataset.index
    var type = dataset.type
    var imgSrc = []
    imgSrc = type == 1 ? dataset.list : [dataset.list]
    console.log(imgSrc)

    dd.previewImage({
      current: index,
      urls: imgSrc,
    });
  },
})
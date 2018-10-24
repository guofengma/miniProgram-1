//获取应用实例
const app = getApp()

Page({

  data: {
    list:[],
    noData:"hide"
  },
  onLoad: function (option) {
    var that = this;
    console.log(option.title)
    // 修改页面标题
    wx.setNavigationBarTitle({
      title: option.title
    })
    that.getList();
  },
  getList:function(){
    var that=this;
    var url = app.globalData.servsers + "dy/orders/getCheckedStep";
    var token = wx.getStorageSync("token");//获取token值
    var vatId = wx.getStorageSync("vatId");//获取缸id
    wx.request({
      url: url,
      data: {
        "dyeid": vatId
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success:function(res){
          var data=res.data;
          console.log(data)
          if(data.code==0){
            var dataList=data.list;
            var noData=that.data.noData;
            if (dataList.length < 1) { noData = "show" } else { noData = "hide" }
            for (var i = 0; i < dataList.length;i++){
              var checkType = dataList[i].checkType;
              switch(checkType){
                case 1:
                  dataList[i].result="正常";
                  break;
                case 2:
                  dataList[i].result = "异常";
                  break;
                case 3:
                  dataList[i].result = "损坏";
                  break;
                default:
                  dataList[i].result = "正常";
              }
            }
            that.setData({
              list: dataList,
              noData:noData
            })
          }else{
            app.exceptionHandle(data,"../../login/login")
          }
      }
    })
  },
  // 预览图片
  previewImg: function (e) {
    var current = e.target.dataset.src;
    var index=e.target.dataset.index;
    var list=this.data.list; 
    var imgList = list[index].imgList;
    wx.previewImage({
      current: current,// 当前显示图片的http链接
      //所有图片
      urls: imgList // 需要预览的图片http链接列表
    })
  
   
  }
}) 
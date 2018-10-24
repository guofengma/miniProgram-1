//获取应用实例
const app = getApp()

Page({
  data: {
    progress:0,
    maxNum:0,
    percent:0
  },
  onLoad:function(option){
    var id=option.id;
    this.setData({
      id:id
    })
    this.getSpecialTime();
    

  },
  // 获取特殊时间是否开启
  getSpecialTime: function () {
    var that = this;
    var token = wx.getStorageSync("token");//获取token值
    var servsers = app.globalData.servsers;
    wx.request({
      url: servsers + "rz/config/info",
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        console.log(res)
        var data = res.data;
        if (data.code == 0) {
          var isOpen = data.info.isOpen;
          wx.setStorageSync("isOpen", isOpen)
          that.getDetail()//获取时间
        } else {
          app.exceptionHandle(data, "../login/login")
        }
      }
    })
  },
  // 获取数据
  getDetail: function () {
    var that=this,
        id=that.data.id;
    var url = app.globalData.servsers + "rz/orderproductflow/info/"+id;
    var token = wx.getStorageSync("token");//获取token值
    
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          var info = data.info; 
          var isOpen = wx.getStorageSync("isOpen"),
            specialCompleteDate = info.specialCompleteDate,
            completeDate = info.completeDate;
          var completeDate = isOpen == 1?specialCompleteDate:completeDate;
          if (completeDate!==null){
            info.completeDate = completeDate.slice(0, 10);
          }

          var predictCompleteDate = info.predictCompleteDate;
          if (predictCompleteDate !== null) {
            info.predictCompleteDate = predictCompleteDate.slice(0, 10)
          }
         
          that.setData({
            info:info,
            progress: info.completeNum,
            maxNum: info.num
            
          });
          that.calcPercent()
          
          that.canvasProgress();
          
        } else {
          app.exceptionHandle(data, "../login/login")
        }

      }
    });
  },
  // 进度滑块
  changeSlider(e) {
    this.setData({ 
      progress: e.detail.value
       })
    this.calcPercent()

    this.submitNum()
  },
  // 计算百分比
  calcPercent(){
    var maxNum = this.data.maxNum,
      progress = this.data.progress,
      percent = Number(progress / maxNum)*100;
    percent = percent.toFixed(2)
    this.setData({
      percent: percent
    })
    this.canvasProgress()
  },
  /* 点击减号 */
  bindMinus: function (e) {
    var num=this.data.progress;
    var limiteNum = this.data.maxNum;//最大值
    // 如果大于1时，才可以减  
    if (num > 0) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    var plusStatus = num > limiteNum ? 'disabled' : 'normal';

    

    // 将数值与状态写回  
    this.setData({
      progress: num,
      minusStatus: minusStatus,
      plusStatus: plusStatus
    });
    this.calcPercent()
    
  },
  /* 点击加号 */
  bindPlus: function (e) {
    var num = this.data.progress;
    var limiteNum = this.data.maxNum;//最大值
    // 不作过多考虑自增1
    if (limiteNum > num) {
      num++;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态 
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    var plusStatus = num >= limiteNum ? 'disabled' : 'normal';
    
    // 将数值与状态写回  
    this.setData({
      progress: num,
      minusStatus: minusStatus,
      plusStatus: plusStatus
    });
    this.calcPercent()
    

  },
  /* 输入框事件 */
  bindManual: function (e) {
    var val = parseFloat(e.detail.value).toFixed(2);
    console.log(val)
    var limiteNum = this.data.maxNum;//最大值
    if (val > limiteNum) {
      this.setData({
        progress: limiteNum
      });
      this.calcPercent()
      return limiteNum
    }
    if (val == 0) { return 0 }
    // 将数值与状态写回  
    this.setData({
      progress: val
    });
    this.calcPercent()
    

  },
  // 提交数量
  submitNum: function (){

    wx.showToast({
      title: '提交中',
      icon: 'none',
      mask: true,

    })

    var that = this,
      progress = that.data.progress,
      id = that.data.id;
    var url = app.globalData.servsers + "rz/orderproductflow/saveprogress";
    var token = wx.getStorageSync("token");//获取token值

    wx.request({
      url: url,
      data: {
        "id":id,
        "num": progress
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          wx.hideToast();
          wx.showToast({
            title: '提交成功',
            icon: 'none',
            duration: 1000,
            mask: true,
          })
        } else {
          app.exceptionHandle(data, "../login/login")
        }

      }
    });

  },
  // 确认完成
  comfirmfinish:function(e){
    var that = this,
      id = that.data.id;
    var url = app.globalData.servsers + "rz/orderproductflow/completeflow";
    var token = wx.getStorageSync("token");//获取token值
    var percent = e.currentTarget.dataset.percent;
    if (percent<100){return}
    console.log(percent)
    wx.showModal({
      title: '提示',
      content: '确认完成该任务？',
      success:function(res){
        if (res.confirm){
           wx.request({
              url: url,
              data: {
                "id": id
              },
              header: {
                'content-type': 'application/json', // 默认值
                "token": token
              },
              success: function (res) {
                var data = res.data;
                console.log(data)
                if (data.code == 0) {
                  wx.hideToast();
                  wx.showToast({
                    title: '提交成功',
                    icon: 'none',
                    duration: 1000,
                    mask: true,
                    success:function(){
                      // 刷新上一页数据
                      var pages = getCurrentPages();
                      var prePage = pages[pages.length - 2];
                      prePage.setData({
                        page: 1,
                        list: [],
                        scrollTop: 40
                      })
                      prePage.getList(prePage)
                      wx.navigateBack({
                        delta:1
                      })
                  // end刷新上一页数据
                    }
                  })
                } else {
                  app.exceptionHandle(data, "../login/login")
                }

              }
            });
        }
      }
    })
   
  },
  canvasProgress:function(){
    var percent=this.data.percent;
    var canvasPercent = 2 * percent/100-0.5;

    // 页面渲染完成  
    var cxt_arc = wx.createCanvasContext('canvasArc');//创建并返回绘图上下文context对象。  
    cxt_arc.setLineWidth(10);
    cxt_arc.setStrokeStyle('#d2d2d2');
    cxt_arc.setLineCap('round')
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(106, 106, 100, 0, 2 * Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径  
    cxt_arc.stroke();//对当前路径进行描边  

    cxt_arc.setLineWidth(10);
    cxt_arc.setStrokeStyle('#3ea6ff');
    cxt_arc.setLineCap('round')
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(106, 106, 100, -Math.PI * 1 / 2, Math.PI * canvasPercent, false);
    cxt_arc.stroke();//对当前路径进行描边  

    cxt_arc.draw();
    
  }

  
})  
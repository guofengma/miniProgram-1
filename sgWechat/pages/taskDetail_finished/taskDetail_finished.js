//获取应用实例
const app = getApp()

Page({
  data: {
    progress:0,
    maxNum:1000,
    percent:0
  },
  onLoad:function(){
    this.canvasProgress()
  },
  // 进度滑块
  changeSlider(e) {
    this.setData({ 
      progress: e.detail.value
       })
    this.calcPercent()
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
    var val = Number(e.detail.value).toFixed(0);
    console.log(val)
    var limiteNum = this.data.maxNum;//最大值
    if (val > limiteNum) {
      this.setData({
        progress: limiteNum
      });
      return limiteNum
    }
    if (val == 0) { return 0 }
    // 将数值与状态写回  
    this.setData({
      progress: val
    });
    this.calcPercent()
    

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
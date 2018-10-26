var sliderWidth = 66; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["待确认", "寻布中", "已关闭"],
    topTabs:["发布订单","已接订单"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    activeIndexSecond:0,
    noDataHidden: true,
    bottomHidden: true
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.topTabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.topTabs.length * that.data.activeIndex
        });
      }
    });
  },
  // 点击一级tab
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    
  },
  // 点击二级tab
  secondTabClick:function(e){
    this.setData({
      activeIndexSecond: e.currentTarget.id
    });
  },
  // 进入详情
  todetail:function(e){
    console.log(e)
    var activeIndex = this.data.activeIndex
    var activeIndexSecond = this.data.activeIndexSecond
    var title=e.currentTarget.dataset.name
    wx.navigateTo({
      url: '../orders_detail/orders_detail?title=' + title + "&type=" + activeIndex + "&status=" + activeIndexSecond,
    })
  },
  // 取消订单
  cancelOrder:function(e){
    wx.showModal({
      title: '温馨提示',
      content: '确定取消该订单吗？',
      success:res=>{
        if(res.confirm){
          // 取消
        }
      }
    })
  },
  // 打电话
  callUp:function(e){

    wx.makePhoneCall({
      phoneNumber: '661' //仅为示例，并非真实的电话号码
    })

    
    
  },
  // 寻布人确认
  comfirm:function(e){
    wx.showModal({
      title: '温馨提示',
      content: '已经确认寻布人张大大与您取得联系并积极交流寻样情况?',
      success: res => {
        if (res.confirm) {

        }
      }
    })
  }
});
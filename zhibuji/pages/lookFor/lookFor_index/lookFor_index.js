var sliderWidth = 66; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["我要寻布", "我能寻布"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    isLaddie:true,//是否是寻布小哥
    showModal:false,//是否显示模态框
    list:[1],
    page:1,
    noDataHidden:true,
    bottomHidden: true,
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  // 切换navbar
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  // 点击‘寻找小哥帮忙’
  toForm:function(){
    wx.navigateTo({
      url: '../needForm/needForm',
    })
  },
  // 点击‘成为寻布小哥’
  toBeLaddie:function(){
    this.showModal()
  },
  // 隐藏模态框
  hideModal:function(){
    this.setData({
      showModal:false
    })
  },
  // 显示模态框
  showModal: function () {
    this.setData({
      showModal: true
    })
  }
});
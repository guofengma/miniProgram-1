import { httpRequest, chooseImage,deleteImg } from "../../../utils/util.js"
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const app = getApp()
Page({
  data: {
    tabs: ["基础信息", "选填信息", "费用计算"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    files:[],
    img_url:[],
    endDate:""
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  tabClick: function (e) {
    console.log(e)
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  // 选择图片
  chooseImage: function (e) {
    chooseImage(this)
  },
  // 删除图片
  deleteImage:function(e){
    deleteImg(e,this)
  },
  // 预览图片
  previewImage: function (e) {
    var img_url=this.data.img_url
    if (img_url.length<1)return
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: img_url // 需要预览的图片http链接列表
    })
  },
  // 选择时间
  choseDate:function(e){
    this.setData({ endDate:e.detail.value})
  },
  // 基础信息进入下一步
  finishFirst:function(e){
    var _this=this
    _this.changeStep(e)
  },
  // 选填信息进入下一步
  finishSecond:function(e){
    var _this = this
    _this.changeStep(e)
  },
  // 完成费用计算
  finishThird:function(e){
    // 进入确认页面
    wx.navigateTo({
      url: '../comfirmForm/comfirmForm',
    })
  },
  // 上一步or下一步
  changeStep:function(e){
    var dataset=e.currentTarget.dataset
    var active=dataset.active
    var offset = dataset.offset
    this.setData({
      activeIndex: active,
      sliderOffset: offset
    })
  },
});
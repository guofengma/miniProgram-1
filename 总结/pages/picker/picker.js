//获取应用实例
const app = getApp()

Page({
  data: {
    nickName: "",
    avatarUrl: "",
    casArray: ['双眼皮', 'TBM', '隆胸', '减肥', '手动输入'],
    userName: '',
    mobile: '',
    Gender: 'female',
    casIndex: 0,
  },

  /**
  * 生命周期函数--监听页面加载
    */

  bindCasPickerChange: function (e) {
    console.log('乔丹选的是', this.data.casArray[e.detail.value])
    if (e.detail.value == 4) {
      this.setData({ reply: true })
    } else {
      this.setData({ reply: false })
    }
    this.setData({
      casIndex: e.detail.value
    })

  }
})  
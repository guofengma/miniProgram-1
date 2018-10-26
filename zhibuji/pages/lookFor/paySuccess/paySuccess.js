
Page({
  data: {
   
  },
  onLoad: function () {
    setTimeout(function(){
      console.log(11)
      wx.reLaunch({
        url: '../../orders/orders_index/orders_index',
      })
    },3000)
  },
  
});
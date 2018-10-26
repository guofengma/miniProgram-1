
Page({
  data: {
   
  },
  onLoad: function () {
    
  },
  // 提交表单
  saveForm:function(e){
    var opinion = e.detail.value.opinion
    console.log(e)

    wx.showToast({
      title: '意见反馈提交成功！',
      icon:"success",
      duration:2000,
      mask:true,
      success:function(){
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        },2000)
      }
    })
    
  }
  
});
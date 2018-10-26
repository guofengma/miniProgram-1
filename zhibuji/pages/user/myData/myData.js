import getChina from "../../../utils/areaGetChina.js"

Page({
  data: {
    userInfo:"",
    gender:"",
    userName:"",
    mobile:"",
    region:"",
    showModal:false,
  },
  onLoad: function () {
    var userInfo=wx.getStorageSync("userInfo")
    this.setData({
      userInfo: userInfo
    })
    // 性别
    var gender=this.data.gender
    if (!gender){
      gender = userInfo.gender==1?"男":"女"
      
    }

    // 地区
    var country = userInfo.country
    if (country=="China"){
      var province = getChina(userInfo.province)
      var city = getChina(userInfo.city)
      console.log(province)
      var region = province+"-"+city
    }else{
      var region = ""
    }
    this.setData({
      gender: gender,
      region: region
    })
    
    
  },
  // 选择性别
  choseGender:function(){
    var _this=this
    wx.showActionSheet({
      itemList: ['男', '女'],
      success(res) {
        var gender = res.tapIndex==1?"女":"男"
        _this.setData({
          gender:gender
        })
        // 请求接口。。。
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 编辑用户信息
  editInfo:function(e){
    var name=e.currentTarget.dataset.name
    this.showModal()
    var title=""
    if(name=="userName"){
      title="姓名"
    }else if(name="mobile"){
      title = "手机号"
    }
    this.setData({
      modal:{
        title:title,
        name:name
      }
    })
    
  },
  // 保存用户信息
  saveInfo:function(e){
    console.log(e)
  },
  // 选择地区
  regionChange:function(e){
    console.log(e)
    var value=e.detail.value
    value = value.join("-")
    this.setData({
      region:value
    })
    // 请求接口。。。
  },
  // 隐藏模态框
  hideModal: function () {
    this.setData({
      showModal: false
    })
  },
  // 显示模态框
  showModal: function () {
    this.setData({
      showModal: true
    })
  },
  
});
//index.js
var WxSearch = require('../../wxSearchView/wxSearchView.js');
var app = getApp();
Page({
  data: {},

  // 搜索栏
  onLoad: function () {
    var that = this;
    var sampleList=that.getSample();
    console.log(sampleList)
    WxSearch.init(
      that,  // 本页面一个引用
      [], // 热点搜索推荐，[]表示不使用
      sampleList,// 搜索匹配，[]表示不使用
      that.mySearchFunction, // 提供一个搜索回调函数
      that.myGobackFunction //提供一个返回回调函数
    );
  },
  // 获取编号或名称的匹配项
  getSample:function(){
    var that = this;
    var url = app.globalData.servsers + "kb/sample/selecta";//接口地址
    var token = wx.getStorageSync("token");
    var sampleList = [];
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json'
        // "token": token
      },
      success: function (res) {
        var data = res.data;

        if (res.data.code == 0) {
          var list = data.list;
          console.log(list)
          for(var i=0;i<list.length;i++){
            sampleList.push(list[i].sampleName);
            sampleList.push(list[i].sampleNum);
            if (list[i].weight !== null) { sampleList.push(list[i].weight);}
          }
         
        } else {
          //app.exceptionHandle(data, "../../login/login")
        }
      }
    })
    console
    return sampleList;
  },

  // 转发函数,固定部分
  wxSearchInput: WxSearch.wxSearchInput,  // 输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap,  // 点击提示或者关键字、历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, // 删除所有的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm,  // 搜索函数
  wxSearchClear: WxSearch.wxSearchClear,  // 清空函数

  // 搜索回调函数  
  mySearchFunction: function (value) {
    // do your job here
    // 跳转
    wx.redirectTo({
      url: '../sample/sample?searchValue='+value
    })
  },

  // 返回回调函数
  myGobackFunction: function () {
    // do your job here
    // 跳转
    wx.redirectTo({
      url: '../sample/sample?searchValue='  
    })
  }

})

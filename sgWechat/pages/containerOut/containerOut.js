//获取应用实例
const app = getApp()

Page({
  data: {
    dateList:[],
    list:{
      am:[],
      pm:[]
    },
    page:1,
    startDate:"",
    endDate:"",
    noData: "hide",
    display: "hide",
    
  },
  onLoad(){
    var that=this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight,
          winWidth: res.windowWidth,
        });
      }
    });
    var oDate = new Date();   //获取当前时间
    var nextDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate() + 1)
    oDate = app.dateFormat(oDate).split(" ")[0]
    nextDate = app.dateFormat(nextDate).split(" ")[0]
    that.getCalendar()//获取日期对应的只数
    that.setData({
      startDate: oDate,
      endDate: nextDate
    })
    that.getList()
   
    
  },
  init:function(){
    this.setData({
      list: {
        am: [],
        pm: []
      },
      page: 1,
      noData: "hide",
      display: "hide",
    })
  },
  // 选择时间
  changeDate:function(e){
    this.init()
    var dataset = e.currentTarget.dataset
    var item = dataset.item
    var index = dataset.index
    var dateList=this.data.dateList
    dateList.forEach(dItem=>{
      dItem.isActive=false
    })
    dateList[index].isActive=true
    this.setData({
      dateList:dateList
    })
    var realDate=item.realDate
    var startDate = realDate
    realDate=realDate.replace(/-/g,"/")
    realDate = new Date(realDate)
    var endDate = new Date(realDate.getFullYear(), realDate.getMonth(), realDate.getDate() + 1)
    endDate = app.dateFormat(endDate).split(" ")[0]
    this.setData({
      startDate: startDate,
      endDate: endDate
    })
    this.getList()
  },
  // 折叠
  kindToggle: function (e) {
    var id = e.currentTarget.id,
     list = this.data.list,
     am=list.am,
     pm=list.pm;
     console.log(list)
    for (var i = 0, len = am.length; i < len; ++i) {
      if (am[i].id == id) {
        am[i].open = !am[i].open
      } else {
        am[i].open = false
      }
    }
    for (var i = 0, len = pm.length; i < len; ++i) {
      if (pm[i].id == id) {
        pm[i].open = !pm[i].open
      } else {
        pm[i].open = false
      }
    }
    console.log(am,pm)
    this.setData({
      list: {
        am:am,
        pm:pm
      }
    });
  },
  onPullDownRefresh: function () {
    this.init()
    this.getList()
  },
  onReachBottom: function () {
    this.getList();
  },
  // 进入详情页
  toDetail:function(e){
    var dataset=e.currentTarget.dataset
    var item=dataset.item
    wx.setStorageSync("containerDetail", item)
    wx.navigateTo({
      url: '../containerDetail/containerDetail',
    })
  },
  // 获取当天及后六天的时间数组
  tab:function(dayNum){
    var oDate = new Date();   //获取当前时间
    var dayArr = [];     //定义一个数组存储时间
    for(var i = 0; i<dayNum;i++){
      var nextDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate() + i)
      var week = nextDate.getDay()
      var weekStr=""
      switch (week){
        case 0:
          weekStr="周日";
          break;
        case 1:
          weekStr = "周一";
          break;
        case 2:
          weekStr = "周二";
          break;
        case 3:
          weekStr = "周三";
          break;
        case 4:
          weekStr = "周四";
          break;
        case 5:
          weekStr = "周五";
          break;
        case 6:
          weekStr = "周六";
          break;
        default:
          weekStr = "周日";
      }
      var realDate = app.dateFormat(nextDate).split(" ")[0]
      var month = nextDate.getMonth()+1
      var day = nextDate.getDate()
      var date = month+"/"+day
      var isActive=i==0?true:false
      dayArr.push({ date: date, week: weekStr, isActive: isActive, realDate: realDate});   //把未来几天的时间放到数组里
    }
    return dayArr;   //返回一个数组。
  },
  // 获取日期对应的只数
  getCalendar:function(){
    var that = this;
    var url = app.globalData.servsers + "rz/box/calendarMobile";//接口地址
    var token = wx.getStorageSync("token");
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        var data = res.data;
        if (res.data.code == 0) {
          var dateList = that.tab(7)
          var list=data.list
          dateList.forEach((item,index)=>{
            item.count = list[index]+"只"
          })
          console.log(dateList)
          that.setData({
            dateList: dateList
          })
        } else {
          app.exceptionHandle(data, "../login/login")
        }
      }
    })
  },
  // 获取集装箱列表
  getList: function (){
    
    var that = this;
    var url = app.globalData.servsers + "rz/box/list";//接口地址
    var token = wx.getStorageSync("token");
    var startDate=that.data.startDate
    var endDate = that.data.endDate
    var page = that.data.page
    var display = that.data.display
    if (display=="show")return
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: url,
      data: {
        page: page,
        limit: 10,
        startDate: startDate ,
        endDate: endDate
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        var data = res.data;
        if (res.data.code == 0) {
          var list=data.page.list
          that.dataProcessing(list,page)
         
        } else {
          app.exceptionHandle(data, "../login/login")
        }
        wx.hideLoading()
      }
    })
  },
  // 列表数据处理
  dataProcessing:function(data,page){
    if (page == 1 && data.length < 1) { var noData = "show" } else { var noData = "hide" }
    if (data.length < 1 ) {
      var display= "show"
    } else {
      var display= "hide"
    }
    var list = this.data.list
    data.forEach(item=>{
      var shipDate = item.shipDate.split(" ")[1].split(":")[0]
      console.log(shipDate)
      if(shipDate<12){
        list.am.push(item)
      }else{
        list.pm.push(item)
      }
    })
    console.log(list)
    page++
    this.setData({
      list: list,
      noData: noData,
      display: display,
      page:page

    })
  }

})  
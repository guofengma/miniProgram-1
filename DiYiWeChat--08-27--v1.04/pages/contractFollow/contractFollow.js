//获取应用实例
const app = getApp()

Page({
  data: {
    page:1,
    display: "hide",
    noData: "hide",
    scrollTop: 0,
    scrollHeight: 0,
    winWidth:0,
    list: [],
    userName:""
  },
  onLoad: function () {
    var that=this;
    that.getList();//获取合同列表
    // 获取屏幕宽高
    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight,
          winWidth:res.windowWidth
        });
      }
    });
    var user = wx.getStorageSync("realName")
    that.setData({
      userName: user
    })
    that.getUnRead();
  },
  getUnRead: function () {
    var unRead = Number(wx.getStorageSync("unRead"));//新消息条数
    if (unRead > 0) {
      this.setData({
        unReadStr: "你有" + unRead + "条消息！"
      })
    }
  },
  goChangePsd:function(){
    wx.navigateTo({
      url: '../user/user'
    })
  },
  // 进入消息页
  goMessage: function () {
    wx.navigateTo({
      url: '../message/message'

    })
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },
  onPullDownRefresh: function () {
    console.log("下拉");
    var that = this;
    that.setData({
      page: 1,
      list: [],
      scrollTop: 0
    });
    that.getList(that)
  },
  onReachBottom: function () {
    console.log("上拉");
    var that = this;
    that.getList(that);
  },
  getList:function(){
    var that=this;
    var token = wx.getStorageSync("token");//获取token值
    var url = app.globalData.servsers + "dy/contract/list";//接口地址
    var id = wx.getStorageSync("customerId");//客户id
    var page=that.data.page;
    console.log(page)
    wx.request({
      url: url, //仅为示例，并非真实的接口地址
      data: {
        "customerid":id,
        "page":page,
        "limit":8
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token":token
      },
      success: function (res) {
        console.log(res.data)
        var code=res.data.code,
            dataList=res.data.page.list,
            noData = that.data.noData,
            list=that.data.list;
        console.log(page, dataList)
        if (page == 1 && dataList.length < 1) { noData = "show" } else { noData = "hide" }
        if (dataList.length<1){
          that.setData({
            display: "show"
          });
        }else{
          that.setData({
            display: "hide"
          });
        }
        if(code==0){
          for (var i = 0; i < dataList.length; i++) {
            dataList[i].predictDate = dataList[i].predictDate.slice(0, 9)//预计完成时间
            var status = dataList[i].contractStatus+1;
            // if (status == 6) { dataList[i]["status"]=1 }
            
            // status=5;
            dataList[i].progress = (status / 6) * Number(that.data.winWidth);//进度
            if (status !== 7) { list.push(dataList[i]) }//contractStatus==6为废弃合同

            var contractStatus = dataList[i].contractStatus;//准备中12 生产中34 已完成5 作废6
            console.log(contractStatus)
            switch (contractStatus) {
              case 0:
              case 1:
              case 2:
                dataList[i].status = "orange";
                dataList[i].statusStr = "准备中";
                break;
              case 3:
              case 4:
                dataList[i].status = "green";
                dataList[i].statusStr = "生产中";
                break;
              case 5:
                dataList[i].status = "grey";
                dataList[i].statusStr = "已完成";
                break;
              default:
                dataList[i].status = "grey";
                dataList[i].statusStr = "已完成";
            }
            var predictDate = dataList[i].predictDate;//预计交付时间
            var T = new Date(predictDate); // 将指定日期转换为标准日期格式。Fri Dec 08 2017 20:05:30 GMT+0800 (中国标准时间)
            predictDate = T.getTime() // 将转换后的标准日期转换为时间戳。
            var CurentTime = new Date();//当前时间
            CurentTime = CurentTime.getTime(CurentTime)

            if (CurentTime > predictDate && contractStatus !== 5 && contractStatus !== 6) {
              dataList[i].status = "red";
              dataList[i].statusStr = "延迟";
            }
            var fabricList = dataList[i].fabricList;
            for (var j = 0; j < fabricList.length;j++){
              var dyeVatNum = fabricList[j].dyeVatNum;//已完成量
              var fabricCount = fabricList[j].fabricCount;//预计完成量
              var inventoryNum = fabricList[j].inventoryNum;//仓库锁定量
              var unfinished = fabricCount - dyeVatNum - inventoryNum;
              fabricList[j].finished = dyeVatNum + inventoryNum;
              fabricList[j].unfinished = unfinished < 0 ? 0 : unfinished;
            }

          }

          wx.stopPullDownRefresh();
          that.setData({
            list: list
          });
          page++
          that.setData({
            page: page,
            noData: noData
          });
          console.log(that.data.list)
        }else{

        }
      }
    })
  }
});

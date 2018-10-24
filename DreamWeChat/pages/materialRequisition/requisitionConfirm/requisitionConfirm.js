//获取应用实例
const app = getApp()
var dateTimePicker = require('../../../utils/dateTimePicker.js');

Page({
  data: {
    list: [],
    materielTotal: 0,
    totalPrice: 0,
    date: '',
    time: '',
    dateTimeArray1: null,
    dateTime1: null,
    startYear: 2018,
    endYear: 2050,
    showTime: false
  },
  onLoad() {
    // 获取当前时间+1天
    var now = new Date();
    now.setDate(now.getDate() + 1);
    now=app.dateFormat(now)
    // 获取完整的年月日 时分秒，以及默认显示的数组
    // var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear, now);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();

    var materielList = wx.getStorageSync("materielList")
    console.log(materielList)
    this.processList(materielList);

    this.setData({
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime
    });

    console.log(this.data.dateTimeArray1)
    console.log(this.data.dateTime1)
    
  },
  limitText:function(e){
    var val=e.detail.value;
    console.log(e);
    console.log(val.length);
    

  },
  processList:function(list){
    console.log(list)
    
    var materielKinds = list.length,
        materielTotal = 0,
        totalPrice=0;
    for(var i=0,l=list.length;i<l;i++){
      // 数量价格
      materielTotal += Number(list[i].realNum);
      totalPrice += Number(list[i].realNum) *Number(list[i].materiel.price)
      // 图片
      var imgList = list[i].materiel.imgList;
      if (imgList == null || imgList.length < 1) {
        list[i].img = "/images/notUpload_sm.png"
      } else {
        list[i].img = imgList[0].imgUrl
      }
    }
    // console.log(hasList)
    this.setData({
      list: list,
      materielTotal: materielTotal,
      totalPrice: totalPrice
    })
  },
  changeDateTime1(e) {
    this.setData({ dateTime1: e.detail.value,showTime:true });
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray1: dateArr,
      showTime: true
    });
  },
  // 计算总件数和总金额
  calcTotal(list){
    var materielKinds = 0,
      materielTotal = 0,
      totalPrice = 0;
      console.log(list)
    for (var i = 0, l = list.length; i < l; i++) {
      var realNum=Number(list[i].realNum);
      var price = Number(list[i].materiel.price);
      var itemPrice = realNum * price;
      console.log(realNum)
      materielTotal += realNum;
      totalPrice += itemPrice
    }

    this.setData({
      materielTotal: materielTotal,
      totalPrice: totalPrice
    })
  },
  // 删除已选物料
  delMateriel:function(e){
    var index = e.currentTarget.dataset.index;
    var list=this.data.list;
    list.splice(index, 1)
    console.log(list)
    this.calcTotal(list)
    
    
    this.setData({
      list: list
    })
  },
  // 提交表单
  formSubmit:function(e){
    console.log(e)
    var val=e.detail.value;
    var warn = "";
    var flag = true;
    console.log(val)
    var list = this.data.list;
    var showTime = this.data.showTime;

    if (val.use == "") {
      warn = "请输入用途"
      flag = false;
    } else if (list.length<1){
      warn = "物料不能为空"
      flag = false;
    } else if (!showTime) {
      warn = "请选择归还时间"
      flag = false;
    }

    if (!flag) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    } else {
      this.postData(val)

    }
    // wx.navigateTo({
    //   url: '../requisitionList/requisitionList',
    // })
  },
  postData: function (data) {
    wx.showLoading({
      title: '提交中',
      icon: 'none',
      mask: true,
    })
    console.log(data);
    var that = this;
    var url = app.globalData.servsers + "rz/apply/save";//入库接口地址
    var token=wx.getStorageSync("token")
    var list=this.data.list,
      materielList=[];
    console.log(list);
    for(var i=0,l=list.length;i<l;i++){
      materielList.push({
        "warehouseId": list[i].id,
        "materielId": list[i].materielId,
        "num": parseFloat(list[i].realNum)
      })
    }

    wx.request({
      url: url,
      data: {
        "applyReason": data.use,
        "backDate": data.returnDate,
        "materielList": materielList
      },
      methond: "POST",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      method: "POST",
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
        var msg = res.data.msg;
        
        console.log();
        if (code == 0) {//提交成功
        wx.hideLoading()
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 3];
          prePage.setData({
            page: 1,
            msgList: [],
            scrollTop: 0
          })
          prePage.getList(prePage)
          // end刷新上一页数据
          wx.navigateBack({
            delta: 2
          })

        } else {
          wx.hideLoading()
          if(msg=="库存重复"){
            wx.showModal({
              title: '提示',
              content: '库存不足',
              showCancel: true,
            })
            var wrongIds = res.data.wrongIds;
            list.forEach(item=>{
              wrongIds.forEach(wItem=>{
                if(wItem==item.id){
                  item.wrong="red"
                }else{
                  item.wrong = ""
                }
              })
            })
            that.setData({
              list:list
            })  

          }else{
            app.exceptionHandle(res.data, "../../login/login")
          }
        }
      }
    })
  },
  imgError: function (e) {
    var that = this;
    app.imgError(e, that)
  },
  // 预览图片
  previewImg(e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  }
})  
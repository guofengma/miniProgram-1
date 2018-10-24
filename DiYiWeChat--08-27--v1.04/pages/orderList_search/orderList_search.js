//获取应用实例
const app = getApp()

Page({
  data: {
    hidden: true,
    noData: "hide",
    display: "hide",
    page:1,
    list: [],
    contractInfo:"",
    scrollTop: 0,
    scrollHeight: 0,
    winWidth: 0,
    searchForm: { 
      "vatNum": { "selHidden": true ,"noData":true},
     "factoryName": { "selHidden": true ,"noData":true },
      "fabricName": { "selHidden": true ,"noData":true }, 
      "clothBatch": { "selHidden": true ,"noData":true },
      "customer": { "selHidden": true, "noData": true }
      },
    startDate:"开始时间",
    endDate:"结束时间"
  },
  onLoad: function () {
    var that = this,
      token=wx.getStorageSync("token")
    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight,
          winWidth: res.windowWidth
        });
      }
    });
    that.getFactory(token)//印染厂列表
    that.getFabric(token)//面料列表
    that.getCloth(token)//坯布批号列表
    that.getCustomer(token)//客户列表
    
    // 时间区间
    // var startDate = app.CurentTime().slice(0,10);
    // var endDate = new Date();
    // endDate.setMonth(endDate.getMonth() + 1);
    // endDate = app.dateFormat(endDate).slice(0,10)
    // that.setData({
    //   startDate: startDate,
    //   endDate: endDate
    // })
    
  },
  onShow: function () {
    var that = this;
    that.getList(that)
  
    
  },
  // 传formId到后台
  submitFormId: function (e) {
    var formId = e.detail.formId;
    console.log("formId", formId);
  },
  
  // 跳转到详情页
  goDetail:function(e){
    console.log(e)
    var status = e.currentTarget.dataset.status;//订单状态(0.生产中 1.已完成 2.质检完成)
    wx.setStorageSync("status", status)
    var id=e.currentTarget.dataset.id;//订单id
    wx.setStorageSync("orderId", id)
    var fabricType= e.currentTarget.dataset.type;//面料类型1针织 2梭织
    wx.setStorageSync("fabricType", fabricType)
    var orderNum = e.currentTarget.dataset.ordernum;//订单编号
    wx.setStorageSync("orderNum", orderNum)
    var subTitle = e.currentTarget.dataset.title;//详情页标题
    wx.navigateTo({
      url: "../orderFollow/orderDetail/orderDetail?id="+id
    })
  },
  // 输入改变值
  changeVal:function(e){
    var searchForm = this.data.searchForm,
      sName = e.currentTarget.dataset.name,
      val=e.detail.value;
    searchForm[sName].value=val;
    this.setData({
      searchForm: searchForm
    })
  },
  // 搜索下拉
  pickerSearch:function(e){
    var searchForm = this.data.searchForm,
        sName = e.currentTarget.dataset.name,
        selHidden = searchForm[sName].selHidden;
    for (var key in searchForm){
      searchForm[key].selHidden=true;
    }
    searchForm[sName].selHidden = !selHidden;
    this.setData({
      searchForm: searchForm
    })
  },
  // 列表选择
  selTap:function(e){
    var searchForm = this.data.searchForm,
      sName = e.currentTarget.dataset.name,
      id = e.currentTarget.dataset.id,
      value = e.currentTarget.dataset.value;
    searchForm[sName].value = value;
    searchForm[sName].id = id;
    
    searchForm[sName].selHidden=true;
      this.setData({
        searchForm: searchForm
      })
  },
  //输入搜索
  searchInput: function (e) {
    console.log(e)
    var val = e.detail.value.toLowerCase(),
      searchArr = [],
      searchForm = this.data.searchForm,
      sName = e.currentTarget.dataset.name,
      list = searchForm[sName].list,
      l = list.length;
      searchForm[sName].id = "";
      searchForm[sName].value = val;
      
      
    for (var i = 0; i < l; i++) {
      var name = list[i].name.toLowerCase();
      console.log(name)
      if (name.indexOf(val) >= 0) {
        searchArr.push(list[i]);
      }
      console.log(searchArr)
    }
    searchForm[sName].noData = searchArr.length < 1 ? false : true;
    searchForm[sName].selList = searchArr;
    this.setData({
      searchForm: searchForm
    })
  },
  // 获取印染厂列表
  getFactory: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/partners/selectclass/1";//接口地址 1表示合作商中的印染厂
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          var list = data.entity,
            searchForm = that.data.searchForm;
            for(var i=0,l=list.length;i<l;i++){
              list[i].id = list[i].id;
              list[i].name = list[i].pname;
            }
          searchForm.factoryName.selList = list;
          searchForm.factoryName.list = list;
          
          that.setData({
            searchForm: searchForm
          })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 获取面料列表
  getFabric: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/fabric/select";//接口地址
    wx.request({
      url: url,
      data: {
        "fabricType": "0"
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          var list = data.list,
            searchForm = that.data.searchForm;
          for (var i = 0, l = list.length; i < l; i++) {
            list[i].id = list[i].id;
            list[i].name = list[i].fabricName;
          }
          searchForm.fabricName.selList = list;
          searchForm.fabricName.list = list;
          
          that.setData({
            searchForm: searchForm
          })
          // var selectList = []
          // for (var i = 0; i < list.length; i++) {
          //   selectList.push({ "value": list[i].id, "name": list[i].fabricName, "num": list[i].fabricNum })
          // }
          // // console.log(selectList)
          // that.setData({
          //   num_arr: selectList
          // })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 获取坯布批号列表
  getCloth: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/orders/queryOrderClothBatch";//接口地址
    wx.request({
      url: url,
      data: {
        "orderid": "0"
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          var list = data.list,
              newList=[],
            searchForm = that.data.searchForm;
          
          for (var i = 0, l = list.length; i < l; i++) {
            newList.push(list[i].batch)
            // list[i].id = list[i].clothId;
            // list[i].name = list[i].batch;
          }
          newList=app.distinct(newList)
          console.log(newList)
          list=[];
          for(var i=0,l=newList.length;i<l;i++){
            list.push({ "name": newList[i]}) ;
          }
          searchForm.clothBatch.selList = list;
          searchForm.clothBatch.list = list;

          that.setData({
            searchForm: searchForm
          })
         
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 获取客户列表
  getCustomer: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/customer/select";//接口地址 1表示合作商中的印染厂
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          var list = data.list,
            searchForm = that.data.searchForm;
          for (var i = 0, l = list.length; i < l; i++) {
            list[i].id = list[i].id;
            list[i].name = list[i].customerName + " " + list[i].customerNum;

          }
          console.log(l)
          // for (var i = 0, j = list.length, l = list.length*2; j < l; i++,j++) {
          //   console.log(i)
          //   console.log(j)
          //   console.log(list[i].id)
          //   list.push({
          //     "id": list[i].id,
          //     "name": list[i].customerNum
          //   })
          // }

          searchForm.customer.selList = list;
          searchForm.customer.list = list;

          that.setData({
            searchForm: searchForm
          })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 时间选择
  bindDateChange: function (e) {
    var vName=e.currentTarget.dataset.name;
    if (vName=="startDate"){
      this.setData({
        startDate: e.detail.value
      })
    }else{
      this.setData({
        endDate: e.detail.value
      })
    }
   
  },
  // 重置表单
  formReset:function(){
    var searchForm = this.data.searchForm,
        that=this;
    for (var key in searchForm){
      searchForm[key].value=""
      searchForm[key].id = ""
    }
    that.setData({
      searchForm: searchForm,
      startDate:"开始时间",
      endDate: "结束时间",
      page: 1,
      list: [],
      scrollTop: 0
      
    })
    that.getList(that)
  },
  // 搜索订单
  searchOrder:function(e){
    console.log(e)
    var  that=this,
          detail=e.detail.value;
    this.setData({
      page: 1,
      list: [],
      scrollTop: 0
    });
         
    this.getList(that,detail)
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
  // 获取数据
  getList:function(that,detail){
    var url = app.globalData.servsers +"dy/orders/list";
    var token = wx.getStorageSync("token");//获取token值
    var contractid = wx.getStorageSync("contractid");//合同id
    var page = that.data.page,
      startDate = that.data.startDate == "开始时间" ? "" : that.data.startDate,
      endDate = that.data.endDate == "结束时间" ? "" : that.data.endDate;

    var searchForm = that.data.searchForm;
    console.log(searchForm)
    // if (!detail){detail={
    //   factoryId:"0",
    //   vatNum: "",
    //   fabricId: "",
    //   clothBatch: "",
    //   customerId: ""
      
    // }}
    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {
        "isMe":1,
        "partnersId": searchForm.factoryName.id||"0",//印染厂id
        "startDate": startDate,//开始时间
        "endDate": endDate,//结束时间
        "number": searchForm.vatNum.value || "",//缸号
        "fabricid": searchForm.fabricName.id || "",//面料id
        "batch": searchForm.clothBatch.value || "",//坯布批号
        "customerid": searchForm.customer.id || "",//客户id
        "page":page,
        "limit":10,
        "hideComplete":0
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data=res.data;
        console.log(data)
        if(data.code==0){
          that.dataProcessing(data,page)//数据处理
          wx.stopPullDownRefresh();
        }else{
          app.exceptionHandle(data,"../../login/login")
        }
       
      }
    });
  },
  // 数据处理
  dataProcessing:function(data,page){
    var that=this,
        l = that.data.list,
        noData = that.data.noData,
        dataList = data.page.list;
    if (page == 1 && dataList.length <1) { noData = "show" } else { noData = "hide" }
    if (dataList.length < 1) {
      that.setData({
        display: "show"
      });
    } else {
      that.setData({
        display: "hide"
      });
    }
    for (var i = 0; i < dataList.length; i++) {
      var urgencyDegree = dataList[i].urgencyDegree; //紧急程度 1.普通 2.紧急 3.非常紧急
      switch (urgencyDegree){
        case 1:
          dataList[i].urgency="";
          break;
        case 2:
          dataList[i].urgency = "orange";
          break;
        case 3:
          dataList[i].urgency = "red";
          break;
        default:
          dataList[i].urgency = "";
       }
      var realityNum = dataList[i].realityNum;
      if (realityNum > 0) dataList[i].urgency = "blue";
      var fabricInfo = JSON.parse(dataList[i].fabricInfo) ;//面料信息
      var winWidth = that.data.winWidth;
      dataList[i].fabricName = fabricInfo.fabricName;
      dataList[i].fabricType = fabricInfo.fabricType;
      dataList[i].progress = dataList[i].progress * winWidth; //进度
      dataList[i].estimateDate = dataList[i].estimateDate.slice(0, 10)//预计完成时间
      dataList[i].unit = fabricInfo.fabricType == "1" ? "kg" : "m";//单位

      // 进度计算
      var hasCompleteNum = dataList[i].hasCompleteNum,
        estimateProduction = dataList[i].estimateProduction;
      dataList[i].process = (hasCompleteNum / estimateProduction).toFixed(2)*100;
      

      l.push(dataList[i])
    }

    that.setData({
      list: l
    });
    page++;
    that.setData({
      page: page,
      hidden:true,
      noData: noData
    });
  }
})  
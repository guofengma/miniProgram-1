//获取应用实例
const app = getApp()

Page({
  data: {
    list: [
      {
        id: 'order',
        name: '订单信息',
        open: true,
        dataList:[
         
        ]
      },
      {
        id: 'cloth',
        name: '坯布信息',
        open: false,
        dataList: [
          
        ]
      },
      {
        id: 'dyeing',
        name: '印染信息',
        open: false,
        sub:true,
        dataList: [
         
        ]
        
      },
      {
        id: 'log',
        name: '操作记录',
        open: false,
        sub: true,
        dataList: [
         
        ]

      }
    ],
    fabricType:"",//面料类型
    unit:"",
    spec:"",
    color:""
  },
  onLoad: function (option) {
    var that = this;
    // var fabricType = wx.getStorageSync("fabricType");
    // var unit = fabricType==1?"公斤":"米";
    // 修改页面标题
    // wx.setNavigationBarTitle({
    //   title: option.title
    // })
    var orderId=option.id;//订单id
    // var orderInfo=wx.getStorageSync("order")//订单信息
    // console.log(orderInfo)
    // var list=that.data.list;
    // var urgencyDegree = orderInfo.urgencyDegree;//紧急程度
    // switch (urgencyDegree){
    //   case 1:
    //     orderInfo.urgencyStr="普通";
    //     orderInfo.urgencyColor = "";
    //     break;
    //   case 2:
    //     orderInfo.urgencyStr = "紧急";
    //     orderInfo.urgencyColor = "#FE7D21";
    //     break;
    //   case 3:
    //     orderInfo.urgencyStr = "非常紧急";
    //     orderInfo.urgencyColor = "#E53B3B";
    //     break;
    //   default:
    //     orderInfo.urgencyStr = "普通";
    //     orderInfo.urgencyColor = "";
    // }
    // var spec = orderInfo.spec;//规格
    // var color = orderInfo.color;//色别
    
    // var customer = orderInfo.customer;
    // if (!customer){
    //   orderInfo.customer="/"
    // }else{
    //   orderInfo.customer = orderInfo.customer.customerName
    // }
    // list[0] = {
    //   id: 'order',
    //   name: '订单信息',
    //   open: true,
    //   dataList: [
    //     { label: "订单编号", value: orderInfo.orderNum },
    //     { label: "客户对象", value: orderInfo.customer },
    //     { label: "理单员", value: orderInfo.createByUser.realName },
    //     { label: "跟单员", value: orderInfo.updateByUser.realName },
    //     { label: "紧急程度", value: orderInfo.urgencyStr, color: orderInfo.urgencyColor },
    //     { label: "订单标签", list: orderInfo.tagsList},
    //     { label: "印染厂", value: orderInfo.partners.pname }
    //   ]
    // }
  that.setData({
    orderId:orderId,
    // list:list,
    // unit:unit,
    // spec: spec,
    // color:color
  })
  //订单信息end
  that.getOrderInfo();//订单信息
  
  },
  // 一级菜单折叠
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
  // 获取订单信息
  getOrderInfo: function () {
    var that = this;
    var orderId = that.data.orderId;//获取订单id
    var url = app.globalData.servsers + "dy/orders/info/" + orderId;
    var token = wx.getStorageSync("token");//获取token值
    // var orderId = wx.getStorageSync("orderId");//获取订单id
    var list = that.data.list;
    wx.request({
      url: url,
      data: { },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          var orderInfo=data.orders;
          var urgencyDegree = orderInfo.urgencyDegree;//紧急程度
          switch (urgencyDegree) {
            case 1:
              orderInfo.urgencyStr = "普通";
              orderInfo.urgencyColor = "";
              break;
            case 2:
              orderInfo.urgencyStr = "紧急";
              orderInfo.urgencyColor = "#FE7D21";
              break;
            case 3:
              orderInfo.urgencyStr = "非常紧急";
              orderInfo.urgencyColor = "#E53B3B";
              break;
            default:
              orderInfo.urgencyStr = "普通";
              orderInfo.urgencyColor = "";
          }
          var spec = orderInfo.spec;//规格
          var color = orderInfo.color;//色别
          var fabricInfo = JSON.parse(orderInfo.fabricInfo),
              fabricName = fabricInfo.fabricName,
              fabricType = fabricInfo.fabricType;
          var unit = fabricType == 1 ? "kg" : "米";//单位

          // 修改页面标题
          wx.setNavigationBarTitle({
            title: spec + " " + color
          })
          var customer = orderInfo.customer;
          if (!customer) {
            orderInfo.customer = "/"
          } else {
            orderInfo.customer = orderInfo.customer.customerName
          }
         
          list[0] = {
            id: 'order',
            name: '订单信息',
            open: true,
            dataList: [
              { label: "订单编号", value: orderInfo.orderNum },
              { label: "客户对象", value: orderInfo.customer },
              { label: "理单员", value: orderInfo.createByUser.realName },
              { label: "跟单员", value: orderInfo.updateByUser.realName },
              { label: "紧急程度", value: orderInfo.urgencyStr, color: orderInfo.urgencyColor },
              { label: "合同标签", list: orderInfo.tagsList },
              { label: "印染厂", value: orderInfo.partners.pname }
            ]
          }
          that.setData({
            list: list,
            unit: unit,
            spec: spec,
            color: color
          });

          that.getClothInfo();//坯布信息
          that.getDyeInfo();//印染信息
          that.getLogs();//操作记录

        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    });
  },
  // 获取坯布信息
  getClothInfo:function(){
    var that=this;
    var url = app.globalData.servsers + "dy/orderscloth/clothselect";
    var token = wx.getStorageSync("token");//获取token值
    // var orderId = wx.getStorageSync("orderId");//获取订单id
    var orderId = that.data.orderId;//获取订单id
    var list=that.data.list;
    var unit=that.data.unit;//单位
    wx.request({
      url: url,
      data: {
        "orderid": orderId
        
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          var dataList=data.list;
          for(var i=0;i<dataList.length;i++){
            var clothInfo = JSON.parse(dataList[i].clothInfo);
            console.log(clothInfo)
            dataList[i].cName = clothInfo.clothName;
            dataList[i].cNum = dataList[i].batch;
            dataList[i].num = dataList[i].getNum + unit;
            console.log(dataList[i])
            dataList[i].getBolt = dataList[i].getBolt + "匹";
            
            if (dataList[i].bolt<=0){
              dataList[i].bolt = 0
            }else{
              dataList[i].bolt = "余" + dataList[i].bolt+"匹";
            }
            
            
            
            // dataList[i].value = dataList[i].getNum + unit;
            
          }
          list[1] = {
            id: 'cloth',
            name: '坯布信息',
            open: false,
            dataList: dataList
          }
          that.setData({
            list: list
          });

        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    });
  },
  // 获取印染信息
  getDyeInfo: function () {
    var that = this;
    var url = app.globalData.servsers + "dy/orders/selectDye";
    var token = wx.getStorageSync("token");//获取token值
    // var orderId = wx.getStorageSync("orderId");//获取订单id
    var orderId = that.data.orderId;//获取订单id
    var list = that.data.list;
    var unit = that.data.unit;//单位
    wx.request({
      url: url,
      data: {
        "orderid": orderId
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          var dataList=data.list;
          
          for(var i=0;i<dataList.length;i++){
            //进缸匹重
            if (dataList[i].numIn !== 0) {
              dataList[i].weight = (dataList[i].clothNum / dataList[i].clothBolt).toFixed(2) + unit + "/匹";
            } else {
                  dataList[i].weight = ""
             }
            //成品匹重
            if (dataList[i].numOut !== 0) { 
              dataList[i].weightOut = (dataList[i].numOut / dataList[i].boltOut).toFixed(2); 
              dataList[i].recovery = 100 * (dataList[i].numOut / (dataList[i].numOut + dataList[i].inferiorNum + dataList[i].wasteNum)).toFixed(2)+"%";
            } else {
                 dataList[i].weightOut = "";
                 dataList[i].recovery ="";
            }
            //状态
            switch (dataList[i].checkType){
              case 2:
                dataList[i].checkTypeStr="异常";
                dataList[i].checkTypeColor = "#FFA865";
                break;
              case 3:
                dataList[i].checkTypeStr = "损坏";
                dataList[i].checkTypeColor = "#FF6565";
                break;
              default:
                dataList[i].checkTypeStr = "正常";
                dataList[i].checkTypeColor = "#1E87F0";
            }
            dataList[i].color = dataList[i].color == null ? "" : dataList[i].color ;
            // 当前阶段
            var all = dataList[i].allcount,
                has = dataList[i].hascount;
            if (all!==0) { dataList[i].stage = 100 * (has / all).toFixed(2)+"%" } else { dataList[i].stage =""}
            dataList[i].flowName = dataList[i].flowName == null ? "未开始":dataList[i].flowName;
            dataList[i] = {
               label: "",
               parent_id:"dyeInfo",
               sub: true, 
               open: false,
               id: dataList[i].id,
               vatNum: dataList[i].number, 
               bacth: dataList[i].batch,
               bolt: dataList[i].clothBolt,
               newProcess: dataList[i].flowName,

               dataSubLsit: [
                 { label: "缸号", value: dataList[i].number },
                 { label: "色别", value: that.data.color },
                 { label: "坯布批次", value: dataList[i].batch },
                 { label: "匹数", value: dataList[i].clothBolt },
                 { label: "数量", value: dataList[i].clothNum+unit},
                 { label: "规格", value: that.data.spec},
                 { label: "进缸坯重", value: dataList[i].weight },
                 { label: "当前阶段", value: dataList[i].flowName },//stage
                 { label: "成品坯重", value: dataList[i].weightOut },
                 { label: "成品率", value: dataList[i].recovery },
                 { label: "状态", value: dataList[i].checkTypeStr, color: dataList[i].checkTypeColor},
                 { label: "质检结果", value: dataList[i].level, color:"#FF6565" }
              ], subIndex: 2
            }
          }

          list[2] = {
            id: 'dyeing',
            name: '印染信息',
            open: false,
            sub: true,
            dataList:dataList
          }
          that.setData({
            list: list
          });

        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    });
  },
  // 获取操作记录
  getLogs: function () {
    var that = this;
    var url = app.globalData.servsers + "dy/orders/logs";
    var token = wx.getStorageSync("token");//获取token值
    // var orderId = wx.getStorageSync("orderId");//获取订单id
    var orderId = that.data.orderId;//获取订单id
    var list = that.data.list;
    wx.request({
      url: url,
      data: {
        "orderId": orderId
      },
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          var dataList = data.list;

          for (var i = 0; i < dataList.length; i++) {
            dataList[i] = { label: "", value: dataList[i].remarks }
            // dataList[i] = {
            //   label: "时间", value: dataList[i].createDate, sub: true, open: false, id: dataList[i].id,
            //    dataSubLsit: [
            //     // { label: "操作人", value: "李兰" },
            //     // { label: "步骤", value: "2" },
            //      { label: "", value: dataList[i].remarks }
            //   ], subIndex: 3
            // }
          }

          list[3] = {
            id: 'log',
            name: '操作记录',
            open: false,
            sub: true,
            dataList: dataList
          }
          that.setData({
            list: list
          });

        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    });
  },
  // 子级菜单折叠
  kindToggleSub: function (e) {
    console.log(e)
    var sub=e.currentTarget.dataset.sub;
    console.log(sub)
    if(!sub)return;
    var id = e.currentTarget.id,
      index = e.currentTarget.dataset.index,
      list = this.data.list,
     subList = this.data.list[index].dataList;
    for (var i = 0, len = subList.length; i < len; ++i) {
      if (subList[i].id == id) {
        subList[i].open = !subList[i].open
      } else {
        subList[i].open = false
      }
    }
    list[index].dataList = subList;
    this.setData({
      list: list
    });
  },
  print:function(){
    console.log("click")
  }
});

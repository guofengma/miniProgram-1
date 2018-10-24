//获取应用实例
const app = getApp()

var initdata = function (that) {
  var list = that.data.list
  for (var i = 0; i < list.length; i++) {
    list[i].txtStyle = ""
  }
  that.setData({ list: list })
}
Page({
  data: {
    vatList: [{ dyeNum: "", vat_num:""}],
    vatItem: { dyeNum: "", vat_num: ""},
    clothList: [[{ bolt: "",boltIndex:""}]],
    clothItem: { bolt: "", boltIndex: "" },
    orderNum:"",//订单编号
    dyeNum:"",
    p_count:0,
    count:0,
    orderId:"",
    unit:"",//单位
    weightList:[],
    url:"",
    token:"",
    servsers:"",
    // 批次
    batch: {
    },
    batch_arr: [],
    // 数量list
    numList:[[]]
    
  },
  onShow:function(){
    this.getClothBatch();//坯布批次
    
  },
  onLoad:function(){
    var servsers = app.globalData.servsers;
    var url = servsers  + "dy/orders/dyeNum";
    var token = wx.getStorageSync("token");//获取token值
    var orderId = wx.getStorageSync("orderId");//获取订单id
    var fabricType = wx.getStorageSync("fabricType");//获取面料类型
    var unit = fabricType == "1"?"千克":"米";//单位
    var orderNum = wx.getStorageSync("orderNum");//获取订单编号
    
    
    this.setData({
      orderId: orderId,
      orderNum: orderNum,//订单编号
      unit:unit,
      url: url,
      token: token,
      servsers: servsers
    })
     this.getVatNum();//最大缸号
    // this.initEleWidth();
  },
  // 传formId到后台
  submitFormId: function (e) {
    var formId = e.detail.formId;
    console.log(formId)
    if (formId !== "the formId is a mock one") {
      app.postFormId(formId)
    }
  },
  // 获取最大缸号
  getVatNum:function(){
    var that=this,
        orderId = that.data.orderId,
        orderNum = that.data.orderNum,
        url=that.data.url,
        token=that.data.token;
    wx.request({
      url: url,
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      data:{
        orderId: orderId
      },
      success:function(res){
        var data=res.data;
        if(data.code==0){
          if (data.data){
            var dyeNum = data.data.dyeNum;
            var numArr = dyeNum.split("-");
          }else{
            var numArr = [orderNum,0]
          }


          that.setData({
            orderNum: orderNum,
            dyeNum :Number(numArr[1])+1,
            p_count: (data.order.usableBolt - data.order.realityBolt),
            count: (data.order.usableNum - data.order.realityNum)
          })
         
        }else{
          app.exceptionHandle(data, "../../login/login")
        }
      }
    })
  },
  // 获取坯布批次
  getClothBatch(){
    var that = this;
    var url = app.globalData.servsers + "dy/orders/queryOrderClothBatch";//接口地址
    var orderid = that.data.orderId,
        token = that.data.token;
    wx.request({
      url: url,
      data: {
        "orderid": orderid
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = [],
            index = ""
          for (var i = 0; i < list.length; i++) {
            var clothInfo = JSON.parse(list[i].clothInfo);
            var weight=(list[i].num/list[i].bolt).toFixed(2);//匹重
            selectList.push({ "value": list[i].batch, "name": clothInfo.clothName + " " + list[i].batch, "clothName": clothInfo.clothName, "clothInfo": list[i].clothInfo, "bolt": list[i].bolt, "inventoryStorehostId": list[i].inventoryStorehostId, "clothId": list[i].clothId, "num": list[i].num, "weight": weight})
          }
          index = list.length == 1 ? "0" : "";
          that.setData({
            batch: { index: index, option: selectList }
          })
          var batch_arr = that.data.batch_arr;
          var batch = that.data.batch;
          batch_arr.push([batch]);

          var usableList = selectList;//可用匹数list
          that.setData({
            batch_arr: batch_arr,
            usableList: usableList
          })
        }
      }
    })
  },
  // 坯布批次picker
  bindBatchPickerChange: function (e) {
    var arr = this.data.batch_arr;
    if (arr.length == 0) { return }
    var curIndex = e.target.dataset.current;
    var parent = e.target.dataset.parent;
    this.data.batch_arr[parent][curIndex].index = e.detail.value;
    var clothList=this.data.clothList;
    var batchIndexPre = clothList[parent][curIndex].batchIndex;
    clothList[parent][curIndex].batchIndex = e.detail.value;
    if (batchIndexPre!==undefined){
      var numList = this.data.numList,
        usableList = this.data.usableList,
        limitNum = usableList[batchIndexPre].bolt,
        bolt = clothList[parent][curIndex].bolt;




      numList[parent][curIndex] = ""
      if (bolt !== "") usableList[batchIndexPre].bolt = Number(limitNum) + Number(bolt)
      clothList[parent][curIndex].bolt = ""
      this.setData({
        numList: numList,
        usableList: usableList
      })
    }
    

    this.setData({
      batch_arr: this.data.batch_arr,
      clothList: clothList
    })
  },

  setVal:function(e){
    var val=e.detail.value,
        i=e.currentTarget.dataset.index,
        name = e.currentTarget.dataset.name,
        vatList = this.data.vatList;
    vatList[i][name]=val
    this.setData({
      vatList: vatList
    })
  },
  // 增加坯布批次
  addCloth:function(e){
    var index = e.currentTarget.dataset.index;
    var cloth = this.data.clothList;
    cloth[index].push({ bolt: "", boltIndex: ""});
    var batch_arr = this.data.batch_arr;
    var batch= this.data.batch;
    batch_arr[index].push(batch)

    var numList = this.data.numList;
    // console.log(numList);
    numList[index].push([])
    // console.log(numList);

    this.setData({
      clothList: cloth,
      batch_arr: batch_arr,
      numList: numList
    });
  },
  // 删除坯布批次
  delClothBatch:function(e){
    // console.log(e)
    var index = e.currentTarget.dataset.index;
    var parent = e.currentTarget.dataset.parent
    var cloth = this.data.clothList;
    //// 计算可用匹数
    var batchIndex = e.target.dataset.batchindex;
    var usableList = this.data.usableList;
    // console.log(usableList)
    if (batchIndex!==""){
      var limitBolt = usableList[batchIndex].bolt;
      var boltItem = cloth[parent][index].bolt;
      usableList[batchIndex].bolt = Number(limitBolt) + Number(boltItem)
    }
    //

    cloth[parent].splice(index,1);
    var batch_arr = this.data.batch_arr;
    var batch = this.data.batch;
    batch_arr[parent].splice(index, 1);

    var numList = this.data.numList;
    numList[parent].splice(index, 1);
   
    
    this.setData({
      clothList: cloth,
      batch_arr: batch_arr,
      usableList: usableList
    });
  },
  // 添加缸
  insert: function () {
    var vat = this.data.vatList;
    var clothList = this.data.clothList;
    clothList.push([{ bolt: "", boltIndex: ""}])

    var batch_arr = this.data.batch_arr;
    var batch = this.data.batch;
    batch_arr.push([batch])

    var numList = this.data.numList;
    numList.push([[]])
    
    // console.log(vat);
    // console.log(batch_arr);
    
    vat.push({ dyeNum: "", vat_num: "", p_count: "", count: "", weight: "" });
    this.setData({
      vatList: vat,
      clothList: clothList,
      batch_arr: batch_arr
    });
  },
  // 删除缸
  delBind: function (e) {
    var vat = this.data.vatList,
        clothList = this.data.clothList,
        batch_arr = this.data.batch_arr,
        index=e.currentTarget.dataset.index;

    // 计算可用匹数
    var usableList = this.data.usableList;
    for (var i = 0; i < clothList[index].length;i++){
      var batchIndex = clothList[index][i].batchIndex;
      var bolt = clothList[index][i].bolt;
      if (bolt!==""){
        var limitBolt = usableList[batchIndex].bolt;
        usableList[batchIndex].bolt = Number(limitBolt) + Number(bolt);
      }
      
    }
    // 

    vat.splice(index,1)
    clothList.splice(index, 1)
    batch_arr.splice(index, 1);

    var numList = this.data.numList;
    numList.splice(index, 1);
    // console.log(batch_arr)
    this.setData({
      vatList: vat,
      clothList: clothList,
      usableList: usableList
    });
  },
  // 计算数量和匹数
  clacNum:function(e){
    var dataset = e.target.dataset,
        weight = dataset.weight,
        bolt=e.detail.value,
        numList = this.data.numList,
        clothList = this.data.clothList,
        num = weight * bolt,
        parent = dataset.parent,
        index = dataset.index,
        batchIndex = e.target.dataset.batchindex,
        usableList = this.data.usableList;
    if (bolt == "") {
      numList[parent][index] = "";
      this.setData({
        numList: numList
      })
      return;
    }

    var limitNum = usableList[batchIndex].bolt;
    
    clothList[parent][index].bolt = bolt;
    numList[parent][index]=num;
    usableList[batchIndex].bolt = limitNum - bolt;
    this.setData({
      numList:numList,
      usableList: usableList,
      clothList: clothList
    })
  },
  clacNumFocus:function(e){
    console.log(e)
    
    var dataset = e.target.dataset,
      bolt = e.detail.value;
    if (bolt == "") return;
    var parent = dataset.parent,
      index = dataset.index,
      batchIndex = e.target.dataset.batchindex,
      usableList = this.data.usableList,
      limitNum = usableList[batchIndex].bolt,
      clothList = this.data.clothList;
    
    clothList[parent][index].bolt = "";
    usableList[batchIndex].bolt = Number(limitNum) + Number(bolt);
    this.setData({
      usableList: usableList,
      clothList: clothList
    })
  },
  // 限制输入的匹数
  limitBolt:function(e){
    var bolt=e.detail.value,
        usableList = this.data.usableList,
        index=e.target.dataset.index,
        parent=e.target.dataset.parent,
        batchIndex = e.target.dataset.batchindex,
        batch_arr = this.data.batch_arr,
        currentIndex = batch_arr[parent][index].index;
    if (currentIndex==""){
      wx.showToast({
        title: '请先选择坯布批次',
        icon: 'none',
        duration: 500,
        mask: true,
       
      })
      return ""
      }
    var limitNum = usableList[batchIndex].bolt;
    if (bolt > limitNum) {return limitNum};

   
    
  },
  formSubmit: function (e) {
    this.submitFormId(e)
    var clothList = this.data.clothList;
    var val = e.detail.value;
    var l = this.data.vatList.length;
    var warn="";
    var flag=true;
    var vat_numList=[];
   for(var i=0;i<l;i++){
     vat_numList.push(val["vat_num" + i])
      if (val["vat_num" + i] == ""){
        warn = "请输入缸号"
        flag = false;
      } 
      var cl = clothList[i].length;
      for(var j=0;j<cl;j++){
        if (val["batch" + i + j] == "") {
          warn = "请选择坯布批次"
          flag = false;
        } else if (val["bolt" + i + j] == "") {
          warn = "请输入匹数"
          flag = false;
        } 
      }
   }
   var isRepeat = app.isRepeat(vat_numList);
   if (isRepeat){warn="缸号不能重复"}
  //  console.log(isRepeat)
  //  console.log((!flag) || isRepeat)
   
   if ((!flag) || isRepeat){
     wx.showModal({
       title: '提示',
       content: warn
     }) 
    }else{
     this.postData(val,l)
     console.log(val)
    }
    
  },
  postData:function(val,l){
    wx.showLoading({
      title: '提交中',
      icon:"none",
      mask:true
    })
    var that = this,
      dyeVats=[],
      clothBatch=[],
      orderId = that.data.orderId,
      servsers = that.data.servsers,
      token = that.data.token;
      var clothList = that.data.clothList;
      for(var i=0;i<l;i++){
        dyeVats.push({
          "dyeNum": val["dipdye_num" + i],//印染编号
          "number": val["vat_num" + i],//缸号
          "clothList":[]
          })
        var cl = clothList[i].length;
        for(var j=0;j<cl;j++){
          dyeVats[i].clothList.push({
            "clothId": val["clothId"+i+j],
            "clothInfo": val["clothInfo" + i + j],
            "clothBolt": val["bolt" + i + j],
            "batch": val["batch" + i + j],
            "inventoryStorehostId": val["inventoryStorehostId" + i + j]
          })
        }
      }
    wx.request({
      url: servsers +"dy/orders/addDyeVat",
      header: {
        'content-type': 'application/json', // 默认值
        "token": token
      },
      data: {
        "orderId": orderId,
        "dyeVats": dyeVats
      },
      method:"POST",
      success: function (res) {
        wx.hideLoading()
        var data = res.data;
        if (data.code == 0) {
          
          wx.showToast({
            title: '提交成功',
            duration:1000,
            success:function(){
              //app.sendMessage()// 发送小程序通知
            }
          })
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.setData({
            page: 1,
            list: [],
            scrollTop: 40
          })
        prePage.getList(prePage)
        // end刷新上一页数据
           wx.navigateBack({
            delta:1
          })
        } else {
          app.exceptionHandle(data, "../../login/login")
        }
        wx.hideLoading()
      }
    })
  }
})  
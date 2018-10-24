//获取应用实例
const app = getApp()

Page({
  data: {
    vatList: [{ dyeNum: "", vat_num:"",p_count:"",count:"",weight:""}],
    vatItem: { dyeNum: "", vat_num: "", p_count: "", count: "", weight: "" },
    orderNum:"",//订单编号
    dyeNum:"",
    p_count:0,
    count:0,
    orderId:"",
    unit:"",//单位
    weightList:[],
    url:"",
    token:"",
    servsers:""
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
    this.getVatNum();
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
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          console.log(pages)
          console.log(prePage)
          prePage.setData({
            page: 1,
            list: [],
            scrollTop: 40
          })
        // prePage.getList(prePage)
        // end刷新上一页数据
        }else{
          app.exceptionHandle(data, "../../login/login")
        }
      }
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
  insert: function () {
    var vat = this.data.vatList;
    console.log(vat);
    vat.push({ dyeNum: "", vat_num: "", p_count: "", count: "", weight: "" });
    this.setData({
      vatList: vat
    });
    console.log(vat);
  },
  delBind: function (e) {
    var vat = this.data.vatList,
        index=e.currentTarget.dataset.index,
        p_count_item=Number(vat[index].p_count),
        count_item = Number(vat[index].count),
        p_count = Number(this.data.p_count),
        count = Number(this.data.count);
    vat.splice(index,1)
    this.setData({
      vatList: vat,
      p_count: p_count + p_count_item,
      count: count + count_item
    });
  },
  calcPCount: function (e) {
    var p_count = Number(this.data.p_count),//匹数
        val = e.detail.value,
        i = e.currentTarget.dataset.index,
        name = e.currentTarget.dataset.name,
        vatList = this.data.vatList;
    if (val) { vatList[i][name] = Number(val).toFixed(2);}
    
    // 计算匹重
    var count = Number(vatList[i].count);
    if (count) {vatList[i].weight=(count/val).toFixed(2)}
    if (val) { p_count = (this.data.p_count - val).toFixed(2)}
    this.setData({
      p_count: p_count,
      vatList: vatList
    })
  },
  limitVal:function(e){
    var p_count = this.data.p_count
    var val = Number(e.detail.value);
    if (val > p_count) { return p_count }
  },
  focusVal:function(e){
    var p_count = Number(this.data.p_count);
    var val = e.detail.value;
    this.setData({
      p_count: p_count + Number(val)
    })
  },
  calcCount: function (e) {
    var count = this.data.count,
        val = e.detail.value,
         i = e.currentTarget.dataset.index,
         name = e.currentTarget.dataset.name,
         vatList = this.data.vatList;
    if (val) { vatList[i][name] = Number(val).toFixed(2);}
        
    // 计算匹重
    var p_count = Number(vatList[i].p_count);
    if (p_count) { vatList[i].weight = (val/p_count).toFixed(2) }
    if (val) { count=(this.data.count - val).toFixed(2)}
    this.setData({
      count: count,
      vatList: vatList
    })
  },
  limitVal2: function (e) {
    var count = this.data.count
    var val = e.detail.value;
    if (val > count) { return count }
  },
  focusVal2: function (e) {
    var count = Number(this.data.count)
    var val = e.detail.value;
    this.setData({
      count: count + Number(val)
    })
  },
  formSubmit: function (e) {
    console.log(this.data.vatList)
    var val = e.detail.value;
    var l = this.data.vatList.length;
    var warn="";
    var flag=true;
   for(var i=0;i<l;i++){
    if (val["count" + i]==""){
      warn="请输入数量"
      flag=false;
    } else if (val["vat_num" + i] == ""){
      warn = "请输入缸号"
      flag = false;
    } else if (val["p_count" + i] == "") {
      warn = "请输入匹数"
      flag = false;
    } 
    
   }
    console.log(flag)  
   if (!flag){
     wx.showModal({
       title: '提示',
       content: warn
     }) 
    }else{
     this.postData(val,l)
      // wx.showToast({
      //   title: '提交成功',
      //   icon: 'success'
      // })
      // wx.navigateBack({
      //   delta: 1
      // })
    }
    
  },
  postData:function(val,l){
    var that = this,
      dyeVats=[],
      orderId = that.data.orderId,
      servsers = that.data.servsers,
      token = that.data.token;
      console.log(val)
      for(var i=0;i<l;i++){
        dyeVats.push({
          "dyeNum": val["dipdye_num" + i],
          "number": val["vat_num" + i],
          "bolt": val["p_count" + i] ,
          "num": val["count" + i]})
      }
      console.log(dyeVats)
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
        var data = res.data;
        if (data.code == 0) {
          wx.showToast({
            title: '提交成功',
            duration:2000
          })
           wx.navigateBack({
            delta:1
          })
        } else {
          app.exceptionHandle(data, "../../login/login")
        }
      }
    })
  }
})  
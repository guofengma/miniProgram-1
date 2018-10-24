import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      page:1,
      bottomHidden:true,
      noDataHidden:true,
      orderList:[],
      searchForm: { 
        "vatNum": { "selHidden": true ,"noData":true},
        "factoryName": { "selHidden": true ,"noData":true },
        "fabricName": { "selHidden": true ,"noData":true }, 
        "clothBatch": { "selHidden": true ,"noData":true },
        "customer": { "selHidden": true, "noData": true },
        "startDate":"",
        "endDate":"",
      }
    },
    onLoad(){
      var  _this = this;
      _this.getFactory()
      _this.getFabricy()
      _this.getBatch()
      _this.getCustomer()

      _this.getOrderList()
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
    // 下拉搜索
    showSelect:function(e){
      var name=e.currentTarget.dataset.name;
      var searchForm=this.data.searchForm;
      searchForm[name].selHidden=false
      this.setData({
        searchForm:searchForm
      })
    },
    hideSelect:function(e){
      var name=e.currentTarget.dataset.name;
      var searchForm=this.data.searchForm;
      searchForm[name].selHidden=true
      this.setData({
        searchForm:searchForm
      })
    },
    searchName:function(e){
      var val = e.detail.value,//.toLowerCase()
        searchArr = [],
        searchForm = this.data.searchForm,
        sName = e.currentTarget.dataset.name,
        list = searchForm[sName].list,
        l = list.length;
        searchForm[sName].id = "";
        searchForm[sName].value = val;
      for (var i = 0; i < l; i++) {
        var name = list[i].name;//.toLowerCase()
        if (name.indexOf(val) >= 0) {
          searchArr.push(list[i]);
        }
      }
      searchForm[sName].noData = searchArr.length < 1 ? false : true;
      searchForm[sName].select = searchArr;
      this.setData({
        searchForm: searchForm
      })
    },
    choseName:function(e){
      console.log(e)
      var id=e.currentTarget.id
      var name=e.currentTarget.dataset.name
      var value=e.currentTarget.dataset.value
      var searchForm=this.data.searchForm
      searchForm[name].value=value
      searchForm[name].id=id
      this.setData({
        searchForm:searchForm
      })
    },
    // //end  下拉搜索
    // 选择时间
    choseDate:function(e){
      var _this=this
      var searchForm=_this.data.searchForm
      var type=e.currentTarget.dataset.type
       dd.datePicker({
        // currentDate: '2016-10-10',
        // startDate: '2016-10-9',
        // endDate: '2017-10-9',
        success: res => {
          if(type=="start"){
            searchForm.startDate=res.date
          }else{
            searchForm.endDate=res.date
          }
          _this.setData({
            searchForm:searchForm,
            page:1,
            orderList:[]
          })
        },
      });
    },
    // 点击搜索按钮
    search:function(e){
      console.log(e)
       this.setData({
        page:1,
        orderList:[],
        bottomHidden:true
      })
      this.getOrderList()
    },
    // 点击重置
    reset:function(){
      var searchForm=this.data.searchForm
      for (var key in searchForm){
        if(key=="startDate"||key=="endDate"){
         searchForm[key]=""
        }else{
          searchForm[key].value=""
          searchForm[key].id = ""
        }
      }
      this.setData({
        searchForm:searchForm,
        page:1,
        orderList:[],
        bottomHidden:true
      })
      this.getOrderList()
    },
      // 下拉刷新
    // onPullDownRefresh() {
    //   let _this = this;
    //   _this.reset()
    //   _this.getOrderList()//获取订单列表
    // },
    //上拉加载
    onReachBottom(){
      this.getOrderList()//获取订单列表
    },
       // 进入分缸列表
    toVatList:function(e){
      var dataset=e.currentTarget.dataset;
      var title=dataset.title;
      var id=e.currentTarget.id;
      var breakage=dataset.breakage;
      var gendans=dataset.gendans
      var status = dataset.status
       dd.navigateTo({
         url: '../vatList/vatList?title=' + title + '&id=' + id + '&breakage=' + breakage + '&gendans=' + gendans + '&status=' + status
      })
    },
    // 获取订单列表
    getOrderList:function(){
      var _this=this
      var  bottomHidden=this.data.bottomHidden;
      if(!bottomHidden)return
      var searchForm=_this.data.searchForm
      var page=_this.data.page
      var roleIdList=dd.getStorageSync({key:'userInfo'}).data.roleIdList;
      var isMe=roleIdList.indexOf(1)>-1?0:1//除系统管理员只能看到自己有关的合同
      var url=app.globalData.servsers+"/dy/orders/queryOrderSearch" 
      var method="get"
      var data={
        "isMe":isMe,
        "partnersId": searchForm.factoryName.id,//印染厂id
        "startDate": searchForm.startDate,//开始时间
        "endDate": searchForm.endDate,//结束时间
        "number": searchForm.vatNum.value || "",//缸号
        "fabricid": searchForm.fabricName.id || "",//面料id
        "batch": searchForm.clothBatch.value || "",//坯布批号
        "customerid": searchForm.customer.id || "",//客户id
        "page":page,
        "limit":10,
      }
      dd.showLoading({
        content: '加载中...'
      });
      DDhttpRequest({url,method,data,
        success(res){
          console.log(res)
          var data = res.data;
          if(data.code==0){
            var list = data.page.list
            _this.dataProcessing(list,page)
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 数据处理
    dataProcessing:function(list,page){
      var _this=this
      var orderList=_this.data.orderList
      if(list.length<10){
        var bottomHidden=false
      }else{
        var bottomHidden=true
      }
      if(page==1&&list.length<1){
        var noDataHidden=false
      }else{
        var noDataHidden=true
      }
       // 订单相关数据处理
        list.forEach(subItem=>{
          subItem.fabricInfo=JSON.parse(subItem.fabricInfo)
          // // 订单进度计算
          var paidanNum = subItem.paidanNum,
            completedNum = subItem.completedNum;
          if (paidanNum > 0) {
            subItem.process = (completedNum / paidanNum) * 100;
            subItem.process = subItem.process.toFixed(2)
          } else {
            subItem.process = 0.00
          }
          // 优先级
          var urgencyDegree = subItem.urgencyDegree; //紧急程度 1.普通 2.紧急 3.非常紧急
          var isEmergent = subItem.isEmergent; //是否加急        
          switch (urgencyDegree) {
            case 1:
              subItem.urgency = "green";
              break;
            case 2:
              subItem.urgency = "orange";
              break;
            case 3:
              subItem.urgency = "red";
              break;
            default:
              subItem.urgency = "";
          }
          if(isEmergent)subItem.isEmergent ="emergent";
          ////订单预计完成时间
          var estimateDate=subItem.estimateDate
          var createDate=subItem.createDate
          
          var dateObj=_this.handleDate(estimateDate,createDate)
          subItem.estimateDate = estimateDate.slice(0, 10)
          subItem.dateStatus=dateObj.dateStatus
          subItem.dateStr=dateObj.dateStr
        })
        // end订单相关数据处理
        orderList=orderList.concat(list)
        page++
        this.setData({
          orderList:orderList,
          page:page,
          bottomHidden:bottomHidden,
          noDataHidden:noDataHidden
        })
        dd.hideLoading();
        dd.stopPullDownRefresh()//停止当前页面的下拉刷新。
    },
  // 处理预计完成时间
  handleDate(estimateDate, createDate) {
    var eArr = estimateDate.split(/[- :]/);
    var date = new Date(eArr[0], eArr[1] - 1, eArr[2], eArr[3], eArr[4], eArr[5]);
    var cArr = createDate.split(/[- :]/);
    createDate = new Date(cArr[0], cArr[1] - 1, cArr[2], cArr[3], cArr[4], cArr[5]);
    var dateObj = {
      dateStr: estimateDate.slice(0, 10) + "交",
      dateStatus: ""
    }
    var now = new Date()
    var diff = date - now;
    var duration = date - createDate;
    if (diff < 0) {
      var day = Math.ceil(-diff / 24 / 3600 / 1000)
      dateObj.dateStr = "逾期" + day + "天"
      dateObj.dateStatus = "red"
    } else {
      if (diff < (duration * (1 / 3))) {
        dateObj.dateStatus = "orange"
      }
    }
    return dateObj
  },
     // 获取印染厂列表
    getFactory: function () {
      var _this=this
      var searchForm=_this.data.searchForm
      var url=app.globalData.servsers+"/dy/partners/selectclass/1" //1表示合作商中的印染厂
      var method="get"
      var data={}
      DDhttpRequest({url,method,data,
        success(res){
          console.log(res)
          var data = res.data;
          if(data.code==0){
            var list = data.entity
            list.forEach(item=>{
              item.name=item.pname
            })
            searchForm.factoryName.select=list
            searchForm.factoryName.list=list
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
      // 获取面料品名列表
    getFabricy: function () {
      var _this=this
      var searchForm=_this.data.searchForm
      var url=app.globalData.servsers+"/dy/fabric/select" 
      var method="get"
      var data={
        "fabricType": "0"
      }
      DDhttpRequest({url,method,data,
        success(res){
          console.log(res)
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.forEach(item=>{
              item.name=item.fabricName
            })
            searchForm.fabricName.select=list
            searchForm.fabricName.list=list
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
      // 获取坯布批号列表
    getBatch: function () {
      var _this=this
      var searchForm=_this.data.searchForm
      var url=app.globalData.servsers+"/dy/orders/queryOrderClothBatch" 
      var method="get"
      var data={
        "orderid": "0"
      }
      DDhttpRequest({url,method,data,
        success(res){
          console.log(res)
          var data = res.data;
          if(data.code==0){
            var list = data.list
            var newList=[]
            list.forEach(item=>{
              newList.push(item.batch)
            })
            newList=app.distinct(newList)
            list=[]
            newList.forEach(item=>{
              list.push({name:item})
            })
            searchForm.clothBatch.select=list
            searchForm.clothBatch.list=list
            
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
       // 获取客户列表
    getCustomer: function () {
      var _this=this
      var searchForm=_this.data.searchForm
      var url=app.globalData.servsers+"/dy/customer/select" 
      var method="get"
      var data={}
      DDhttpRequest({url,method,data,
        success(res){
          console.log(res)
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.forEach(item=>{
              item.name = item.customerName + " " + item.customerNum;
            })
            searchForm.customer.select=list
            searchForm.customer.list=list
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },

})
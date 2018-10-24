import {DDhttpRequest,exceptionHandle} from  '../../util/request';

let app = getApp();

Page({
    data: {
      systemInfo:{},
      page:1,
      bottomHidden:true,
      noDataHidden:true,
      collapseData: {
        onTitleTap: 'handleTitleTap',
        panels: [],
      },
    },
    onLoad(){
      let _this = this;
      // 设备信息
      var systemInfo=dd.getStorageSync({key:'systemInfo'})
      _this.setData({
            systemInfo: systemInfo.data.systemInfo
      })
      //_this.init()
      //_this.getContractList()//获取合同列表
    },
    onShow(){
      let _this = this;
      _this.init()
      _this.getContractList()//获取合同列表
    },
    // 初始化
    init:function(){
       this.setData({
        page:1,
        bottomHidden:true,
        collapseData: {
          onTitleTap: 'handleTitleTap',
          panels: []
         
        }
      })
    },
    // 进入订单搜索列表
    toOrderList:function(e){
      dd.navigateTo({
        url: '../orderListSearch/orderListSearch'
      })
    },
    // 折叠面板
    handleTitleTap(e) {
      const { index } = e.currentTarget.dataset;
      const panels = this.data.collapseData.panels;
      // android does not supprt Array findIndex
      panels[index].expanded = !panels[index].expanded;
      this.setData({
        collapseData: {
          ...this.data.collapseData,
          panels: [...panels],
        },
      });
    },
    // 进入已完成合同
    toFinishContract:function(){
      dd.navigateTo({
        url: '../contractFinished/contractFinished'
      })
    },
    // 进入合同详情页
    toContractDetail:function(e){
      var title=e.currentTarget.dataset.title;
      var id=e.currentTarget.dataset.id;
      
       dd.navigateTo({
        url: '../contractDetail/contractDetail?title='+title+'&id='+id
      })
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
     // 下拉刷新
    onPullDownRefresh() {
      let _this = this;
      _this.init()
      _this.getContractList()//获取合同列表
    },
    //上拉加载
    onReachBottom(){
      // console.log("上拉")
      this.getContractList()//获取合同列表
    },
    // 获取合同列表
    getContractList:function(){
      var _this=this
      var  bottomHidden=this.data.bottomHidden;
      if(!bottomHidden)return
      var page=_this.data.page
      var url=app.globalData.servsers+"/dy/contract/list"
      var method="get"
      var roleIdList=dd.getStorageSync({key:'userInfo'}).data.roleIdList;
      var isMe=roleIdList.indexOf(1)>-1?0:1//除系统管理员只能看到自己有关的合同
      console.log(isMe)
      var data={
         page:page,
         limit:5,
        //  isMe:isMe,
         isComplete:0//未完成
      }
      dd.showLoading({
        content: '加载中...'
      });
      DDhttpRequest({url,method,data,
        success(res){
          console.log(res)
          var data = res.data;
          if(data.code==0){
            var list=data.page.list;
            _this.dataProcessing(list,page)
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 合同列表数据处理
    dataProcessing(data,page){
      var panels=[]
      var collapseData=this.data.collapseData;
      if(data.length<5){
        var bottomHidden=false
      }else{
        var bottomHidden=true
      }
      if(page==1&&data.length<1){
        var noDataHidden=false
      }else{
        var noDataHidden=true
      }
      data.forEach(item=>{
         // 优先级
        var urgencyDegree = item.urgencyDegree; //紧急程度 1.普通 2.紧急 3.非常紧急
        var isEmergent = item.isEmergent; //是否加急        
        switch (urgencyDegree) {
          case 1:
            item.urgency = "green";
            break;
          case 2:
            item.urgency = "orange";
            break;
          case 3:
            item.urgency = "red";
            break;
          default:
            item.urgency = "";
        }
        if(isEmergent) item.urgency ="red";
        // 标签颜色
        if (item.contractStatus==3){
          item.tagList.forEach(tagItem=>{
            tagItem.colorCode ="#919191"
          })
        }
        // 面料名称
        var fabricList = item.fabricList;
        var fabricLength = fabricList.length;
        var fabricName = [];
        for (var j = 0; j < fabricLength; j++) {
          var fabricInfo = JSON.parse(fabricList[j].fabricInfo);
          fabricName.push(fabricInfo.fabricName)
          item.unit = fabricInfo.fabricType == "1" ? "kg" : "m";//单位
        }
        fabricName = app.distinct(fabricName)
        var fabricNameStr = fabricName.join(",");
        item.fabricNameStr = fabricNameStr
        // // 进度计算
        var fabricSum = item.fabricSum,
          inventorySum = item.inventorySum,
          completeNum = item.completeNum;
        if (fabricSum > 0) {
          item.process = ((completeNum + inventorySum) / fabricSum) * 100;
          item.process = item.process.toFixed(2)
        } else {
          item.process = 0.00
        }
        // 合同预计完成时间
        var predictDate = item.predictDate
        var createDate = item.createDate
        var dateObj = this.handleDate(predictDate, createDate)
        item.predictDate = predictDate.slice(0, 10)
        item.dateStatus = dateObj.dateStatus
        item.dateStr = dateObj.dateStr

        item.predictDate = item.predictDate.slice(0, 10)//合同预计完成时间
        // 订单相关数据处理
        item.orderList.forEach(subItem=>{
          subItem.fabricInfo=JSON.parse(subItem.fabricInfo)
          // // 订单进度计算
          var estimateProduction = subItem.estimateProduction,
            completeNum = subItem.completeNum;
          if (estimateProduction > 0) {
            subItem.process = (completeNum / estimateProduction) * 100;
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
          var dateObj=this.handleDate(estimateDate,createDate)
          subItem.estimateDate = estimateDate.slice(0, 10)
          subItem.dateStatus=dateObj.dateStatus
          subItem.dateStr=dateObj.dateStr
          
          
           
        })
        // end订单相关数据处理
        collapseData.panels.push({
             contract:item ,
             expanded: false,
        })
      })
      // console.log(collapseData)
      page++
      this.setData({
        collapseData:collapseData,
        page:page,
        bottomHidden:bottomHidden,
        noDataHidden:noDataHidden
      })
      dd.hideLoading();
      dd.stopPullDownRefresh()//停止当前页面的下拉刷新。
    },
   
    // 处理预计完成时间
    handleDate(estimateDate,createDate){
      var  eArr= estimateDate.split(/[- :]/);
      var date = new Date(eArr[0], eArr[1] - 1, eArr[2], eArr[3], eArr[4], eArr[5]);
      var cArr = createDate.split(/[- :]/);
      createDate = new Date(cArr[0], cArr[1] - 1, cArr[2], cArr[3], cArr[4], cArr[5]);      
      var dateObj={
        dateStr:estimateDate.slice(0,10)+"交",
        dateStatus:""
      }
      var now=new Date()
      var diff=date-now;
      var duration=date-createDate;
      if(diff<0){
        var day=Math.ceil(-diff/24/3600/1000)
        dateObj.dateStr="逾期"+day+"天"
        dateObj.dateStatus="red"
      }else{
        if( diff<(duration*(1/3))){
          dateObj.dateStatus="orange"
        }
      }
      return dateObj
    }
})
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
      _this.init()
      _this.getContractList()//获取合同列表
    },
    // 初始化
    init:function(){
       this.setData({
        page:1,
        collapseData: {
          onTitleTap: 'handleTitleTap',
          panels: [],
        }
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
    // toFinishContract:function(){
    //   dd.navigateTo({
    //     url: '../contractFinished/contractFinished'
    //   })
    // },
     // 进入合同详情页
    toContractDetail:function(e){
      var title=e.currentTarget.dataset.title;
      var id=e.currentTarget.dataset.id;
      
       dd.navigateTo({
        url: '../contractDetail/contractDetail?title='+title+'&id='+id
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
      console.log("上拉")
      this.getContractList()//获取合同列表
    },
    // 获取合同列表
    getContractList:function(){
      var _this=this
      var  bottomHidden=+this.data.bottomHidden;
      if(!bottomHidden)return
      var page=_this.data.page
      var url=app.globalData.servsers+"/dy/contract/list"
      var method="get"
      var roleIdList=dd.getStorageSync({key:'userInfo'}).data.roleIdList;
      var isMe=roleIdList.indexOf(1)>-1?0:1
      console.log(isMe)
      var data={
         page:page,
         limit:5,
        //  isMe:isMe,
         isComplete:1// 1已完成 0未完成
         
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
        // 面料名称
        var fabricList = item.fabricList;
        var fabricLength = fabricList.length;
        var fabricName = [];
        for (var j = 0; j < fabricLength; j++) {
          var fabricInfo = JSON.parse(fabricList[j].fabricInfo);
          fabricName.push(fabricInfo.fabricName)
          item.unit = fabricInfo.fabricType == "1" ? "kg" : "m";//单位
        }
        var fabricNameStr = fabricName.join(",");
        item.fabricNameStr = fabricNameStr
        
        // 合同预计完成时间
        item.predictDate = item.predictDate.slice(0, 10)//合同预计完成时间
        
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
      console.log(this.data.noDataHidden)
      dd.hideLoading();
      dd.stopPullDownRefresh()//停止当前页面的下拉刷新。
    },
   
})
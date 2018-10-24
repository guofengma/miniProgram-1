import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      id:"",//订单id 
      title:"",//页面标题
      breakage:"",//预计折损率
      canAddVat:"",//添加分缸权限
      canFinishOrder:"",//完成订单权限
      canCheckFlow:"",//分缸跟进权限
      isGenDan:"",//是否是本合同的跟单员
      unfinishList:[],//未完成列表
      finishList:[],//已完成列表
      status: ""//订单状态(0.生产中 1.已完成 2.质检完成)
      

    },
    onLoad(options){
      let _this = this;
      // 修改页面标题
      dd.setNavigationBar({
          title: options.title
      })
      var id=options.id
      var title=options.title
      var breakage=options.breakage
      // debugger
      var gendans=options.gendans//跟单员id列表
      var status = options.status//订单状态 1已完成
      
      var userId=dd.getStorageSync({ key: "userInfo" }).data.userId;
      var isGenDan=gendans.indexOf(userId)==-1?false:true
      // 临时权限
        // console.log(isGenDan=true)
       // end临时权限 
      

      
      var canAddVat=app.isPermission("dy:orders:addDyeVat") 
      var canFinishOrder=app.isPermission("dy:orders:completeorder") 
      var canCheckFlow=app.isPermission("dy:orders:checkflow") 
      
      _this.setData({
          id:id,
          title:title,
          breakage:breakage,//预计折损率
          canAddVat:canAddVat,
          canFinishOrder:canFinishOrder,
          canCheckFlow:canCheckFlow,
          isGenDan:isGenDan,//是否是本合同的跟单员
          status: status
      })
      //_this.getVatList(0)//未完成
      //_this.getVatList(1)//已完成
      
    },
  onShow() {
    // 页面显示
    this.getVatList(0)//未完成
    this.getVatList(1)//已完成
  },
    // 进入新增分缸页面
    addVat:function(e){
      var title=e.currentTarget.dataset.title;
      var id=e.currentTarget.id;
      dd.navigateTo({
        url: '../addVat/addVat?title='+title+'&id='+id
      })
    },
    // 删除分缸
    deleteVat:function(e){
      console.log(e)
      var id=e.currentTarget.id
      var _this = this;
      var url=app.globalData.servsers+"/dy/orders/deleteDye"
      var method="get"
      var data={
       dyeid:id
      }
      dd.confirm({
        title: '温馨提示',
        content: '是否删除该条信息',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        success: (result) => {
         if(result.confirm){
           dd.showLoading({
             content: '删除中...'
           });
          DDhttpRequest({url,method,data,
            success(res){
              var data = res.data;
              if(data.code==0){
                dd.showToast({
                  type: 'success',
                  content: "删除成功",
                  duration: 2000,
                  success: () => {
                    _this.getVatList(0) 
                    // _this.refreshContract()   
                  },
                });
                
              }else{
                exceptionHandle(res.data)
              }
            
            }
          })
        }
        },
      });
       
    },
    // 进入跟进页或详情页
    toCheckOrdetail:function(e){
       var canCheckFlow=this.data.canCheckFlow;
       var isGenDan=this.data.isGenDan;
       
       var id=e.currentTarget.id
       var dataset=e.currentTarget.dataset
       var number=dataset.number
       var flowList=JSON.stringify(dataset.flowList)
       var boltIn=dataset.boltIn
       dd.setStorageSync({
          key: 'boltIn',
          data: {
            boltIn: boltIn
          }
        });
      if(canCheckFlow&&isGenDan){
         dd.navigateTo({
          url: '../checkFlow/checkFlow?title='+number+'&id='+id+'&flowList='+flowList
        })
      }else{
        this. toVatDetail(e)
      }
    },
    // 进入详情页
    toVatDetail:function(e){
       var canCheckFlow=this.data.canCheckFlow;
       var id=e.currentTarget.id
       var number=e.currentTarget.dataset.number
        dd.navigateTo({
          url: '../vatDetail/vatDetail?title='+number+'&id='+id
        })
    },
    // 已完成缸长按进入验收修改
    toAcceptantce:function(e){
      var id = e.currentTarget.id
      var chengjianStatus = e.currentTarget.dataset.chengjianStatus
      var number = e.currentTarget.dataset.number
      var roleIdList = dd.getStorageSync({ key: 'userInfo' }).data.roleIdList;
      var isManager = roleIdList.indexOf(1)//只有系统管理员可以修改
      if(isManager==-1)return
      if(chengjianStatus==0){
        dd.navigateTo({
          url: '../acceptance/acceptance?title=' + number + '&id=' + id + '&type=update'
        })
      }else{
        dd.showToast({
          type: 'fail',
          content: "该分缸已成检,数据不可再修改",
          duration: 2000,
          success: () => {

          },
        });
      }
    },
    // 刷新合同列表页
    refreshContract:function(){
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];
      prePage.init()
      prePage.getContractList()//获取合同列表
    },
    // 完成订单
    finishOrder:function(e){
       var _this = this;
      var id=_this.data.id
      var url=app.globalData.servsers+"/dy/orders/completeOrder"
      var method="get"
      var data={
        "orderid": id
      }
        dd.confirm({
        title: '温馨提示',
        content: '是否确认订单完成？',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        success: (result) => {
         if(result.confirm){
            dd.showLoading({
              content: '提交中...'
            });
          DDhttpRequest({url,method,data,
            success(res){
              var data = res.data;
              if(data.code==0){
                dd.showToast({
                  type: 'success',
                  content: "操作成功",
                  duration: 2000,
                  success: () => {
                    _this.getVatList(0)//未完成
                    _this.getVatList(1)//已完成
                    _this.setData({
                      status:1
                    })
                    // _this.refreshContract() 
                    // dd.navigateBack({
                    //   delta:1
                    // }) 
                  },
                });
              }else{
                exceptionHandle(res.data)
              }
            
            }
          })
        }
        },
      });
    },
      // 获取未完成OR已完成缸列表
    getVatList:function(status){
      var _this = this;
      var id=_this.data.id
      var url=app.globalData.servsers+"/dy/orders/dyelist"
      var method="get"
      var data={
        "status": status,//未完成0 已完成1
        "orderid": id,
        "page": 1,
        "limit":9999
      }
      //  dd.showLoading({
      //   content: '加载中...'
      // });
       DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list=data.page.list
            if(status==0){
              _this.unfinishedProcessing(list)//未完成
            }else{
              _this.finishedProcessing(list)//已完成
            }
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    unfinishedProcessing:function(data){
      console.log(data)
      this.setData({
        unfinishList:data
      })
    },
     finishedProcessing:function(data){
      console.log(data)
      this.setData({
        finishList:data
      })
    }
})
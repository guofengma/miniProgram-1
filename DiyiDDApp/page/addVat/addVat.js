import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
       orderId:"",//订单id
       orderNum:"",//订单编号
       dyeNum:"",//印染编号起始值
       clothSelect:[],//坯布选项
       dyeVats:[
        {
            dyeNum:"",//投染编号
            number:"",//缸号
            clothList:[//坯布
                {
                    clothIndex:"",//坯布选项list的下标
                    clothId:"",//坯布id
                    clothInfo:"",//坯布信息
                    clothName:"",//坯布名称
                    batch:"",//坯布批号
                    inventoryStorehostId:"",//库存id
                    clothBolt:"",//匹数
                    colthCount:""//数量
                }
                ]
        }
        ]
    },
    onLoad(options){
      let _this = this;
      _this.init()
       // 修改页面标题
      dd.setNavigationBar({
          title: options.title
      })
      var orderId=options.id
       _this.setData({
          orderId:orderId,
      })
      _this.getDyeNum(orderId)// 获取起始印染编号
      _this.getClothSelect(orderId)// 获取坯布选项
      
    },
    init:function(){
      this.setData({
       orderId:"",//订单id
       orderNum:"",//订单编号
       dyeNum:"",//印染编号起始值
       clothSelect:[],//坯布选项
       dyeVats:[
        {
            dyeNum:"",//投染编号
            number:"",//缸号
            clothList:[//坯布
                {
                    clothIndex:"",//坯布选项list的下标
                    clothId:"",//坯布id
                    clothInfo:"",//坯布信息
                    clothName:"",//坯布名称
                    batch:"",//坯布批号
                    inventoryStorehostId:"",//库存id
                    clothBolt:"",//匹数
                    colthCount:""//数量
                }
                ]
        }
        ]
      })
    },
    // 添加不同批号的坯布
    addCloth:function(e){
      var index=e.currentTarget.dataset.index
      var dyeVats=this.data.dyeVats
      dyeVats[index].clothList.push({})
      this.setData({dyeVats:dyeVats})
    },
    // 删除不同批号的坯布
    delCloth:function(e){
      var dataset=e.currentTarget.dataset
      var index=dataset.index
      var parentIndex=dataset.parentIndex
      var dyeVats=this.data.dyeVats
      var clothSelect=this.data.clothSelect
      console.log(dyeVats)
      // 重新计算可用匹数...
      var cloth=dyeVats[parentIndex].clothList[index]
      console.log(cloth)
      var clothBolt=cloth.clothBolt?cloth.clothBolt:0
      var clothIndex=cloth.clothIndex
      if(clothIndex!==undefined){
         var usableBolt=Number(clothSelect[clothIndex].bolt)+Number(clothBolt)
         clothSelect[clothIndex].bolt=usableBolt
      }else{

      }
      dyeVats[parentIndex].clothList[index]=cloth

      dyeVats[parentIndex].clothList.splice(index,1)
      this.setData({
        dyeVats:dyeVats,
        clothSelect:clothSelect
      })
      // console.log(clothSelect)
      // console.log(dyeVats)
      
    },
    // 添加分缸
    addVat:function(e){
      var dyeVats=this.data.dyeVats
      dyeVats.push({clothList:[{
         clothId:"",//坯布id
         clothBolt:"",//匹数
      }]})
      this.setData({dyeVats:dyeVats})
    },
    // 删除缸
    deleteVat:function(e){
      var dataset=e.currentTarget.dataset
      var index=dataset.index
      var clothSelect=this.data.clothSelect
      var dyeVats=this.data.dyeVats

      dyeVats[index].clothList.forEach(item=>{
        var clothId=item.clothId
        clothSelect.forEach(cItem=>{
          var id=cItem.clothId
          if(id==clothId){
            var clothBolt=item.clothBolt
            var bolt=Number(cItem.bolt)+Number(clothBolt)
            cItem.bolt=bolt
          }
        })
      })
      dyeVats.splice(index,1)
      this.setData({
        dyeVats:dyeVats,
        clothSelect:clothSelect
      })

    },
    // 选择坯布批次
    choseCloth:function(e){
      // console.log(e)
      var dataset=e.currentTarget.dataset
      var index=dataset.index
      var parentIndex=dataset.parentIndex
      var val=e.detail.value
      var clothSelect=this.data.clothSelect
      var dyeVats=this.data.dyeVats
      // console.log(clothSelect)
      // dyeVats[parentIndex].clothList[index]=clothSelect[val]
      dyeVats[parentIndex].clothList[index].clothName=clothSelect[val].clothName
      dyeVats[parentIndex].clothList[index].clothId=clothSelect[val].clothId
      dyeVats[parentIndex].clothList[index].inventoryStorehostId=clothSelect[val].inventoryStorehostId
      dyeVats[parentIndex].clothList[index].clothInfo=clothSelect[val].clothInfo
      dyeVats[parentIndex].clothList[index].batch=clothSelect[val].batch
      
      dyeVats[parentIndex].clothList[index].clothIndex=val//坯布选项list的下标
      
      this.setData({
        dyeVats:dyeVats
      })
      // console.log(this.data.dyeVats)
      // console.log(clothSelect)
    },
    // 输入匹数
    inputBolt:function(e){
      var dataset=e.currentTarget.dataset
      var index=dataset.index
      var parentIndex=dataset.parentIndex
      var dyeVats=this.data.dyeVats
      var clothId=dyeVats[parentIndex].clothList[index].clothId
      if(clothId==""){
         dd.showToast({
            type: 'warn',
            content: '请先选择坯布批次！',
            duration: 2000,
            success: () => {
                   
             },
          });
          return  ""
      }
      
    },
    //关于匹数的计算
    blurBolt:function(e){
      // console.log(this.data.clothSelect)
      var dataset=e.currentTarget.dataset
      var index=dataset.index
      var parentIndex=dataset.parentIndex
      var val=e.detail.value
      var clothSelect=this.data.clothSelect
      var dyeVats=this.data.dyeVats
      var cloth=dyeVats[parentIndex].clothList[index]
      var clothId=cloth.clothId
      console.log(clothSelect)
      if(clothId==""){
        val=""
      }else{
        var clothIndex=cloth.clothIndex
        var weight=clothSelect[clothIndex].weight
        var bolt=clothSelect[clothIndex].bolt
        if(val>bolt)val=bolt.toFixed(2)
        cloth.colthCount=Number(val)*Number(weight)
        cloth.colthCount = cloth.colthCount.toFixed(2)
        var usableBolt=Number(bolt)-Number(val)
        clothSelect[clothIndex].bolt=usableBolt
      }
      cloth.clothBolt=val
      
      dyeVats[parentIndex].clothList[index]=cloth
      this.setData({
         dyeVats:dyeVats,
         clothSelect:clothSelect
      })
      console.log(dyeVats)
    },
    focusBolt:function(e){
      console.log(this.data.clothSelect)
      var dataset=e.currentTarget.dataset
      var index=dataset.index
      var parentIndex=dataset.parentIndex
      var val=e.detail.value
      var clothSelect=this.data.clothSelect
      var dyeVats=this.data.dyeVats
      var cloth=dyeVats[parentIndex].clothList[index]
      // console.log(clothSelect)
      if(val=="")return
      var clothIndex=cloth.clothIndex
      var usableBolt=Number(clothSelect[clothIndex].bolt)+Number(val)
      clothSelect[clothIndex].bolt=usableBolt
     
      
      cloth.clothBolt=""
      dyeVats[parentIndex].clothList[index]=cloth
      this.setData({
         dyeVats:dyeVats,
         clothSelect:clothSelect
      })
      // console.log(clothSelect)
      

    },
    // 获取起始印染编号
    getDyeNum:function(orderId){
      var _this = this;
      var url=app.globalData.servsers+"/dy/orders/dyeNum"
      var method="get"
      var data={
        "orderId": orderId,
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var orderNum=data.order.orderNum//订单编号
            if (data.data){
              var dyeNum = data.data.dyeNum;
              var numArr = dyeNum.split("-");
            }else{
              var numArr = [orderNum,0]
            }
            _this.setData({
              orderNum:numArr[0],
              dyeNum:Number(numArr[1])+1
            })
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 获取坯布选项
    getClothSelect:function(orderId){
      var _this = this;
      var url=app.globalData.servsers+"/dy/orders/queryOrderClothBatch"
      var method="get"
      var data={
        "orderid": orderId
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list=data.list
            list.forEach(item=>{
              var clothInfo=JSON.parse(item.clothInfo) 
              item.clothName=clothInfo.clothName+" "+item.batch

              var bolt=item.bolt
              var num=item.num
              item.weight=(num/bolt).toFixed(2)
            })
            _this.setData({
              clothSelect:list
            })
            console.log(_this.data.clothSelect)
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 提交表单
    saveVat:function(e){
      var _this=this
      console.log(e)
      console.log(_this.data.dyeVats)
      var flag=true
      var msg=""
      var formVal=e.detail.value
      var dyeVats=_this.data.dyeVats
      dyeVats.forEach((item,index)=>{
        item.dyeNum=formVal["dyeNum-"+index]
        item.number=formVal["vatNum-"+index]
        if(item.number==""){
           flag=false
           msg="请输入缸号"
        }
        item.clothList.forEach(cItem=>{
          cItem.clothName=null
          cItem.clothIndex=null
          cItem.colthCount=null
          
          if(cItem.clothId==""){
            flag=false
            msg="请选择坯布批次"
          }else if(cItem.clothBolt==""){
             flag=false
             msg="请输入匹数"
          }
        })
      })
      if(!flag){
        dd.showToast({
            type: 'warn',
            content: msg,
            duration: 2000,
            success: () => {
                   
             },
          });
      }else{
          var orderId=Number(_this.data.orderId)
          var postData={
            orderId:orderId,
            dyeVats:[]
          }
          dyeVats.forEach((item,index)=>{
            postData.dyeVats.push({
              dyeNum:item.dyeNum,
              number:item.number,
              clothList:[]
            })
            item.clothList.forEach((cItem,cIndex)=>{
              postData.dyeVats[index].clothList[cIndex]={
                clothId:cItem.clothId,//坯布id
                clothInfo:cItem.clothInfo,//坯布信息
                batch:cItem.batch,//坯布批号
                inventoryStorehostId:cItem.inventoryStorehostId,//库存id
                clothBolt:Number(cItem.clothBolt),//匹数
              }
            })
          })
         _this.updateData(postData)
      }
      
    },
    updateData:function(data){
      var _this = this;
      var url=app.globalData.servsers+"/dy/orders/addDyeVat"
      var method="post"
       dd.showLoading({
        content: '上传中...'
      });
       DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            dd.showToast({
              type: 'success',
              content: "上传成功",
              duration: 2000,
              success: () => {
                // 刷新上一页数据
                  // var pages = getCurrentPages();
                  // var prePage = pages[pages.length - 2];
                  //  prePage.getVatList(0)//未完成
                  // console.log(pages) 
                // end刷新上一页数据
                dd.navigateBack({
                 delta:1
                })
                   
              },
            });
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    }
})
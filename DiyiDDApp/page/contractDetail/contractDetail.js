import {DDhttpRequest,exceptionHandle} from  '../../util/request';

let app = getApp();

Page({
    data:{
      id:"",//合同id
      detail:"",//合同详情
      contractStatus:"",//合同状态
      contractLog:[],//合同流水
      isEdit:false,//编辑状态
      canEdit:false,//编辑权限
      canPause:false,//开启暂停权限
      personList:[],//人员选择列表
      personnelIndex:"",//点击添加相关人员的index
      personnel:[],//相关人员信息
      predictDate:"",//预计交货时间
      imgSrc:[],//上传的图片list
      message:"",//消息内容
      personnelSelectView:false,//人员选择界面
      personnelIdList:[],//@的相关人员id列表
      personnelNameList:[],//@的相关人员选择
      collapseData: {
        onTitleTap: 'handleTitleTap',
        panels: [
          {
            title: '生产要求',
            content: '',
            expanded: false,
          },
          {
            title: '订货明细',
            content: '',
            gapNumSum:0,
            fabricSum:0,
            expanded: false,
          },
        ],
      },
    },
    onLoad(options){
      console.log(options)
      let _this = this;
      // 修改页面标题
      dd.setNavigationBar({
          title: options.title
      })
      var id=options.id 
      var canEdit=app.isPermission("dy:contract:update")
      var canPause=app.isPermission("dy:contract:pause")
      console.log(canPause)
      _this.setData({
        id:id,
        canEdit:canEdit,
        canPause:canPause,
        title: options.title
      })
      _this.getPersonList()//人员列表
      _this.getContractDetail()// 获取合同详情
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
  // 进入编辑状态
  edit:function(){
    this.setData({
      isEdit:true
    })
  },
  // 修改交货时间
   datePicker(e) {
     var _this=this
     var isEdit=_this.data.isEdit
     if(!isEdit)return
     var predictDate=_this.data.predictDate
    my.datePicker({
      currentDate: predictDate,
      // startDate: '2016-10-9',
      // endDate: '2017-10-9',
      success: res => {
         _this.setData({
            predictDate:res.date
         })
      },
    });
  },
  // 改变index
  changeIndex:function(e){
    var index=e.currentTarget.dataset.index;
    this.setData({personnelIndex:index})
  },
  // 添加相关人员
  chosePerson:function(e){
    var index=e.detail.value
    var personList=this.data.personList;
    var personnel=this.data.personnel;
    var name=personList[index].username
    var id=personList[index].userId
    var flag=true
    var personnelIndex=this.data.personnelIndex
    personnel[personnelIndex].count++
    personnel[personnelIndex].names.forEach(item=>{
      if(item.id==id){
        flag=false
      }
    })
    if(!flag)return
    personnel[personnelIndex].names.push({
      name:name,
      id:id
    })
    this.setData({personnel:personnel})
  },
  // 删除相关人员
  deletePerson:function(e){
    console.log(e)
    var curr=e.currentTarget
    var id=curr.id;
    var isEdit=curr.dataset.isEdit
    if(!isEdit)return
    var name=curr.dataset.name
    var index=curr.dataset.index
    var parentIndex=curr.dataset.parentIndex
    var personnel=this.data.personnel
    var l=personnel[parentIndex].names.length
    if(l<2&&parentIndex<3){
      dd.alert({
        title:"无法删除全部人员",
        buttonText: '确定'
        })
    }else{
       dd.confirm({
        title: '温馨提示',
        content: '是否删除“'+name+'”？',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        success: (result) => {
          console.log(result)
          if(result.confirm){
          personnel[parentIndex].names.splice(index,1)
          personnel[parentIndex].count--
          this.setData({personnel:personnel})
          }
        },
      });
    }
  },
  // 保存交货时间和相关人员
  savePersonnel:function(){
    var _this=this
    var predictDate=_this.data.predictDate
    var contractId=_this.data.id
    var personnel=_this.data.personnel
    personnel.forEach(item=>{
      item.idList=[]
      item.names.forEach(subItem=>{
        item.idList.push(subItem.id)
      })
    })
    console.log(personnel)
    var url=app.globalData.servsers+"/dy/contract/updatePeople"
    var method="post"
    var data={
      "contractId":contractId,
      "predictDate":predictDate,
      "salers":personnel[0].idList,
      "lidans": personnel[1].idList,
      "gendans":personnel[2].idList,
      "focus":personnel[3].idList
    }
    dd.showLoading({
      content: '保存中...'
    });
     DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            dd.alert({
              title:"保存成功",
              buttonText: '确定',
              success: () => {
                _this.setData({isEdit:false})
             },
            })
          //   dd.showToast({
          //   type: 'success',
          //   content: '保存成功',
          //   duration: 3000,
          //   success: () => {
          //       _this.setData({isEdit:false})
          //    },
          // });
          }else{
            exceptionHandle(res.data)
          }
        }
      })

  },
  // 暂停OR开启合同
  stopContract:function(e){
      let _this = this;
      var contractStatus=_this.data.contractStatus
      var method="get"
      var contractId=_this.data.id
      var data={
          contractId:contractId
      }
    var type = contractStatus == 3 ? "open" :"pause"
    var msg = contractStatus == 3 ? "合同已开启" : "合同已暂停"
    

    var url = app.globalData.servsers + "/dy/contract/" + type
    dd.showLoading({
      content: '加载中...'
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          dd.alert({
            title: msg,
            buttonText: '确定',
            success: () => {
              _this.getContractDetail()
              _this.setData({ 
                isEdit: false,

               })
            },
          })
        } else {
          exceptionHandle(res.data)
        }

      }
    })
     
  },
  

  // 选择图片
  choseImg:function(){
    var _this=this
    app.choseImg(_this)
    console.log(_this.data.imgSrc)
   
  },
  // 预览图片
  previewImage:function(e){
    var dataset=e.currentTarget.dataset
    var index=dataset.index
    var type=dataset.type
    if(type==1){
      var imgSrc=this.data.imgSrc
    }else{
      var imgSrc=dataset.list
    }
    dd.previewImage({
      current: index,
      urls: imgSrc,
    });
  },
  // 删除图片
  deleteImage:function(e){
    console.log(e)
    var index=e.currentTarget.dataset.index
    var imgSrc=this.data.imgSrc
    imgSrc.splice(index,1)
    this.setData({
      imgSrc:imgSrc
    })
  },
  // 输入消息内容
  messageInput:function(e){
    console.log(e)
    var val=e.detail.value
    var l=val.length
    var key=val.slice(l-1,l)//最后一个字符
    var flag=false
    if(key=="@"){
     flag=true
      dd.hideKeyboard();
    }
    this.setData({
      message:val,
      personnelSelectView:flag
    })
  },
  // 添加@的人员
  addPersonnel:function(e){
    console.log(e)
    var id=e.currentTarget.id
    var name=e.currentTarget.dataset.name
    var message=this.data.message
    message = " " + message + name + "，"
    
    var mArr = message.split("，")
    var pArr=[]
    mArr.forEach((item,index)=>{
      if(item.indexOf("@")>-1){
        pArr.push(item.split("@")[1])
      }
    })
    this.setData({
      message:message,
      personnelSelectView:false,
      pArr: pArr
    })
  },
  // 发送消息
  sendMessage:function(){
    var _this = this;
    var imgSrc=_this.data.imgSrc
    var message=_this.data.message
    var personnelNameList=_this.data.personnelNameList
    var pArr = _this.data.pArr
    
    var id = _this.data.id
    var title = _this.data.title
    var url = app.globalData.servsers + "/ruiz/dd/sendMsg"
    var method = "post"
    var personnelIdList=[]
    personnelNameList.forEach(item=>{
      pArr.forEach(pItem=>{
        if (pItem == item.realName){
          personnelIdList=personnelIdList.concat(item.userId)
        }
      })
    })
    personnelIdList = app.distinct(personnelIdList)

    var data = {
      "userIds": personnelIdList,
      "remarks": message,
      "imgList": imgSrc,
      "title": title,
      "contractId": id
    }
    console.log(imgSrc, message, pArr, personnelIdList)
    dd.showLoading({
      content: '发送中...',
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        dd.hideLoading()
        var data = res.data;
        if (data.code == 0) {
          _this.getContractDetail(data)
          _this.setData({
            message:"",
            imgSrc:[],
            personnelIdList:[]
          })
        } else {
          exceptionHandle(res.data)
        }

      }
    })

  },
    // 获取合同详情
    getContractDetail:function(){
      let _this = this;
      var id=_this.data.id
      var url=app.globalData.servsers+"/dy/contract/info/"+id
      var method="get"
      var data={}
       dd.showLoading({
        content: '加载中...'
      });
       DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            _this.dataProcessing(data)
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 合同详情数据处理
    dataProcessing:function(data){
       // @选择相关人员
      var personnelNameList=data.users
      var personnelIdList=[]
      personnelNameList.forEach(item=>{
        personnelIdList.push(item.userId)
      })
       personnelNameList.unshift({
        realName:"所有人",
        userId: personnelIdList
      })
      // @ end选择相关人员
      var data=data.entity;
      // 合同信息数据
      var collapseData=this.data.collapseData;
      data.transportRemark = data.transportRemark ? data.transportRemark:"/"
      data.packRemark = data.packRemark ? data.packRemark : "/"
      data.dyeRemark = data.dyeRemark ? data.dyeRemark : "/"
      data.especiallyRemark = data.especiallyRemark ? data.especiallyRemark : "/"
      collapseData.panels[0].content={
        transportRemark:"运输要求："+data.transportRemark,
        packRemark:"包装要求："+data.packRemark,
        dyeRemark:"印染要求："+data.dyeRemark,
        especiallyRemark:"特殊要求："+data.especiallyRemark
      }
      data.fabricList.forEach(item=>{
        var estimateProduction=item.estimateProduction//订单预计生产量
        var inventoryNum=item.inventoryNum//库存锁定量
        var fabricCount=item.fabricCount//面料需求量（采购量）
        // <!-- 缺口数量=面料需求量-订单预计生产量-仓库锁定量 -->
        item.gapNum=fabricCount-inventoryNum-estimateProduction
        item.gapNum = item.gapNum > 0?item.gapNum:0
        collapseData.panels[1].gapNumSum+= item.gapNum//缺口总量
        collapseData.panels[1].fabricSum+=item.fabricCount//采购总量
      })
      
      collapseData.panels[1].content=data.fabricList
      // end合同信息数据
      // 交货时间
      var contractStatus=data.contractStatus//合同状态 3暂停
      var predictDate=data.predictDate.slice(0,10)
      if(contractStatus==3){
        var pauseDate=new Date(data.pauseDate.slice(0,10))
        var nowDate=new Date()
        var diff=nowDate-pauseDate
        diff=Math.floor(diff/24/3600/1000)
        console.log(diff)
        predictDate=(new Date(predictDate)).getTime()+diff*24*3600*1000
        predictDate=new Date(predictDate)
        predictDate=app.dateFormat(predictDate).slice(0,10)
      }
      // end交货时间
      // 相关人员
      var salersList=this.handlePersonnel(data.salerNames,data.salers)
      var lidansList=this.handlePersonnel(data.lidanNames,data.lidans)
      var gendansList=this.handlePersonnel(data.gendanNames,data.gendans)
      var focusList=this.handlePersonnel(data.focusNames,data.focus)
      var personnel=[
        {
          label:"销",
          names:salersList,
          count:salersList.length
        },
        {
          label:"理",
          names:lidansList,
          count:lidansList.length
        },
        {
          label:"跟",
          names:gendansList,
          count:gendansList.length
        },
        {
          label:"关",
          names:focusList,
          count:focusList.length
        }
      ]
      console.log(personnel)
      // end相关人员
      // 合同流水
      var logList = data.logList
      logList.forEach(item=>{
        var userIds = item.userIds
        var readNum = item.readNum
        if (userIds){
          userIds = userIds.split(",")
          var atNum=userIds.length
          if (readNum == atNum){
            item.readStr="（已读）"
            item.readStatus = "grey"
          }else{
            item.readStr = "未读（"+readNum+"/"+atNum+"）"
            item.readStatus = "blue"
          }
        }
        var details = item.details
        // console.log(details)
        item.titleStr=""
        if(details){
          details=JSON.parse(details)
          item.titleStr = details.checkType == 1 ? "" : "red"
          item.titleStr = details.ishuixiu == 1 ? "red" : item.titleStr
          // console.log(item)
          
        }
      })
      //end 合同流水

     
      
      this.setData({
        // detail:data,
        predictDate:predictDate,
        personnel:personnel,
        collapseData:collapseData,
        contractStatus:contractStatus,
        personnelNameList:personnelNameList,
        contractLog: logList
      })
      this.toRead()//已读消息
      dd.hideLoading();
    },
    // 相关人员数据处理
    handlePersonnel:function(names,ids){
      names=names?names.split(","):[]
      ids=ids?ids.split(","):0
      var list=[]
      names.forEach((item,index)=>{
        list.push({
          name:item,
          id:ids[index]
        })
      })
      return list
    },
  // 设置已读
  toRead: function() {
    let _this = this;
    var id = _this.data.id
    var url = app.globalData.servsers + "/ruiz/dd/toRead"
    var method = "get"
    var data = {
      contractId:id
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          // _this.dataProcessing(data)
        } else {
          exceptionHandle(res.data)
        }

      }
    })
  },
    // 获取人员列表
    getPersonList:function(){
      var _this=this
      var url=app.globalData.servsers+"/sys/user/select"
      var method="get"
      var data={}
        DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            console.log(data)
            var list=[]
            data.list.forEach(item=>{
              list.push({
                userId:item.userId,
                username:item.realName
              })
            })
            _this.setData({
              personList:list
            })
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    }
})
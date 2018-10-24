import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
        navbar: ['面料入库', '坯布入库'],
        currentTab: 0,
        typeSelect:[{name:"针织布",value:"1"},{name:"梭织布",value:"2"}],//面料分类选项
        fabricSelect:[],//面料编号选项
        clothSelect:[],//坯布编号选项
        specSelect:[],//规格选项
        colorSelect:[],//颜色选项
        peopleSelect:[],//人员选项
        reasonSelect:[],//原因选项
        warehouseSelect:[],//仓库选项
        detailList:[],//入库明细
        imgSrc:[],//图片
        saveType:0,//入库类型  0--直接入库  1--成检入库
        fabricForm:{
          type:"1",
          typeName:"针织布",
          fabricId:"",
          color:"",
          spec:"",
          peopleId:"",
          reasonId:""
        },
        clothForm:{
          clothId:"",
          spec:"",
          peopleId:"",
          reasonId:""
        },
        
    },
    onLoad(){
      var _this = this;
      _this.init()
      _this.getFabricSelect() // 获取面料编号选项
      _this.getClothSelect()//坯布编号
      
      _this.getPeopleSelect()//人员选项
      _this.getReasonSelect()//原因选项
      _this.getWarehouseSelect()//仓库选项
    },
    init:function(){
      this.setData({
        navbar: ['面料入库', '坯布入库'],
        currentTab: 0,
        typeSelect: [{ name: "针织布", value: "1" }, { name: "梭织布", value: "2" }],//面料分类选项
        //fabricSelect: [],//面料编号选项
        //clothSelect: [],//坯布编号选项
        specSelect: [],//规格选项
        colorSelect: [],//颜色选项
        //peopleSelect: [],//人员选项
        //reasonSelect: [],//原因选项
        //warehouseSelect: [],//仓库选项
        detailList: [],//入库明细
        imgSrc: [],//图片
        saveType: 0,//入库类型  0--直接入库  1--成检入库
        fabricForm: {
          type: "1",
          typeName: "针织布",
          fabricId: "",
          color: "",
          spec: "",
          peopleId: "",
          reasonId: ""
        },
        clothForm: {
          clothId: "",
          spec: "",
          peopleId: "",
          reasonId: ""
        },
      })
    },
    clear:function(){
      var fabricForm=this.data.fabricForm
      fabricForm.fabricNum=""
      fabricForm.fabricName=""
      fabricForm.fabricId=""
      this.setData({
        fabricForm:fabricForm,
        detailList:[]
      })
    },
    // 标签页切换
    navbarTap: function (e) {
      this.setData({
        currentTab: e.currentTarget.dataset.idx,
        detailList: []
      })
    },
    // 选择面料分类
    choseType:function(e){
      var _this=this
      var index=e.detail.value
      var typeSelect=_this.data.typeSelect
      var fabricForm=_this.data.fabricForm
      
      fabricForm.typeName=typeSelect[index].name
      fabricForm.type=typeSelect[index].value
      _this.clear()
      _this.setData({
        fabricForm:fabricForm
      })

       _this.getFabricSelect() // 获取面料编号选项
       _this.getSpecSelect()//规格选项
    },
    // 选择面料编号
    choseFabric:function(e){
      var _this=this
      var index=e.detail.value
      var fabricSelect=_this.data.fabricSelect
      var fabricForm=_this.data.fabricForm
      
      fabricForm.fabricNum=fabricSelect[index].fabricNum
      fabricForm.fabricName=fabricSelect[index].fabricName
      fabricForm.fabricId=fabricSelect[index].id
      _this.setData({
        fabricForm:fabricForm
      })
      _this.getSpecSelect()//规格选项
      _this.getColorSelect()//颜色选项
    },
    // 选择坯布编号
    choseCloth:function(e){
      var _this=this
      var index=e.detail.value
      var clothSelect=_this.data.clothSelect
      var clothForm=_this.data.clothForm
      
      clothForm.clothNum=clothSelect[index].clothNum
      clothForm.clothName=clothSelect[index].clothName
      clothForm.clothId=clothSelect[index].id
      clothForm.spec=clothSelect[index].clothSpec
      
      _this.setData({
        clothForm:clothForm
      })
    },
  //  选择规格/颜色/交接人/原因
    chose:function(e){
      console.log(e)
      var dataset=e.currentTarget.dataset
      var name=dataset.name
      var form=dataset.form
      var _this=this
      var index=e.detail.value
      var fabricForm=_this.data.fabricForm
      var clothForm=_this.data.clothForm
      var select=_this.data[name+"Select"]
      if(form=="fabricForm"){
         fabricForm[name]=select[index][name]
         fabricForm[name+"Id"]=select[index].id
      }else{
         clothForm[name]=select[index][name]
         clothForm[name+"Id"]=select[index].id
      }
      _this.setData({
        fabricForm:fabricForm,
        clothForm:clothForm
      })
    },
    // 添加入库信息
    addInfo:function(){
      var detailList=this.data.detailList
      detailList.push({
        warehouseId:"",
        shelvesId:"",
        bolt:"",
        num:"",
        batch:"",
      })
       this.setData({
        detailList:detailList
      })
    },
    // 删除入库信息
    deleteInfo:function(e){
      var detailList=this.data.detailList
      var index=e.currentTarget.dataset.index
      detailList.splice(index,1)
       this.setData({
        detailList:detailList
      })

    },
    // 选择仓库
    choseWarehouse:function(e){
      var _this=this
      var index=e.detail.value
      var detailListIndex=e.currentTarget.dataset.idx
      var warehouseSelect=_this.data.warehouseSelect
      var detailList=_this.data.detailList
      detailList[detailListIndex].warehouseId=warehouseSelect[index].id
      detailList[detailListIndex].warehouse=warehouseSelect[index].storeName
       detailList[detailListIndex].shelvesId=""
      detailList[detailListIndex].shelvesName=""
      _this.setData({
        detailList:detailList
      })
      _this.getShelvesSelect(detailListIndex)
    },
    // 选择货架（位置）
    choseShelves:function(e){
      var _this=this
      var index=e.detail.value
      var detailListIndex=e.currentTarget.dataset.idx
      var detailList=_this.data.detailList
      var shelvesSelect=detailList[detailListIndex].shelvesSelect
      
      detailList[detailListIndex].shelvesId=shelvesSelect[index].id
      detailList[detailListIndex].shelvesName=shelvesSelect[index].shelvesName
      _this.setData({
        detailList:detailList
      })
    },
    //输入框写入仓库信息
    setInputValue:function(e){
      var _this=this
      var val=e.detail.value
      var detailListIndex=e.currentTarget.dataset.idx
      var name=e.currentTarget.dataset.name
      
      var detailList=_this.data.detailList
      detailList[detailListIndex][name]=val
       _this.setData({
        detailList:detailList
      })
      console.log(detailList)
    },
    // 选择图片
    choseImg:function(){
      var _this=this
      app.choseImg(_this)
    },
    // 预览图片
    previewImage:function(e){
      var dataset=e.currentTarget.dataset
      var index=dataset.index
      var type=dataset.type
      var imgSrc=this.data.imgSrc
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
    changeSaveType:function(e){
      var type=e.currentTarget.dataset.type;
      this.setData({
        saveType:type
      })

    },
    // 确认入库（提交表单）
    saveForm:function(e){
      var _this=this
      var currentTab=_this.data.currentTab
      var detailList=_this.data.detailList
      var imgSrc=_this.data.imgSrc
      var value=e.detail.value
      if(currentTab==0){
        var formData=_this.data.fabricForm
      }else{
        var formData=_this.data.clothForm
      }
      var flag=true
      var msg=""
      console.log(e)
      console.log(formData)
      console.log(detailList)
      if(formData.fabricId==""){
        flag=false
        msg="请选择面料编号"
      }else if(formData.clothId==""){
        flag=false
        msg="请选择坯布编号"
      }else if(formData.spec==""){
        flag=false
        msg="请输入规格"
      }else if(formData.spec=="手动输入"&&value.spec==""){
        flag=false
        msg="请输入规格"
      }else if(formData.color==""){
        flag=false
        msg="请输入颜色"
      }else if(formData.color=="手动输入"&&value.color==""){
        flag=false
        msg="请输入颜色"
      }else if(formData.peopleId==""){
        flag=false
        msg="请选择入库交接人"
      }else if(formData.reasonId==""){
        flag=false
        msg="请选择入库原因"
      }else if(detailList.length<1){
        flag=false
        msg="请添加入库信息"
      }else{
        detailList.forEach(item => {
          if (item.warehouseId == "") {
            flag = false
            msg = "请选择入库仓库"
          } else if (item.shelvesId == "") {
            flag = false
            msg = "请选择入库位置"
          } else if (item.bolt == "") {
            flag = false
            msg = "请输入入库匹数"
          } else if (item.num == "") {
            flag = false
            msg = "请输入入库数量"
          } else if (item.batch == "") {
            flag = false
            msg = "请输入入库批次"
          }
        })
      }
     

      if(!flag){
         dd.showToast({
            type: 'warn',
            content: msg,
            duration: 2000,
            success: () => {
                   
             },
          });
      }else{
        if(formData.color=="手动输入"){
          formData.color=value.color
        }
        if(formData.spec=="手动输入"){
          formData.spec=value.spec
        }
        var infoList=[]
        detailList.forEach(item=>{
          infoList.push({
             "storehostId": item.warehouseId,
              "shelvesId": item.shelvesId,
              "bolt": item.bolt,
              "num": item.num,
              "batch": item.batch
          })
        })
        _this.postData(formData,infoList,imgSrc)
      }
    },
    // 上传数据
    postData(formData,infoList,imgSrc){
      var _this = this;
      var detailList=_this.data.detailList
      var currentTab=_this.data.currentTab
      var url=app.globalData.servsers+"/dy/warehouse/in"
      var method="post"
      var type=currentTab==0?formData.type:"3"
      var fabricId=currentTab==0?formData.fabricId:formData.clothId
      var saveType = Number(_this.data.saveType)
      var data={
        "isCheck": saveType,//入库类型  0--直接入库  1--成检入库
        "type": type,//类型 1.针织 2.梭织 3.坯布
        "fabricId": fabricId,
        "spec": formData.spec,
        "color": formData.color,
        "shelves": infoList,
        "reasonId":formData.reasonId,
        "updateBy": formData.peopleId,
        "remarks": "",
        "accessory": imgSrc
      }
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
                dd.setStorageSync({
                  key: 'warehouseInfo',
                  data: {
                    title: '入库',
                    type:currentTab,
                    formData: formData,
                    detailList: detailList,
                    saveType: saveType
                  }
                });
                dd.navigateTo({
                  url: '../success/success'
                })
              },
            });
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 获取面料编号选项
    getFabricSelect:function(){
      var _this=this
      var fabricForm=_this.data.fabricForm
      var fabricType=fabricForm.type
      var url=app.globalData.servsers+"/dy/fabric/select" 
      var method="get"
      var data={
        "fabricType": fabricType//1-针织布，2-梭织布
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.forEach(item=>{
              item.fabricInfo=item.fabricNum + " " + item.fabricName
            })
            _this.setData({
              fabricSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
    // 获取坯布编号选项
    getClothSelect:function(){
      var _this=this
      var fabricForm=_this.data.fabricForm
      var fabricType=fabricForm.type
      var url=app.globalData.servsers+"/dy/cloth/select" 
      var method="get"
      var data={}
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.forEach(item => {
              item.clothInfo = item.clothNum + " " + item.clothName
            })
            _this.setData({
              clothSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
    // 获取规格选项
    getSpecSelect:function(){
      var _this=this
      var fabricForm=_this.data.fabricForm
      var fabricType=fabricForm.type
      var url = app.globalData.servsers +"/dy/warehouse/selectSpec" 
      var method="get"
      var data={
        "type": fabricType,//1-针织布，2-梭织布
        fabricId: fabricForm.fabricId
        
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.push({spec:"手动输入"})
            _this.setData({
              specSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
    // 获取颜色选项
    getColorSelect:function(){
      var _this=this
      var fabricForm=_this.data.fabricForm
      var fabricType=fabricForm.type
      var url = app.globalData.servsers +"/dy/warehouse/selectColor" 
      var method="get"
      var data={
        "type": fabricType,//1-针织布，2-梭织布
        fabricId: fabricForm.fabricId
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.push({color:"手动输入"})
            _this.setData({
              colorSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
    // 获取入库交接人选项
    getPeopleSelect:function(){
      var _this=this
      var fabricForm=_this.data.fabricForm
      var url=app.globalData.servsers+"/sys/user/select" 
      var method="get"
      var data={}
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.forEach(item=>{
              item.people=item.realName
              item.id=item.userId
            })
            _this.setData({
              peopleSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
    // 获取入库原因选项
    getReasonSelect:function(){
      var _this=this
      var fabricForm=_this.data.fabricForm
      var url=app.globalData.servsers+"/dy/reason/select" 
      var method="get"
      var data={
        "reasontype":2  //入库2 出库1
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            list.forEach(item=>{
              item.reason=item.reasonName
            })
            _this.setData({
              reasonSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
     // 获取入库仓库选项
    getWarehouseSelect:function(){
      var _this=this
      var currentTab=_this.data.currentTab
      var storeType=currentTab?"2,3":"1,3"
      var url=app.globalData.servsers+"/dy/storehost/select" 
      var method="get"
      var data={
         "storeType": storeType //storeType:1-面料仓库，2-坯布仓库，3-面料仓库、坯布仓库，0-所有仓库
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
           
            _this.setData({
              warehouseSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
     // 获取入库货架选项
    getShelvesSelect:function(index){
      var _this=this
      var detailList=_this.data.detailList
      var warehouseId=detailList[index].warehouseId//仓库id
      var url=app.globalData.servsers+"/dy/shelves/select" 
      var method="get"
      var data={
        "storeid":warehouseId
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            detailList[index].shelvesSelect=list
            _this.setData({
              detailList:detailList
            })
            console.log(detailList)
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },

})
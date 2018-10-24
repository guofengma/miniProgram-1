import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
        navbar: ['面料出库', '坯布出库'],
        currentTab: 0,
        typeSelect:[{name:"针织布",value:"1"},{name:"梭织布",value:"2"}],//面料分类选项
        fabricSelect:[],//面料编号选项
        clothSelect:[],//坯布编号选项
        specSelect:[],//规格选项
        colorSelect:[],//颜色选项
        peopleSelect:[],//人员选项
        reasonSelect:[],//原因选项
        warehouseSelect:[],//仓库选项
        detailList:[],//出库明细
        imgSrc:[],//图片
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
      //_this.getSpecSelect()//规格选项
      //_this.getColorSelect()//颜色选项
      _this.getPeopleSelect()//人员选项
      _this.getReasonSelect()//原因选项
     // _this.getWarehouseSelect()//仓库选项
    },
    init:function(){
      this.setData({
        navbar: ['面料出库', '坯布出库'],
        currentTab: 0,
        typeSelect: [{ name: "针织布", value: "1" }, { name: "梭织布", value: "2" }],//面料分类选项
       // fabricSelect: [],//面料编号选项
        //clothSelect: [],//坯布编号选项
        specSelect: [],//规格选项
        colorSelect: [],//颜色选项
        //peopleSelect: [],//人员选项
        //reasonSelect: [],//原因选项
        warehouseSelect: [],//仓库选项
        detailList: [],//出库明细
        imgSrc: [],//图片
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
      this.getFabricSelect() // 获取面料编号选项
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
        fabricForm:fabricForm,
        
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
      fabricForm.spec = ""
      fabricForm.color = ""
      _this.setData({
        fabricForm:fabricForm,
        detailList: []
      })
      _this.getSpecSelect()
      
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
        clothForm:clothForm,
        detailList: [{
          warehouseId: "",
          shelvesId: "",
          bolt: "",
          num: "",
          batch: "",
          boltOut: "",
          numOut: "",
        }]
      })
      _this.getWarehouseSelect()
    },
     // 选择规格
    choseSpec:function(e){
      var _this=this
      var index=e.detail.value
      var specSelect=_this.data.specSelect
      var fabricForm=_this.data.fabricForm
      fabricForm.spec=specSelect[index].spec
      fabricForm.color = ""
      
      _this.setData({
        fabricForm:fabricForm,
        detailList:[]
      })
      _this.getColorSelect()
    },
    // 选择颜色
    choseColor: function(e) {
      var _this = this
      var index = e.detail.value
      var colorSelect = _this.data.colorSelect
      var fabricForm = _this.data.fabricForm
      fabricForm.color = colorSelect[index].color
      fabricForm.inventoryId = colorSelect[index].id
      
      _this.setData({
        fabricForm: fabricForm,
        detailList: [{
          warehouseId: "",
          shelvesId: "",
          bolt: "",
          num: "",
          batch: "",
          boltOut: "",
          numOut: "",
        }]
        
      })
      _this.getWarehouseSelect()
    },

  //  选择/交接人/原因
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
    // 添加出库信息
    addInfo:function(){
      var detailList=this.data.detailList
      var currentTab=this.data.currentTab
      var formData=currentTab?this.data.clothForm:this.data.fabricForm
      var flag=true;
      var msg=""
      if(formData.fabricId==""){
        msg="请先选择面料编号"
        flag=false
      } else if (formData.clothId == "") {
        msg = "请先选择坯布编号"
        flag = false
      } else if (formData.spec == "") {
        msg = "请先选择规格"
        flag = false
      } else if (formData.color == "") {
        msg = "请先选择颜色"
        flag = false
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
        detailList.push({
          warehouseId: "",
          shelvesId: "",
          bolt: "",
          num: "",
          batch: "",
          boltOut: "",
          numOut: "",
        })
        this.setData({
          detailList: detailList
        })
      }
     
    },
    // 删除出库信息
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
      _this.getBatchSelect(detailListIndex)
    },
    // 选择批次
    choseBatch:function(e){
      var _this = this
      var index = e.detail.value
      var detailListIndex = e.currentTarget.dataset.idx
      var detailList = _this.data.detailList
      var batchSelect = detailList[detailListIndex].batchSelect

      detailList[detailListIndex].batch = batchSelect[index].batch
      detailList[detailListIndex].bolt= batchSelect[index].bolt
      detailList[detailListIndex].lockBolt = batchSelect[index].lockBolt
      detailList[detailListIndex].num = batchSelect[index].num
      detailList[detailListIndex].lockNum = batchSelect[index].lockNum
      detailList[detailListIndex].id = batchSelect[index].id
      _this.setData({
        detailList: detailList
      })
    },
    //输入框写入仓库信息
    setInputValue:function(e){
      var _this=this
      var val=e.detail.value
      var dataset = e.currentTarget.dataset
      var detailListIndex=dataset.idx
      var name=dataset.name
      var limit=dataset.limit
      var detailList = _this.data.detailList
      
      var batch = detailList[detailListIndex].batch
      if(batch==""){
        val=""
        dd.showToast({
          type: 'warn',
          content: "请先选择批次",
          duration: 2000,
          success: () => {

          },
        });
      }
      if(val>limit){
        val=limit
        dd.showToast({
          type: 'warn',
          content: "超出库存量",
          duration: 2000,
          success: () => {

          },
        });
      }
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
    // 确认出库（提交表单）
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
        msg="请选择规格"
      }else if(formData.color==""){
        flag=false
        msg="请选择颜色"
      }else if(formData.peopleId==""){
        flag=false
        msg="请选择出库交接人"
      }else if(formData.reasonId==""){
        flag=false
        msg="请选择出库原因"
      }else if(detailList.length<1){
        flag=false
        msg="请添加出库信息"
      }else{
        detailList.forEach(item => {
          if (item.warehouseId == "") {
            flag = false
            msg = "请选择出库仓库"
          } else if (item.shelvesId == "") {
            flag = false
            msg = "请选择出库位置"
          } else if (item.batch == "") {
            flag = false
            msg = "请选择出库批次"
          } else if (item.boltOut == "") {
            flag = false
            msg = "请输入出库匹数"
          } else if (item.numOut == "") {
            flag = false
            msg = "请输入出库数量"
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
              "warehouseId":item.id,
              "bolt": item.boltOut,
              "num": item.numOut,
              "batch": item.batch
          })
        })
        _this.setData({
          detailList: detailList
        })
        _this.postData(formData,infoList,imgSrc)
      }
    },
    // 上传数据
    postData(formData,infoList,imgSrc){
      var _this = this;
      var detailList=_this.data.detailList
      var currentTab=_this.data.currentTab
      var url=app.globalData.servsers+"//dy/warehouse/out"
      var method="post"
      var type=currentTab==0?formData.type:"3"
      var fabricId=currentTab==0?formData.fabricId:formData.clothId
      var data={
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
                    title: '出库',
                    type:currentTab,
                    formData: formData,
                    detailList: infoList,
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
    // 获取面料编号选项,坯布编号选项
    getFabricSelect:function(){
      var _this=this
      var currentTab=_this.data.currentTab
      var fabricForm=_this.data.fabricForm
      var fabricType=fabricForm.type
      var type=currentTab==0?fabricType:"3"//1--针织，2--梭织，3--坯布
      var url=app.globalData.servsers+"/dy/warehouse/selectFabric" 
      var method="get"
      var data={
        "type": type//1-针织布，2-梭织布，3--坯布
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            var select=[]
            list.forEach(item=>{
              select.push(item.fabric)
            })
            if(currentTab==0){
              select.forEach(item => {
                item.fabricInfo = item.fabricNum + " " + item.fabricName
              })
              _this.setData({
                fabricSelect:select
              })
            }else{
              select.forEach(item => {
                item.clothInfo = item.clothNum + " " + item.clothName
              })
              _this.setData({
                clothSelect:select
              })
            }
            
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
      var fabricId=fabricForm.fabricId
      var url=app.globalData.servsers+"/dy/warehouse/selectSpec" 
      var method="get"
      var data={
        type: fabricType,//1-针织布，2-梭织布
        fabricId:fabricId
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            if(list.length==1){
              fabricForm.spec = list[0].spec
              _this.getColorSelect()
            }
            _this.setData({
              specSelect:list,
              fabricForm: fabricForm
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
      var fabricId=fabricForm.fabricId
      var url=app.globalData.servsers+"/dy/warehouse/selectColor" 
      var method="get"
      var data={
        type: fabricType,//1-针织布，2-梭织布
        fabricId:fabricId,
        spec: fabricForm.spec
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            if (list.length == 1) {
              fabricForm.color = list[0].color
              fabricForm.inventoryId=list[0].id//库存id
              _this.setData({
                detailList: [{
                  warehouseId: "",
                  shelvesId: "",
                  bolt: "",
                  num: "",
                  batch: "",
                }]
              })
              _this.getWarehouseSelect()
            }
            _this.setData({
              colorSelect:list,
              fabricForm: fabricForm
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
    // 获取出库交接人选项
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
    // 获取出库原因选项
    getReasonSelect:function(){
      var _this=this
      var fabricForm=_this.data.fabricForm
      var url=app.globalData.servsers+"/dy/reason/select" 
      var method="get"
      var data={
        "reasontype": 1  ////入库2 出库1
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
     // 获取出库仓库选项
    getWarehouseSelect:function(){
      var _this=this
      var currentTab=_this.data.currentTab
      var formData = currentTab?_this.data.clothForm:_this.data.fabricForm
      var type = currentTab ? "3" : formData.type
      var detailList = _this.data.detailList
      var url = app.globalData.servsers +"/dy/warehouse/selectStorehost" 
      var method="get"
      var data={
        type:type,
        fabricId: formData.fabricId||formData.clothId,
        spec:formData.spec,
        color: formData.color
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            if (list.length == 1) {
              detailList[0].warehouseId = list[0].storehost.id
              detailList[0].warehouse = list[0].storehost.storeName
              _this.getShelvesSelect(0)
            }
            var warehouseList=[]
            list.forEach(item=>{
              warehouseList.push(item.storehost)
            })
            _this.setData({
              warehouseSelect: warehouseList,
              detailList: detailList
            })
            console.log(detailList)
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
     // 获取出库位置（货架）选项
    getShelvesSelect:function(index){
      var _this=this
      var currentTab = _this.data.currentTab
      var formData = currentTab ? _this.data.clothForm : _this.data.fabricForm
      var type = currentTab ? "3" : formData.type
      var detailList=_this.data.detailList
      var warehouseId=detailList[index].warehouseId//仓库id
      var url = app.globalData.servsers +"/dy/warehouse/selectShelves" 
      var method="get"
      var data={
        type: type,
        fabricId: formData.fabricId || formData.clothId,
        spec: formData.spec,
        color: formData.color,
        storehostId: warehouseId
      }
      DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = data.list
            if (list.length == 1) {
              detailList[0].shelvesId = list[0].shelves.id
              detailList[0].shelvesName = list[0].shelves.shelvesName
              _this.getBatchSelect(0)
            }
            var shelvesSelect=[]
            list.forEach(item=>{
              shelvesSelect.push(item.shelves)
            })
            detailList[index].shelvesSelect = shelvesSelect
            _this.setData({
              detailList:detailList
            })
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
  // 获取出库批次选项
  getBatchSelect: function(index) {
    var _this = this
    var currentTab = _this.data.currentTab
    var formData = currentTab ? _this.data.clothForm : _this.data.fabricForm
    var type = currentTab ? "3" : formData.type
    var detailList = _this.data.detailList
    var warehouseId = detailList[index].warehouseId//仓库id
    var shelvesId = detailList[index].shelvesId//货架id
    var url = app.globalData.servsers + "/dy/warehouse/selectBatch"
    var method = "get"
    var data = {
      type: type,
      fabricId: formData.fabricId || formData.clothId,
      spec: formData.spec,
      color: formData.color,
      storehostId: warehouseId,
      shelvesId: shelvesId
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          if (list.length == 1) {
            detailList[0].batch = list[0].batch
            detailList[0].id = list[0].id
            detailList[0].bolt = list[0].bolt
            detailList[0].lockBolt = list[0].lockBolt
            detailList[0].num = list[0].num
            detailList[0].lockNum = list[0].lockNum
            detailList[0].numOut = ""
            detailList[0].boltOut = ""
            
          }
          detailList[index].batchSelect = list
          _this.setData({
            detailList: detailList
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },

})
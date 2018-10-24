
import { DDhttpRequest, exceptionHandle } from '../../util/request';
let app = getApp();

Page({
  data: {
    checkInfo:"",//入库信息
    warehouseSelect:[],//仓库选项
    shelvesSelect:[],//货架选项
    storeName:"",//仓库名
    storehostId: "",//仓库id 
    shelvesName: "",//货架名
    shelvesId: "",//货架id 
    batch:"",//批次
    fabricOqaId:"",//id 
    fabricName:"",//面料品名
    spec: "",//规格
    color: "",//颜色
    unit:"千克",//单位
    modalShow:false,//模态框显示
    
    
  },
  onLoad(options) {
    var _this = this;
    _this.init()
    // 修改页面标题
    dd.setNavigationBar({
      title: options.title + "入库"
    })
    var id = options.id
    var status = options.status
    var type=options.type//2--染缸过来的面料 1--入库管理进入的面料
    var checkInfo = dd.getStorageSync({ key: "checkInfo" }).data.checkInfo
    console.log(checkInfo)
    _this.setData({
      checkInfo:checkInfo,
      fabricOqaId:id,
      status: status,
      type: type,
      fabricName: checkInfo.fabricName,//面料品名
      spec: checkInfo.fabricSpec,//规格
      color: checkInfo.fabricColor,//颜色
    })
    if (type == 2) {
      _this.getBatch()//染缸过来的面料需要获取批号
    }else{
      // 仓库信息赋值
      var storehost=checkInfo.fabricOqaEntity
      console.log(storehost)
      var unit = storehost.fabricTypeId==2?"米":"千克"
      _this.setData({
        storeName: storehost.storehostName,//仓库名
        storehostId: storehost.storehostId,//仓库id 
        shelvesName: storehost.shelvesName,//货架名
        shelvesId: storehost.shelvesId,//货架id 
        batch: storehost.batch,//批次
        bolt: storehost.bolt,//匹数
        num: storehost.num,//重量
        unit:unit
      })
      _this.getShelvesSelect()//获取货架选项
    }
    _this.getWarehouseSelect()//获取仓库选项
  },
  init:function(){
    this.setData({
      checkInfo: "",//入库信息
      warehouseSelect: [],//仓库选项
      shelvesSelect: [],//货架选项
      storeName: "",//仓库名
      storehostId: "",//仓库id 
      shelvesName: "",//货架名
      shelvesId: "",//货架id 
      batch: "",//批次
      fabricOqaId: "",//id 
      fabricName: "",//面料品名
      spec: "",//规格
      color: "",//颜色
      unit:"千克",//单位
      modalShow: false//模态框显示
    })
  },
  // 选择仓库
  choseWarehouse:function(e){
    var _this = this
    var index = e.detail.value
    var warehouseSelect = _this.data.warehouseSelect
    _this.setData({
      storeName: warehouseSelect[index].storeName,//仓库名
      storehostId: warehouseSelect[index].id,//仓库id 
    })
    _this.setData({
      shelvesName: "",//货架名
      shelvesId: "",//货架id
      shelvesSelect: [],//货架选项
    })
    _this.getShelvesSelect()//获取货架选项
  },
  // 选择货架
  choseShelves: function(e) {
    var _this = this
    var index = e.detail.value
    var shelvesSelect = _this.data.shelvesSelect
    _this.setData({
      shelvesName: shelvesSelect[index].shelvesName,//仓库名
      shelvesId: shelvesSelect[index].id,//仓库id 
    })
  },
  // 输入框改变值
  changeValue:function(e){
    var name=e.currentTarget.dataset.name
    var value=e.detail.value
    if(name=="bolt"){
      this.setData({
        bolt: value
      })
    } else if (name == "num") {
      this.setData({
        num: value
      })
    } else if (name == "color") {
      this.setData({
        color: value
      })
    } else if (name == "spec") {
      this.setData({
        spec: value
      })
    }
  },
  // 提交入库（提交表单）
  saveForm: function(e) {
    var _this = this
    var data=_this.data
    var value = e.detail.value
    console.log(data)
    console.log(value)
    
    var flag = true
    var msg = ""
    if (data.storehostId == "") {
      flag = false
      msg = "请选择入库仓库"
    } else if (data.shelvesId == "") {
      flag = false
      msg = "请选择入库货架"
    }else if (value.bolt == "") {
      flag = false
      msg = "请输入匹数"
    } else if (value.num== "") {
      flag = false
      msg = "请输入重量"
    } else if (value.spec== "") {
      flag = false
      msg = "请输入规格"
    } else if (value.color == "") {
      flag = false
      msg = "请输入颜色"
    } 
   

    if (!flag) {
      dd.showToast({
        type: 'warn',
        content: msg,
        duration: 2000,
        success: () => {

        },
      });
    } else {
      var formData={
        "fabricOqaId": Number(data.fabricOqaId),
        "storehostId": Number(data.storehostId),
        "shelvesId": Number(data.shelvesId),
        "spec": value.spec,
        "color": value.color,
        "batch": data.batch,
        "bolt": Number(value.bolt),
        "num": Number(value.num),
        "status": Number(data.status)//"PS：status = 2 为跳过检验 其余可不传": "",
      }
      console.log(formData)
      _this.postData(formData)
    }
  },
  // 上传数据
  postData(data) {
    var _this = this;
    var url = app.globalData.servsers + "/dy/dyfabricoqa/warehouseIn"
    var method = "post"
    var type=_this.data.type
    dd.showLoading({
      content: '上传中...'
    });
    DDhttpRequest({url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          _this.setData({
            modalShow:true
          })
          setTimeout(function() {
            // 刷新上一页数据
            // var pages = getCurrentPages();
            // var prePage = pages[pages.length - 3];
            // prePage.getList()
            // console.log(pages)
            // console.log(type)
            
            // if (type==2){
            //   var checkPage = pages[pages.length - 4];
            //   checkPage.init()
            //   checkPage.getList()
              
            // }
            // end刷新上一页数据
            dd.navigateBack({
              delta: 2
            })
          }, 2000)

        } else {
          exceptionHandle(res.data)
        }

      }
    })
  },
  // 获取批次
  getBatch(){
    var _this = this
    var url = app.globalData.servsers + "/dy/dyfabricoqa/getFabricOqaBatch"
    var method = "get"
    var fabricOqaId = _this.data.fabricOqaId
    var data = {
      "fabricOqaId": fabricOqaId 
    }
    dd.showLoading({
      content: '加载中...'
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          console.log(data)
          _this.setData({
            batch: data.data
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
  
  // 获取入库仓库选项
  getWarehouseSelect: function() {
    var _this = this
    var url = app.globalData.servsers + "/dy/storehost/select"
    var method = "get"
    var data = {
      "storeType": '1,3' //storeType:1-面料仓库，2-坯布仓库，3-面料仓库、坯布仓库，0-所有仓库
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          _this.setData({
            warehouseSelect: list
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
  // 获取入库货架选项
  getShelvesSelect: function(index) {
    var _this = this
    var storehostId = _this.data.storehostId
    var url = app.globalData.servsers + "/dy/shelves/select"
    var method = "get"
    var data = {
      "storeid": storehostId
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          _this.setData({
            shelvesSelect: list
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
})
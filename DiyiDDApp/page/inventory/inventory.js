import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      tabBar:["针织布","梭织布","坯布"],
      currentTab:[0],
      tabTxt: ['面料编号', '规格', '色别', '仓库', '货架'],
      dropdown: [
        { name: "面料编号", key:"fabric"},
        { name: "规格", key: "spec" },
        { name: "颜色", key: "color" },
        { name: "仓库", key: "storehost" },
        { name: "货架", key: "shelves" }],
      dropdownShow:false,
      dropdownIndex:[""],
      selectList:[],
      fabricSelect: [],//面料编号选项
      specSelect: [],//规格选项
      colorSelect: [],//颜色选项
      storehostSelect:[],//仓库
      shelvesSelect: [],//货架
      page: 1,
      bottomHidden: true,
      noDataHidden: true,
      list: [],
    },
    onLoad(){
      var _this = this;
      _this.getFabricSelect()
      _this.getWarehouseSelect()
      _this.init()
      _this.getInventory()
      
    },
  init: function() {
    this.setData({
      page: 1,
      bottomHidden: true,
      noDataHidden: true,
      list: [],
      dropdown: [
        { name: "面料编号", key: "fabric" },
        { name: "规格", key: "spec" },
        { name: "颜色", key: "color" },
        { name: "仓库", key: "storehost" },
        { name: "货架", key: "shelves" }],
    })
  },
    // 选择类型
   choseType: function(e) {
      this.setData({
        currentTab: e.currentTarget.dataset.idx,
        bottomHidden: true,
        list: [],
        page:1,
        dropdown: [
          { name: "面料编号", key: "fabric" },
          { name: "规格", key: "spec" },
          { name: "颜色", key: "color" },
          { name: "仓库", key: "storehost" },
          { name: "货架", key: "shelves" }],
        specSelect: [],//规格选项
        colorSelect: [],//颜色选项
        dropdownShow: false,
      })

     this.getFabricSelect()
     this.getWarehouseSelect()
     this.getInventory()
     
    },
  // 点击筛选tab
  dropdownTap: function(e) {
    var dataset = e.currentTarget.dataset
    var key=dataset.key
    var selectList=this.data[key+"Select"]
    this.setData({
      dropdownIndex: dataset.idx,
      dropdownShow:true,
      selectList: selectList,
      list: []
    })
  },
  // 选择下拉菜单
  choseDropdown:function(e){
    var dataset=e.currentTarget.dataset
    var value=dataset.value
    var name = dataset.name
    
    var dropdownIndex = this.data.dropdownIndex;
    var dropdown = this.data.dropdown
    var key = dropdown[dropdownIndex].key
    var tabTxt = this.data.tabTxt
    if (name == "不限") { name = tabTxt[dropdownIndex]}

    dropdown[dropdownIndex].name = name
    dropdown[dropdownIndex].value=value
    if (key == "fabric") {
      dropdown[1].name = "规格"
      dropdown[1].value = ""
      dropdown[2].name = "颜色"
      dropdown[2].value = ""
    } else if (key == "storehost") {
      dropdown[4].name = "货架"
      dropdown[4].value = ""
    }
    this.setData({
      dropdown: dropdown,
      dropdownShow: false,
      bottomHidden: true,
      dropdownIndex: [""],
      page: 1,
      list:[]      
    })
    if (key =="fabric"){
      this.getSpecSelect()
      this.getColorSelect()
    } else if (key == "storehost"){
      this.getShelvesSelect()
    }
    console.log(dropdown)
    this.getInventory()
  },
  // 多柜展开
  handleTitleTap(e) {
    const { index } = e.currentTarget.dataset;
    const list= this.data.list;
    list[index].expanded = !list[index].expanded;
    this.setData({
      list: list
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    let _this = this;
    _this.setData({
      list:[],
      page:1,
      bottomHidden: true,
    })
    _this.getInventory()//获取合同列表
  },
  //上拉加载
  onReachBottom() {
    console.log("上拉")
    this.getInventory()//获取合同列表
  },
  // 获取当前库存
  getInventory: function() {
    var _this = this
    var bottomHidden = this.data.bottomHidden;
    if (!bottomHidden) return
    var currentTab = _this.data.currentTab
    var type = Number(currentTab) + 1//1--针织，2--梭织，3--坯布
    var dropdown=_this.data.dropdown
    var page=_this.data.page
    var url = app.globalData.servsers + "/dy/warehouse/list"
    var method = "get"
    var data = {
      page:page,
      limit:10,
      type: type,//1-针织布，2-梭织布，3--坯布
      fabricId: dropdown[0].value,
      spec: dropdown[1].value,
      color: dropdown[2].value,
      storehostId: dropdown[3].value,
      shelvesId: dropdown[4].value,
    }
    dd.showLoading({
      content: '加载中...'
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.page.list
          
          _this.dataProcessing(list,page)
          console.log(list)
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
  // 数据处理
  dataProcessing:function(data,page){
    var list=this.data.list
    if (data.length < 10) {
      var bottomHidden = false
    } else {
      var bottomHidden = true
    }
    if (page == 1 && data.length < 1) {
      var noDataHidden = false
    } else {
      var noDataHidden = true
    }
    data.forEach(item=>{
      var num = 0, bolt = 0, lockNum = 0, lockBolt = 0;
      item.children.forEach(subitem=>{
        num += subitem.num
        bolt += subitem.bolt
        lockNum += subitem.lockNum
        lockBolt += subitem.lockBolt
      })
      item.num=num
      item.bolt = bolt
      item.lockNum = lockNum
      item.lockBolt = lockBolt
      
      list.push({
        data: item,
        expanded: false,
      })
    })

    page++
    this.setData({
      list: list,
      page: page,
      bottomHidden: bottomHidden,
      noDataHidden: noDataHidden
    })
    console.log(list)
    dd.hideLoading();
    dd.stopPullDownRefresh()//停止当前页面的下拉刷新。
  },
  // 获取面料编号选项,坯布编号选项
  getFabricSelect: function() {
    var _this = this
    var currentTab = _this.data.currentTab
    var type = Number(currentTab)+1//1--针织，2--梭织，3--坯布
    var url = app.globalData.servsers + "/dy/warehouse/selectFabric"
    var method = "get"
    var data = {
      "type": type//1-针织布，2-梭织布，3--坯布
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          var select = []
          list.forEach(item => {
            if(type==3){
              select.push({
                id: item.fabric.id,
                name: item.fabric.clothNum,
                value: item.fabric.id,
                tips: item.fabric.clothName
              })
            }else{
              select.push({
                id: item.fabric.id,
                name: item.fabric.fabricNum,
                value: item.fabric.id,
                tips: item.fabric.fabricName
              })
            }
            
          })
          _this.setData({
            fabricSelect: select
          })
          console.log(select)

        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },

  // 获取规格选项
  getSpecSelect: function() {
    var _this = this
    var currentTab = _this.data.currentTab
    var type = Number(currentTab) + 1//1--针织，2--梭织，3--坯布
    var dropdown=_this.data.dropdown
    var fabricId = dropdown[0].value
    var url = app.globalData.servsers + "/dy/warehouse/selectSpec"
    var method = "get"
    var data = {
      type: type,
      fabricId: fabricId
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          var select = []
          list.forEach(item => {
            select.push({
              id: item.id,
              name: item.spec,
              value: item.spec,
              tips: ""
            })
          })
          _this.setData({
            specSelect: select,
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
  // 获取颜色选项
  getColorSelect: function() {
    var _this = this
    var currentTab = _this.data.currentTab
    var type = Number(currentTab) + 1//1--针织，2--梭织，3--坯布
    var dropdown = _this.data.dropdown
    var fabricId = dropdown[0].value
    var url = app.globalData.servsers + "/dy/warehouse/selectColor"
    var method = "get"
    var data = {
      type: type,//1-针织布，2-梭织布
      fabricId: fabricId,
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          var select = []
          list.forEach(item => {
            select.push({
              id: item.id,
              name: item.color,
              value: item.color,
              tips: ""
            })
          })
          _this.setData({
            colorSelect: select,
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
  // 获取仓库选项
  getWarehouseSelect: function() {
    var _this = this
    var currentTab = _this.data.currentTab
    var type = Number(currentTab) + 1//1--针织，2--梭织，3--坯布
    var url = app.globalData.servsers + "/dy/warehouse/selectStorehost"
    var method = "get"
    var data = {
      type: type
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          var select = []
          console.log(list)
          list.forEach(item => {
            select.push({
              id: item.storehost.id,
              name: item.storehost.storeName,
              value: item.storehost.id,
              tips: ""
            })
          })
          _this.setData({
            storehostSelect: select,
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
  // 获取位置（货架）选项
  getShelvesSelect: function(index) {
    var _this = this
    var currentTab = _this.data.currentTab
    var type = Number(currentTab) + 1//1--针织，2--梭织，3--坯布
    var dropdown = _this.data.dropdown
    var storehostId = dropdown[3].value
    var url = app.globalData.servsers + "/dy/warehouse/selectShelves"
    var method = "get"
    var data = {
      type: type,
      storehostId: storehostId
    }
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          var select = []
          console.log(list)
          list.forEach(item => {
            select.push({
              id: item.shelves.id,
              name: item.shelves.shelvesName,
              value: item.shelves.id,
              tips: ""
            })
          })
          _this.setData({
            shelvesSelect: select
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },
})
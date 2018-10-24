//获取应用实例
const app = getApp()

Page({
  data: {
    windowHeight:"",
    hidden: true,
    noData:"hide",
    list:[],
    menuList: [],
    menuLength:0,
    detailList:[],//已申请过的详情list
    currentTab:0,
    // input默认是1  
    num: 1,
    // 使用data数据对象设置样式名  
    minusStatus: 'disabled',
    materielTypeId:"",//物料类型id
    materielKinds:0,//物料种类总数
    materielTotal:0 //物料数量总数

    
  },
  onLoad:function(options){
    var windowHeight = app.data.deviceInfo.windowHeight;
    this.setData({
      windowHeight: windowHeight
    })


    var id = options.id;
    if(id){
      console.log(id)
      this.getDetail(id)
    }
    this.getClassify()//分类列表
    this.getMateriel(0, "",1,"")// 获取热门物料列表
    
  },
  // 搜索物品
  wxSearchTab:function(e){
    var value=e.detail.value;
    if(value=="")return
    console.log(value  )
    var menuList=this.data.menuList;
    var menuLength = this.data.menuLength;
    var list = this.data.list;
    list[menuLength]=[];
    menuList[menuLength] = ({ "id": 0, "search":"search"})
    console.log(menuLength)
    this.setData({
      searchValue: value,
      menuList: menuList,
      currentTab: menuLength,
      list: list
    })
    this.getMateriel(menuLength, "", "", value,"search")// 获取已有物料列表
  },
  // 搜索列表和热门列表数据处理
  handleSearch: function (id, value){
    console.log(value)
      var list=this.data.list;
      list.forEach((item,index)=>{
        item.forEach(subItem=>{
          console.log(subItem)
          if (subItem.id==id&&index!==0){
            subItem.realNum=value
          }
        })
      })
    this.setData({
      list:list
    })
  },
  // 改变热门列表数据
  changeHot:function(id,value){
    var hotList = this.data.list[0];
    hotList.forEach(item=>{
      if (item.id == id) {
        item.realNum = value
      }
    })

  },
  // 获取已申请的详情
  getDetail:function(id){
    var that = this;
    var url = app.globalData.servsers + "rz/apply/applyMateriels";
    var token = wx.getStorageSync("token");//获取token值

    wx.request({
      url: url,
      data: {
        "applyId":id
      },
      header: {
        'content-type': 'application/json',// 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          var applyMaterialList = data.list;
          that.setData({
            detailList: applyMaterialList
          })
        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    })
  },
  imgError:function(e){
    console.log(e)
    var index=e.target.dataset.index;
    var parent = e.target.dataset.parent;
    var list=this.data.list;
    list[parent][index]["img"]="/images/errImg.png"
    this.setData({
      list:list
    })
  },
  // 进入确认页面
  goConfirm:function(e){
    var list = e.currentTarget.dataset.list;
    var menuLength = this.data.menuLength;
    
    wx.setStorageSync("materielList", list)
    wx.setStorageSync("menuLength", menuLength)
    
    var materielTotal = this.data.materielTotal;
    if (materielTotal>0){
      wx.navigateTo({
        url: '../requisitionConfirm/requisitionConfirm',
      })
    }else{
      wx.showToast({
        title: '请选择物料',
        icon:"none"
      })
    }
    
  },
  // 选择菜单
  choseClassify:function(e){
    var index = e.currentTarget.dataset.idx;
    var id = e.currentTarget.dataset.id;

    this.setData({
      currentTab: index,
      noData: "hide",
      searchValue:""
      
    })
  },
  /* 点击减号 */
  bindMinus: function (e) {
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var parent = dataset.parent;
    var search = dataset.search;
    var warehouseId = dataset.warehouseid;
    var materielId = dataset.materielid;
   

    var list = this.data.list;
    var num = list[parent][index].realNum;
    if (num == undefined) num = 0
    var limiteNum = list[parent][index].num - list[parent][index].lockNum;//最大值
    // 如果大于1时，才可以减  
    if (num > 0) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1  ? 'disabled' : 'normal';
    var plusStatus = num > limiteNum ? 'disabled' : 'normal';
    
    list[parent][index].realNum = Number(num)
    list[parent][index].minusStatus = minusStatus
    list[parent][index].plusStatus = plusStatus

    // 搜索列表和热门物料处理数据
    if (search || parent == 0) {
      this.handleSearch(warehouseId, num)
    } else {
      this.changeHot(warehouseId, num)
    }
    // 将数值与状态写回  
    this.setData({
      list: list,
      // minusStatus: minusStatus
    });
    this.calcTotal()//计算总数
  },
  /* 点击加号 */
  bindPlus: function (e) {
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var parent = dataset.parent;
    var search = dataset.search;
    var warehouseId = dataset.warehouseid;
    var materielId = dataset.materielid;
   
    var list = this.data.list;
    var num = list[parent][index].realNum;
    if(num==undefined)num=0
    var limiteNum = list[parent][index].num - list[parent][index].lockNum;//最大值
    // 不作过多考虑自增1
    if (limiteNum>num){
      num++;
    }  
    // 只有大于一件的时候，才能normal状态，否则disable状态 
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    var plusStatus = num >= limiteNum ? 'disabled' : 'normal';
    list[parent][index].realNum = Number(num)
    list[parent][index].minusStatus = minusStatus;
    list[parent][index].plusStatus = plusStatus
    // 搜索列表和热门物料处理数据
    if (search || parent==0) {
       this.handleSearch(warehouseId, num)
     }else{
      this.changeHot(warehouseId, num)
     }
    // 将数值与状态写回  
    this.setData({
      // minusStatus: minusStatus,
      list:list
    });

    this.calcTotal()//计算总数
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var val = e.detail.value;
    if (val == "") { return }
    val = parseFloat(val).toFixed(2);
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var parent = dataset.parent;
    var search = dataset.search;
    var warehouseId = dataset.warehouseid;
    var materielId = dataset.materielid;
    var list = this.data.list;
    var num = list[parent][index].realNum;
    if (num == undefined) num = 0
    var limiteNum = list[parent][index].num - list[parent][index].lockNum;//最大值
console.log(val)
    list[parent][index].realNum = val
    if (val > limiteNum){
      list[parent][index].plusStatus = "disabled";
      list[parent][index].realNum = limiteNum;
      // 搜索列表和热门物料处理数据
      if (search || parent == 0) {
        this.handleSearch(warehouseId,  list[parent][index].realNum)
      } else {
        this.changeHot(warehouseId,  list[parent][index].realNum)
      }
      this.setData({
        list: list
      });
      this.calcTotal()//计算总数
      return limiteNum
    }
    // 搜索列表和热门物料处理数据
    if (search || parent == 0) {
      this.handleSearch(warehouseId, list[parent][index].realNum)
    } else {
      this.changeHot(warehouseId, list[parent][index].realNum)
    }
    // if (val==0){
    //   list[parent][index].realNum=0
    //   return 0
    // }


    // 将数值与状态写回  
    this.setData({
      list: list
    });

    this.calcTotal()//计算总数
  },
  // 计算物种和总数
  calcTotal:function(){
    var list=this.data.list,
      menuLength = this.data.menuLength,
      materielKinds=0,
      materielTotal=0;
    console.log(list)
    console.log(menuLength)
    
    for (var i = 1; i < menuLength;i++){
      console.log(list[i])
      if (list[i]!==undefined){
        for (var j = 0, ll = list[i].length; j < ll; j++) {
          var realNum = Number(list[i][j].realNum);
          if (realNum !== undefined && realNum > 0) {
            materielKinds++;
            materielTotal += realNum

          }
        }
      }
        
    }

    this.setData({
      materielKinds: materielKinds,//物料种类总数
        materielTotal: parseFloat(materielTotal).toFixed(2) //物料数量总数
    })
  },
  // 获取已有物料的分类
  getClassify: function () {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/materielTypeSelect";//接口地址
    var token = wx.getStorageSync("token");//获取token值

    that.setData({
      hidden: false
    });
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = [{ "id": "hot", "name": "热门物料"}];
          if(list.length<1){
            that.setData({
              hidden: true,
              noData:"show"
            })
            return;
          }
          for (var i = 0; i < list.length; i++) {
            var id = list[i].materielType.id;
            selectList.push({ "id": id, "name": list[i].materielType.typeName })
            that.getMateriel(i+1, id,"","")// 获取已有物料列表
          }
          // console.log(selectList)
          that.setData({
            menuList: selectList,
            menuLength: selectList.length,
            materielTypeId:selectList[0].id
          })

          
        }
      }
    })
  } ,
  // 获取已有物料列表
  getMateriel: function (typeIndex, typeId, hot, materielName, search) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/select";//接口地址
    var token = wx.getStorageSync("token");//获取token值
    // var typeId = that.data.materielTypeId;
    // var currentTab = that.data.currentTab;
    var list=that.data.list;
    wx.request({
      url: url,
      data: {
        "materielTypeId": typeId,
        "hot":hot,
        "materielName": materielName
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var dataList = res.data.list;
          var detailList = that.data.detailList;
          if (dataList.length < 1) {
            that.setData({
              hidden: true,
              noData: "show"
            })
            return;
          }
          for (var i = 0; i < dataList.length; i++) {
            // 图片
            var imgList = dataList[i].materiel.imgList;
            if (imgList == null || imgList.length < 1) {
              dataList[i].img = "/images/notUpload_sm.png"
            } else {
              dataList[i].img = imgList[0].imgUrl
            }
            // 搜索列表
            if (search){dataList[i].search=true}
            // 默认数量
            // console.log(detailList)
            var id = dataList[i].id;
            for (var j = 0, l = detailList.length;j<l;j++){
              var warehouseId = detailList[j].warehouseId;
              var num = detailList[j].num;
              
              if (id == warehouseId){
                dataList[i].realNum=num
              }

            }


          }

          list[typeIndex] = dataList;
          
          that.setData({
            list: list,
            hidden:true
          })
          that.calcTotal()//计算总数

        }
      }
    })
  } 

})  
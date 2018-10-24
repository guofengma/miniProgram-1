//获取应用实例
const app = getApp()

Page({
  data: {
    windowHeight:"",
    scrollTop:100,
    hidden: true,
    Loadinghidden:true,
    clearHidden:true,
    display:"hide",
    noData:"hide",
    page:1,
    list:[],
    menuList: [],
    choseList:[],//已选物料list
    searchValue:"",//搜索关键字
    typeId:"",//物料类型id
    currentTab:0,
    // input默认是1  
    num: 1,
    // 使用data数据对象设置样式名  
    minusStatus: 'disabled',
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
    this.setData({
      searchValue: value,
      // clearHidden: true,
      page: 1
    })
    this.getMateriel()// 获取已有物料列表
  },
  // 
  searchInput:function(e){
    var value = e.detail.value;
    if(value!==''){
      this.setData({
        clearHidden:false
      })
    }else{
      this.setData({
        clearHidden: true
      })
    }
  },
  // 
  clearInput:function(){
    this.setData({
      searchValue: '',
      clearHidden: true,
    })
    this.getMateriel()// 获取已有物料列表
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
          applyMaterialList.forEach((item)=>{
            item.id = item.warehouseId
            item.materielId = item.materialId
            item.realNum = item.num
            
            
          })
          that.setData({
            choseList: applyMaterialList
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
    var choseList=this.data.choseList;
    
    wx.setStorageSync("materielList", choseList)
    
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
      searchValue:"",
      typeId:id,
      page:1
    })
    this.getMateriel();

    //typeIndex, typeId, hot, materielName, search
  },
  /* 点击减号 */
  bindMinus: function (e) {
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var search = dataset.search;
    var warehouseId = dataset.warehouseid;
    var materielId = dataset.materielid;

    var list = this.data.list;
    var num = list[index].realNum;
    if (num == undefined) num = 0
    var limiteNum = list[index].num - list[index].lockNum;//最大值
    // 如果大于1时，才可以减  
    if (num > 0) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1  ? 'disabled' : 'normal';
    var plusStatus = num > limiteNum ? 'disabled' : 'normal';
    
    list[index].realNum = Number(num)
    list[index].minusStatus = minusStatus
    list[index].plusStatus = plusStatus

    // 如果数量大于0写入choseList
    this.refreshChoseList(num, list[index], warehouseId)
    // 将数值与状态写回  
    this.setData({
      list: list,
      // minusStatus: minusStatus
    });
  },
  /* 点击加号 */
  bindPlus: function (e) {
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var search = dataset.search;
    var warehouseId = dataset.warehouseid;
    var materielId = dataset.materielid;
   
    var list = this.data.list;
    
    var num = list[index].realNum;
    if(num==undefined)num=0
    var limiteNum = list[index].num - list[index].lockNum;//最大值
    // 不作过多考虑自增1
    if (limiteNum>num){
      num++;
    }  
    // 只有小于库存量的时候，才能normal状态，否则disable状态 
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    var plusStatus = num >= limiteNum ? 'disabled' : 'normal';
    list[index].realNum = Number(num)
    list[index].minusStatus = minusStatus;
    list[index].plusStatus = plusStatus

    // 如果数量大于0写入choseList
    this.refreshChoseList(num, list[index], warehouseId)
    // 将数值与状态写回  
    this.setData({
      list:list
    });

  },
  /* 输入框事件 */
  bindManual: function (e) {
    var val = e.detail.value;
  console.log(val)
    if (val == "" || val==undefined) {
       val == 0 ;
       }else{
      val = parseFloat(val).toFixed(2);
       }
    
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var search = dataset.search;
    var warehouseId = dataset.warehouseid;
    var materielId = dataset.materielid;
    var list = this.data.list;
    var num = list[index].realNum;
    if (num == undefined) num = 0
    var limiteNum = list[index].num - list[index].lockNum;//最大值
console.log(val)
    list[index].realNum = val

    if (val > limiteNum){
      list[index].plusStatus = "disabled";
      list[index].realNum = limiteNum;
      // 如果数量大于0写入choseList
      this.refreshChoseList(limiteNum, list[index], warehouseId)
      this.setData({
        list: list
      });
      return limiteNum
    }
    // 如果数量大于0写入choseList
    this.refreshChoseList(val, list[index], warehouseId)


    // 将数值与状态写回  
    this.setData({
      list: list
    });

  },
  // 写入已选列表
  refreshChoseList(num, data, warehouseId){
    var choseList = this.data.choseList;
    var flag=false;
    if (num > 0) {
      if (choseList.length < 1) {
        choseList.push(data)
      } else {
        choseList.forEach((item) => {
          if (item.id == warehouseId) {
            flag = false;
            item.realNum = num
          } else {
            flag=true;
          }
        })
        if (flag) choseList.push(data)
      }
    }else if(num==0){
      choseList.forEach((item,index) => {
        if (item.id == warehouseId) {
          choseList.splice(index,1)
        } else {
          // flag = true;
        }
      })
       
    } 
    this.setData({
      choseList: choseList
    }); 
    console.log(choseList) 
    this.calcTotal()//计算总数
                                      
  },
  // 计算物种和总数
  calcTotal:function(){
    var choseList = this.data.choseList,
        l = choseList.length,
        materielKinds=l,
        materielTotal=0;
    
    for (var i = 0; i < l;i++){
      materielTotal += Number(choseList[i].realNum)
    }
    console.log(materielTotal)

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
          var selectList = [{ "id": "", "name": "热门物料"}];
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
           // that.getMateriel(i+1, id,"","")// 获取已有物料列表
          }
          // console.log(selectList)
          that.setData({
            menuList: selectList
          })

          
        }
      }
    })
  } ,
  // 获取已有物料列表
  getMateriel: function () {
   
    var that = this;
    var page = that.data.page;
    var typeIndex = that.data.currentTab;
    var typeId = that.data.typeId;
    var materielName = that.data.searchValue;
    
    
    var hot = typeIndex==0?1:0;
    if (hot && page > 3) {
      this.setData({
        display:"show"
      })
      return;
    }

    this.setData({
      Loadinghidden: false
    })
    
    var url = app.globalData.servsers + "rz/warehouse/list";//接口地址
    var token = wx.getStorageSync("token");//获取token值
    
    wx.request({
      url: url,
      data: {
        "page":page,
        "limit":10,
        "materielTypeId": typeId,
        "hot":hot,
        "keyName": materielName,
        "applet":1
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 0) {
          var dataList = res.data.page.list;
          that.dataProcessing(dataList,  typeIndex,page)
          wx.stopPullDownRefresh();


        }
      }
    })
  } ,
  // 数据处理
  dataProcessing: function (dataList, typeIndex,page) {
    var that=this;
    var list = that.data.list;
    var choseList = that.data.choseList;
    
    var noData = that.data.noData;
    console.log(dataList)
    if (page == 1 && dataList.length < 1) { noData = "show" } else { noData = "hide" }
    if (dataList.length < 10 && dataList.length>0) {
      var display="show"
    } else {
      var display = "hide"
      that.setData({
        list: []
      })
    }
    
    for (var i = 0; i < dataList.length; i++) {
      // 图片
      var imgList = dataList[i].materiel.imgList;
      if (imgList == null || imgList.length < 1) {
        dataList[i].img = "/images/notUpload_sm.png"
      } else {
        dataList[i].img = imgList[0].imgUrl
      }
    // 已选物料数量赋值
      choseList.forEach((item=>{
        if (item.id == dataList[i].id){
          dataList[i].realNum=item.realNum;
        }
      }))
    // end已选物料数量赋值

     


    }

    list = dataList;
    that.setData({
      list: list,
      Loadinghidden: true,
      noData: noData,
      display:display
    })
    that.calcTotal()//计算总数
  //  app.goTop()
    
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    console.log("下拉");
   
    var page = this.data.page;
    page--;
    console.log(page)
    if(page<1)page=1
    this.setData({
      page: page
    })
    this.getMateriel();
  },
  // 上拉加载
  onReachBottom: function (e) {
    console.log("上拉");
    
    var display = this.data.display;
    if (display == "show") return
    var page=this.data.page;
    page++;
    this.setData({
      page:page
    })
    this.getMateriel();
  },
  changeScroll:function(e){
      console.log(e)
  },
  // 预览图片
  previewImg(e){
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  }

})  
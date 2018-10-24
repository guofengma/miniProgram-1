//获取应用实例
const app = getApp()
Page({
  data: {
    token:"",
    // navbar: ['面料入库', '坯布入库'],
    // currentTab: 0,
    img_arr:[],
    img_url:[],
    place_list:[],
    selHidden:true,
    noDataHidden:true,
    //原料编号list
    num:"",//原料编号
    pName:"",//品名
    sampleType:"",//原料分类
    sampleId:"",//原料id
    num_arr: [],
    num_arrSel:[],
    num_index: "",
    //样品分类
    classify_arr: [],
    classify_index: "",
    //交接人
    person_arr: [],
    person_index: "",
    //原因
    reason_arr: [],
    reason_index: '',
  //  货架
    shelfList: [],
    shelfIndexList:[],
    warehouseList:[],
    fabricShelves:""//面料对应存在货架

    
  },
  onLoad:function(){
    var that = this;
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    var token = wx.getStorageSync("token");//获取token值

    that.setData({
      token: token
    })
    //that.getClassify(token)//样品分类列表
    that.getFabric(token)//样品列表
    that.getReason(token)//原因列表
    that.getPerson(token)//交接人列表
    that.getPlace(token)//仓库位置（货架）列表
  },
  onShow:function(){
    
  },
  // 查看货架量
  goShelves:function(){
    wx.navigateTo({
      url: '../checkShelves/checkShelves',
    })
  },
  // 扫码（原料编号）
  scanNum: function (e) {
    var that = this;
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        that.setData({
          scan: true
        })
        console.log(res.result)
        
        var result = JSON.parse(res.result);
        console.log(result)
        var id = result.id;
        console.log(id)
        that.getFabricInfo(id)
        
      }
    })
  },
  // 扫码（入库位置）
  scanPlace: function (e) {
    var that = this;
    var index=e.currentTarget.dataset.index;
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        that.setData({
          scan: true
        })
        console.log(res)
        var result = JSON.parse(res.result);
        var id = result.id;
        console.log(id)
        that.getShelfInfo(id,index)
      }
    })
  },
  // 获取单个原料信息
  getFabricInfo:function(id){
    var that = this;
    var url = app.globalData.servsers + "rz/fabric/info/"+id;//接口地址
    var token=that.data.token;
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
         console.log(data)
         var info = data.entity;
         if (!info) {
           wx.showToast({
             title: '此二维码无效',
             icon: "none"
           })
           return;
         }
         if (info.fabricDescribe == null) info.fabricDescribe="/"
         that.setData({
           num: info.fabircNum,
           pName: info.fabricDescribe,
           fabricType: info.fabricType,
           fabricId: info.id,
         })
          that.getFabricShelves()
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 获取单个货架信息
  getShelfInfo: function (id,index) {
    var that = this;
    var url = app.globalData.servsers + "rz/shelves/info/" + id;//接口地址
    var token = that.data.token;
    var place_list=that.data.place_list;
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          console.log(data)
          var info = data.entity;
          if (!info){
            wx.showToast({
              title: '此二维码无效',
              icon:"none"
            })
            return;
          }
          place_list[index].shelvesName = info.row + info.height + info.line ;
          place_list[index].shelvesId = info.id;
          place_list[index].unit = info.unit;
          that.setData({
            place_list: place_list
          })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // // 样品编号picker
  pickerSearch:function(){
    var selHidden = !this.data.selHidden;
    this.setData({
      selHidden: selHidden
    })
  },
  // 样品编号下拉选择
  selectNum:function(e){
    console.log(e)
    var num=e.currentTarget.dataset.num;
    var name = e.currentTarget.dataset.name;
    var fabricType = e.currentTarget.dataset.fabrictype;
    var fabricId = e.currentTarget.dataset.id;
    
    this.setData({
      num:num,
      pName:name,
      fabricType:fabricType,
      fabricId: fabricId,
      selHidden:true
    })
    
    this.getFabricShelves()
  },
  // 样品编号搜索
  searchNum:function(e){
    // console.log(e)
    var val = e.detail.value.toLowerCase(),
        numArr=[],
        list=this.data.num_arr,
        l=list.length;
    for(var i=0;i<l;i++){
      var num = list[i].num.toLowerCase();
      // console.log(num)
      if (num.indexOf(val) >= 0){
        numArr.push(list[i]);
      }
    }
    var noDataHidden = numArr.length < 1?false:true;
    this.setData({
      num_arrSel: numArr,
      noDataHidden: noDataHidden
    })
  },
  // 隐藏样品编号下拉选择框
  hideSelList:function(){
    this.setData({
      selHidden:true
    })
  },
  // 获取面料对应存放货架位置
  getFabricShelves(){
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/fabricShelves";//接口地址
    var fabricId = that.data.fabricId
    var token = that.data.token
    
    wx.request({
      url: url,
      data: {
        "fabricId": fabricId
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          that.setData({
            fabricShelves: data.shelves
          })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 获取样品分类
  // getClassify: function (token) {
  //   var that = this;
  //   var url = app.globalData.servsers + "kb/sampletype/select";//接口地址
  //   wx.request({
  //     url: url,
  //     data: {},
  //     header: {
  //       'content-type': 'application/json',
  //       "token": token
  //     },
  //     success: function (res) {
  //       // console.log(res.data)
  //       if (res.data.code == 0) {
  //         var list = res.data.list;
  //         var selectList = []
  //         for (var i = 0; i < list.length; i++) {
  //           selectList.push({ "value": list[i].id, "name": list[i].typeName })
  //         }
  //         // console.log(selectList)
  //         that.setData({
  //           classify_arr: selectList
  //         })
  //       }
  //     }
  //   })
  // },
  // 样品分类picker
  // bindClassifyPickerChange: function (e) {
  //   // console.log('picker发送选择改变，携带值为', e.detail.value)
  //   var token = wx.getStorageSync("token");//获取token值
  //   var index = e.detail.value;
  //   var currentId = this.data.classify_arr[index].value; // 这个id就是选中项的id
  //   this.setData({
  //     classify_index: e.detail.value,
  //     num_arr: [],
  //     num_index:""
  //   })
  //   this.getFabric(token, currentId)
  // },
 
   // 获取原料编号列表
  getFabric: function (token){
    var that=this;
    var url = app.globalData.servsers + "rz/fabric/select";//接口地址
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: url, 
      data: {
        "genre":0,//0所有
        "fabricType":0//0所有
      },
      header: {
        'content-type': 'application/json', 
        "token":token
      },
      success: function (res) {
        // console.log(res.data)
        var data=res.data;
        var code=data.code;
        if(code==0){
          var list = data.list;
          var selectList=[]
          for(var i=0;i<list.length;i++){
            selectList.push({ "id": list[i].id, "name": list[i].fabricDescribe, "num": list[i].fabircNum, "fabricType": list[i].fabricType})
          }
          // console.log(selectList)
          that.setData({
            num_arr: selectList,
            // num_arrSel: selectList
            
          })
        }else {
          app.exceptionHandle(data,"../login/login")

        }
        wx.hideLoading()
      }
    })
  },
  // 样品编号编号picker
  // bindNumPickerChange: function (e) {
  //   // console.log('picker发送选择改变，携带值为', e.detail.value)
  //   var token = wx.getStorageSync("token");//获取token值
  //   var index = e.detail.value;
  //   var currentId = this.data.num_arr[index].id; // 这个id就是选中项的id
  //   this.setData({
  //     num_index: e.detail.value
  //   })
  // },
  // 获取原因列表
  getReason: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/reason/select";//接口地址
    wx.request({
      url: url,
      data: {
        "reasontype": 2  //1-出库，2-入库，3-盘库，4-处理意见
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = []
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].id, "name": list[i].reasonName})
          }
          // console.log(selectList)
          that.setData({
            reason_arr: selectList
          })
        }
      }
    })
  },
  // 获取领用人列表
  getPerson: function (token) {
    var that = this;
    var url = app.globalData.servsers + "sys/user/select";//接口地址

    wx.request({
      url: url,
      data: {
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = []
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].userId, "name": list[i].realName })//realName
          }
          // console.log(selectList)
          that.setData({
            person_arr: selectList
          })
        }
      }
    })
  },
  // 获取仓库位置（货架）
  getPlace: function (token,index) {
    var that = this;
    var url = app.globalData.servsers + "rz/shelves/select";//接口地址
    // var warehouse_id = that.data.warehouse_id;//仓库id
    wx.request({
      url: url,
      data: {
        // "storeid":warehouse_id
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = []
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].id, "name": list[i].row + list[i].height + list[i].line + " " + list[i].unit, "unit": list[i].unit })
          }
          that.setData({
            shelfList: selectList
          })
          
        }
      }
    })
  },
 
  
 
  // 入库交接人picker
  bindPersonPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var index = e.detail.value;
    var currentId = this.data.person_arr[index].id; // 这个id就是选中项的id
    this.setData({
      person_index: e.detail.value
    })
  },
  // 入库原因picker
  bindReasonPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var index = e.detail.value;
    var currentId = this.data.reason_arr[index].id; // 这个id就是选中项的id
    this.setData({
      reason_index: e.detail.value
    })
  },
 
  // 入库位置picker
  // bindPlacePickerChange: function (e) {
  //   // console.log('picker发送选择改变，携带值为', e.detail.value)
  //   var curIndex = e.target.dataset.current;
  //   var vName = e.target.dataset.name;
  //   var place_list = this.data.place_list;
  //   var place_arr = this.data.place_arr;
    
  //   var val = e.detail.value;
  //   var shelfId = place_arr[curIndex].option[val].value;
  //   place_list[curIndex][vName] = shelfId
  //   place_arr[curIndex].index = e.detail.value;
    
  //   this.setData({
  //     place_arr:place_arr,
  //     place_list: place_list
  //   })
   
  // },
  // 入库位置picker
  bindshelfPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var curIndex = e.target.dataset.current;
    var vName = e.target.dataset.name;
    var place_list = this.data.place_list,
        shelfList = this.data.shelfList;

    var val = e.detail.value;
    place_list[curIndex][vName] = shelfList[val].value;//货架名称
    place_list[curIndex]["shelvesIndex"] = e.detail.value;//货架选择index
    place_list[curIndex]["shelvesName"] = shelfList[val].name.split(" ")[0];//货架名称
    place_list[curIndex]["unit"] = shelfList[val].unit;//货架单位

    // place_list[curIndex]["freeSpace"] = shelfList[val].freeSpace;//货架剩余空间
    
    
    console.log(place_list)
    this.setData({
      place_list: place_list
    })

  },
  // 改变数值
  changeValue:function(e){
    var dataset = e.target.dataset,
        vName = dataset.name,
        index = dataset.index,
        val=e.detail.value,
        place_list = this.data.place_list;
    place_list[index][vName]= val;
    this.setData({
      place_list: place_list
    }) 
        
  },
  // 添加入库表单
  insert: function () {
    var num=this.data.num;
    if(num==""){
      wx.showModal({
        title: '提示',
        content: "请先选择原料编号"
      }) 
      return;
    }
    var place = this.data.place_list;
    place.push({ "shelvesId": "", "num": "", "batch": "", "shelvesIndex": "", "shelvesName": ""});
    
    this.setData({
      place_list: place
    });
  },
  // 删除入库表单
  delBind: function (e) {
    console.log(e)
    
    var index = e.currentTarget.dataset.index;
    var place = this.data.place_list;
    var l=place.length;
   
    place.splice(index,1)
   
    this.setData({
      place_list: place,
    });
  },
  // 选择上传图片
  upimg: function () {
    var that = this;
    app.upimg(that);
  },
  // 删除图片
  deleteImg: function (e) {
    var that = this;
    app.deleteImg(e, that)
  },
  // 预览图片
  previewImg: function (e) {
    var that = this;
    app.previewImg(e, that)
  },
  formSubmit: function (e) {
    var val = e.detail.value;
    var place_list = this.data.place_list,
      l = place_list.length;
    var warn = "";
    var flag = true;
   console.log(val)
   console.log(place_list)
   
    if (val.num == "") {
      warn = "请选择编号"
      flag = false;
    }  else if (val.person == "") {
      warn = "请选择入库交接人"
      flag = false;
    } else if (val.reason == "") {
      warn = "请选择入库原因"
      flag = false;
    }else if(l<1){
      warn = "请添加入库信息"
      flag = false;
    }
    for (var i = 0; i < l; i++) {
      if (place_list[i].shelvesId == "") {
        warn = "请选择入库位置"
        flag = false;
      } else if (place_list[i].num == "") {
        warn = "请输入入库数量"
        flag = false;
      } else if (place_list[i].batch == "") {
        warn = "请输入入库批次"
        flag = false;
      }

    }
    if(!flag){
      wx.showModal({
        title: '提示',
        content: warn
      }) 
    }else{
      this.postData(val, place_list)
      
    }
   
  },
  postData: function (data, place_list){
    console.log(data);
    var that=this;
    var url = app.globalData.servsers + "rz/warehouse/save";//入库接口地址
    var imgUrl = that.data.img_url;
    console.log(imgUrl)
    var shelvesList=[];
    for (var i = 0, l = place_list.length;i<l;i++){

      var shelves = {
        "shelvesId": place_list[i].shelvesId,//货架id(位置),
        "num": place_list[i].num,//入库数量
        "batch": place_list[i].batch,//批次
      }
      
      shelvesList.push(shelves)
    }
    console.log(shelvesList)
    console.log(place_list)
    
    wx.request({
      url: url, 
      data: {
        "fabricTypeId": data.fabricType,
        "fabricId": data.fabricId,
        "shelves": shelvesList,
        "updateBy": data.person,
        "reasonId": data.reason,
        "images": imgUrl
      },
      methond:"POST",
      header: {
        'content-type': 'application/json',
        'token': that.data.token
      },
      method: "POST",
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
        console.log();
        if(code==0){//提交成功
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 1000,
          success:function(){
            var warehouseList = that.data.warehouseList;
            for (var i = 0, l = place_list.length;i<l;i++){
              warehouseList.push({ placeName: place_list[i].shelvesName, count: place_list[i].num })
            }
           
            var warehouseInfo = { label: "入库", num: data.num, unit: place_list[0].unit, numlabel: "原料", url: "../warehouseIn/warehouseIn", warehouse: warehouseList }
              wx.setStorageSync('warehouseInfo', warehouseInfo)
              
              wx.redirectTo({
                url: '../success/success'
              })
          }

        })
        
        }else{
          app.exceptionHandle(res.data, "../login/login")
        }
      }
    })
  }
})  
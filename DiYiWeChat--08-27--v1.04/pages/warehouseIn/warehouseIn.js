//获取应用实例
const app = getApp()
Page({
  data: {
    token:"",
    navbar: ['面料入库', '坯布入库'],
    currentTab: 0,
    img_arr:[],
    img_url:[],
    place_list:[],
    classify_arr: [{ value: 1, name: '针织布',index:0 }, { value: 2, name: '梭织布',index:1} ],
    classify_index:"0",
    classify:1,
    //面料编号list
    num_arr: [],
    num_index: "",
    //坯布编号list
    clothNum_arr: [],
    clothNum_index: "",
    //规格
    spec_arr: [],
    spec_index: "",
    spec: "",//所选规格
    //色别
    color_arr: [],
    color_index: "",
    color_id: "",//所选色别id
    //交接人
    person_arr: [{ value: 0, name: 'jack' }, { value: 1, name: 'rose' }],
    person_index: "",
    //原因
    reason_arr: [],
    reason_index: '',
    //仓库
    warehouse: {
      index: "",
      option: []
    },
    warehouse_arr: [],
    warehouse_id:"",//所选仓库id
    //位置
    placeData: {
      index: "",
      option: []
    },
    place_arr: [],
    warehouseList:[],
    postNum:0//上传次数
  },
  onLoad:function(){
    var token = wx.getStorageSync("token");//获取token值
    this.setData({
      token: token
    })
    this.getFabric(token)//面料列表
    this.getReason(token)//原因列表
    this.getPerson(token)//领用人列表
    this.getwarehouse(token)//仓库列表
    //this.getPlace(token)//仓库位置（货架）列表
  },
  onShow:function(){
    
  },
  navbarTap: function (e) {
    var data = this.data
    data["place_list"] = [];
    data["num_index"] = "";
    data["person_index"] = "";
    data["reason_index"] = "";
    data.warehouse_arr=[];
    data.place_arr = [];
    

    // console.log(data)
    this.setData(data)
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    var token = wx.getStorageSync("token");//获取token值
    this.getCloth(token)//面料列表
    this.getwarehouse(token)//仓库列表
  },
   // 获取面料列表
  getFabric:function(token){
    var that=this;
    var url = app.globalData.servsers + "dy/fabric/select";//接口地址
    var classify = this.data.classify;
    wx.request({
      url: url, 
      data: {
        "fabricType": classify
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
            selectList.push({ "value": list[i].id, "name": list[i].fabricName, "num": list[i].fabricNum})
          }
          // console.log(selectList)
          that.setData({
            num_arr: selectList
          })
        }else {
          app.exceptionHandle(data,"../login/login")

        }
      }
    })
  },
  // 获取规格列表
  getSpec: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/selectSpec";//接口地址
    // var id = that.data.num_id;
    var classify = this.data.classify;
    var currentTab = this.data.currentTab;
    if (currentTab == 1) { classify = "3" }
    wx.request({
      url: url,
      data: {
        // "fabricId": id,//面料编号id
        "type": classify
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
            selectList.push({ "value": list[i].spec, "name": list[i].spec })
          }
          selectList.push({"value":0,name:"手动输入"})
          console.log(selectList)
          // 如果数据只有一条
          if (list.length == 1) {
            // that.setData({
            //   spec_index: "0"
            // })
            // that.getColor(token)
          }
          that.setData({
            spec_arr: selectList
          })
        }
      }
    })
  },
  // 获取色别列表
  getColor: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/selectColor";//接口地址
    var id = that.data.num_id;//面料id
    // var spec = that.data.spec;//规格
     var classify = this.data.classify;
    var currentTab = this.data.currentTab;
    if (currentTab == 1) { classify = "3" }
    wx.request({
      url: url,
      data: {
        "type": classify
        // "fabricId": id//面料编号id
        // "spec": spec
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
            selectList.push({ "value": list[i].color, "name": list[i].color, "inventoryId": list[i].id })
          }
          selectList.push({ "value": 0, name: "手动输入" })
          // console.log(selectList)
         
          that.setData({
            color_arr: selectList
          })
        }
      }
    })
  },
  // 获取坯布列表
  getCloth: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/cloth/select";//接口地址
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
          var list = data.list;
          var selectList = []
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].id, "name": list[i].clothName, "num": list[i].clothNum, "spec":list[i].clothSpec })
          }
          console.log(selectList)
          that.setData({
            clothNum_arr: selectList
          })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 获取原因列表
  getReason: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/reason/select";//接口地址

    wx.request({
      url: url,
      data: {
        "reasontype":2  //入库2 出库1
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
  // 获取仓库列表
  getwarehouse: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/storehost/select";//接口地址
    var classify = this.data.classify;
    var currentTab = this.data.currentTab;
    if (currentTab == 1) { classify = "2,3" } else { classify="1,3"}//如果是坯布入库
    // console.log(token)
    wx.request({
      url: url, 
      data: {
        "storeType": classify//storeType:1-面料仓库，2-坯布仓库，3-面料仓库、坯布仓库，0-所有仓库
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
            selectList.push({ "value": list[i].id, "name": list[i].storeName })
          }
          // console.log(selectList)
          that.setData({
            warehouse: {index: "", option: selectList}
          })
        }

      }
    })
  },
  // 获取仓库位置（货架）
  getPlace: function (token,index) {
    var that = this;
    var url = app.globalData.servsers + "dy/shelves/select";//接口地址
    var warehouse_id = that.data.warehouse_id;//仓库id
    wx.request({
      url: url,
      data: {
        "storeid":warehouse_id
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
            selectList.push({ "value": list[i].id, "name": list[i].shelvesName })
          }
          that.setData({
            placeData: { index: "", option: selectList }
          })
          // console.log(that.data)
          var place_arr = that.data.place_arr;
          var placeData = that.data.placeData;//获取的仓库位置数据
          place_arr.splice(index, 1, placeData)
          // console.log(place_arr)

          that.setData({
            place_arr: place_arr
          })
        }
      }
    })
  },
 
  // 面料分类picker
  bindClassifyPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var token = wx.getStorageSync("token");//获取token值
    var index = e.detail.value;
    var currentId = this.data.classify_arr[index].value; // 这个id就是选中项的id
    // console.log(currentId)
    this.setData({
      classify_index: e.detail.value,
      classify: currentId
    })
    this.getFabric(token)//面料列表
  },
  // 面料编号picker
  bindNumPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var token = wx.getStorageSync("token");//获取token值
    var index = e.detail.value;
    var currentId = this.data.num_arr[index].id; // 这个id就是选中项的id
    this.setData({
      num_index: e.detail.value
    })
    this.getSpec(token)
    this.getColor(token)
  },
  // 坯布编号picker
  bindClothNumPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var index = e.detail.value;
    var currentId = this.data.clothNum_arr[index].id; // 这个id就是选中项的id
    this.setData({
      clothNum_index: e.detail.value
    })
  },
  // 规格picker
  bindSpecPickerChange: function (e) {
    var arr = this.data.spec_arr;
    if (arr.length == 0) { return }
    var token = wx.getStorageSync("token");//获取token值
    var index = e.detail.value;
    var spec = this.data.spec_arr[index].value; //所选规格值
    console.log(index)
    console.log(arr.length - 1)
    if(index==(arr.length-1)){
      this.setData({ reply: true })
    }else{
      this.setData({ reply: false })
    }
    this.setData({
      spec_index: e.detail.value,
      spec: spec
    })
    // this.getColor(token)
  },
  // 色别picker
  bindColorPickerChange: function (e) {
    var arr = this.data.color_arr;
    if (arr.length == 0) { return }
    // var token = wx.getStorageSync("token");//获取token值
    var index = e.detail.value;
    // var currentId = this.data.color_arr[index].id; // 这个id就是选中项的id
    // var inventoryId = this.data.color_arr[index].inventoryId;//库存id
    if (index == (arr.length - 1)) {
      this.setData({ colorReply: true })
    } else {
      this.setData({ colorReply: false })
    }
    this.setData({
      color_index: e.detail.value,
      // inventoryId: inventoryId,//库存id
    })
    // this.getwarehouse(token, inventoryId)//仓库列表
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
  // 入库仓库picker
  bindWarehousePickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var token = wx.getStorageSync("token");//获取token值
    var curIndex = e.target.dataset.current;
    this.data.warehouse_arr[curIndex].index = e.detail.value;
    var currentId = this.data.warehouse.option[e.detail.value].value;
    // console.log(currentId)
    this.setData({
      warehouse_arr: this.data.warehouse_arr,
      warehouse_id: currentId
    })
    this.getPlace(token, curIndex)//仓库位置（货架）列表
  },
  // 入库位置picker
  bindPlacePickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var curIndex = e.target.dataset.current;
    this.data.place_arr[curIndex].index = e.detail.value;
    // console.log(this.data.place_arr)
    this.setData({
      place_arr: this.data.place_arr
    })
  },
  // 添加入库表单
  insert: function () {
    var place = this.data.place_list;
    // console.log(place.length);
    var warehouse_arr = this.data.warehouse_arr;
    var warehouse = this.data.warehouse;//获取的仓库数据
    warehouse_arr.push(warehouse)
    place.push(this.data.place_list.length);
    this.setData({
      place_list: place,
      warehouse_arr: warehouse_arr
    });
  },
  // 删除入库表单
  delBind: function (e) {
    var place = this.data.place_list;
    var l=place.length;
    var warehouse_arr = this.data.warehouse_arr;
    var place_arr = this.data.place_arr;
    // console.log(place);
    place.pop(l);
    warehouse_arr.pop(l);
    place_arr.pop(l);
    
    this.setData({
      place_list: place,
      warehouse_arr: warehouse_arr,
      place_arr: place_arr
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
    var l = this.data.place_list.length;
    var currentTab = this.data.currentTab;
    var warn = "";
    var flag = true;
    console.log(val)
    val.spec = val.spec == 0 ? val.spec2 : val.spec;
    val.color = val.color == 0 ? val.color2 : val.color;
    if (val.num == "") {
      warn = "请选择编号"
      flag = false;
    } else if (val.spec == "") {
      warn = "请输入规格"
      flag = false;
    } else if (val.color == "" && currentTab == 0) {
      warn = "请输入色别"
      flag = false;
    }else if (val.person == "") {
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
      if (val["wearhouse" + i] == "") {
        warn = "请选择入库仓库"
        flag = false;
      } else if (val["place" + i] == "") {
        warn = "请选择入库位置"
        flag = false;
      } else if (val["count" + i] == "") {
        warn = "请输入入库数量"
        flag = false;
      } else if (val["p_count" + i] == "") {
        warn = "请输入入库匹数"
        flag = false;
      } else if (val["batch" + i] == "") {
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
      this.postData(val,l)
      // for (var j = 0; j < l; j++ ){
      //   this.postData(val,j,l)
      // }
    }
   
  },
  postData:function(data,l){
    console.log(data);
    var that=this;
    var  url=app.globalData.servsers + "dy/inventory/save";//入库接口地址
    var currentTab = this.data.currentTab;
    if (data.color == ""||data.color==undefined) { data.color="未填写" }
    if (currentTab == 1) { data.classify = "3"; data.color=(data.color=="")?"灰色":data.color}//如果是坯布入库
    var imgUrl = JSON.stringify(that.data.img_url);
    var paramsList=[];
    for(var i=0;i<l;i++){
      var params = {
        "type": data.classify,//	类型 1.针织 2.梭织 3.坯布
        "fabricId": data.num,//面料（坯布）id
        "spec": data.spec,//规格
        "color": data.color,//颜色
        "storehostId": data["warehouse" + i], //仓库id
        "shelvesId": data["place" + i],//货架id(位置)
        "num": data["count" + i],//入库数量
        "bolt": data["p_count" + i],//入库匹数
        "batch": data["batch" + i],//批次
        "reason": data.reason,//原因
        "updateBy": data.person,//入库交接人（领用人）
        "accessory": imgUrl
      }
      paramsList.push(params)
    }
    console.log(paramsList)
    wx.request({
      url: url, 
      data: paramsList,
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
            for(var i=0;i<l;i++){
              that.data.warehouseList.push({ name: data["warehouseName" + i], count: data["count" + i] })
              // console.log(that.data.warehouseList)
              var warehouseList = that.data.warehouseList;
              that.setData({
                warehouseList: warehouseList
              })
              var unit = data.classify == "1" ? "千克" : "米";//针织布:千克，梭织布：米，坯布：米（暂定）
              var numlabel = data.classify == "3" ? "坯布" : "面料";

              var postNum = that.data.postNum;
              postNum++
              that.setData({
                postNum: postNum
              })
            }
            
            // if (postNum==l){
              // 成功后跳转到success页面
              // console.log(warehouseList)
              var warehouseInfo = { label: "入库", num: data.numName, numlabel: numlabel, unit: unit, url: "../warehouseIn/warehouseIn", warehouse: warehouseList }
              wx.setStorageSync('warehouseInfo', warehouseInfo)
              
              wx.redirectTo({
                url: '../success/success'
              })
            // }
           
          }

        })
        
        }else{
          app.exceptionHandle(res.data, "../login/login")
        }
      }
    })
  }
})  
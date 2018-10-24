// 获取应用实例
const app = getApp()
Page({
  data: {
    token: "",
    navbar: ['面料出库', '坯布出库'],
    currentTab: 0,
    img_arr: [],
    img_url: [],
    place_list: [],
    classify_arr: [{ value: 1, name: '针织布', index: 0 }, { value: 2, name: '梭织布', index: 1 }],
    classify_index: "0",
    classify: 1,
    //面料编号list
    num_arr: [],
    num_index: "",
    num_id: "",//所选面料编号id
    //规格
    spec_arr: [],
    spec_index: "",
    spec: "",//所选规格
    //色别
    color_arr: [],
    color_index: "",
    color_id: "",//所选色别id
    // 交接人
    person_arr: [],
    person_index: "",
    // 原因
    reason_arr: [],
    reason_index: '',
    // 仓库
    inventoryId:"",//库存id
    warehouse: {
      index: "",
      option: []
    },
    warehouse_arr: [],
    warehouse_id: "",//所选仓库id
    // 位置
    placeData: {
      index: "",
      option: []
    },
    place_arr: [],
    place_id:"",//位置（货架）id
    warehouseList: [],
    // 批次
    batch: {
      index: "",
      option: [{ value: 0, name: '批次1' }, { value: 1, name: '批次2' }]
    },
    batch_arr: [],
    postNum: 0//上传次数
  },
  onLoad: function () {
    var token = wx.getStorageSync("token");//获取token值
    this.setData({
      token: token
    })
    this.getFabric(token)//面料列表
    this.getReason(token)//原因列表
    this.getPerson(token)//领用人列表
    
    
  },
  onShow: function () {

  },
  navbarTap: function (e) {
    var data = this.data
    data["place_list"] = [];
    data["num_index"] = "";
    data["person_index"] = "";
    data["reason_index"] = "";

    // console.log(data)
    this.setData(data)
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    var token = wx.getStorageSync("token");//获取token值
    this.getFabric(token)//面料列表
  },
  // 获取面料列表
  getFabric: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/selectFabric";//接口地址
    var classify = this.data.classify;
    var currentTab = this.data.currentTab;
    if (currentTab == 1) { classify = "3" }//如果是坯布出库
    // console.log(classify)
    // console.log(token)

    wx.request({
      url: url,
      data: {
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
          var selectList = [];
          for (var i = 0; i < list.length; i++) {
            var fabricInfo = JSON.parse(list[i].fabricInfo) ;
            // console.log(fabricInfo)
            console.log(classify == "3")
            
            if (classify=="3"){//坯布
              selectList.push({ "value": fabricInfo.id, "name": fabricInfo.clothName, "num": fabricInfo.clothNum, "spec": fabricInfo.clothSpec, "inventoryId": list[i].id})
            }else{
              selectList.push({ "value": fabricInfo.id, "name": fabricInfo.fabricName, "num": fabricInfo.fabricNum })
            }
          }
          // console.log(selectList)
          that.setData({
            num_arr: selectList
          })
        }else{
          app.exceptionHandle(data, "../login/login")
        }
      }
    })
  },
  // 获取规格列表
  getSpec: function (token) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/selectSpec";//接口地址
    var id=that.data.num_id;
    var classify = this.data.classify;
    var currentTab = this.data.currentTab;
    if (currentTab == 1) { classify = "3" }//如果是坯布出库
    wx.request({
      url: url,
      data: {
        "fabricId": id,//面料编号id
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
          console.log(selectList)
          // 如果数据只有一条
          if(list.length==1){
            that.setData({
              spec_index:"0",
              spec: list[0].spec
            })
            that.getColor(token)
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
    var spec = that.data.spec;//规格
    wx.request({
      url: url,
      data: {
        "fabricId": id,//面料编号id
        "spec": spec
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
          // console.log(selectList)
          // 如果数据只有一条
          if (list.length == 1) {
            that.setData({
              color_index: "0"
            })
            var inventoryId=list[0].id;
            that.setData({
              inventoryId: inventoryId
            })
            that.getwarehouse(token, inventoryId)
          }
          that.setData({
            color_arr: selectList
          })
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
        "reasontype": 1 //入库2 出库1
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
            selectList.push({ "value": list[i].id, "name": list[i].reasonName })
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
  getwarehouse: function (token,id) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/selectStorehost";//接口地址
    var classify = this.data.classify;
    var currentTab = this.data.currentTab;
    if (currentTab == 1) { classify = "2,3" } else { classify = "1,3" }//如果是坯布出库
    // console.log(token)
    wx.request({
      url: url,
      data: {
        "inventoryId": id
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = [] ;
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].storehostId, "name": list[i].storehostName })
          }
          // console.log(selectList)
          
          that.setData({
            warehouse: { index: "", option: selectList }
          })

          var warehouse_arr = that.data.warehouse_arr;
          console.log(warehouse_arr)
          for (var i = 0; i < warehouse_arr.length;i++){
            warehouse_arr[i].index="";
            warehouse_arr[i].option = selectList;
          }
          // var warehouse = that.data.warehouse;//获取的仓库位置数据
          // warehouse_arr.splice(index, 1, warehouse)
          // // console.log(warehouse_arr)

          that.setData({
            warehouse_arr: warehouse_arr
          })
        }

      }
    })
  },
  // 获取仓库位置（货架）
  getPlace: function (token, index) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/selectShelves";//接口地址
    var warehouse_id = that.data.warehouse_id;//仓库id
    var inventoryId = that.data.inventoryId;//库存id
    wx.request({
      url: url,
      data: {
        "storehostId": warehouse_id,
        "inventoryId": inventoryId
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = [],
            index="";
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].shelvesId, "name": list[i].shelvesName })
          }
          if (list.length == 1){
            index="0";
            var shelvesId = list[0].shelvesId;
            that.setData({
              place_id: shelvesId
            })
            that.getBatch(token, index)
          }
          that.setData({
            placeData: { index: index, option: selectList }
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
  // 获取批次列表
  getBatch: function (token, index) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/selectBatch";//接口地址
    var warehouse_id = that.data.warehouse_id;//仓库id
    var inventoryId = that.data.inventoryId;//库存id
    var place_id=that.data.place_id;//位置（货架id）
    wx.request({
      url: url,
      data: {
        "storehostId": warehouse_id,
        "inventoryId": inventoryId,
        "shelvesId": place_id
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var selectList = [],
              index=""
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].batch, "name": list[i].batch, "count": list[i].num, "p_count": list[i].bolt, "lockNum": list[i].lockNum, "lockBolt": list[i].lockBolt })
          }
          index=list.length==1?"0":"";
          that.setData({
            batch: { index: index, option: selectList }
          })
          // console.log(that.data)
          var batch_arr = that.data.batch_arr;
          var batch = that.data.batch;//获取的仓库位置数据
          batch_arr.splice(index, 1, batch)
          // console.log(place_arr)

          that.setData({
            batch_arr: batch_arr
          })
        }
      }
    })
  },
  // 限制输入数量和匹数
  limitVal:function(e){
    var val = e.detail.value;
    var limit=e.target.dataset.limit;
    var lock = e.target.dataset.lock;
    if (!limit){
      wx.showToast({
        title: '请选择出库批次！',
        icon:"none"
      })
      return ""
      }
    if (val > (limit-lock)) { return limit-lock }
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
      classify: currentId,
      place_list:[],
      num_index:"",
      person_index:"",
      reason_index:"",
      spec_index: "",
      color_index: "",
    })
    this.getFabric(token)//面料列表

  },
  // 面料编号picker
  bindNumPickerChange: function (e) {
    var arr = this.data.num_arr;
    if(arr.length==0){return}
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var token = wx.getStorageSync("token");//获取token值
    var index = e.detail.value;
    var currentId = this.data.num_arr[index].value; // 这个id就是选中项的id

    var warehouseArr = this.data.warehouse_arr;//仓库选项
    for (var i = 0; i < warehouseArr.length;i++){
      warehouseArr[i].index=""
    }
    var placeArr = this.data.place_arr;//位置选项
    for (var i = 0; i < placeArr.length; i++) {
      placeArr[i].index = ""
    }
    var batchArr = this.data.batch_arr;//批次选项
    for (var i = 0; i < batchArr.length; i++) {
      batchArr[i].index = ""
    }
    this.setData({
      num_index: e.detail.value,
      num_id: currentId,
     
      spec_index:"",
      warehouse_arr: warehouseArr,
      place_arr: placeArr,
      batch_arr: batchArr
    })
    this.getSpec(token);//获取规格列表
    var currentTab=this.data.currentTab;
    if(currentTab==1){//如果是坯布直接获取仓库列表
      var inventoryId = this.data.num_arr[index].inventoryId;//库存id
      this.setData({
        inventoryId: inventoryId,//库存id
      })
      this.getwarehouse(token,inventoryId)//仓库列表
    }
   
  },
  // 规格picker
  bindSpecPickerChange: function (e) {
    var arr = this.data.spec_arr;
    if (arr.length == 0) { return }
    var token = wx.getStorageSync("token");//获取token值
    var index = e.detail.value;
    var spec = this.data.spec_arr[index].value; //所选规格值
    this.setData({
      spec_index: e.detail.value,
      spec:spec,
      color_index:""
    })
    this.getColor(token)
  },
  // 色别picker
  bindColorPickerChange: function (e) {
    var arr = this.data.color_arr;
    if (arr.length == 0) { return }
    var token = wx.getStorageSync("token");//获取token值
    var index = e.detail.value;
    var currentId = this.data.color_arr[index].id; // 这个id就是选中项的id
    var inventoryId = this.data.color_arr[index].inventoryId;//库存id
    this.setData({
      color_index: e.detail.value,
      inventoryId: inventoryId,//库存id
    })
    this.getwarehouse(token, inventoryId)//仓库列表
  },
  // 出库交接人picker
  bindPersonPickerChange: function (e) {
    var arr = this.data.person_arr;
    if (arr.length == 0) { return }
    var index = e.detail.value;
    var currentId = this.data.person_arr[index].id; // 这个id就是选中项的id
    this.setData({
      person_index: e.detail.value
    })
  },
  // 出库原因picker
  bindReasonPickerChange: function (e) {
    var arr = this.data.reason_arr;
    if (arr.length == 0) { return }
    var index = e.detail.value;
    var currentId = this.data.reason_arr[index].id; // 这个id就是选中项的id
    this.setData({
      reason_index: e.detail.value
    })
  },
  // 出库仓库picker
  bindWarehousePickerChange: function (e) {
    var arr = this.data.warehouse_arr;
    if (arr.length == 0) { return }
    var token = wx.getStorageSync("token");//获取token值
    var curIndex = e.target.dataset.current;
    this.data.warehouse_arr[curIndex].index = e.detail.value;
    var currentId = this.data.warehouse.option[e.detail.value].value;//仓库id

    var placeArr = this.data.place_arr;//位置选项
    for (var i = 0; i < placeArr.length; i++) {
      if (i == curIndex) { placeArr[i].index = ""}
    }
    var batchArr = this.data.batch_arr;//批次选项
    for (var i = 0; i < batchArr.length; i++) {
      if (i == curIndex) { batchArr[i].index = ""}
      
    }

    this.setData({
      warehouse_arr: this.data.warehouse_arr,
      warehouse_id: currentId,
      place_arr: placeArr,
      batch_arr: batchArr
    })
    this.getPlace(token, curIndex)//仓库位置（货架）列表



  },
  // 出库位置picker
  bindPlacePickerChange: function (e) {
    var arr = this.data.place_arr;
    if (arr.length == 0) { return }
    var token = wx.getStorageSync("token");//获取token值
    var curIndex = e.target.dataset.current;
    this.data.place_arr[curIndex].index = e.detail.value;
    var currentId = this.data.placeData.option[e.detail.value].value;//位置id
    this.setData({
      place_arr: this.data.place_arr,
      place_id: currentId//位置id
    })
    this.getBatch(token, curIndex)//批次列表  
  },
  // 出库批次picker
  bindBatchPickerChange: function (e) {
    var arr = this.data.batch_arr;
    if (arr.length == 0) { return }
    var curIndex = e.target.dataset.current;
    this.data.batch_arr[curIndex].index = e.detail.value
    this.setData({
      batch_arr: this.data.batch_arr
    })
  },
  // 添加出库表单
  insert: function () {
    var place = this.data.place_list;
    var currentTab = this.data.currentTab;
    // console.log(place.length);
    var num_index=this.data.num_index;
    var spec_index = this.data.spec_index;
    var color_index = this.data.color_index;
   
    if (num_index==""){
      wx.showModal({
        title: '提示',
        content: '请选择面料编号',
      })
    } else if (currentTab == 0&&spec_index == "") {
      wx.showModal({
        title: '提示',
        content: '请选择规格',
      })
    } else if (currentTab == 0&&color_index == "") {
      wx.showModal({
        title: '提示',
        content: '请选择色别',
      })
    }else{
      var warehouse_arr = this.data.warehouse_arr;
      var warehouse = this.data.warehouse;//获取的仓库数据
      warehouse_arr.push(warehouse)
      place.push(this.data.place_list.length);
      this.setData({
        place_list: place,
        warehouse_arr: warehouse_arr
      });
    }
    
  },
  // 删除出库表单
  delBind: function (e) {
    var place = this.data.place_list;
    var l = place.length;
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
    // console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var val = e.detail.value;
    var l = this.data.place_list.length;
    var currentTab = this.data.currentTab;
    var warn = "";
    var flag = true;
    if (val.num == "") {
      warn = "请选择编号"
      flag = false;
    } else if (val.spec == "") {
      warn = "请选择规格"
      flag = false;
    } else if (val.color == "" && currentTab==0) {
      warn = "请选择色别"
      flag = false;
    }else if (val.person == "") {
      warn = "请选择出库交接人"
      flag = false;
    } else if (val.reason == "") {
      warn = "请选择出库原因"
      flag = false;
    } else if (l < 1) {
      warn = "请添加出库信息"
      flag = false;
    }
    for (var i = 0; i < l; i++) {
      if (val["wearhouse" + i] == "") {
        warn = "请选择出库仓库"
        flag = false;
      } else if (val["place" + i] == "") {
        warn = "请选择出库位置"
        flag = false;
      } else if (val["count" + i] == "") {
        warn = "请输入出库数量"
        flag = false;
      } else if (val["p_count" + i] == "") {
        warn = "请输入出库匹数"
        flag = false;
      } else if (val["batch" + i] == "") {
        warn = "请输入出库批次"
        flag = false;
      }

    }
    // console.log(flag)
    if (!flag) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    } else {
      for (var i = 0; i < l; i++) {
        this.postData(val, i, l)
      }
    }
  },
  postData: function (data, i, l) {
    var that = this;
    var url = app.globalData.servsers + "dy/inventory/update";//出库接口地址
    console.log(data)
    var currentTab = this.data.currentTab;
    if (data.color == "" || data.color == undefined) { data.color = "未填写" }
    if (currentTab == 1) { data.classify = "3"; data.color = (data.color == "") ? "灰色" : data.color }//如果是坯布出库
    var imgUrl = JSON.stringify(that.data.img_url);


    var params = {
      "type": data.classify,//	类型 1.针织 2.梭织 3.坯布
      "fabricId": data.num,//面料（坯布）id
      "spec": data.spec,//规格
      "color": data.color,//颜色
      "storehostId": data["warehouse" + i], //仓库id
      "shelvesId": data["place" + i],//货架id(位置)
      "num": data["count" + i],//出库数量
      "bolt": data["p_count" + i],//出库匹数
      "batch": data["batch" + i],//批次
      "reason": data.reason,//原因
      "updateBy": data.person,//出库交接人（领用人）
      "accessory": imgUrl//附件(图片地址等)
    }
    console.log(params)
    wx.request({
      url: url,
      data: params,
      header: {
        'content-type': 'application/json',
        'token': that.data.token
      },
      method: "PUT",
      success: function (res) {
        console.log(res.data)
        var code = res.data.code;
        if (code == 0) {//提交成功
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000,
            success: function () {
              that.data.warehouseList.push({ name: data["warehouseName" + i], count: data["count" + i] })
              console.log(that.data.warehouseList)
              var unit = data.classify == "1" ? "千克" : "米";//针织布:千克，梭织布：米，坯布：米（暂定）
              var numlabel = data.classify == "3" ? "坯布" : "面料";

              var postNum = that.data.postNum;
              postNum++
              that.setData({
                postNum: postNum
              })
              if (postNum==l) {
                var warehouseList = that.data.warehouseList;
                console.log(warehouseList)

                // 成功后跳转到success页面
                var warehouseInfo = { label: "出库", num: data.numName, unit: unit, numlabel: numlabel, url: "../warehouseOut/warehouseOut", warehouse: warehouseList }
                wx.setStorageSync('warehouseInfo', warehouseInfo)
                wx.redirectTo({
                  url: '../success/success'
                })
              }

            }

          })

        } else {
          
          app.exceptionHandle(data, "../login/login")
        }
      }
    })
  }
})  
//获取应用实例
const app = getApp()
Page({
  data: {
    token: "",
    img_arr: [],
    img_url: [],
    place_list: [],
    selHidden: true,
    noDataHidden: true,
    //样品编号list
    num: "",//样品编号
    pName: "",//品名
    sampleType: "",//样品分类
    sampleId: "",//样品id
    num_arr: [],
    num_arrSel: [],
    num_index: "",
    num_id: "",//所选样品编号id
    //样品分类
    classify_arr: [],
    classify_index: "",
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
    //  存放货架
    shelfList: [],
    shelf_index: "",
    shelfName:"",
    shelfId:"",
    warehouseList: [],
    // 入库货架
    inShelfList: [],
    inShelvesIndex: "",
    inShelfName: "",
    inShelfId: "",

   
  },
  onLoad: function () {
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
    that.getPlace(token)//存放位置
    that.getReason(token)//原因列表
    that.getPerson(token)//领用人列表
    that.getInPlace(token)//入库位置
    
    
    
  },
  onShow: function () {

  },
  // 查看货架量
  goShelves: function () {
    wx.navigateTo({
      url: '../checkShelves/checkShelves',
    })
  },
  // 扫码（货架）
  scanPlace: function (e) {
    var that = this;
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
        that.getShelfInfo(id)
      }
    })
  },
  // 获取单个货架信息
  getShelfInfo: function (id) {
    var that = this;
    var url = app.globalData.servsers + "rz/shelves/info/" + id;//接口地址
    var token = that.data.token;
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
         

          that.setData({
            shelfName: info.row + info.height + info.line ,
            shelfId: info.id
          })
          that.getFabric(token)//原料编号列表
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 获取仓库位置（货架）
  getPlace: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/shelves";//接口地址
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
          var selectList = [];
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "id": list[i].shelves.id, "name": list[i].shelves.row + list[i].shelves.height + list[i].shelves.line + " " + list[i].shelves.unit, "unit": list[i].shelves.unit })
          }

          that.setData({
            shelfList: selectList
          })

        }
      }
    })
  },
  // 存放位置picker
  bindShelfPickerChange: function (e) {
    var token = wx.getStorageSync("token");//获取token值
    var curIndex = e.target.dataset.current;
    var val = e.detail.value,
      shelfList = this.data.shelfList,
      shelfName = shelfList[val].name.split(" ")[0],
      shelfId = shelfList[val].id
    console.log(shelfList)
    this.setData({
      shelf_index: val,
      shelfName: shelfName,
      shelfId: shelfId,
      unit: shelfList[val].unit
    });

    this.getFabric(token)//原料编号列表
    
  },
  
  // 获取原料编号列表
  getFabric: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/select";//接口地址
    var shelfId = that.data.shelfId;//货架id
    console.log(shelfId)
    wx.request({
      url: url,
      data: {
        "shelvesId": shelfId
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
          var list = data.list;
          var selectList = [];
          var idList=[];
          for (var i = 0; i < list.length; i++) {
            // selectList.push({ "id": list[i].fabricId, "name": list[i].fabric.fabricDescribe, "num": list[i].fabric.fabircNum })
            idList.push(list[i].fabricId + ','+list[i].fabric.fabricDescribe +','+ list[i].fabric.fabircNum)
          }
          idList = app.distinct(idList)
          // console.log(idList)
          idList.forEach(item=>{
            var itemList=item.split(",")
            // console.log(itemList)
            selectList.push({ "id": itemList[0], "name": itemList[1], "num": itemList[2] })
          })
          // console.log(selectList)
          that.setData({
            num_arr: selectList,
            num_arrSel: selectList

          })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },

  // 原料编号编号picker
  bindNumPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var token = wx.getStorageSync("token");//获取token值
    var val = e.detail.value;
    var curIndex = e.target.dataset.current;
    var place_list = this.data.place_list,
      num_arr = this.data.num_arr;
    place_list[curIndex]["materialIndex"] = e.detail.value;//原料选择index
    place_list[curIndex]["materialName"] = num_arr[val].name;//原料名称
    place_list[curIndex]["materialNum"] = num_arr[val].num;//原料编号
    place_list[curIndex]["materialId"] = num_arr[val].id;//原料id
    

    console.log(place_list)
    this.setData({
      place_list: place_list
    })
    this.getBatch(token, curIndex)
  },
  // 获取批次列表
  getBatch: function (token, currIndex) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/select";//接口地址
    var shelfId = that.data.shelfId;//货架id
    var place_list = that.data.place_list;
    var fabricId = place_list[currIndex].materialId;
    wx.request({
      url: url,
      data: {
        "shelvesId": shelfId,
        "fabricId": fabricId
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
            index = ""
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "id": list[i].id, "name": list[i].batch, "count": list[i].num - list[i].lockNum, })
          }
          if (list.length == 1) {//如果只有一条数据
            place_list[currIndex].batch = { "index": "0", "selectList": selectList, 'id': list[0].id, 'name': list[0].batch, "count": list[0].num - list[0].lockNum}
          } else {
            place_list[currIndex].batch = { "index": "", "selectList": selectList, 'id': "", 'name': "", "count": "" }
          }

          that.setData({
            place_list: place_list
          })
          console.log(place_list)
        }
      }
    })
  },
  // 盘库批次picker
  bindBatchPickerChange: function (e) {
    var curIndex = e.target.dataset.current;
    var place_list = this.data.place_list;
    var val = e.detail.value;
    var selectList = place_list[curIndex].batch.selectList;
    console.log(val)
    place_list[curIndex].batch.index = val;
    place_list[curIndex].batch.id = selectList[val].id;
    place_list[curIndex].batch.name = selectList[val].name;
    place_list[curIndex].batch.count = selectList[val].count;
    this.setData({
      place_list: place_list
    })
  },
 
  // 获取原因列表
  getReason: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/reason/select";//接口地址

    wx.request({
      url: url,
      data: {
        "reasontype": 1 //入库2 盘库1
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
 
  
  
  // 限制输入数量和匹数
  limitVal:function(e){
    var val = e.detail.value;
    var limit=e.target.dataset.limit;
    if (!limit){
      wx.showToast({
        title: '请选择盘库批次！',
        icon:"none"
      })
      return ""
      }
    if (val > limit) { return limit }
  },
 
 
  // 盘库交接人picker
  bindPersonPickerChange: function (e) {
    var arr = this.data.person_arr;
    if (arr.length == 0) { return }
    var index = e.detail.value;
    var currentId = this.data.person_arr[index].id; // 这个id就是选中项的id
    this.setData({
      person_index: e.detail.value
    })
  },
  // 盘库原因picker
  bindReasonPickerChange: function (e) {
    var arr = this.data.reason_arr;
    if (arr.length == 0) { return }
    var index = e.detail.value;
    var currentId = this.data.reason_arr[index].id; // 这个id就是选中项的id
    this.setData({
      reason_index: e.detail.value
    })
  },
  // 获取入库位置（货架）
  getInPlace: function (token) {
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
            inShelfList: selectList
          })

        }
      }
    })
  },
  // 入库位置picker
  bindInShelfPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var curIndex = e.target.dataset.current;
    var vName = e.target.dataset.name;
    var inShelfList = this.data.inShelfList;

    var val = e.detail.value;
    console.log(inShelfList)
    this.setData({
      inShelvesIndex: val,//货架选择index
      inShelfName: inShelfList[val].name.split(" ")[0],
      inShelfId: inShelfList[val].value,
      
    })

  },



  
  
  // 改变数值
  changeValue: function (e) {
    var dataset = e.target.dataset,
      vName = dataset.name,
      index = dataset.index,
      val = e.detail.value,
      place_list = this.data.place_list;
    place_list[index][vName] = val;
    this.setData({
      place_list: place_list
    })
    console.log(place_list)
  },
  // 添加盘库表单
  insert: function () {
    var place = this.data.place_list;
    var currentTab = this.data.currentTab;
    // console.log(place.length);
   
    place.push({ "materialNum": "", "materialName": "", "materialIndex":"", "num": "", "batch": "", "outNum": "" });
    this.setData({
      place_list: place
    });
    
  },
  // 删除盘库表单
  delBind: function (e) {
    var index = e.currentTarget.dataset.index;
    var place = this.data.place_list;
    var l = place.length;
    
    // console.log(place);
    place.splice(index, 1)
   
    

    this.setData({
      place_list: place
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
    console.log( e.detail.value);
    var val = e.detail.value;
    var place_list = this.data.place_list,
      l = place_list.length;
    console.log(place_list)
    var warn = "";
    var flag = true;
    if (val.shelfId == "") {
      warn = "请选择存放位置"
      flag = false;
    } else if (l < 1) {
      warn = "请添加盘库信息"
      flag = false;
    }else if (val.person == "") {
      warn = "请选择盘库交接人"
      flag = false;
    } else if (val.reason == "") {
      warn = "请选择盘库原因"
      flag = false;
    }  else if (val.inShelfId =="") {
      warn = "请选择入库位置"
      flag = false;
    }
    for (var i = 0; i < l; i++) {
      if (place_list[i].materialIndex == "") {
        warn = "请选择原料编号"
        flag = false;
      } else if (place_list[i].num == "") {
        warn = "请输入出库数量"
        flag = false;
      } else if (place_list[i].batch.index == "") {
        warn = "请选择出库批次"
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
      this.postData(val, place_list)
    }
  },
  postData: function (data, place_list) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/move";//盘库接口地址
    console.log(data)
    var imgUrl = that.data.img_url;
    var shelvesList = [];
    for (var i = 0,l = place_list.length; i < l; i++) {

      var shelves = {
        "warehouseId": place_list[i].batch.id,
        "realNum": parseFloat(place_list[i].num),//出库数量
      }

      shelvesList.push(shelves)
    }

   
    wx.request({
      url: url,
      data: {
        "shelvesId": data.inShelfId,
        "updateBy": data.person,
        "reasonId": data.reason,
        "warehouse": shelvesList
      },
      header: {
        'content-type': 'application/json',
        'token': that.data.token
      },
      method: "POST",
      success: function (res) {
        console.log(res.data)
        var code = res.data.code;
        if (code == 0) {//提交成功
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000,
            success: function () {
              var warehouseList = that.data.warehouseList;
              for (var i = 0, l = place_list.length;i<l;i++){
                
                warehouseList.push({ materialNum: place_list[i].materialNum, count: place_list[i].num })
              }
                console.log(warehouseList)

                // 成功后跳转到success页面
                var warehouseInfo = { label: "盘库",unit:that.data.unit, inShelfName: data.inShelfName, shelfName: data.shelfName, numlabel: "原料", url: "../warehouseShift/warehouseShift", warehouse: warehouseList }
                wx.setStorageSync('warehouseInfo', warehouseInfo)
                wx.redirectTo({
                  url: '../success/success'
                })
            

            }

          })

        } else {
          
          app.exceptionHandle(data, "../login/login")
        }
      }
    })
  }
})  
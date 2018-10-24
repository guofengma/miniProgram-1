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
    //  货架
    shelfList: [],
    shelfIndexList: [],
    warehouseList: []
   
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
    //that.getClassify(token)//样品分类列表
    that.getFabric(token)//样品编号列表
    that.getReason(token)//原因列表
    that.getPerson(token)//领用人列表
    
    
    
  },
  onShow: function () {

  },
  // 查看货架量
  goShelves: function () {
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
        console.log(res)
        var result = JSON.parse(res.result);
        var id = result.id;
        console.log(id)
        that.getFabricInfo(id)
      }
    })
  },
  // 获取单个原料信息
  getFabricInfo: function (id) {
    var that = this;
    var url = app.globalData.servsers + "rz/fabric/info/" + id;//接口地址
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
          if (info.fabricDescribe == null) info.fabricDescribe = "/"
          that.setData({
            num: info.fabircNum,
            pName: info.fabricDescribe,
            fabricType: info.fabricType,
            fabricId: info.id,
          })
          that.getPlace(token)

        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 样品编号picker
  pickerSearch: function () {
    var selHidden = !this.data.selHidden;
    this.setData({
      selHidden: selHidden
    })
  },
  // 样品编号下拉选择
  selectNum: function (e) {
    console.log(e)
    var num = e.currentTarget.dataset.num;
    var name = e.currentTarget.dataset.name;
    var fabricType = e.currentTarget.dataset.fabrictype;
    var fabricId = e.currentTarget.dataset.id;
    var token = wx.getStorageSync("token");//获取token值
  

    this.setData({
      num: num,
      pName: name,
      fabricType: fabricType,
      fabricId: fabricId,
      selHidden: true,
      place_list:[]
     
      
    })
    this.getPlace(token)

  },
  // 样品编号搜索
  searchNum: function (e) {
    console.log(e)
    var val = e.detail.value.toLowerCase(),
      numArr = [],
      list = this.data.num_arr,
      l = list.length;
    for (var i = 0; i < l; i++) {
      var num = list[i].num.toLowerCase();
      console.log(num)
      if (num.indexOf(val) >= 0) {
        numArr.push(list[i]);
      }
    }
    var noDataHidden = numArr.length < 1 ? false : true;
    this.setData({
      num_arrSel: numArr,
      noDataHidden: noDataHidden
    })
  },
  // 隐藏样品编号下拉选择框
  hideSelList: function () {
    this.setData({
      selHidden: true
    })
  },
  // 获取样品分类
  // getClassify: function (token) {
  //   var that = this;
  //   var url = app.globalData.servsers + "kb/warehouse/sampleTypeList";//接口地址
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
  //           selectList.push({ "value": list[i].sampleType.id, "name": list[i].sampleType.typeName })
  //         }
  //         // console.log(selectList)
  //         that.setData({
  //           classify_arr: selectList
  //         })
  //       }
  //     }
  //   })
  // },
  // // 样品分类picker
  // bindClassifyPickerChange: function (e) {
  //   // console.log('picker发送选择改变，携带值为', e.detail.value)
  //   var token = wx.getStorageSync("token");//获取token值
  //   var index = e.detail.value;
  //   var currentId = this.data.classify_arr[index].value; // 这个id就是选中项的id
  //   this.setData({
  //     classify_index: e.detail.value,
  //     num_arr: [],
  //     num_index: "",
  //     sampleId:""
  //   })
  //   this.getFabric(token, currentId)
  // },
  // 获取面料列表
  getFabric: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/fabric";//接口地址
    wx.request({
      url: url,
      data: {
        "fabricType": 0//0所有
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
          var selectList = []
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "id": list[i].fabricId, "name": list[i].fabric.fabricDescribe, "num": list[i].fabric.fabircNum, "fabricType": list[i].fabric.fabricType })
          }
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

  // 样品编号编号picker
  // bindNumPickerChange: function (e) {
  //   // console.log('picker发送选择改变，携带值为', e.detail.value)
  //   var token = wx.getStorageSync("token");//获取token值
  //   var index = e.detail.value;
  //   var currentId = this.data.num_arr[index].id; // 这个id就是选中项的id
  //   console.log(currentId)
  //   this.setData({
  //     num_index: e.detail.value,
  //     sampleId: currentId
  //   })
  //   this.getPlace(token)
  // },
 
  // 获取原因列表
  getReason: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/reason/select";//接口地址

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
 
  // 获取仓库位置（货架）
  getPlace: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/shelves";//接口地址
    var fabricType = that.data.fabricType;//类型
    var fabricId = that.data.fabricId;//原料id
    
    wx.request({
      url: url,
      data: {
        "fabricTypeId": fabricType,
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
          var selectList = [];
          if (list.length<1){
            wx.showToast({
              title: '该原料没有库存！',
              icon:"none",
              mask:true
            })
          }
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "value": list[i].shelves.id, "name": list[i].shelves.row + list[i].shelves.height + list[i].shelves.line + " " + list[i].shelves.unit, "unit": list[i].shelves.unit })
          }
          
          that.setData({
            shelfList: selectList
          })

        }
      }
    })
  },
  // 获取批次列表
  getBatch: function (token, currIndex) {
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/batch";//接口地址
    var place_list = that.data.place_list;
    var fabricType = that.data.fabricType;//类型
    var fabricId = that.data.fabricId;//原料id
    var placeId = place_list[currIndex].shelvesId;//位置（货架id）
    
    wx.request({
      url: url,
      data: {
        "fabricTypeId": fabricType,
        "fabricId": fabricId,
        "shelvesId": placeId
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
            selectList.push({ "id": list[i].id, "name": list[i].batch, "count": list[i].num-list[i].lockNum,   })
          }
          if (list.length==1){//如果只有一条数据
            place_list[currIndex].batch = { "index": "0", "selectList": selectList, 'id': list[0].id, 'name': list[0].batch, "count": list[0].num-list[0].lockNum }
          }else{
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
  // 限制输入数量和匹数
  limitVal:function(e){
    var val = e.detail.value;
    var limit=e.target.dataset.limit;
    var id = e.target.dataset.id;
    var idx = e.target.dataset.index;
    
    var place_list = this.data.place_list;
    place_list.forEach((item,index)=>{
      // console.log(item.batch.id)
      if (id == item.batch.id && (index!==idx)){
        // console.log(index)
        // console.log(idx)
        // console.log(item.num)
        limit = limit -item.num
        
      }
    })
    
    if (limit == "" && limit!==0){
      wx.showToast({
        title: '请选择出库批次！',
        icon:"none"
      })
      return ""
      }
    if (val > limit) {
      wx.showToast({
        title: '出库数量不能超过存放量',
        icon: "none"
      })
       return limit
     }
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

  // 出库位置picker
  // bindPlacePickerChange: function (e) {
  //   var arr = this.data.place_arr;
  //   if (arr.length == 0) { return }
  //   var token = wx.getStorageSync("token");//获取token值
  //   var curIndex = e.target.dataset.current;
  //   this.data.place_arr[curIndex].index = e.detail.value;
  //   var currentId = this.data.placeData.option[e.detail.value].value;//位置id
  //   this.setData({
  //     place_arr: this.data.place_arr,
  //     place_id: currentId//位置id
  //   })
  //   this.getBatch(token, curIndex)//批次列表  
  // },
  // 出库位置picker
  bindshelfPickerChange: function (e) {
    var token = wx.getStorageSync("token");//获取token值
    var curIndex = e.target.dataset.current;
    var vName = e.target.dataset.name;
    var place_list = this.data.place_list,
      shelfList = this.data.shelfList;

    var val = e.detail.value;
    place_list[curIndex]["shelvesId"] = shelfList[val].value;//货架id
    place_list[curIndex]["shelvesIndex"] = e.detail.value;//货架选择index
    place_list[curIndex]["shelvesName"] = shelfList[val].name.split(" ")[0];//货架名称
    place_list[curIndex]["unit"] = shelfList[val].unit;//货架单位
    //place_list[curIndex]["freeSpace"] = shelfList[val].freeSpace;//货架剩余空间


    console.log(place_list)
    this.setData({
      place_list: place_list,
      place_id: shelfList[val].value//货架id
    });

    this.getBatch(token, curIndex)//批次列表 

  },
  // 出库批次picker
  bindBatchPickerChange: function (e) {
    var curIndex = e.target.dataset.current;
    var place_list = this.data.place_list;
    var val = e.detail.value;
    var selectList = place_list[curIndex].batch.selectList;
    console.log(curIndex)
    console.log(val)
    

    place_list[curIndex].batch.index = val;
    place_list[curIndex].batch.id = selectList[val].id;
    place_list[curIndex].batch.name = selectList[val].name;
    place_list[curIndex].batch.count = selectList[val].count;
   


    this.setData({
      place_list: place_list
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
  // 添加出库表单
  insert: function () {
    var num = this.data.num;
    if (num == "") {
      wx.showModal({
        title: '提示',
        content: "请先选择原料编号"
      })
      return;
    }
    var place = this.data.place_list;
    place.push({ "shelvesId": "", "num": "", "batch": "", "shelvesIndex": "", "shelvesName": "" });

    this.setData({
      place_list: place
    });
    
  },
  // 删除出库表单
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
    // console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var val = e.detail.value;
    var place_list = this.data.place_list,
      l = place_list.length;
    var warn = "";
    var flag = true;
    if (val.num == "") {
      warn = "请选择编号"
      flag = false;
    } else if (val.person == "") {
      warn = "请选择领用人"
      flag = false;
    } else if (val.reason == "") {
      warn = "请选择出库原因"
      flag = false;
    } else if (l < 1) {
      warn = "请添加出库信息"
      flag = false;
    }
    for (var i = 0; i < l; i++) {
      if (place_list[i].shelvesId == "") {
        warn = "请选择出库位置"
        flag = false;
      } else if (place_list[i].batch.index == "") {
        warn = "请选择出库批次"
        flag = false;
      }else if (place_list[i].num == "") {
        warn = "请输入出库数量"
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
    var url = app.globalData.servsers + "rz/warehouse/update";//出库接口地址
    console.log(data)
    var imgUrl = that.data.img_url;
    var shelvesList = [];
    for (var i = 0,l = place_list.length; i < l; i++) {

      var shelves = {
        "warehouseId": place_list[i].batch.id,//库存id,
        "num": parseFloat(place_list[i].num)//出库数量
      }

      shelvesList.push(shelves)
    }

   
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
                
                warehouseList.push({ placeName: place_list[i].shelvesName, count: place_list[i].num })
              }
                console.log(warehouseList)

                // 成功后跳转到success页面
                var warehouseInfo = { label: "出库", num: data.num, unit: place_list[0].unit, numlabel: "原料", sampleName: data.sampleName, url: "../warehouseOut/warehouseOut", warehouse: warehouseList }
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
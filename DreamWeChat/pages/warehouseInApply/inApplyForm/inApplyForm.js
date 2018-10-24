//获取应用实例
const app = getApp()

Page({
  data: {
    classify_arr: [ ],
    classify_index:"",
    mNum_arr: [],
    mNum_index: "",
    unit_arr: [],
    unit_index: "",
    reason_arr: [],
    reason_index: "",
    place_arr: [],
    place_index: "",
    img_arr: [],
    img_url: [],
    auto:false,
    page:1
  },
  onLoad:function(){
    var that=this,
        token = wx.getStorageSync("token");//获取token值
    that.setData({
      token: token
    })
    that.getClassify(token)//分类选项
    that.getReason(token)//原因选项
    that.getUnit(token)//单位选项
    
  },
  // 获取分类选项
  getClassify:function(token){
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/materielTypeSelect";//接口地址
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
          var selectList = []
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "id": list[i].materielTypeId, "name": list[i].materielType.typeName })
          }
          // console.log(selectList)
          that.setData({
            classify_arr: selectList
          })
        }
      }
    })
  },
  //分类picker
  classifyPicker: function (e) {
    var index = e.detail.value;
    var currentId = this.data.classify_arr[index].id, // 这个id就是选中项的id
        token = wx.getStorageSync("token");//获取token值
    this.setData({
      classify_index: e.detail.value,
      classify: currentId,
      mNum_index:"",
      mNum_arr:[]
    })
    this.getFabric(token,currentId)
  },
  // 获取物料编号列表
  getFabric: function (token, currentId) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var url = app.globalData.servsers + "rz/materiel/select";//接口地址selectApplet
    currentId = currentId == undefined ? "" : currentId;
  //  var  page=this.data.page
    wx.request({
      url: url,
      data: {
        "materielType": currentId,
        // "page":page,
        // "limit":300
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        
        console.log(code)
        if (code == 0) {

          var list = data.list;
          console.log(list)
          
          var selectList = []
          selectList.push({ "auto": true, "num": "手动输入","id":"" })
          for (var i = 0; i < list.length; i++) {
            var imgList = list[i].imgList;
            if (imgList){
              var img = imgList[0].imgUrl
            }else{
              var img = "/images/notUpload_sm.png"
            }
            selectList.push({ "id": list[i].id, "name": list[i].materielName, "num": list[i].materielNum + ' '+list[i].materielName, "materielType": list[i].materielType, "spec": list[i].spec, "unit": list[i].unitName,"img":img,"auto":false })
          }
          // page++
          that.setData({
            mNum_arr: selectList,
            // page:page
            // num_arrSel: selectList

          })
        } else {
          app.exceptionHandle(data, "../login/login")

        }

        wx.hideLoading()
      }
    })
  },
  //物料编号picker
  mNumPicker: function (e) {
    var index = e.detail.value;
    var currentId = this.data.mNum_arr[index].id; // 这个id就是选中项的id
    var auto = this.data.mNum_arr[index].auto;
    this.setData({
      mNum_index: e.detail.value,
      mNum: currentId,
      auto: auto
    })
  },
  // 获取原因选项
  getReason: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/reason/select";//接口地址
    wx.request({
      url: url,
      data: {
        "reasontype":1 //入库
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
            selectList.push({ "id": list[i].id, "name": list[i].reasonName })
          }
          // console.log(selectList)
          that.setData({
            reason_arr: selectList
          })
        }
      }
    })
  },
  //入库原因picker
  reasonPicker: function (e) {
    var index = e.detail.value;
    var currentId = this.data.reason_arr[index].id; // 这个id就是选中项的id
    this.setData({
      reason_index: e.detail.value,
      reason: currentId
    })
  },
  // 获取领用单位选项
  getUnit: function (token) {
    var that = this;
    var url = app.globalData.servsers + "rz/unit/select";//接口地址
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
          var selectList = []
          for (var i = 0; i < list.length; i++) {
            selectList.push({ "id": list[i].id, "name": list[i].unitName })
          }
          // console.log(selectList)
          that.setData({
            unit_arr: selectList
          })
        }
      }
    })
  },
  //领用单位picker
  unitPicker: function (e) {
    var index = e.detail.value;
    var currentId = this.data.unit_arr[index].id; // 这个id就是选中项的id
    this.setData({
      unit_index: e.detail.value,
      unit: currentId
    })
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
  // 提交表单
  formSubmit: function (e) {
    var val = e.detail.value;
    var warn = "";
    var flag = true;
    var auto=this.data.auto;
    console.log(val)

    
    if (val.classifyId == "") {
      warn = "请选择分类"
      flag = false;
    } else if (val.mNum == "") {
      warn = "请选择物料编号"
      flag = false;
    } else if (val.reasonId == "") {
      warn = "请选择入库原因"
      flag = false;
    } else if (val.numIn == "" || val.numIn==0) {
      warn = "请输入入库数量"
      flag = false;
    } 
    if(auto){
      if (val.materielNum == "") {
        warn = "请输入物料编号"
        flag = false;
      } else if (val.materielName == "") {
        warn = "请输入物料名称"
        flag = false;
      } else if (val.unitId == "") {
        warn = "请选择领用单位"
        flag = false;
      } 
    }

    if (!flag) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    } else {
       this.postData(val)

    }

  },
  postData: function (data) {
    wx.showLoading({
      title: '上传中',
      icon: "none",
      mask: true
    })
    console.log(data);
    var that = this;
    var url = app.globalData.servsers + "rz/warehouse/apply";//入库接口地址
    var imgUrl = that.data.img_url;
    console.log(imgUrl)
    var params = {
      "warehouseApplyForm": {
        "materielTypeId": data.classifyId,
        "materielId": data.mNumId,
        "reasonId": data.reasonId,
        "num": data.numIn
      },
      "materielFrom": {
        "materielNum": data.materielNum,
        "materielType": data.classifyId,
        "materielName": data.materielName,
        "price": data.materielPrice,
        "unitId": data.unitId,
        "spec": data.materielSpec,
        "partnerName": data.partnerName,
        "imgUrl": imgUrl
      }
    }
    console.log(params)
    wx.request({
      url: url,
      data: params,
      methond: "POST",
      header: {
        'content-type': 'application/json',
        'token': that.data.token
      },
      method: "POST",
      success: function (res) {
        // console.log(res.data)
        wx.hideLoading()
        var code = res.data.code;
        console.log();
        if (code == 0) {//提交成功
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.setData({
            page: 1,
            msgList: [],
            scrollTop: 0
          })
           prePage.getList(prePage)
          // end刷新上一页数据
          wx.navigateBack({
            delta: 1
          })

        } else {
          app.exceptionHandle(res.data, "../../login/login")
        }
      }
    })
  },
  imgError: function (e) {
    console.log(e)
    var index = e.target.dataset.index;
    var mNum_arr = this.data.mNum_arr;
    mNum_arr[index]["img"] = "/images/errImg.png"
    this.setData({
      mNum_arr: mNum_arr
    })
  },
  // 预览图片
  previewListImg(e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  }

})  
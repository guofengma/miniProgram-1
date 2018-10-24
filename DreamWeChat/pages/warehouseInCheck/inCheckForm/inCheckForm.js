//获取应用实例
const app = getApp()

Page({
  data: {
    classify_arr: [ ],
    classify_index:"",
    mNum_arr: [],
    mNum_index: "",
    reason_arr: [],
    reason_index: "",
    place_arr: [],
    place_index: "",
    materiel:""
  },
  onLoad:function(){
    var materiel= wx.getStorageSync("materiel")//物料信息
    console.log(materiel)
    this.setData({
      materiel: materiel
    })
    this.getDefaultShelf()
    this.getShelves()

  },
  // 获取默认入库位置
  getDefaultShelf: function () {
    var that = this;
    var token = wx.getStorageSync("token")
    var url = app.globalData.servsers + "rz/warehouse/shelvesSelect";//接口地址
    var materielId = that.data.materiel.materiel.id;
    wx.request({
      url: url,
      data: {
        'materielId': materielId
      },
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 0) {
          var list = res.data.list;
          var shelves = list[0].shelves
         
          that.setData({
            place: shelves.id,
            placeName: shelves.shelvesName
          })
        }
      }
    })
  },
  // 获取入库位置
  getShelves: function () {
    var that = this;
    var token=wx.getStorageSync("token")
    var url = app.globalData.servsers + "rz/shelves/select";//接口地址
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
            selectList.push({ "id": list[i].id, "name": list[i].shelvesName })
          }
          // console.log(selectList)
          that.setData({
            place_arr: selectList
          })
        }
      }
    })
  },
  //入库位置picker
  placePicker: function (e) {
    var index = e.detail.value;
    var currentId = this.data.place_arr[index].id; // 这个id就是选中项的id
    this.setData({
      place_index: e.detail.value,
      place: currentId,
      placeName: this.data.place_arr[index].name
    })
  },
  // 提交表单
  formSubmit: function (e) {
    var val = e.detail.value;
    var warn = "";
    var flag = true;
    console.log(val)


    if (val.placeId == "") {
      warn = "请选择入库位置"
      flag = false;
    } else if (val.numIn == "") {
      warn = "请输入入库数量"
      flag = false;
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
    var url = app.globalData.servsers + "rz/warehouse/save";
    var token=wx.getStorageSync("token")
    var applyId = that.data.materiel.realId;

    wx.request({
      url: url,
      data: {
        "applyId": applyId,
        "status": 1,
        "num": data.numIn,
        "shelvesId": data.placeId,
        "remarks": data.remarks
      },
      methond: "POST",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      method: "POST",
      success: function (res) {
        // console.log(res.data)
        wx.hideLoading()
        var code = res.data.code;
        if (code == 0) {//提交成功
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.setData({
            page: 1,
            msgList: [],
            scrollTop: 40
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
  }

})  
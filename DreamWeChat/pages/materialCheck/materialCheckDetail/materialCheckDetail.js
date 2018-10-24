//获取应用实例
const app = getApp()

Page({
  data: {
    info: "",
    applyId:"",
    showAgreeModal: {
      showModal: 'hideModal',
      showMask: 'hideMask',
    },
    showDisagreeModal: {
      showModal: 'hideModal',
      showMask: 'hideMask',
    },
    personIndex:"",
    personArray:["小明","Allen"]
  },
  onLoad: function (options) {
    var id = options.id;
    console.log(id)
    this.setData({
      applyId:id
    })
    this.getList(id)
    this.getPerson();
  },
  getList: function (id) {
    var that = this;
    var url = app.globalData.servsers + "rz/apply/info/" + id;
    var token = wx.getStorageSync("token");//获取token值

    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',// 默认值
        "token": token
      },
      success: function (res) {
        var data = res.data;
        console.log(data)
        if (data.code == 0) {
          that.dataProcessing(data)
        } else {
          app.exceptionHandle(data, "../../login/login")
        }

      }
    })
  },
  dataProcessing: function (data) {
    var data = data.data;

    // 图片
    var applyMaterialList = data.applyMaterialList,
      l = applyMaterialList.length;
    for (var i = 0; i < l; i++) {
      var imgList = applyMaterialList[i].materielImgList;
      if (imgList == null || imgList.length < 1) {
        applyMaterialList[i].img = "/images/notUpload_sm.png"
      } else {
        applyMaterialList[i].img = imgList[0].imgUrl
      }
    }


    this.setData({
      info: data
    })
  },
  // 打开模态框
  showModal:function(e){
    var dataset=e.currentTarget.dataset,
        status=dataset.status;
    if(status==1){
      this.setData({
        showAgreeModal:{
          showModal: 'showModal',
          showMask: 'showMask',
        }
      })
    }else{
      this.setData({
        showDisagreeModal: {
          showModal: 'showModal',
          showMask: 'showMask',
        }
      })
    }
  },
  // 关闭模态框
  hideModal: function (e) {
    var dataset = e.currentTarget.dataset,
      status = dataset.status;
    if (status == 1) {
      this.setData({
        showAgreeModal: {
          showModal: 'hideModal',
          showMask: 'hideMask',
        }
      })
    } else {
      this.setData({
        showDisagreeModal: {
          showModal: 'hideModal',
          showMask: 'hideMask',
        }
      })
    }
  },
  // 获取物料负责人选项
  getPerson: function () {
    var that = this;
    var token = wx.getStorageSync("token")
    var url = app.globalData.servsers + "sys/user/selectByRole";//接口地址
    wx.request({
      url: url,
      data: {
      "roleids":4 //仓库操作员的角色id
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
            selectList.push({ "id": list[i].userId, "name": list[i].realName })
          }
          // console.log(selectList)
          that.setData({
            personArray: selectList
          })
        }
      }
    })
  },
  // 物料负责人选择
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      personIndex: e.detail.value
    })
  },
  // 同意表单提交
  formSubmitAgree:function(e){
      console.log(e)
      var that=this,
        applyId = that.data.applyId;//申请id
      var userId = e.detail.value.personId;//仓库负责人id
      
      if (userId==""){
        wx.showToast({
          title: '请选择负责人',
          icon:"none"
        })
        return
        
      }

      var url = app.globalData.servsers + "rz/apply/agree";
      var token = wx.getStorageSync("token")
      wx.showLoading({
        title: '上传中',
        icon: "none",
        mask: true
      })
      wx.request({
        url: url,
        data: {
          "applyId": applyId,
          "userId": userId,
        },
        methond: "GET",
        header: {
          'content-type': 'application/json',
          'token': token
        },
        success: function (res) {
          // console.log(res.data)
          var code = res.data.code;
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
          wx.hideLoading()
        }
      })

    
  },
  // 拒绝表单提交
  formSubmitDisagree: function (e) {
    console.log(e)
    var that = this,
      applyId = that.data.applyId;

    var url = app.globalData.servsers + "rz/apply/reject";
    var token = wx.getStorageSync("token")
    var remarks=e.detail.value.remarks;

    if (remarks == "") {
      wx.showToast({
        title: '请输入备注',
        icon: "none"
      })
      return
    }
    wx.showLoading({
      title: '上传中',
      icon: "none",
      mask: true
    })
    wx.request({
      url: url,
      data: {
        "applyId": applyId,
        "remarks": remarks,
      },
      methond: "GET",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
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
        wx.hideLoading()
      }
    })
      
  },
  imgError: function (e) {
    var that = this;
    app.imgError2(e, that)
  },
  // 预览图片
  previewImg(e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  }
})  
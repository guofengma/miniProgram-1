//获取应用实例
const app = getApp()

Page({
  data: {
    list:[],
    showModal: {
      showModal: 'hideModal',
      showMask: 'hideMask',
    },
  },
  onLoad:function(options){
    var id = options.id;
    console.log(id)
    this.setData({
      applyId: id
    })
    this.getList(id)
    this.getReason()
  },

  // 获取数据
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
      applyMaterialList[i].realId = applyMaterialList[i].id
      applyMaterialList[i].id = 'id-' + i + 1;
      // 数量
      applyMaterialList[i].returnNum = applyMaterialList[i].realNum;
      // 图片
      var imgList = applyMaterialList[i].materielImgList;
      if (imgList == null || imgList.length < 1) {
        applyMaterialList[i].img = "/images/notUpload_sm.png"
      } else {
        applyMaterialList[i].img = imgList[0].imgUrl
      }

      var status = applyMaterialList[i].status;
      if (status == 0) {
        this.setData({
          ready: false
        })
      }

    }


    this.setData({
      info: data,
      list: data.applyMaterialList
    })
  },
  /* 点击减号 */
  bindMinus: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.list;
    var num = list[index].returnNum;
    var maxNum = list[index].realNum;//最大值
    
    if (num == undefined) num = 0
    // 如果大于1时，才可以减  
    if (num > 0) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    var plusStatus = num >= maxNum ? 'disabled' : 'normal';
    

    list[index].returnNum = Number(num)
    list[index].minusStatus = minusStatus
    list[index].plusStatus = plusStatus;

    if (!list[index].reasonId) {
      this.setData({
        showModal: {
          showModal: 'showModal',
          showMask: 'showMask',
        },
        listIndex:index
      })
    }

    // 将数值与状态写回  
    this.setData({
      list: list
    });
  },
  /* 点击加号 */
  bindPlus: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.list;
    var num = list[index].returnNum;
    
    var maxNum = list[index].realNum;//最大值
    
    if (num == undefined) num = 0
    // 不作过多考虑自增1
    if (num < maxNum){
      num++;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态 
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    var plusStatus = num >= maxNum ? 'disabled' : 'normal';
    
    list[index].returnNum = Number(num)
    list[index].minusStatus = minusStatus;
    list[index].plusStatus = plusStatus;
    
    // 将数值与状态写回  
    this.setData({
      list: list
    });

  },
  /* 输入框事件 */
  bindManual: function (e) {
    var val = Number(e.detail.value).toFixed(2);
    var index = e.currentTarget.dataset.index;
    var parent = e.currentTarget.dataset.parent;
    var list = this.data.list;
    var num = list[index].returnNum;
    var realNum = list[index].realNum;
    
    if (num == undefined) num = 0

    list[index].returnNum = Number(val)
    if (realNum > val && !list[index].reasonId){
      this.setData({
        showModal: {
          showModal: 'showModal',
          showMask: 'showMask',
        },
        listIndex: index
      })
    }

    
   
    if (val == 0) { return 0 }
    // 将数值与状态写回  
    this.setData({
      list: list
    });

  },
  // 提交
  formSubmit:function(e){
    var that=this;
    wx.showModal({
      title: '提示',
      content: '是否确认归还？',
      success:function(res){

        if (res.confirm) {
          that.postData()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
        
      },

    })

     
  },
  postData:function(){
    var that = this,
      applyId = that.data.applyId,//申请id
      list = that.data.list,
      materielList = [];
    console.log(list)
    for (var i = 0, l = list.length; i < l; i++) {
      materielList.push({
        "applyMaterielId": list[i].applyMaterialId,
        "backNum": list[i].returnNum,
        "reasonId": list[i].reasonId||""
      })
    }
    console.log(materielList)
    var url = app.globalData.servsers + "rz/apply/back";
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
        "materielList": materielList
      },
      method: "POST",
      header: {
        'content-type': 'application/json',
        'token': token
      },
      success: function (res) {
        // console.log(res.data)
        wx.hideLoading()
        var code = res.data.code;
        if (code == 0) {//提交成功
        wx.showToast({
          title: '归还成功',
          duration:1500,
          success:function(){
           
          }
        })

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
    var that = this;
    app.imgError(e, that)
  },
  // 预览图片
  previewImg(e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    app.previewListImg(url)
  },
  hideModal: function (e) {
    this.setData({
      showModal: {
        showModal: 'hideModal',
        showMask: 'hideMask',
      }
     
    })
  },
  // 获取原因选项
  getReason: function () {
    var that = this;
    var token = wx.getStorageSync("token")
    var url = app.globalData.servsers + "rz/reason/select";//接口地址
    wx.request({
      url: url,
      data: {
        "reasontype": 3 //	原因类型。1-入库，2-盘库，3-损耗
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
  //损耗原因picker
  reasonPicker: function (e) {
    var index = e.detail.value;
    var reasonId = this.data.reason_arr[index].id; // 这个id就是选中项的id
    var reasonName = this.data.reason_arr[index].name; // 这个id就是选中项的id

    var listIndex = this.data.listIndex;
    var list = this.data.list;
    list[listIndex].reasonId = reasonId
    list[listIndex].reasonName = reasonName
    
    this.setData({
      reason_index: e.detail.value,
      reasonId: reasonId,
      reasonName: reasonName,
      list: list,
    })
    this.hideModal()


  },
 

  
})  
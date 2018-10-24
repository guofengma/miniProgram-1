//获取应用实例
const app = getApp()
// dy / reason / select ? reasontype = 4
Page({
  data: {
    inferiorOpinion_arr: [],
    inferiorOpinion_index: '',
    destroyOpinion_arr: [],
    destroyOpinion_index: '',
    inferiorList:[],
    destroyList: [],
    inferiorBtn:"添加",
    destroyBtn: "添加",
    acceptance: { boltOut: "", inferiorBolt: "", destroyBolt:""},
    boltLimit:"",
    numLimit:"",
    bolt:0,
    diffBolt:0
    
  },
  onLoad:function(){
    var boltLimit=wx.getStorageSync("bolt");
    var numLimit=wx.getStorageSync("num");
    var unit = wx.getStorageSync("unit");
    
      this.setData({
        boltLimit: boltLimit,
        numLimit: numLimit,
        unit:unit
      })
    this.getReason();

  },
  // 获取意见列表
  getReason: function () {
    var that = this;
    var url = app.globalData.servsers + "dy/reason/select";//接口地址
    var token = wx.getStorageSync("token")
    wx.request({
      url: url,
      data: {
        "reasontype": 4  
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
            inferiorOpinion_arr: selectList,
            destroyOpinion_arr: selectList
            
          })
        }
      }
    })
  },
  // 计算匹数
  calcBolt:function(e){
    var val=Number(e.detail.value),
        name=e.target.dataset.name,
      acceptance = this.data.acceptance,
      boltLimit = this.data.boltLimit,
      diffBolt=this.data.diffBolt,
      bolt = this.data.bolt;
    acceptance[name] = val;
    console.log(e) 
    bolt = acceptance.boltOut + acceptance.inferiorBolt + acceptance.destroyBolt;
    diffBolt = boltLimit - bolt;
    this.setData({
      acceptance: acceptance,
      bolt: bolt,
      diffBolt: diffBolt
    })

  },
  // 添加次品信息
  addInferiorInfo:function(e){
    var inferiorList = this.data.inferiorList;
    var inferiorBtn = this.data.inferiorBtn;
    if (inferiorList.length>0){
      inferiorList=[];
      inferiorBtn="添加"
    }else{
      inferiorList = [0];
      inferiorBtn = "删除"
    }
    this.setData({
      inferiorList: inferiorList,
      inferiorBtn: inferiorBtn
    })
  },
  // 添加损坏信息
  addDestroyInfo: function (e) {
    var destroyList = this.data.destroyList;
    var destroyBtn = this.data.destroyBtn;
    if (destroyList.length > 0) {
      destroyList = [];
      destroyBtn = "添加"
    } else {
      destroyList = [0];
      destroyBtn = "删除"
    }
    this.setData({
      destroyList: destroyList,
      destroyBtn: destroyBtn
    })
  },
  // 次品意见
  bindInferiorOpinionPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var index = e.detail.value;
    var currentId = this.data.inferiorOpinion_arr[index].id; // 这个id就是选中项的id
    this.setData({
      inferiorOpinion_index: e.detail.value
    })
  },
  // 损坏意见
  bindDestroyOpinionPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var index = e.detail.value;
    var currentId = this.data.destroyOpinion_arr[index].id; // 这个id就是选中项的id
    this.setData({
      destroyOpinion_index: e.detail.value
    })
  },
  formSubmit:function(e){
    var val = e.detail.value;
    var dyeid = wx.getStorageSync("vatId")
    var url = app.globalData.servsers + "dy/orders/checkDye";
    var token = wx.getStorageSync("token");//获取token值
    console.log(val)
   
      var flag = true;
      var warn = "";
      if (val.boltOut == "") {
        warn = "请输入成品匹数";
        flag = false;
      } else if (val.numOut == "") {
        warn = "请输入成品数量";
        flag = false;
      } else if (val.inferiorBolt == "") {
        warn = "请输入次品匹数";
        flag = false;
      } else if (val.inferiorNum == "") {
        warn = "请输入次品数量";
        flag = false;
      } else if (val.inferiorReason == "") {
        warn = "请输入次品描述";
        flag = false;
      } else if (val.inferiorOpinion == "") {
        warn = "请选择次品处理意见";
        flag = false;
      } else if (val.destroyBolt == "") {
        warn = "请输入次品匹数";
        flag = false;
      } else if (val.destroyNum == "") {
        warn = "请输入次品数量";
        flag = false;
      } else if (val.destroyReason == "") {
        warn = "请输入次品描述";
        flag = false;
      } else if (val.destroyOpinion == "") {
        warn = "请选择次品处理意见";
        flag = false;
      }

      var params = {
        "dyeid": dyeid,
        "boltOut": val.boltOut,
        "numOut": val.numOut,
        "inferiorBolt": val.inferiorBolt || 0,
        "inferiorNum": val.inferiorNum || 0,
        "inferiorRemarks": val.inferiorReason,
        "inferiorReason": val.inferiorOpinion,
        "wasteNum": val.destroyNum || 0,
        "wasteBolt": val.destroyBolt || 0,
        "wasteRemarks": val.destroyReason,
        "wasteReason": val.destroyOpinion
      }
      console.log(params)
      // var boltSum = Number(params.boltOut) + Number(params.inferiorBolt) + Number(params.wasteBolt);
      // var numSum = Number(params.numOut) + Number(params.inferiorNum) + Number(params.wasteNum);
      // var boltLimit=wx.getStorageSync("bolt");
      // var numLimit=wx.getStorageSync("num");
      // console.log(boltSum)
      // if ((boltSum > boltLimit) || (numSum > numLimit)){
      //   flag=false;
      //   warn="匹数和数量不能超过总匹数和总数量"
      // }
      if (!flag) {
        wx.showModal({
          title: '提示',
          content: warn
        })
      } else {
        wx.request({
          url: url,
          data: params,
          method: "POST",
          header: {
            'content-type': 'application/json', // 默认值
            "token": token
          },
          success: function (res) {
            var data = res.data;
            console.log(data)
            if (data.code == 0) {
              wx.showToast({
                title: '提交成功',
                icon: 'success',
                duration: 1000

              });
              // 刷新上一页数据
              var pages = getCurrentPages();
              var prePage = pages[pages.length - 2];
              
              prePage.setData({
                page: 1,
                list: [],
                scrollTop:0
              })
              // prePage.getList(prePage)
        // end刷新上一页数据
              wx.navigateBack({
                delta:1
              })
             
            } else {
              app.exceptionHandle(data, "../../login/login")
            }

          }
        });
      }
  }
})  
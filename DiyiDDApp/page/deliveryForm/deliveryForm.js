import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      imgSrc: [],
      modalShow:false,
      deliveryInfo:{},//发货信息
      confirmInfo:{},//确认信息
      form:{
        licensePlateNumber:"",
        remarks:"",
        amount:"",
        logistics:""
      }
    },
    onLoad(){
      var _this = this;
      var deliveryInfo = dd.getStorageSync({ key: 'deliveryInfo' }).data.info;
      console.log(deliveryInfo)
      var fabricNames=[]
      deliveryInfo.detail.forEach(item=>{
        var fabricName = item.spec + " " + item.color + " " +item.fabricName
        fabricNames.push(fabricName)
      })
      fabricNames = app.distinct(fabricNames)
      deliveryInfo.fabricNames = fabricNames
      console.log(deliveryInfo)
      
      _this.setData({
        deliveryInfo: deliveryInfo
      })      
    },
    onShow(){
      var _this = this;
      _this.init()
    },
    init:function(){
      this.setData({
        form: {
          licensePlateNumber: "",
          remarks: "",
          amount: "",
          logistics: ""
        }
      })
    },
  onInput:function(e){
    var name=e.currentTarget.dataset.name
    var val=e.detail.value
    var form=this.data.form
    form[name]=val
    this.setData({
      form:form
    })
  },
  onBlur: function(e) {
    console.log("onBlur", e.detail.value)
  },
  // 选择图片
  choseImg: function() {
    var _this = this
    
    app.choseImg(_this)
  },
  // 预览图片
  previewImage: function(e) {
    var dataset = e.currentTarget.dataset
    var index = dataset.index
    var type = dataset.type
    if (type == 1) {
      var imgSrc = this.data.imgSrc
    } else {
      var imgSrc = dataset.list
    }
    dd.previewImage({
      current: index,
      urls: imgSrc,
    });
  },
  // 删除图片
  deleteImage: function(e) {
    console.log(e)
    var index = e.currentTarget.dataset.index
    var imgSrc = this.data.imgSrc
    imgSrc.splice(index, 1)
    this.setData({
      imgSrc: imgSrc
    })
  },
  hideModal:function(){
    this.setData({
      modalShow:false
    })
  },
  // 保存表单
  saveForm: function(e) {
    var _this = this
    var value = e.detail.value
    var deliveryInfo=_this.data.deliveryInfo
    console.log(value)
    var flag = true
    var msg = ""
    if (value.amount=="") {
      flag = false
      msg = "请输入包数"
    } else if (value.logistics == "") {
      flag = false
      msg = "请输入物流信息"
    }

    if (!flag) {
      dd.showToast({
        type: 'warn',
        content: msg,
        duration: 2000,
        success: () => {

        },
      });
    } else {
      
      var imgSrc = _this.data.imgSrc
      value.amount=Number(value.amount)
      value.image=imgSrc
      value.shipmentsId = deliveryInfo.id
      console.log(value)
      _this.setData({
        modalShow: true,
        confirmInfo:value
      })
     // _this.confirmDeliver(value)
    }

  },
  confirmDeliver: function() {
   
    var _this = this;
    var data =_this.data.confirmInfo
      console.log(data)
    var url = app.globalData.servsers + "/shipments/shipments/confirm"
    var method = "post"
    dd.showLoading({
      content: '上传中...'
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          dd.showToast({
            type: 'success',
            content: "上传成功",
            duration: 2000,
            success: () => {
              // 刷新上一页数据
              // var pages = getCurrentPages();
              // var prePage = pages[pages.length - 3];
              // prePage.init()
              // prePage.getList()
              // end刷新上一页数据
              dd.navigateBack({
                delta: 2
              })

            },
          });

        } else {
          exceptionHandle(res.data)
        }

      }
    })

  }
})
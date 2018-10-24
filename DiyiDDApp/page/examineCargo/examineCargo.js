import { DDhttpRequest, exceptionHandle } from '../../util/request';
let app = getApp();

Page({
  data: {
    formData: {
      fabricOqaId: "",
      weight: {//克重
        status: 1,
        remarks: ""
      },
      width: {//门幅
        status: 1,
        remarks: ""
      },
      handle: 1,//手感
      elastica: 1,//弹力
      verticalShrink:1,//竖向缩水
      transverseShrink: 1,//横向缩水
      colorFateness: 1,//色牢度
      others:[]//其他情况
      
      
    },
    reasonSelect:[],//原因选项
    imgObj:{
      colorImg_40:"",//色牢度40°测试温度图片
      colorImg_90: "",//色牢度90°测试温度图片
      reportImg: [],//验货报告图片
      imgSrc:[]//特殊备注图片
    },


  },
  onLoad(options) {
    var _this = this;
    _this.init()
    // 修改页面标题
    dd.setNavigationBar({
      title: options.title
    })
    var id = options.id
    var type = options.type//2--染缸过来的面料 1--入库管理进入的面料
    var formData = _this.data.formData
    formData.fabricOqaId = Number(id)
    _this.setData({
      formData: formData,
      title: options.title,
      type: type
    })
    _this.getReasonSelect()//其他情况选项
  },
  init:function(){
    this.setData({
      formData: {
        fabricOqaId: "",
        weight: {//克重
          status: 1,
          remarks: ""
        },
        width: {//门幅
          status: 1,
          remarks: ""
        },
        handle: 1,//手感
        elastica: 1,//弹力
        verticalShrink: 1,//竖向缩水
        transverseShrink: 1,//横向缩水
        colorFateness: 1,//色牢度
        others: []//其他情况


      },
      imgObj: {
        colorImg_40: "",//色牢度40°测试温度图片
        colorImg_90: "",//色牢度90°测试温度图片
        reportImg: [],//验货报告图片
        imgSrc: []//特殊备注图片
      },

    })
  },
  // 直接进入入库界面
  toWarehouseIn:function(){
    var title=this.data.title
    var id = this.data.formData.fabricOqaId
    var type=this.data.type
    dd.navigateTo({
      url: '../warehouseInOne/warehouseInOne?title=' + title + '&id=' + id + '&status=' + 2 + '&type=' + type//入库表单页
    })
  },
  // 选择（单选）
  choseValue(e) {
    var dataset = e.currentTarget.dataset
    var name = dataset.name
    var value = Number(dataset.value)
    var formData = this.data.formData

    if (name == "weight" || name == "width") {
      formData[name].status = value
    } else {
      formData[name] = value
    }
    this.setData({
      formData: formData
    })
  },
  // 选择其他情况（多选）
  multiChoseValue(e) {
    var dataset = e.currentTarget.dataset
    var name = dataset.name
    var value = Number(dataset.value)
    var formData = this.data.formData
    var valueList=formData[name]
    if (valueList.indexOf(value)==-1){
      formData[name].push(value)
    }else{
      var i=""
      valueList.forEach((item,index)=>{
        if(item==value){
          i=index
        }
      })
      valueList.splice(i,1)
    }
    this.setData({
      formData: formData
    })
  },
  // 输入实际值
  setValue: function(e) {
    var dataset = e.currentTarget.dataset
    var name = dataset.name
    var value = e.detail.value
    var formData = this.data.formData
    formData[name].remarks = value
    this.setData({
      formData: formData
    })
  },
  // 选择图片
  choseImg: function(e) {
    var _this = this
    var name=e.currentTarget.dataset.name
    var count = e.currentTarget.dataset.count
    
    app.choseImg(_this, count,name)
  },
  // 预览图片
  previewImage: function(e) {
    var dataset = e.currentTarget.dataset
    var index = dataset.index
    var type = dataset.type
    var name=dataset.name
    var imgObj=this.data.imgObj
    var imgSrc=[]
    if (type == 1) {
      imgSrc = dataset.list
    } else if(type==2){
      imgSrc.push(imgObj[name])
      index=0
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
    var imgObj = this.data.imgObj
    var name = e.currentTarget.dataset.name
    imgObj[name].splice(index, 1)
    this.setData({
      imgObj: imgObj
    })
  },
  // 删除单张图片
  deleteImageOne:function(e){
    console.log(e)
    var name = e.currentTarget.dataset.name
    var imgObj = this.data.imgObj
    imgObj[name]=""
    this.setData({
      imgObj: imgObj
    })
  },
  // 保存表单
  saveForm: function(e) {
    var _this = this
    var value = e.detail.value
    var formData = _this.data.formData
    var imgObj = _this.data.imgObj
    
    console.log(value)
    console.log(formData)
    var flag = true
    var msg = ""
    if (formData.weight.status !== 1 && formData.weight.remarks == "") {
      flag = false
      msg = "请选择输入实际克重"
    } else if (formData.width.status !== 1 && formData.width.remarks == "") {
      flag = false
      msg = "请选择输入实际门幅"
    } else if (imgObj.reportImg.length<1){
      flag = false
      msg = "请上传验货报告"
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
      var data = formData
      data.remarks = value.remarks
      data.img = imgObj.imgSrc
      data.report = imgObj.reportImg
      data.img40 = imgObj.colorImg_40
      data.img90 = imgObj.colorImg_90
      _this.postData(data)
    }

  },
  postData: function(data) {
    console.log(data)
    var _this = this;
    var url = app.globalData.servsers + "/dy/dyfabricoqadetail/check"
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
              // 进入入库表单页
              var title = _this.data.title
              var type = _this.data.type
              var id = _this.data.formData.fabricOqaId
              dd.navigateTo({
                url: '../warehouseInOne/warehouseInOne?title=' + title + '&id=' + id + '&status=' + 1 + '&type=' + type//入库表单页
              })

            },
          });

        } else {
          exceptionHandle(res.data)
        }

      }
    })

  },
  // 获取其他情况选项
  getReasonSelect: function() {
    var _this = this
    var fabricForm = _this.data.fabricForm
    var url = app.globalData.servsers + "/dy/reason/select"
    var method = "get"
    var data = {
      "reasontype": 5  //原因类型。1-出库，2-入库，3-盘库，4-处理意见,5-成检情况
    }
    dd.showLoading({
      content: '加载中'
    });
    DDhttpRequest({
      url, method, data,
      success(res) {
        var data = res.data;
        if (data.code == 0) {
          var list = data.list
          list.forEach(item => {
            item.reason = item.reasonName
          })
          _this.setData({
            reasonSelect: list
          })
        } else {
          exceptionHandle(res.data)
        }
      }
    })
  },

})
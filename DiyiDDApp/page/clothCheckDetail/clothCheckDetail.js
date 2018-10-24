import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      formData:{
        warehouseId:"",
        weight: {//克重
          status: 1,
          remarks: ""
        },
        width: {//门幅
          status: 1,
          remarks: ""
        },
        clean: 1, //清洁度
        elastica:1,//弹力
        handFeeling:1,//手感
        woolFeel:1,//毛感
        density: 1,//密度
        thickness: 1,//厚度
        needleMark:1,//针路
        rung:1,//横档
        quality:1,//品质评定
      },
      imgSrc: []
      
      
    },
    onLoad(options){
      var _this = this;
      _this.init()
      // 修改页面标题
      dd.setNavigationBar({
        title: options.title
      })
      var id = options.id
      var formData=_this.data.formData
      formData.warehouseId=id 
      _this.setData({
        formData: formData
      })
    },
    init:function(){
      this.setData({
        formData: {
          warehouseId: "",
          weight: {//克重
            status: 1,
            remarks: ""
          },
          width: {//门幅
            status: 1,
            remarks: ""
          },
          clean: 1, //清洁度
          elastica: 1,//弹力
          handFeeling: 1,//手感
          woolFeel: 1,//毛感
          density: 1,//密度
          thickness: 1,//厚度
          needleMark: 1,//针路
          rung: 1,//横档
          quality: 1,//品质评定
        },
        imgSrc: []
      })
    },
    // 选择
    choseValue(e){
      var dataset = e.currentTarget.dataset
      var name=dataset.name
      var value=Number(dataset.value)
      var formData=this.data.formData
      
      if (name == "weight" || name =="width"){
        formData[name].status=value
      }else{
        formData[name]= value
      }
      this.setData({
        formData: formData
      })
    },
    // 输入实际值
    setValue:function(e){
      var dataset = e.currentTarget.dataset
      var name = dataset.name
      var value=e.detail.value
      var formData = this.data.formData
      formData[name].remarks = value
      this.setData({
        formData: formData
      })
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
  // 保存表单
  saveForm:function(e){
    var _this=this
    var value=e.detail.value
    var formData=_this.data.formData
    console.log(value)
    console.log(formData)
    var flag=true
    var msg=""
    if (formData.weight.status !== 1 && formData.weight.remarks=="") {
      flag = false
      msg = "请选择输入实际克重"
    } else if (formData.width.status !== 1 && formData.width.remarks == "") {
      flag = false
      msg = "请选择输入实际门幅"
    }

    if (!flag) {
      dd.showToast({
        type: 'warn',
        content: msg,
        duration: 2000,
        success: () => {

        },
      });
    } else{
      var imgSrc=_this.data.imgSrc
      var data = formData
      data.yarn=value.yarn
      data.remarks = value.remarks
      data.images=imgSrc
      _this.postData(data)
    }
    
  },
  postData:function(data){
    console.log(data)
    var _this = this;
    var url = app.globalData.servsers + "/dy/warehouseoqa/save"
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
              // // 刷新上一页数据
              // var pages = getCurrentPages();
              // var prePage = pages[pages.length - 2];
              // dd.alert({
              //   title:"checksuccess"
              // })
              // // prePage.init()
              // // prePage.getClothList()
              // // end刷新上一页数据
              dd.navigateBack({
                delta: 1
              })

            },
          });

        } else {
          exceptionHandle(res.data)
        }

      }
    })

  },
   onUnload() {
    // 页面被关闭
     // 刷新上一页数据
              // var pages = getCurrentPages();
              // var prePage = pages[pages.length - 2];
              // prePage.init()
              // prePage.getClothList()
    // end刷新上一页数据
  },
  
})
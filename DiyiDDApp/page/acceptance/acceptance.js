import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      boltLimit:0,//投坯匹数
      checkBolt:0,//验收匹数
      diffBolt:0,//差值
      reasonSelect: [],//处理意见选项
      formData:{
        inferiorReason: "",//次品处理意见名
        inferiorReasonId: "",//次品处理意见id
        destroyReason: "",//损坏处理意见名
        destroyReasonId: "",//损坏处理意见id
        inferiorList: [],//次品信息
        destroyList: [],//损坏信息
        inferiorBtn: "添加",
        destroyBtn: "添加",
        acceptance: {
          boltOut: "",//成品匹数
          numOut: ""
        }
      },
      
      type:""//修改或添加
    },
    onLoad(options){
      var _this = this;
      _this.init()
      var id=options.id
      var title=options.title
       // 修改页面标题
      dd.setNavigationBar({
          title:"缸号"+title
      })
      _this.getReason()//获取处理意见选项
      var type=options.type
      if(type=="update"){
        _this.getCheckDyeInfo(id)//获取验收详情

      }
      var boltIn=dd.getStorageSync({ key: 'boltIn' }).data.boltIn
      _this.setData({
        boltLimit:boltIn,
        id:id,
        type: type
      })
      
    },
    init:function(){
      this.setData({
        boltLimit: 0,//投坯匹数
        checkBolt: 0,//验收匹数
        diffBolt: 0,//差值
        reasonSelect: [],//处理意见选项
        formData: {
          inferiorReason: "",//次品处理意见名
          inferiorReasonId: "",//次品处理意见id
          destroyReason: "",//损坏处理意见名
          destroyReasonId: "",//损坏处理意见id
          inferiorList: [],//次品信息
          destroyList: [],//损坏信息
          inferiorBtn: "添加",
          destroyBtn: "添加",
          acceptance: {
            boltOut: "",//成品匹数
            numOut: ""
          }
        },

        type: ""//修改或添加
      })
    },
    // 获取验收详情
    getCheckDyeInfo:function(id){
      var _this = this;
      // var id = _this.data.id
      var url = app.globalData.servsers + "/dy/ordersdye/info/"+id
      var method = "get"
      var data = {}
      DDhttpRequest({
        url, method, data,
        success(res) {
          var data = res.data;
          if (data.code == 0) {
            console.log(data)
            var data=data.data
            var inferiorList=[]
            var destroyList = []
            
            if (data.inferiorReason){
              var inferiorList = [{
                inferiorBolt: data.inferiorBolt,
                inferiorNum: data.inferiorNum,
                inferiorRemarks: data.inferiorRemarks
              }]
            }
            if (data.wasteReason) {
              var destroyList = [{
                destroyBolt: data.wasteBolt,
                destroyNum: data.wasteNum,
                destroyRemarks: data.wasteRemarks
              }]
            }
            var diffBolt = data.boltIn - data.boltOut - data.inferiorBolt - data.wasteBolt
            var formData={
              acceptance: {
                boltOut: data.boltOut,
                numOut: data.numOut
              },
              inferiorReason: data.interfiorReasonName,//次品处理意见名
              inferiorReasonId: data.inferiorReason,//次品处理意见id
              destroyReason: data.wasteReasonName,//损坏处理意见名
              destroyReasonId: data.wasteReason,//损坏处理意见id
              inferiorList: inferiorList,//次品信息
              destroyList: destroyList,//损坏信息
              inferiorBtn: data.inferiorReason ? "删除" : "添加",
              destroyBtn: data.wasteReason ? "删除" : "添加",
            }
            _this.setData({
              boltLimit: data.boltIn,//投坯匹数
              checkBolt: data.boltOut + data.inferiorBolt + data.wasteBolt,//验收匹数
              diffBolt: diffBolt,//差值
              formData: formData
              
            })
            console.log(_this.data)
          } else {
            exceptionHandle(res.data)
          }

        }
      })
    },
    // 添加次品OR损坏信息
    addInfo:function(e){
      var dataset=e.currentTarget.dataset
      var name = dataset.name
      var formData=this.data.formData
      var list=formData[name+'List']
      formData[name + 'List'] = list.length > 0 ? [] : [{}]
      formData[name + 'Btn'] = list.length > 0 ? "添加" : "删除"
      if (list.length > 0) this.calcBolt()
      
      console.log(formData)
      this.setData({
        formData: formData
      })
     
    },
  changeValue:function(e){
      var val = Number(e.detail.value)
      var dataset=e.currentTarget.dataset
      var father=dataset.father
      var name=dataset.name
      var formData=this.data.formData
    if (father =="destroyList[0]"){
      formData.destroyList[0][name]=val
    } else if (father == "inferiorList[0]") {
      formData.inferiorList[0][name] = val
    }else{
      formData[father][name] = val
    }
     
      this.setData({
        formData:formData
      })
      console.log(formData)
  },
  // boltFocus:function(e){
  //     var val = Number(e.detail.value)
  //     var dataset=e.currentTarget.dataset
  //     var father=dataset.father
  //     var name=dataset.name
  //     var formData=this.data.formData
  //     var boltLimit = Number(this.data.boltLimit)
  //     var checkBolt = Number(this.data.checkBolt)
  //     var diffBolt = Number(this.data.diffBolt)
  //     checkBolt = checkBolt-val
  //     diffBolt = boltLimit - checkBolt
  //     formData[father][name]=" "
  //     this.setData({
  //       formData:formData,
  //       checkBolt: checkBolt,
  //       diffBolt: diffBolt
  //     })
  //     console.log(this.data)

  //   },
    // 计算匹数
    calcBolt:function(){
      // var val=Number(e.detail.value)
      var boltLimit=Number(this.data.boltLimit)
      var checkBolt=Number(this.data.checkBolt)
      var diffBolt=Number(this.data.diffBolt)
      var formData=this.data.formData
      var inferiorBolt = formData.inferiorList.length>0? Number(formData.inferiorList[0].inferiorBolt):0
      var destroyBolt = formData.destroyList.length>0 ? Number(formData.destroyList[0].destroyBolt) : 0
      
      checkBolt = formData.acceptance.boltOut + inferiorBolt+destroyBolt
      diffBolt=boltLimit-checkBolt
      console.log(checkBolt)
      console.log(this.data.formData)
      
      
      this.setData({
        checkBolt:checkBolt,
        diffBolt:diffBolt
      })

    },
    // 选择处理意见
    choseReason:function(e){
      console.log(e)
      var index=e.detail.value
      var type=e.currentTarget.dataset.type
      var select=this.data.reasonSelect
      var name=select[index].reasonName
      var id=select[index].id
      var formData=this.data.formData
      if(type=="inferior"){
        formData.inferiorReason=name,
        formData.inferiorReasonId=id
      }else{
        formData.destroyReason = name,
          formData.destroyReasonId = id
      }
      this.setData({
        formData: formData
      })
    },
    // 获取处理意见
    getReason:function(){
       var _this = this;
      var url=app.globalData.servsers+"/dy/reason/select"
      var method="get"
      var data={
         "reasontype": 4  
      }
       DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            var list = res.data.list;
            _this.setData({
              reasonSelect:list
            })
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 提交表单
    formSubmit:function(e){
      var val=e.detail.value
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
      } else if (val.inferiorRemarks == "") {
        warn = "请输入次品描述";
        flag = false;
      } else if (val.inferiorReasonId == "") {
        warn = "请选择次品处理意见";
        flag = false;
      } else if (val.destroyBolt == "") {
        warn = "请输入次品匹数";
        flag = false;
      } else if (val.destroyNum == "") {
        warn = "请输入次品数量";
        flag = false;
      } else if (val.destroyRemarks == "") {
        warn = "请输入次品描述";
        flag = false;
      } else if (val.destroyReasonId == "") {
        warn = "请选择次品处理意见";
        flag = false;
      }

      if(!flag){
        dd.showToast({
            type: 'warn',
            content: warn,
            duration: 2000,
            success: () => {
                   
             },
        });
      }else{
        this.uploadData(val)
      }
    },
    // 上传数据
    uploadData:function(val){
      var _this=this
      var dyeid=_this.data.id
      var data={
        "dyeid": dyeid,
        "boltOut": val.boltOut,
        "numOut": val.numOut,
        "inferiorBolt": val.inferiorBolt || 0,
        "inferiorNum": val.inferiorNum || 0,
        "inferiorRemarks": val.inferiorRemarks,
        "inferiorReason": val.inferiorReasonId,
        "wasteNum": val.destroyNum || 0,
        "wasteBolt": val.destroyBolt || 0,
        "wasteRemarks": val.destroyRemarks,
        "wasteReason": val.destroyReasonId
      }
      var _this = this;
      var type=_this.data.type
      var urlsec = type == "update" ? "/dy/orders/updateCheckDye" : "/dy/orders/checkDye"
      var url = app.globalData.servsers + urlsec
      var method="post"
       dd.showLoading({
        content: '上传中...'
      });
       DDhttpRequest({url,method,data,
        success(res){
          var data = res.data;
          if(data.code==0){
            dd.showToast({
              type: 'success',
              content: "上传成功",
              duration: 1500,
              success: () => {
                if(type=="update"){
                  // 刷新分缸列表数据
                  // var pages = getCurrentPages();
                  // var prePage = pages[pages.length - 2];
                  // prePage.getVatList(0)//未完成
                  // prePage.getVatList(1)//已完成
                  // var contractPage = pages[pages.length - 3];
                  // contractPage.init()
                  // contractPage.getContractList()
                  // end刷新分缸列表数据
                  dd.navigateBack({
                    delta: 1
                  })
                }else{
                  // 刷新分缸列表数据
                  // var pages = getCurrentPages();
                  // var prePage = pages[pages.length - 3];
                  // prePage.getVatList(0)//未完成
                  // prePage.getVatList(1)//已完成
                  // var contractPage = pages[pages.length - 4];
                  // contractPage.init()
                  // contractPage.getContractList()
                  // end刷新分缸列表数据
                  dd.navigateBack({
                    delta: 2
                  })
                 
                }
                
              },
            });
            
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
  onUnload() {
    // 页面被关闭
    // var _this=this
    // var type = _this.data.type
    // if (type == "update") {
    //   // 刷新分缸列表数据
    //   var pages = getCurrentPages();
    //   var prePage = pages[pages.length - 2];
    //   prePage.getVatList(0)//未完成
    //   prePage.getVatList(1)//已完成
    //   // var contractPage = pages[pages.length - 3];
    //   // contractPage.init()
    //   // contractPage.getContractList()
    //   // end刷新分缸列表数据
    // } else {
    //   // 刷新分缸列表数据
    //   var pages = getCurrentPages();
    //   var prePage = pages[pages.length - 3];
    //   prePage.getVatList(0)//未完成
    //   prePage.getVatList(1)//已完成
    //   // var contractPage = pages[pages.length - 4];
    //   // contractPage.init()
    //   // contractPage.getContractList()
    //   // end刷新分缸列表数据
    // }
  },

})
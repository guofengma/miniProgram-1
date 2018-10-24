App({
  onLaunch(options) {    
    var _this=this;
    _this.getSystemInfoPage()
    _this.globalData.servsers = "http://dytest.ruiztech.cn/diyiAdmin/";//http://dytest.ruiztech.cn  //https://erp.tc6535.com
    _this.globalData.corpId = "ding7917e5f32b799ede";//小程序corpId///ding7917e5f32b799ede///ding0078412a57acfe2f35c2f4657eb6378f
    
  },
  onShow() {
    // console.log('App Show');
  },
  onHide() {
    // console.log('App Hide');
  },
  globalData: {
    code:'',//用户code
    servsers: "",//服务器地址
    systemInfo:{}//设备信息
  },
  // 权限
  isPermission(per){
    var permission=dd.getStorageSync({key:"permissions"}).data.permissions
    var index=permission.indexOf(per)
    var flag=false
   if(index>-1)flag=true
   return flag
  },
  // 获取设备信息
  getSystemInfoPage(){
    var _this=this
     dd.getSystemInfo({
        success: (res) => {
          console.log(res)
          _this.globalData.systemInfo=res
           dd.setStorageSync({
                    key: 'systemInfo',
                    data: {
                        systemInfo: res,
                    }
           })
        }
      })
  },
  // 格式化日期时间
  dateFormat: function (date) {
    var year = date.getFullYear();       //年  
    var month = date.getMonth() + 1;     //月  
    var day = date.getDate();            //日  

    var hh = date.getHours();            //时  
    var mm = date.getMinutes();          //分  
    var ss = date.getSeconds();           //秒  

    var clock = year + "-";

    if (month < 10)
      clock += "0";

    clock += month + "-";

    if (day < 10)
      clock += "0";

    clock += day + " ";

    if (hh < 10)
      clock += "0";

    clock += hh + ":";
    if (mm < 10) clock += '0';
    clock += mm + ":";

    if (ss < 10) clock += '0';
    clock += ss;
    return (clock);
  },
  // // 时间戳转换成时间格式
  // timestampToTime:unction(timestamp){
  //   var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  //   var Y = date.getFullYear() + '-';
  //   var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  //   var D = date.getDate() + ' ';
  //   var h = date.getHours() + ':';
  //   var m = date.getMinutes() + ':';
  //   var s = date.getSeconds();
  //   return Y + M + D + h + m + s;
  // },
  // 数组去重
  distinct: function (arr) {
    var result = [],
      i,
      j,
      len = arr.length;
    for (i = 0; i < len; i++) {
      for (j = i + 1; j < len; j++) {
        if (arr[i] === arr[j]) {
          j = ++i;
        }
      }
      result.push(arr[i]);
    }
    return result;
  },
   // 选择图片
  choseImg:function(page,count,name){
    var count=count?count:9
    var _this=this
    dd.chooseImage({
      count: count,
      success: (res) => {
        console.log("选择图片",res)
        var length = res.apFilePaths.length
        dd.showLoading({
          content: '图片上传中'
        });
        res.apFilePaths.forEach((item,index)=>{
          
          //_this.compressImage(item, page, count, name)
          _this.upLoadImg(item, page, count, name, length,index)
        })
        
      },
    });
  },
  // 压缩图片
  compressImage: function(filePath, page, count, name){
    var _this=this
    dd.compressImage({
      filePaths: [filePath],
      level: 4,
      success: (res) => {
        filePath = res.filePaths[0]
        _this.upLoadImg(filePath, page, count, name)
      },
      fail: err => {
        dd.showToast({
          duration: 1000,
          content: JSON.stringify(err),
        });
      },
    });
  },
  // 上传图片
  upLoadImg: function(filePath, page, count, name, length,index){
    var token = dd.getStorageSync({ key: 'token' }).data.token;
    var url =this.globalData.servsers + "sys/oss/upload?token="+token;//接口地址
   
    dd.uploadFile({
      url: url,
      fileType: 'image',
      fileName: 'file',
      formData: {
        // 'token': token
      },
      filePath: filePath,
      success: (res) => {
        
        if(index==(length-1)){
          // dd.alert({
          //   title: length,
          //   content: index,
          // })
          dd.hideLoading();
        }
        console.log("上传图片",res)
        var data = JSON.parse(res.data);
        if(data.code==0){
          if(name){
            var imgObj = page.data.imgObj
            if(count==1){
              imgObj[name] = data.url
            }else{
              imgObj[name] = imgObj[name].concat(data.url) 
            }
            page.setData({
              imgObj: imgObj
            })
          }else{
            page.setData({
              imgSrc: page.data.imgSrc.concat(data.url)
            })
          }
          // console.log("imgSrc",page.data.imgSrc)
          // console.log("imgObj", page.data.imgObj)
        }
      },
      fail:(err)=>{
        console.log("fail",err)
      },
      complete:(err)=>{
        // dd.alert({
        //   title: "complete",
        //   content: index,
        // })
        // dd.hideLoading();
      }
    });
  },
 
});
import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
       
    },
    onLoad(){
      var _this = this;
    },
  formSubmit: function(e) {
    var val = e.detail.value;
    var _this = this;
    var flag=true
    var msg=""
    if (val.old_psd == "") {
      flag = false
      msg = "旧密码不能为空"
    } else if (val.new_psd == "") {
      flag = false
      msg = "新密码不能为空"
    } else if (val.new_psd !== val.confirm_psd) {
      flag=false
      msg ="两次密码输入不一致"
    }

    if(!flag){
      dd.showToast({
        type: 'warn',
        content: msg,
        duration: 2000,
        success: () => {

        },
      });
    }else{
      var data={
        "password": val.old_psd,
        "newPassword": val.new_psd
      }
      _this.postData(data)
    } 
  },
  postData:function(data){
    var _this = this;
    var url = app.globalData.servsers + "/sys/user/password";//接口地址
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
  }
})
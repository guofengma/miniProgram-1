import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

Page({
    data:{
      realName: '',
      username: ''
    },
    onLoad(){
      var userInfo = dd.getStorageSync({ key: "userInfo"}).data
      var username = userInfo.username
      var realName = userInfo.realName
      this.setData({
        realName: realName,
        username: username
      })
    },
    logout: function() {
      dd.removeStorage({
        key: 'token',
        success: function() {
          dd.reLaunch({
            url: '../login/login',
          })
        }
      });
      
    }
})
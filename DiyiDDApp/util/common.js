var exceptionHandle=function(data,login){
    switch (data.code) {
      case 401:
        msg: "登录超时，请重新登录";
        break;
      case 500:
        msg: data.msg;
        break;
    }
    dd.alert({
      title: '提示',
      content: data.msg,
      duration: 2000,
      success:function(){
        if(data.code==401){
          dd.reLaunch({
            url: login,
          })
        }
      }
    })
}
// 请求数据
// ******//***** */
// url:请求地址
// method:请求方式
// data:请求参数
// success:请求成功的回调
var DDhttpRequest=function({url,method,data,success,fail}){
 var token = dd.getStorageSync({key:'token'}).data;
 token=token?token.token:""
 if(method=="post"){
    data=JSON.stringify(data)//post请求需要转换成json字符串
 }
     dd.httpRequest({
        url: url,
        method:method,
        data: data,
        dataType: 'json',
        headers:  {
          'Content-Type': 'application/json',
          'token':token
          },
        success: (res) =>{success(res)},
        fail: (res) => {
          console.log("fail",res)
           dd.showToast({
            type: 'exception',
            content: '网络异常',
            duration: 3000,
            success: () => {
            },
          });
        },
        complete: (res) => {
            dd.hideLoading();
        }
                    
        });
  }


 
 export default {DDhttpRequest,exceptionHandle}
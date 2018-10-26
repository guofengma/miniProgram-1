var servsers = 'https://shiguang.ruiztech.cn/ruiz/'
//时间格式化 
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//end 时间格式化 

// 数组去重
const distinct=arr=> {
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
}
// end 数组去重

// 请求数据
const  httpRequest=function(url, data, method) {
  var token = wx.getStorageSync("token");//获取token值
  wx.request({
    url: servsers + url, //仅为示例，并非真实的接口地址
    data: data,
    method: method,
    header: {
      'content-type': 'application/json', // 默认值
      "token": token
    },
    success: (res) => { success(res) },
    fail: (res) => {
      wx.showModal({
        title: "提示",
        content: '网络异常',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // console.log('用户点击确定')
          }
        }
      });
    },
    complete: (res) => {
      wx.hideLoading()
    }
  })
}
// end 请求数据
// 上传图片
const uploadImg = function (that, path, index) {
  var url = servsers + "sys/oss/upload";//接口地址
  var token = wx.getStorageSync("token");//获取token值
  wx.uploadFile({
    url: url,
    filePath: path,
    name: 'file',
    formData: {
      'token': token
    },
    success: function (res) {
      var data = JSON.parse(res.data);
      if (data.code == 0) {
        var img_url = that.data.img_url;
        img_url.push(data.url);
        var files=that.data.files
        files[index].status=1
        that.setData({
          img_url: img_url,
          files: files
        });
      } else {
        var files = that.data.files
        files[index].status = 2
        that.setData({
          files: files
        });
      }
    }
  })
}
// end 上传图片

// 选择图片
const chooseImage=function (that) {
  wx.chooseImage({
    count: 9,//默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var files = that.data.files
      var length=files.length
      res.tempFilePaths.forEach((item,index)=>{
        files.push({ path: item, status: 0, index: length+index})//status:0-上传中，1-上传成功，2-上传失败
        uploadImg(that,item,index)
      })
      console.log(files)
      that.setData({
        files: files
      });
      
    }
  })
}
// end 选择图片
// 删除图片
const deleteImg=function (e, that) {
  var files = that.data.files;
  var img_url = that.data.img_url;
  var index = e.currentTarget.dataset.index;
  files.splice(index, 1);
  img_url.splice(index, 1);
  that.setData({
    files: files,
    img_url: img_url
  });
}
//end  删除图片

module.exports = {
  formatTime: formatTime,// 时间格式化 
  distinct: distinct,// 数组去重
  httpRequest: httpRequest,// 请求数据
  chooseImage: chooseImage,//选择图片
  deleteImg: deleteImg,//删除图片
}

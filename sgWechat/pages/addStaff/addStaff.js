//获取应用实例
const app = getApp()

Page({
  data: {
    gender_arr: [{ id: 1, name: "男" }, { id: 2, name: "女" }],
    gender_index: "",
    roleList: [],
    checkArr: []
  },
  onLoad: function () {
    var that = this,
      token = wx.getStorageSync("token");//获取token值
    that.setData({
      token: token
    })

    that.getRoleList(token)
  },
  
  //性别picker
  genderPicker: function (e) {
    var index = e.detail.value;
    var currentId = this.data.gender_arr[index].id, // 这个id就是选中项的id
      token = wx.getStorageSync("token");//获取token值
    this.setData({
      gender_index: e.detail.value,
      gender: currentId
    })
  },
  // 获取角色列表
  getRoleList: function (token) {
    var that = this;
    var url = app.globalData.servsers + "sys/role/select";//接口地址
    wx.request({
      url: url,
      data: {},
      header: {
        'content-type': 'application/json',
        "token": token
      },
      success: function (res) {
        // console.log(res.data)
        var data = res.data;
        var code = data.code;
        if (code == 0) {
         that.setData({
           roleList:data.list
         })
        } else {
          app.exceptionHandle(data, "../login/login")

        }
      }
    })
  },
  // 多选框
  checkboxChange: function (e) {
    var arr = [];
    e.detail.value.forEach(current => {
      for (var value of this.data.roleList) {
        if (current == value.roleId) {
          arr.push(value.roleId);
          break;
        }
      }
    });
    this.setData({ checkArr: arr });
  },

  // 提交表单
  formSubmit: function (e) {
    var val = e.detail.value;
    var checkArr = this.data.checkArr;
    var warn = "";
    var flag = true;
    console.log(val)
    console.log(checkArr)
    

   if (val.sName == "") {
      warn = "请输入员工姓名"
      flag = false;
    }  else if (val.phone == "") {
      warn = "请输入员工手机号"
      flag = false;
    } else if (!(/^1[345789]\d{9}$/.test(val.phone))) {
      warn = "手机号格式有误"
      flag = false;
    }else if (checkArr.length <1) {
      warn = "请选择角色"
      flag = false;
    }

    if (!flag) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    } else {
      this.postData(val,checkArr)

    }

  },
  postData: function (data,checkArr) {
    console.log(data);
    var that = this;
    var url = app.globalData.servsers + "sys/user/save";


    wx.request({
      url: url,
      data: {
        "username": data.phone,
        "password": "123456",
        "email": "test@qq.com",
        "mobile": data.phone,
        "status": 1,
        "roleIdList": checkArr,
        "realName": data.sName,
        "code":data.num
      },
      methond: "POST",
      header: {
        'content-type': 'application/json',
        'token': that.data.token
      },
      method: "POST",
      success: function (res) {
        // console.log(res.data)
        var code = res.data.code;
        console.log();
        if (code == 0) {//提交成功
          // 刷新上一页数据
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2];
          prePage.setData({
            page: 1,
            list: [],
            scrollTop: 0
          })
          prePage.getList(prePage)
          // end刷新上一页数据
          wx.navigateBack({
            delta: 1
          })

        } else {
          app.exceptionHandle(res.data, "../login/login")
        }
      }
    })
  }

})  
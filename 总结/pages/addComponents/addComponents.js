//index.js
//获取应用实例
const app = getApp()

Page({

  data: {

    checkbox: [],

    array: ['A',
      'B', 'C'],

    isReview: false,

    isVerify: false,

  },



  insert: function () {

    var cb = this.data.checkbox;

    console.log(cb);

    cb.push(this.data.checkbox.length);

    this.setData({

      checkbox: cb

    });

  },

  delBind: function () {

    var cb = this.data.checkbox;

    console.log(cb);

    cb.pop(this.data.checkbox.length);

    this.setData({

      checkbox: cb

    });

  },



})
var app=getApp();
Page({
    data: {
        tabTxt: ['货柜编号',  '存放面料'],//tab文案
        pName_current: 0,//品种
        spec_current: 0,//规格
        weight_current: 0,//克重
        
        tab: [true, true],
        spec:[],
        color: [],
        pName: [],
        weight: [],

        hidden: true,
        noData: "hide",
        display: "hide",
        addHidden:false,
        page: 1,
        list: [],
        scrollHeight: 0,
        winWidth: 0,
        searchValue:"",//搜索关键字
        sort:"row",
        order: "asc"
        
    },
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        // console.log(res.target)
      }
      return {
        title: '',
        path: 'pages/sample/sample/sample'
      }
    },
    onShow: function () {
      var that = this;
       this.getList(that);
    },
    onLoad: function (options) {
      // console.log(options)
      var that = this;
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            scrollHeight: res.windowHeight,
            winWidth: res.windowWidth
          });
        }
      });
      if (options && options.searchValue) {
        this.setData({
          searchValue: options.searchValue
        });
      }
    },
    onReady: function() {
        var that=this;
        
    },
    // 搜索 
    searchInput: function (e) {
      var key=e.detail.value,
      that=this;
      console.log(key)
      that.setData({
        searchValue:key,
        page:1,
        list:[]
      })
      var hidden = that.data.hidden;
      if (hidden) that.getList(that);
      
    },
 
    // 选项卡
    filterTab:function(e){
      var order = this.data.order;//排序字段
      order = order == "asc" ? "desc" : "asc";
      var sName=e.currentTarget.dataset.name;
      var sort = sName == "货柜编号" ? "row" :"fabirc_num"
        var data=[true,true,true],index=e.currentTarget.dataset.index;
        data[index]=!this.data.tab[index];
        this.setData({
            tab:data,
            order: order,
            sort: sort,
            page:1,
            list:[]
        })
        this.getList(this);
    },
   
   
   
   
    onPullDownRefresh: function () {
      console.log("下拉");
      var that = this;
      that.setData({
        page: 1,
        list: [],
        scrollTop: 0
      });
      that.getList(that)
    },
    onReachBottom: function () {
      console.log("上拉");
      var that = this;
      that.getList(that);
    },
    // 获取数据
    getList: function () {
      var that=this;
      var url = app.globalData.servsers + "rz/warehouse/shelvesDosage";
      var token = wx.getStorageSync("token");//获取token值
      var page = that.data.page,
        searchValue = that.data.searchValue,//搜索关键词
        sort = that.data.sort,
        order = that.data.order;//排序字段
      that.setData({ order: order})
      that.setData({
        hidden: false
      });
      wx.request({
        url: url,
        data: {
          "page": page,
          "limit":15,
          "isNull":0,
          "searchText": searchValue,
          "sort": sort, //fabirc_num   排序字段 值为 row 表示按编号排序 值为fabirc_num 表示按面料编号排序
          "order": order //排序字段 asc 顺序 desc 倒序
         
        },
        header: {
          'content-type': 'application/json' ,// 默认值
          "token": token
        },
        success: function (res) {
          var data = res.data;
          // console.log(data)
          if (data.code == 0) {
            that.dataProcessing(data, page)//数据处理
            wx.stopPullDownRefresh();
          } else {
            app.exceptionHandle(data, "../login/login")
          }

        }
      });
    },
    // 数据处理
    dataProcessing: function (data, page) {
      var that = this,
        l = that.data.list,
        noData = that.data.noData,
        dataList = data.page.list;
      if (page == 1 && dataList.length < 1) { noData = "show" } else { noData = "hide" }
      if (dataList.length < 1) {
        that.setData({
          display: "show"
        });
      } else {
        that.setData({
          display: "hide"
        });
      }
      // console.log(dataList)
      for (var i = 0; i < dataList.length; i++) {
       
        l.push(dataList[i])
      }

      that.setData({
        list: l
      });
      page++;
      that.setData({
        page: page,
        hidden: true,
        noData: noData
      });
    },
    kindToggle: function (e) {
      var id = e.currentTarget.id, list = this.data.list;
      for (var i = 0, len = list.length; i < len; ++i) {
        if (list[i].id == id) {
          list[i].open = !list[i].open
        } else {
          list[i].open = false
        }
      }
      this.setData({
        list: list
      });
    }
});
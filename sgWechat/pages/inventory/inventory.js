var app=getApp();
Page({
    data: {
        classify:['面料','辅料'],
        classifyCurrent:0,
        tabTxt: ['原料分类','原料编号', '规格', '颜色',  '货架'],//tab文案
        mClassify_current:0,//原料分类
        fabric_current:0,//原料编号
        spec_current: 0,//规格
        color_current: 0,//颜色
        warehouse_current: 0,//仓库
        shelf_current: 0,//货架
        tab: [true, true, true,true, true],
        mClassify:[],
        fabric: [{ name: "棉麻棉麻棉麻棉麻", id: 1 }, { name: "毛绒毛绒毛绒毛绒毛绒", id: 2 }],
        spec: [{ name: "100*200", id: 1 }, { name: "200*300", id: 2 }],
        color: [{ name: "red", id: 1 }, { name: "黑色", id: 2 }],
        warehouse: [{ name: "仓库1", id: 1 }, { name: "仓库2", id: 2 }],
        shelf: [{ name: "货架1", id: 1 }, { name: "货架2", id: 2 }],
        hidden: true,
        noData: "hide",
        display: "hide",
        page: 1,
        list: [],
        scrollHeight: 0,
        winWidth: 0
        
    },
    onShow: function () {
      var that = this;
      this.getList(that);
    },
    onLoad: function (option) {
      var that = this,
        classify = option.type,
        classifyCurrent = classify==3?2:0;
        console.log(option)
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            scrollHeight: res.windowHeight,
            winWidth: res.windowWidth,
            classifyCurrent: classifyCurrent
          });
        }
      });
    },
    onReady: function() {
      this.getmClassify();//原料分类选项
      this.getFabric();//原料编号选项
      this.getPlace();//货架
    },
    classifySel:function(e){
      this.setData({
        classifyCurrent: e.currentTarget.dataset.idx,
        mClassify_current: 0,//原料分类
        fabric_current: 0,//原料编号
        spec_current: 0,//规格
        color_current: 0,//颜色
        warehouse_current: 0,//仓库
        shelf_current: 0,//货架
        mClassify:[],
        fabric: [],
        spec: [],
        color: [],
        warehouse: [],
        shelf: [],
        tabTxt: ['原料分类','原料编号', '规格', '颜色',  '货架'],//tab文案
        page:1,
        list:[]
      })
      this.getmClassify();//原料分类选项
      this.getFabric();//面料编号选项
      this.getPlace();//货架
      this.getList();//获取列表
    },
    // 选项卡
    filterTab:function(e){
        var data=[true,true,true,true,true],index=e.currentTarget.dataset.index;
        data[index]=!this.data.tab[index];
        this.setData({
            tab:data
        })
    },
    // 获取原料分类选项
    getmClassify: function () {
      var that = this;
      var url = app.globalData.servsers + "rz/warehouse/fabricType";//接口地址
      var token = wx.getStorageSync("token");
      var classify = Number(this.data.classifyCurrent) + 1;
      wx.request({
        url: url,
        data: {
          "genre": classify// 1面料 2辅料
        },
        header: {
          'content-type': 'application/json',
          "token": token
        },
        success: function (res) {
          var data = res.data;
          if (res.data.code == 0) {
            var list = res.data.list;
            for (var i = 0, l = list.length; i < l; i++) {
              list[i].id = list[i].fabricType.id
              list[i].name = list[i].fabricType.typeName

            }
            that.setData({
              mClassify: list
            })
          } else {
            app.exceptionHandle(data, "../login/login")
          }
        }
      })
    },
    // 获取面料编号选项
    getFabric: function () {
      var that = this;
      var url = app.globalData.servsers + "rz/warehouse/fabric";//接口地址
      var token=wx.getStorageSync("token");
      wx.request({
        url: url,
        data: {
          // "type": classify
        },
        header: {
          'content-type': 'application/json',
          "token": token
        },
        success: function (res) {
          var data = res.data;
          if (res.data.code == 0) {
            var list = res.data.list;
            var colorList=[];
            var specList = [];
            var color=[],spec=[];

            for(var i=0,l=list.length;i<l;i++){
              list[i].id = list[i].fabric.id
              list[i].fabircNum = list[i].fabric.fabircNum 
              list[i].fabircName = list[i].fabric.fabricDescribe 
              if (list[i].fabric.color !== null) colorList.push(list[i].fabric.color)
              if (list[i].fabric.spec !== null)specList.push(list[i].fabric.spec)
              
            }
            colorList = app.distinct(colorList)
            specList = app.distinct(specList)
            colorList.forEach((item,index)=>{
              color.push({"id":index+1,"color":item})
            })
            specList.forEach((item, index) => {
              spec.push({ "id": index+1, "spec": item })
            })
            that.setData({
              fabric:list,
              color: color,
              spec:spec
            })
          } else {
            app.exceptionHandle(data, "../login/login")
          }
        }
      })
    },
    // 获取仓库位置（货架）
    getPlace: function (id) {
      var that = this;
      var url = app.globalData.servsers + "rz/warehouse/shelves";//接口地址
      var token = wx.getStorageSync("token");
      wx.request({
        url: url,
        data: {
          // "storehostId": id
        },
        header: {
          'content-type': 'application/json',
          "token": token
        },
        success: function (res) {
          var data=res.data;
          if (res.data.code == 0) {
            var list = res.data.list;
            for (var i = 0, l = list.length; i < l; i++) {
              list[i].id = list[i].shelves.id
              list[i].name = list[i].shelves.row + list[i].shelves.height + list[i].shelves.line 

            }
            that.setData({
              shelf_current: 0,
              shelf: res.data.list
            })
          } else {
            app.exceptionHandle(data, "../login/login")
          }
        }
      })
    },
    //筛选项点击操作
    filter:function(e){
        var that=this,
            id=e.currentTarget.dataset.id,
            txt=e.currentTarget.dataset.txt,
            index = e.currentTarget.dataset.index,
            tabTxt=this.data.tabTxt;
            switch (index){
              case '0':
                tabTxt[0] = txt;
                that.setData({
                  page: 1,
                  list: [],
                  tab: [true, true, true, true, true],
                  tabTxt: tabTxt,
                  mClassify_current: id
                });
                break;
            case '1':
                tabTxt[1]=txt;
                that.setData({
                    page:1, 
                    list:[],
                    tab: [true, true, true, true, true],
                    tabTxt:tabTxt,
                    fabric_current:id
                });
            break;
            case '2':
                tabTxt[2]=txt;
                that.setData({
                    page:1,
                    list:[],
                    tab: [true, true, true, true, true],
                    tabTxt:tabTxt,
                    spec_current:id
                });
                
            break;
            case '3':
                tabTxt[3]=txt;
                that.setData({
                    page:1,
                    list:[],
                    tab: [true, true, true, true, true],
                    tabTxt:tabTxt,
                    color_current:id
                });
            break;
            case '4':
              tabTxt[4] = txt;
              that.setData({
                page: 1,
                list: [],
                tab: [true, true, true, true, true],
                tabTxt: tabTxt,
                shelf_current: id
              });
              break;
        }
        //数据筛选
        that.getList();
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
      var url = app.globalData.servsers + "rz/warehouse/list";
      var token = wx.getStorageSync("token");//获取token值
      var page = that.data.page;
      var classify = Number(that.data.classifyCurrent) + 1;//类型
      var fabricTypeId = that.data.mClassify_current == 0 ? "" : that.data.mClassify_current;//原料类型id
      
      var fabricId = that.data.fabric_current == 0 ? "" : that.data.fabric_current;//面料编号
      var spec = that.data.tabTxt[2] == "规格" ? "" : that.data.tabTxt[2];//规格
      var color = that.data.tabTxt[3] == "颜色" ? "" : that.data.tabTxt[3];//颜色
      var shelvesId = that.data.shelf_current == 0 ? "" : that.data.shelf_current;//货架id
      console.log(fabricId)
      that.setData({
        hidden: false
      });
      wx.request({
        url: url,
        data: {
          "page": page,
          "limit": 10,
          "fabricTypeId": fabricTypeId,
          "fabricId": fabricId,
          "spec": spec,
          "color": color,
          "shelvesId": shelvesId,
          "genre": classify
        },
        header: {
          'content-type': 'application/json', // 默认值
          "token": token
        },
        success: function (res) {
          var data = res.data;
          console.log(data)
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
      console.log(dataList)
      for (var i = 0; i < dataList.length; i++) {
        if (dataList[i].fabric.color == null) dataList[i].fabric.color=""
        if (dataList[i].fabric.spec == null) dataList[i].fabric.spec = ""
        
        // 多柜处理
        var shelves = dataList[i].children,
            shelvesLength=shelves.length;
        if (shelvesLength > 1) {
           dataList[i]["isMulti"] = 1;
           var num=0,lockNum=0;
           for (var j = 0; j < shelvesLength;j++){
             num += shelves[j].num;
             lockNum += shelves[j].lockNum;
           }
           dataList[i]["num"] = num;
           dataList[i]["lockNum"] = lockNum;
           // 匹数数量处理
           dataList[i].realNum = (num - lockNum).toFixed(2)
           
        } else { dataList[i]["isMulti"] = 0}
        // end 多柜处理
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
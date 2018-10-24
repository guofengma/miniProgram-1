import {DDhttpRequest,exceptionHandle} from  '../../util/request';
let app = getApp();

//内网穿透工具介绍:
// https://open-doc.dingtalk.com/microapp/debug/ucof2g
//替换成开发者后台设置的安全域名
let servsers = app.globalData.servsers;

Page({
    data:{
      userInfo:"",
      unReadStr:"消息通知"
    },
    onLoad(){
        let _this = this;
        var userInfo=dd.getStorageSync({key:'userInfo'}).data;
         var token = dd.getStorageSync({key:'token'}).data.token;
        this.setData({
            userInfo:userInfo,
            token:token
        })
        // _this.getUnread(userInfo)
        _this.getMenu()
    },
    // 进入消息列表
    goMessage:function(){
      dd.navigateTo({
        url: '../message/message'
      })
    },
    // 获取未读消息的条数
    getUnread:function(){
      var _this=this
      var url = app.globalData.servsers +"notify/notify/list"
      var method="get"
      var userInfo = dd.getStorageSync({ key: 'userInfo' }).data;
      var data={
        //  uid: userInfo.userId,
        status: 0,//0 未读 1 已读
        type: 0,//1 系统消息 2 仓库操作 3 合同订单跟进 4 财务管理
         page: 1,
         limit: 9999
      }
      DDhttpRequest({url,method,data,
        success(res){
           var data = res.data;
        // console.log(data)
        if (data.code == 0) {
          var msg = data.page.list;
          var totalCount = data.page.totalCount
          if (totalCount > 0) {
            _this.setData({
             unReadStr: "你有" + totalCount + "条消息！"
            })
          } else {
            _this.setData({
              unReadStr: "消息通知"
            })
          }
          }else{
            exceptionHandle(res.data)
          }
        }
      })
    },
    // 获取菜单列表
     // 获取未读消息的条数
    getMenu:function(){
      var _this=this
      var url=app.globalData.servsers+"sys/menu/nav"
      // var token=_this.data.token
      var method="get"
      var data={
         ismobile: 1
      }
      DDhttpRequest({url,method,data,
        success(res){
          // console.log(res)
          var data = res.data;
          if(data.code==0){
            // 权限存储
            var permissions=data.permissions
            dd.setStorageSync({
              key: 'permissions',
                    data: {
                        permissions: permissions,
                    }
            })
            var list=data.menuList[0].list
            list.forEach(item=>{
              switch(item.name){
                case"订单跟进":
                item.icon ="sign.png";
                break;
                case "订单跟踪":
                item.icon = "itemList.png";
                  break;
                case "入库管理":
                  item.icon = "in.png";
                  break;
                case "出库管理":
                  item.icon = "out.png";
                  break;
              }
            })
            _this.setData({
              menuList: list
            })
          }else{
            exceptionHandle(res.data)
          }
         
        }
      })
    },
    // 进入下级页面
    toNext:function(e){
      // console.log(e)
      var src=e.currentTarget.dataset.src
      dd.navigateTo({
        url: src
      })
    }
    
})
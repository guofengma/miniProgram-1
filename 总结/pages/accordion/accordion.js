//获取应用实例
const app = getApp()

Page({
  data: {
    list: [
      {
        id: 'order',
        name: '订单信息',
        open: false,
        dataList: [
          { label: "订单编号", value: "D26565" },
          { label: "客户对象", value: "李丹" },
          { label: "负责人", value: "卡卡" },
          { label: "关注人", value: "丽丽" },
          { label: "紧急程度", value: "非常紧急", status: "0" },
          { label: "订单标签", value: "新客户" },
          { label: "印染厂", value: "皮皮印染厂" },
          { label: "对接人", value: "拉拉" }
        ]
      },
      {
        id: 'cloth',
        name: '坯布信息',
        open: false,
        dataList: [
          { label: "白坯1", value: "使用量：2000" },
          { label: "白坯2", value: "使用量：300222" }
        ]
      },
      {
        id: 'dyeing',
        name: '印染信息',
        open: false,
        sub: true,
        dataList: [
          {
            label: "投坯编号", value: "2569", sub: true, open: false, id: "dyeing1", dataSubLsit: [
              { label: "缸号", value: "fr66" },
              { label: "色号", value: "black256" },
              { label: "匹数", value: "200" },
              { label: "数量", value: "3000" },
              { label: "规格", value: "100c 250g" },
              { label: "进缸坯重", value: "2500" },
              { label: "当前阶段", value: "印染" },
              { label: "成品坯重", value: "2400" },
              { label: "成品率", value: "99%" },
              { label: "状态", value: "正常" },
              { label: "质检结果", value: "A" }
            ], subIndex: 2
          },
          {
            label: "投坯编号", value: "189487", sub: true, open: false, id: "dyeing2", dataSubLsit: [
              { label: "缸号", value: "GH15988" },
              { label: "色号", value: "red256" }
            ], subIndex: 2
          },
          {
            label: "投坯编号", value: "189487", sub: true, open: false, id: "dyeing3", dataSubLsit: [
              { label: "缸号", value: "GH15988" },
              { label: "色号", value: "red256" }
            ], subIndex: 2
          }
        ]

      },
      {
        id: 'log',
        name: '操作记录',
        open: false,
        sub: true,
        dataList: [
          {
            label: "时间", value: "2012-05-02", sub: true, open: false, id: "log1", dataSubLsit: [
              { label: "操作人", value: "李兰" },
              { label: "步骤", value: "2" },
              { label: "备注", value: "啦啦啦" }
            ], subIndex: 3
          },
          {
            label: "时间", value: "2012-05-06", sub: true, open: false, id: "log2", dataSubLsit: [
              { label: "操作人", value: "皮皮" },
              { label: "步骤", value: "3" },
              { label: "备注", value: "啦啦啦" }
            ], subIndex: 3
          }

        ]

      }
    ]

  },
  // 一级菜单折叠
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
  },
  // 子级菜单折叠
  kindToggleSub: function (e) {
    console.log(e)
    var sub = e.currentTarget.dataset.sub;
    console.log(sub)
    if (!sub) return;
    var id = e.currentTarget.id,
      index = e.currentTarget.dataset.index,
      list = this.data.list,
      subList = this.data.list[index].dataList;
    for (var i = 0, len = subList.length; i < len; ++i) {
      if (subList[i].id == id) {
        subList[i].open = !subList[i].open
      } else {
        subList[i].open = false
      }
    }
    list[index].dataList = subList;
    this.setData({
      list: list
    });
  },
  print: function () {
    console.log("click")
  }
});

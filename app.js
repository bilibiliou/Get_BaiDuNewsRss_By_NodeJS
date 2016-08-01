var fs              = require("fs"),
    service         = require("./service.js")    

var DataPort = [
   {  
       name: "国内焦点",
       category: "civilnews",
       url: "http://news.baidu.com/n?cmd=1&class=civilnews&tn=rss"
   },{
       name: "国际焦点",
       category: "internews",
       url: "http://news.baidu.com/n?cmd=1&class=internews&tn=rss"
   },{   name: "社会焦点",
       category: "socianews",
       url: "http://news.baidu.com/n?cmd=1&class=socianews&tn=rss"
   }
];


service
.getData(DataPort,function ($self) {
  console.log("\n===== 接收阶段结束， 准备存储数据 =====");

  $self.saveData(function () {
    console.log("\n===== 存储数据结束 =====");
  });
})
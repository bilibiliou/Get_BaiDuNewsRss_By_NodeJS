var request         = require("superagent"),
    charsetCompoent = require('superagent-charset'),
    superagent      = charsetCompoent(request),
    eventproxy      = require("eventproxy"),
    feedparser      = require("feedparser"),
    iconv           = require("iconv-lite"),
    fs              = require("fs"),
    DAO             = require("./database/dao.js");

var {
    model,
    schema,
    db
} = DAO;

var ep = new eventproxy(),
    count = 0;

class service {
    constructor() {
        this.result = [];
    }

    getData(valueList, callback) {
        var $self = this;

        valueList.forEach(function(value, idx) {
            var fp              = new feedparser(),
                category        = {
                    "category": value.name,
                    "data": []
                }

            console.log("Catching < "+ value.name + " > from:" + value.url);
            superagent.get(value.url)
                .charset('gb2312')
                .type("xml")
                .on("error", function (err) {
                   console.log("===== %s 获取数据失败 =====",value.name) 
                   console.log(err);
                })    
                .pipe(iconv.decodeStream("gb2312"))
                .pipe(iconv.encodeStream("utf-8"))
                .pipe(iconv.decodeStream("utf-8"))
                .pipe(fp)
                .on("error", function (err) {
                    console.log("===== %s 解析数据失败 =====",value.name);
                    console.error(err);
                })
                .on("readable", function () {
                    var $stream = this,
                        obj = null,
                        item

                    while(item = $stream.read()) {                         
                        obj = {
                            "title" : item.title,
                            "link" : item.link,
                            "pubDate": item.pubDate,
                            "source": JSON.stringify(item.source),
                            "author": item.author
                        }
                    }

                    ++count;
                    category.data.push(obj);                     
                })
                .on("end", function (err) {
                    if(err) {
                        console.log(">>>>>> 出现错误!!!");
                        console.log(err);
                    } else {
                        $self.result.push(category);
                        console.log("===== %s 已解析完数据 =====",value.name);
                        ep.emit("get_data");
                    }
                })
        })
        
        ep.after("get_data", valueList.length, function () {
            console.log("所有结果：%s 组 共 %s 条",$self.result.length,count);
            callback && callback($self); 
        })
    }

    saveData(callback) {
        var $self = this;
        var ep = eventproxy();
        for(var i = 0; i<$self.result.length; i++) {
             new model($self.result[i]).save(function (err) {
                if(err) {
                    console.log(err)
                } else {
                    console.log("数据存储成功!");
                    ep.emit("save_Data");
                }
            });
        }

        ep.after("save_Data", $self.result.length , function () {
            db.close();
        })

        callback && callback();    
    }
}

module.exports = new service;
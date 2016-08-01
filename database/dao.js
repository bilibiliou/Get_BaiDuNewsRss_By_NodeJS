var mongoose = require("mongoose"), 
    db, 
    modelName = "news"; // 设定操作的collections
    mongoose.connect("mongodb://localhost:27017/test");
    db = mongoose.connection;
    db
      .on("error", function (err) {
        console.log("Connection Error!!! this's some prompts: ");
        console.log(err);
    })
      .once("open", function () {
        console.log("Open DataBase Successfully!!!");
    });

// 设置
var newsSchema = mongoose.Schema({
        "category": String,
        "data": [{
            "title": String,
            "link": String,
            "pubDate": String,
            "source": String,
            "author": String    
        }]    
    });

newsSchema.pre("save", function (next) {
    if( !this.title ) {
        this.title = "未知标题";
    }

    next();
})

var newsModel = mongoose.model(modelName, newsSchema);

module.exports = {
    model: newsModel,
    schema: newsSchema,
    mongoose,
    db
}

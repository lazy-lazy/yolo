/**
 * Created by dq6663 on 2015-08-19.
 */
var mongodb = require('./db.js');
var markdown = require('markdown').markdown;


function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

//存储一篇文章及相关信息
Post.prototype.save = function (callback) {
    var date = new Date();

    //存储各种类型时间(似乎并没有必要)
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' + (date.getMonth() + 1),
        day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }

    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
    }

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //将文档插入posts集合
            collection.insert(post, {safe: true}, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })
        });
    });
};

//读取文章及其相关信息
Post.getAll = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({time: -1}).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);
            });
        });
    });
}

//获取一篇文章
Post.getOne = function (name,day,title,callback) {
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //根据用户名，发表日期及文章名进行查询
            collection.findOne({
                name: name,
                "time.day":day,
                title: title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                //解析markdown为html
                doc.post = markdown.toHTML(doc.post);
                callback(null,doc);
            });
        });
    });
}

//返回原始发表的内容
Post.edit = function(name,day,title,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //根据用户名，发表日期及文章名进行查询
            collection.findOne({
                name: name,
                "time.day":day,
                title: title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                callback(null,doc);
            });
        });
    });
}

//更新文章数据
Post.update = function(name,day,title,post,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}
var express = require('express');
var crypto = require('crypto');
var User = require('../models/user.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: '主页',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: '登录' });
});
router.get('/reg', function(req, res, next) {
  res.render('reg', {
    title: '注册' ,
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/reg',function(req,res,next){
  var name = req.body.name,
      password = req.body.password,
      re_password = req.body['password-repeat'];

  //检验用户两次输入的密码是否一致
  if(password!==re_password){
    req.flash('error','两次输入的密码不一致');
    return res.redirect('/reg');//返回注册页
  }

  //生成密码的 MD5 值
  var md5 = crypto.createHash('md5'),
      pwd = md5.update(password).digest('hex');
  var newUser = new User({
    name: name,
    password: pwd,
    email: req.body.email
  });

  //检查用户名是否已经存在
  User.get(newUser.name,function(err,user){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    if(user){
      req.flash('error','用户已存在！');
      return res.redirect('/reg');//返回注册页
    }

    //如果用户不存在则新增用户
    newUser.save(function(err,user){
      if(err){
        req.flash('error',err);
        return res.redirect('/reg');//注册失败返回注册页
      }
      req.session.user = user;//用户信息存入session
      req.flash('success','注册成功');
      res.redirect('/');//注册成功后返回主页
    });
  });

});
module.exports = router;

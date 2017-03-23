var express = require('express');
var router = express.Router();
var model = require('../models/dbSchema');
var user = require('./users');

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.name){
        res.redirect('users/')
    }
  res.render('index', { title: 'Iniciar Sesión' });
});
router.post('/', function(req, res, next) {
  dataUser = {nombre:req.body.usuario,pwd:req.body.password}
  model.Auth(dataUser,function (callback) {
      if(callback.error == false){
        req.session.name = callback.rows;
        res.redirect('users/')
      }else{
        res.render('index',{title:callback.rows})
      }
  })
});

module.exports = router;

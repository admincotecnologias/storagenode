var express = require('express');
var index = require('./index');
var model = require('../models/dbSchema')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  model.getUsers(function (callback) {
      if(callback.err == false){
          res.render('users', { title: 'File Manager',users:callback.rows });
      }
  })
});
router.delete('/delete/:id', function(req, res, next) {
    model.deleteUser(req.params.id,function (callback) {
        res.json(callback)
    })
});
router.get('/create', function(req, res, next) {
  res.render('create_user', { title: 'File Manager' });
});
router.post('/create_user', function(req, res, next) {
    var userdata = {pwd:req.body.pwd,nombre:req.body.usuario}
    model.insertUser(userdata,function (callback) {
        if(callback.error){
            res.json({response:callback})
        }else {
            res.json({response:callback})
        }
    })
});
router.get('/edit', function(req, res, next) {
    res.render('edit_user', { title: 'File Manager',user:req.session.name.user });
});
router.post('/edit', function(req, res, next) {
    model.updateUser(req.session.name.id,req.body.password,function (callback) {
        if(callback.error){
            res.json({response:callback})
        }else {
            res.json({response:callback})
        }
    })
});

module.exports = router;

/**
 * Created by Enrique on 09/03/2017.
 */
var express = require('express');
var index = require('./index');
var model = require('../models/dbSchema')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    model.getApps(function (callback) {
        if(callback.err == false){
            res.render('aplications', { title: 'File Manager',applications:callback.rows });
        }
    })
});
router.delete('/delete/:id', function(req, res, next) {
    model.deleteApp(req.params.id,function (callback) {
        res.json(callback)
    })
});
router.post('/create_app', function(req, res, next) {
    model.insertApplication({nombre:req.body.nombre},function (callback) {
        if(callback.error){
            res.json({response:callback})
        }else {
            res.json({response:callback})
        }
    })
});

module.exports = router;
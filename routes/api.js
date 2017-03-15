/**
 * Created by Enrique on 09/03/2017.
 */
var express = require('express');
var fs = require('fs');
var model = require('../models/dbSchema');
var multer  = require('multer')
var upload = multer()
var router = express.Router();

/* GET file . */
router.get('/',function (req,res,next) {
    res.json({data:""});
})
router.get('/:route/:file', function(req, res, next) {
    var routeSlasher = req.params.route.toString().replace(/([,*])/g,'/')
    var token = req.header("token_storage");
    model.getRoute(token,routeSlasher,function (fullroute) {
        if(fullroute.error == false && fullroute.route){
            var route = 'uploads/'+fullroute.app.name+routeSlasher+req.params.file.replace(/([%*])/g,' ');
            fs.stat(route,function (err,stat) {
                if(err != null){
                    res.json({data:route,check:null})
                }else{
                    res.download(route)
                }
            });
        }else{
            if(fullroute.error == false && !fullroute.route && routeSlasher == '/'){
                var route = 'uploads/'+fullroute.app.name+routeSlasher+req.params.file.replace(/([%*])/g,' ');
                fs.stat(route,function (err,stat) {
                    if(err){
                        res.json({data:route,check:null})
                    }else{
                        res.download(route)
                    }
                });
            }else{
                res.json({data:"no existe ruta"})
            }
        }
    })
});
router.post('/:route/',upload.array('files'),function (req,res,next) {
    var path = req.params.route.toString().replace(/([,*])/g,'/');
    var token = req.header("token_storage");
    var files = req.files;
    model.insertFiles(token,path,files,function (callback) {
        if(callback){
            if(callback.error){
                res.json(callback);
            }else{
                res.json({error:callback.error,path:callback.path,requestroute:req.params.route.toString(),filename:callback.filename});
            }
        }else {
            res.json({error:true,data:null})
        }
    })
})
module.exports = router;
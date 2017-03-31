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
    res.json({data:"Storage App"});
})
router.get('/:route/:file', function(req, res, next) {
    try{
        var routeSlasher = req.params.route.toString().replace(/([,*])/g,'/')
        var token = req.header("token_storage");
        if(token!=null){
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
        }else{
            res.json({data:'no existe token'})
        }
    }catch (ex){
        res.json({error:true,data:"exception",ex:ex})
    }
});
router.delete('/:route/:file', function(req, res, next) {
    try{
        var routeSlasher = req.params.route.toString().replace(/([,*])/g,'/')
        var token = req.header("token_storage");
        model.getRoute(token,routeSlasher,function (fullroute) {
            if(fullroute.error == false && fullroute.route){
                var route = 'uploads/'+fullroute.app.name+routeSlasher+req.params.file.replace(/([%*])/g,' ');
                fs.stat(route,function (err,stat) {
                    if(err != null){
                        res.json({data:route,check:null})
                    }else{
                        fs.unlink(route,function(err){
                            if(err) {
                                res.json({error:true,data:'No se pudo eliminar archivo.'})
                            }else{
                                res.json({error:false,data:'Archivo eliminado'})
                            }
                        });
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
    }catch (ex){
        res.json({error:true,data:"exception",ex:ex})
    }
});
router.post('/:route/',upload.array('files'),function (req,res,next) {
    try{
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
    }    catch (ex){
        console.log(ex)
        res.json({error:true,data:'exception',ex:ex})
    }
})
module.exports = router;
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
                    var route = fullroute.route+req.params.file.replace(/([%*])/g,' ');
                    console.log(route)
                    if(fs.existsSync(route)) {
                        res.download(route)
                    }
                }else{
                    res.status(400)
                    res.json({data:"no existe ruta"})
                }
            })
        }else{
            res.status(401)
            res.json({data:'no existe token'})
        }
    }catch (ex){
        res.status(400)
        res.json({error:true,data:"exception",ex:ex})
    }
});
router.delete('/:route/:file', function(req, res, next) {
    try{
        var routeSlasher = req.params.route.toString().replace(/([,*])/g,'/')
        var token = req.header("token_storage");
        if(token!=null){
            model.getRoute(token,routeSlasher,function (fullroute) {
                if(fullroute.error == false && fullroute.route){
                    var route = fullroute.route+req.params.file.replace(/([%*])/g,' ');
                    fs.stat(route,function (err,stat) {
                        if(err != null){
                            res.status(404)
                            res.json({data:route,check:null,error:true})
                        }else{
                            fs.unlinkSync(route)
                            if(!fs.existsSync(route)){
                                res.json({data:route,error:false})
                            }
                        }
                    });
                }else{
                    res.status(404)
                    res.json({data:"no existe ruta"})
                }
            })
        }else{
            res.status(401)
            res.json({data:'no existe token'})
        }
    }catch (ex){
        res.status(400)
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
                    res.status(201)
                    res.json({error:callback.error,path:callback.path,requestroute:req.params.route.toString(),filename:callback.filename});
                }
            }else {
                res.status(400)
                res.json({error:true,data:null})
            }
        })
    }    catch (ex){
        console.log(ex)
        res.status(400)
        res.json({error:true,data:'exception',ex:ex})
    }
})
module.exports = router;
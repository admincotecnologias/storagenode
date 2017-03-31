/**
 * Created by Enrique on 03/03/2017.
 */
//creamos la base de datos tienda y el objeto Manager donde iremos almacenando la info
var bcrypt = require("bCrypt");
const fs = require('fs');
var multer  = require('multer');
const uuidV1 = require('uuid/v1');
var Objpath = require('path');
var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('filemanager'),
    Manager = {};
var upload = multer({ dest: 'uploads/' });
//elimina y crea la tablas
Manager.createTables = function()
{
    db.run("CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, token TEXT, " +
            "CONSTRAINT unique_name UNIQUE (name)"+
        ")");
    console.log("La tabla applications ha sido correctamente creada");
    db.run("CREATE TABLE IF NOT EXISTS directories (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT, idapp INTEGER,"+
        "FOREIGN KEY(idapp) REFERENCES applications(id), " +
            "CONSTRAINT unique_path UNIQUE (path)"+
        ")");
    console.log("La tabla directories ha sido correctamente creada");
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pdw TEXT, " +
            "CONSTRAINT unique_user UNIQUE (user)"+
        ")");
    console.log("La tabla users ha sido correctamente creada");
}

//inserta un nuevo usuario en la tabla users
Manager.insertUser = function(userData,callback)
{
    var stmt = db.prepare("INSERT INTO users VALUES (?,?,?)");
    bcrypt.hash(userData.pwd,10).then(function(hash){
        stmt.run(null,userData.nombre,hash,function (cb) {
            if(cb){
                stmt.finalize();
                callback({error:false,description:null});
            }else
                stmt.finalize();
                callback({error:true,description:cb})
        });
    });
}
//inserta una nueva app y crea carpeta root
Manager.insertApplication = function(appData,callback){
    if(!fs.existsSync('uploads/'+appData.nombre)){
        fs.mkdirSync('uploads/'+appData.nombre)
            if (!fs.existsSync('uploads/'+appData.nombre)) {
                console.log('Error al crear directorio', err);
            } else {
                var stmt = db.prepare("INSERT INTO applications VALUES (?,?,?)");
                bcrypt.hash(appData.nombre + Math.floor(Date.now()/1000), 10).then(function(hash) {
                    // Store hash in your password DB.
                    stmt.run(null,appData.nombre,hash,function (cb) {
                        if(cb != null){
                            if(cb.errno==19){
                                fs.rmdirSync('uploads/'+appData.nombre);
                                callback({error:true,description:"Ya existe ese registro"})
                            }else{
                                callback({error:true,description:cb})
                            }
                        }else{
                            callback({error:false,description:null});
                        }
                    });

                });
            }
    }else{
        return callback({error:true,description:"Ya existe Carpeta con ese nombre"});
    }
}
// inserta en directories 1 - n files
var saveFiles = function (path,files,callback) {
    var dir = fs.readdirSync('uploads/'+path);
    var data = 0;
    var error=[];
    files.forEach(function (item) {
        var filename = uuidV1()+Objpath.extname(item.originalname);
        var filetocreate = 'uploads/'+path+filename;
        console.log(filetocreate)
        fs.writeFile(filetocreate,item.buffer,function (err) {
            if (err){
                console.log(err)
                callback({error:true,data:err})
            }else{
                console.log("entra")
                callback({error:false,path:path+filename,filename:filename})
            }
        });
    });
}
Manager.insertFiles = function (token,path,files, callback) {
    try{
        db.all("SELECT * FROM applications WHERE token='"+token+"'",function (err,rows_app) {
            if(err){
                callback({error:true,data:err,description:"no se encontro aplicacion"})
            }else{
                if(rows_app.length>0){
                    var idapp = rows_app[0].id;
                    var apppath = rows_app[0].name + path;
                    if(!fs.existsSync('uploads/'+rows_app[0].name)){
                        fs.mkdirSync('uploads/'+rows_app[0].name);
                    }
                    if(!fs.existsSync('uploads/'+apppath)){
                        var stmt = db.prepare("INSERT INTO directories VALUES (?,?,?)");
                        stmt.run(null,apppath,idapp,function (cb) {
                            var patharray = path.split('/')
                            var pathcreate = 'uploads/'+rows_app[0].name;
                            for(Single in patharray){
                                if(patharray[Single]!=""){
                                    pathcreate = pathcreate+'/' + patharray[Single];
                                    console.log(pathcreate,patharray)
                                    try{
                                        fs.mkdirSync(pathcreate);
                                    }catch (ex){
                                        console.log(ex.code)
                                        callback({error:true,data:'exception',description:ex.code})
                                    }
                                }
                            }
                            saveFiles(apppath,files,function (CB) {
                                callback(CB);
                            })
                        });
                    }else {
                        saveFiles(apppath,files,function (CB) {
                            callback(CB);
                        })
                    }
                }
            }
        })
    }catch(ex){
        callback({error:true,data:'exception',ex:ex})
    }
}
//DELETE User by ID
Manager.deleteUser = function(id,callback)
{
    var retorno;
    var stmt = db.prepare("DELETE FROM users WHERE id = "+id.toString());
    stmt.run( function(err) {
        if(err)
        {
            retorno = {err:true, data:err};
        }
        else
        {
            retorno = {err:false, data:"Eliminado"};
        }
        callback(retorno);
    });
}
//DELETE Application by ID
Manager.deleteApp = function(id,callback)
{
    var retorno;
    var stmt = db.prepare("DELETE FROM applications WHERE id = "+id.toString());
    stmt.run( function(err) {
        if(err)
        {
            retorno = {err:true, data:err};
        }
        else
        {
            retorno = {err:false, data:"Eliminado"};
        }
        callback(retorno);
    });
}
//Update User by ID
Manager.updateUser = function(id,password,callback)
{
    var retorno;
    bcrypt.hash(password,10).then(function(hash){
        var stmt = db.prepare("UPDATE users SET pdw='"+hash+"' WHERE id = "+id.toString());
        stmt.run( function(err) {
            if(err)
            {
                retorno = {err:true, data:err};
            }
            else
            {
                retorno = {err:false, data:"Editado"};
            }
            callback(retorno);
        });
    });
}
//obtenemos todos los clientes de la tabla clientes
//con db.all obtenemos un array de objetos, es decir todos
Manager.getRoute = function(token,path, callback)
{
    db.all("SELECT * FROM applications WHERE token='"+token+"'",function (err,rows_app) {
        if(err){
            callback({error:true,data:"No se encontro applicacion",description:err})
        }else{
            if(path!='/'){
                db.all("SELECT * FROM directories WHERE path='"+rows_app[0].name+path+"' AND idapp="+rows_app[0].id, function(err, rows) {
                    if(err)
                    {
                        callback({error:true, rows:[],data:"No se encontro directorio",description:err});
                    }
                    else
                    {
                        if(rows.length>0){
                            callback({error:false, app:rows_app[0],route:rows});
                        }else{
                            callback({error:false, app:rows_app[0],route:null});
                        }
                    }
                });
            }else {
                callback({error:false, app:rows_app[0],route:null});
            }
        }
    })
}
//obtenemos todos los clientes de la tabla clientes
//con db.all obtenemos un array de objetos, es decir todos
Manager.getUsers = function(callback)
{
    db.all("SELECT * FROM users", function(err, rows) {
        if(err)
        {
            callback({err:true, rows:[]});
        }
        else
        {
            callback({err:false, rows:rows});
        }
    });
}
//obtenemos todos los clientes de la tabla clientes
//con db.all obtenemos un array de objetos, es decir todos
Manager.getApps = function(callback)
{
    db.all("SELECT * FROM applications", function(err, rows) {
        if(err)
        {
            callback({err:true, rows:[]});
        }
        else
        {
            callback({err:false,rows:rows});
        }
    });
}

//obtenemos un usuario por su id, en este caso hacemos uso de db.get
//ya que sólo queremos una fila
Manager.Auth = function(userData, callback)
{
    stmt = db.prepare("SELECT * FROM users WHERE user = ?");
    //pasamos el id del cliente a la consulta
    stmt.bind(userData.nombre);
    stmt.get(function(error, rows)
    {
        if(error)
        {
            callback({error:true, rows:error});
        }
        else
        {
            //retornamos la fila con los datos del usuario
            if(rows)
            {
                bcrypt.compare(userData.pwd, rows.pdw,function (err,cb) {
                    if(cb){
                        callback({error:false, rows:rows});
                    }else{
                        callback({error:true, rows:"Contraseña no coincide"});
                    }
                });
            }
            else
            {
                callback({error:true, rows:"No Existe Usuario"});
            }
        }
    });
}
//exportamos el modelo para poder utilizarlo con require
module.exports = Manager;

/**
 * Created by Enrique on 07/03/2017.
 */
$(document).ready(function () {
    $(".modal").modal();
    $("#create_user").click(function () {
        var json = {usuario: $("#usuario_create").val(),pwd:$("#password_create").val()}
        if($("#usuario_create").val()!="" && $("#password_create").val()!=""){
            $.ajax({
                type: "post",
                url: window.location.origin + "/users/create_user",
                cache: false,
                data: JSON.stringify(json),
                contentType: "application/json",
                crossDomain: true,
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                complete: function(msg) {
                    // Replace the div's content with the page method's return.
                    res = msg.responseJSON
                    if(res.error){
                        Materialize.toast("Ya existe usuario.",4000)
                    }else {
                        Materialize.toast("Usuario Creado",2000,'',function () {
                            window.location.replace(window.location.origin + "/users");
                        })
                    }
                },error: function (error) {
                    console.log(error)
                }
            });
        }
    })
    $("table tbody tr td a#deleteUser").on("click",function (btn) {
        var idUser = btn.delegateTarget.attributes["data-id"].value
        $.ajax({
            type: "delete",
            url: window.location.origin + "/users/delete/"+idUser,
            cache: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            complete: function(msg) {
                // Replace the div's content with the page method's return.
                console.log(msg)
                res = msg.responseJSON
                if(res.error){
                    Materialize.toast("Ya existe usuario.",4000)
                }else {
                    Materialize.toast("Usuario Creado",2000,'',function () {
                        window.location.reload(true)
                    })
                }
            },error: function (error) {
                console.log(error)
            }
        });
    })
    $("#edit_user").click(function () {
        if($("#password_1").val()!="" && $("#password_1").val()==$("#password_2").val()){
            $.ajax({
                type: "post",
                url: window.location.origin + "/users/edit",
                cache: false,
                data: JSON.stringify({password:$("#password_1").val()}),
                contentType: "application/json",
                crossDomain: true,
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                complete: function(msg) {
                    // Replace the div's content with the page method's return.
                    res = msg.responseJSON
                    if(res.error){
                        Materialize.toast("No se pudo editar usuario.",4000)
                    }else {
                        Materialize.toast("Usuario editado",2000,'',function () {
                            window.location.replace(window.location.origin + "/users");
                        })
                    }
                },error: function (error) {
                    console.log(error)
                }
            })
        }else{
            Materialize.toast("Contraseña debe ser valida",3000)
        }
    })
    $("#createApp").click(function () {
        var json = {nombre:$("#nameApp").val()}
        if($("#nameApp").val()!=""){
            $.ajax({
                type: "post",
                url: window.location.origin + "/applications/create_app",
                cache: false,
                data: JSON.stringify(json),
                contentType: "application/json",
                crossDomain: true,
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                complete: function(msg) {
                    console.log(msg)
                    // Replace the div's content with the page method's return.
                    res = msg.responseJSON.response
                    if(res.error){
                        Materialize.toast(res.description,4000)
                    }else {
                        Materialize.toast("Aplicación Creada",2000,'',function () {
                            //window.location.reload();
                        })
                    }
                },error: function (error) {
                    console.log(error)
                }
            });
        }
    })
    $("table tbody tr td a#deleteApp").on("click",function (btn) {
        var idUser = btn.delegateTarget.attributes["data-id"].value
        $.ajax({
            type: "delete",
            url: window.location.origin + "/applications/delete/"+idUser,
            cache: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            complete: function(msg) {
                // Replace the div's content with the page method's return.
                console.log(msg)
                res = msg.responseJSON
                if(res.error){
                    Materialize.toast("Ya existe applicación.",4000)
                }else {
                    Materialize.toast("Aplicación Eliminada,ahí nomás quedo",2000,'',function () {
                        window.location.reload(true)
                    })
                }
            },error: function (error) {
                console.log(error)
            }
        });
    })
});

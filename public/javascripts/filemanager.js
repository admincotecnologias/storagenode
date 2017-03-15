/**
 * Created by Enrique on 08/03/2017.
 */
$(document).ready( function() {
    $('#container_id').fileTree({
        root: 'uploads/',
        script: '/files/getDir',
        expandSpeed: 1000,
        collapseSpeed: 1000,
        multiFolder: false
    }, function(file) {
        $.ajax({
            type: "get",
            url: window.location.origin + "/files/"+file.replace(/[/*]/g,','),
            cache: false,

            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },complete:function (response) {
                    console.log(response)
                if(!response.responseJSON){
                    if(response.getResponseHeader("Content-Type").includes("image")){
                        $("#imgView").show();
                        $("#imgView").attr("src",window.location.origin + "/files/"+file.replace(/[/*]/g,','));
                        $("#hrefDown").attr("href",window.location.origin + "/files/"+file.replace(/[/*]/g,','));
                        $("#dataFile").html("Extensión: "+response.getResponseHeader("Content-Disposition").split('.').pop().replace(/["*]/g,'')+'\n'+response.getAllResponseHeaders());
                    }else{
                        $("#dataFile").show();
                        $("#dataFile").html("Extensión: "+response.getResponseHeader("Content-Disposition").split('.').pop().replace(/["*]/g,'')+'\n'+response.getAllResponseHeaders());
                        $("#hrefDown").attr("href",window.location.origin + "/files/"+file.replace(/[/*]/g,','));
                        $("#imgView").hide();
                    }
                }else{
                    Materialize.toast("Error code: "+response.responseJSON.data.code,3000);
                }
            }
        });
    });
});
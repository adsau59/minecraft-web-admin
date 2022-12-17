
var app = angular.module('mcAdmin', []);


app.controller('MyController', function($http, $location, $scope) {

    var me = this;

    this.message = ["offline", "starting, please wait..", "online"]
    this.state = 0;
    this.title = "Minecraft Server"
    this.background = ""

    var socket = io($location.protocol() + "://" + $location.host() + ":" + $location.port());
    socket.emit('state');
    
    socket.on('state', function (data) {
        me.state = data;
        $scope.$apply();
    });

    socket.on('hi', data=>{
        me.state = data.state;
        me.title = data.title;
        me.background = {"background": `url('${data.background}') center center / cover no-repeat`};
        $scope.$apply();
    });

    this.toggle =function(){
        socket.emit('toggle');
    }

});


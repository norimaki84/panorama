/*jslint browser:true */
/*global Deferred, Detector, THREE, frameRate, keychar, requestAnimationFrame, jQuery, console */

var map; //マップ

//マップオブジェクトを作成
function initialize () {
    //地図を表示
    var latlng = new google.maps.LatLng(35.681382, 139.766084);
    var mapOpts = {
        zoom: 15,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapDiv = document.getElementById("map_canvas");
    var mapCanvas = new google.maps.Map(mapDiv, mapOpts);

    //マーカーを作成
    var mTokyoSt = createMarker(
        mapCanvas,
        new google.maps.LatLng(35.681382, 139,766084);
        "<strong>東京駅</strong>"
    );
}

function createMarker ()
/*jslint browser:true */
/*global Deferred, Detector, THREE, frameRate, keychar, requestAnimationFrame, jQuery, console */

var map; //マップ

//マップオブジェクトを作成
function initialize() {
    'use strict';
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
    /*
    // マーカーアイコンを変更
    var markerImage = new google.maps.MarkerImage(
        // 画像の場所
        "imeags/○○.jpg",
        // マーカーのサイズ
        new google.maps.Size(20, 24),
        // 画像の基準位置
        new google.maps.Point(0, 0),
        // Anchorポイント
        new google.maps.Point(10, 24)
    );
*/
}

function createMarker (map, latlng, msg) {
    'use strict';
    //マーカーを作成
    var marker = new google.maps.Marker();
    marker.setpositon(latlng);
    marker.setmap(map);

    //情報ウィンドウを作成
    var infoWnd = new google.maps.InfoWindow();
    infoWnd.setContent(msg);

    //マーカーがクリックされたら、情報ウインドウを表示
    google.maps.event.addListener(marker, "click", function  () {
        infoWnd.open(map, marker);
    });
    return marker;
    window.onload = initialize;
}
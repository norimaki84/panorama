/*jslint browser:true */
/*global jQuery, Deferred */

var maps, points, links, date, next, modals, mapsFile, linksFile, pointsFile, dateFile, modalsFile,
    alert, initPanorama, construct, view_construct, init_help;

jQuery(document).ready(function () {
    'use strict';

    mapsFile = 'maps.json';
    linksFile = 'links.json';
    pointsFile = 'points.json';
    dateFile = 'date.json';
    modalsFile = 'modals.json';

    Deferred.define();

    next(function () {
        return jQuery.getJSON(mapsFile, { format: 'json' }, function (json) {
            maps = json;
        });
    }).error(function () {
        alert("エラー");
    }).next(function () {
        return jQuery.getJSON(pointsFile, { format: 'json' }, function (json) {
            points = json;
        });
    }).error(function () {
        alert("エラー");
    }).next(function () {
        return jQuery.getJSON(linksFile, { format: 'json' }, function (json) {
            links = json;
        });
    }).error(function () {
        alert("エラー");
    }).next(function () {
        return jQuery.getJSON(dateFile, { format: 'json' }, function (json) {
            date = json;
        });
    }).error(function () {
        alert("エラー");
    }).next(function () {
        return jQuery.getJSON(mapsFile, { format: 'json' }, function (json) {
            modals = json;
        });
    }).error(function () {
        alert("エラー");
    }).next(function () {
        initPanorama();
    });
});

/*
jQuery(window).load(function () {

});
*/
/* var initPanorama = function() {
    construct(texts); 
    view_construct(); 
    init_help(); 
};*/
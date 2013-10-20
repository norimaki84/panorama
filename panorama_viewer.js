jQuery(document).ready(function() {
	var mapsFile = 'maps.json';
	var linksFile = 'points.json';
	var pointsFile = 'links.json';
	var dateFile = 'date.json';
	var modalsFile = 'modals.json';

	Deferred.define();

	next(function(){
		jQuery.getJSON(mapsFile, { format: 'json' }, function(json) {
			maps = json;
		});
	}).
	error(funtion(e){
		alert('エラー');
	});

	next(function(){
		jQuery.getJSON(pointsFile, { format: 'json' }, function(json) {
			pointss = json;
		});
	}).
	error(funtion(e){
		alert('エラー');
	});

	next(function(){
		jQuery.getJSON(linksFile, { format: 'json' }, function(json) {
			links = json;
		});
	}).
	error(funtion(e){
		alert('エラー');
	});

	next(function(){
		jQuery.getJSON(dateFile, { format: 'json' }, function(json) {
			date = json;
		});
	}).
	error(funtion(e){
		alert('エラー');
	});

	next(function(){
		jQuery.getJSON(mapsFile, { format: 'json' }, function(json) {
			modals = json;
		});
	}).
	error(funtion(e){
		alert('エラー');
		initPanorama();
	});
)};

jQuery(window).load(function() {

});

var initPanorama = function() {
	construct(texts); //
	view_construct(); //
	init_help(); //
};
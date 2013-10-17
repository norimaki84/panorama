jQuery(document).ready(function() {
	var mapsFile = 'maps.json';
	var linksFile = 'points.json';
	var pointsFile = 'links.json';
	var dateFile = 'date.json';
	var modalsFile = 'modals.json';

	jQuery.getJSON(mapsFile, { format: 'json' }, function(json) {
		maps = json;
		jQuery.getJSON(linksFile, { format: 'json' }, function(json) {
			links = json;
			jQuery.getJSON(pointsFile, { format: 'json' }, function(json) {
				points = json;
				jQuery.getJSON(dateFile, { format: 'json' }, function(json) {
					date = json;
					jQuery.getJSON(modalsFile, { format: 'json' }, function(json) {
						modals = json;
					initPanorama();
					});
				});
			});
		});
	});
});

jQuery(window).load(function() {

});

var initPanorama = function() {
	construct(texts); //??
	view_construct(); //??
	init_help(); //??
};
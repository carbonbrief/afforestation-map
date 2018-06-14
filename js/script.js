
var map = new mapboxgl.Map({
    container: 'map',
    style: 'https://openmaptiles.github.io/positron-gl-style/style-cdn.json',
    center: [8, 20],
    zoom: 1.8
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

var bounds = [
    [ -100, -70],[120, 85]
]

var getYear = {
    2011: "1990",
    2012: "2000",
    2013: "2005",
    2014: "2010",
    2015: "2015"
}

// resize map for the screen
map.fitBounds(bounds, {padding: 5});

var year = 2015;

var filterHasData = ['>=', ['number', ['get', "2015"]], 0];

var filterBelowZero = ['<', ['number', ['get', "2015"]], 0];

// var filterYear = ['==', ['number', ['get', 'sliderYear']], year];

map.on('load', function() {

    map.addLayer({
        id: 'withData',
        type: 'fill',
        source: {
          type: 'geojson',
          data: './data/afforestation.geojson'
        },
        paint: {
            'fill-color': {
                property: '2015',
                type: 'exponential',
                stops: [
                    [50, '#ffffcc'],
                    [5000, '#78c679'],
                    [50000, '#006837']
                ]
            },
            'fill-opacity': 0.75
        },
        'filter': ['all', filterHasData]
    });

    map.addLayer({
        id: 'withoutData',
        type: 'fill',
        source: {
          type: 'geojson',
          data: './data/afforestation.geojson'
        },
        paint: {
            'fill-color': "#999999",
            'fill-opacity': 0.75
        },
        'filter': ['all', filterBelowZero]
    });

    document.getElementById('slider').addEventListener('input', function(e) {

        sliderYear = parseInt(e.target.value);

        year = getYear[sliderYear];

        // update text in the UI
        document.getElementById('active-year').innerText = year;

        // update filters
        var filterHasData = ['>=', ['number', ['get', year]], 0];

        var filterBelowZero = ['<', ['number', ['get', year]], 0];

        map.setFilter('withData', ['all', filterHasData]);

        map.setFilter('withoutData', ['all', filterBelowZero]);

        map.setPaintProperty('withData', 'fill-color', {
            property: year,
            type: 'exponential',
            stops: [
                [50, '#ffffcc'],
                [5000, '#78c679'],
                [50000, '#006837']
            ]
        });

    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'withData', function(e) {

        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        var name = e.features[0].properties.ADMIN;
        var forest = e.features[0].properties[year]

        popup.setLngLat(e.lngLat)
            .setHTML('<h3 style = "color: #7bb888;">' + name 
            + '</h3><p><span class="label-title">Planted forest (1000 ha): </span>' + forest)
            .addTo(map);

    });

    // remove popups on mouseleave
    map.on('mouseleave', 'withData', function() {

        map.getCanvas().style.cursor = '';
        popup.remove();

    });

    map.on('mouseenter', 'withoutData', function(e) {

        map.getCanvas().style.cursor = 'pointer';

        var name = e.features[0].properties.ADMIN;
        /*var currentYear = e.features[0].properties.year;*/

        popup.setLngLat(e.lngLat)
            .setHTML('<h3 style = "color: #7bb888;">' + name 
            + '</h3><p><span class="label-title">Data unavailable for current year</span>')
            .addTo(map);

    });

    map.on('mouseleave', 'withoutData', function() {

        map.getCanvas().style.cursor = '';
        popup.remove();

    });



});

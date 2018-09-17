var map = new mapboxgl.Map({
    container: 'map', // container id
    style: {
        "version": 8,
        "sources": {
            "simple-tiles": {
                "type": "raster",
                // point to our third-party tiles. Note that some examples
                // show a "url" property. This only applies to tilesets with
                // corresponding TileJSON (such as mapbox tiles). 
                "tiles": [
                   "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                ],
                "tileSize": 256,
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            }
        },
        "layers": [{
            "id": "simple-tiles",
            "type": "raster",
            "source": "simple-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    },
    center: [0, 10], // starting position
    zoom: 0.6, // starting zoom
    maxZoom: 4
});


/*var screenWidth = $(window).width();

var boundsMobile = [
    [ -250, 10],[280, 55]
]

var boundsLaptop = [
    [ -170, -65],[185, 85]
]

var boundsDesktop = [
    [ -80, -120],[20, 86]
]*/


function getBounds () {
    // 850 pixels is the screen width below which the charts get hidden
    if (1024 > screenWidth && screenWidth > 850) {
        return boundsLaptop
    } 

    else if (screenWidth > 1024){
        return boundsDesktop
    }

    else {
        return boundsMobile
    }
}

/*var bounds = getBounds();*/

/*var map = new mapboxgl.Map({
    container: 'map',
    style: 'https://openmaptiles.github.io/positron-gl-style/style-cdn.json',
    center: [0, 10],
    minZoom: 0.6,
    maxZoom: 4
});*/


// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

var getYear = {
    2011: "1990",
    2012: "2000",
    2013: "2005",
    2014: "2010",
    2015: "2015"
}

// resize map for the screen
/*map.fitBounds(bounds, {padding: 5});*/

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
        var forest = ((e.features[0].properties[year])*1000);

        var forestLabel = forest.toLocaleString('en');

        popup.setLngLat(e.lngLat)
            .setHTML('<h3 style = "color: #7bb888;">' + name 
            + '</h3><p><span class="label-title">Planted forest: </span>' + forestLabel + ' hectares</p>')
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

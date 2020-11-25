var MapboxApi = (function () {
    var ACCESS_TOKEN = 'pk.eyJ1IjoidHlsZXJjbGV2ZWxhbmQxIiwiYSI6ImNrOHFncXZtcDAzczUzZnFzajcxM2xha3IifQ.7-26SKXFNExaIUQAexIE9A';
    var BASE_URL = 'https://api.mapbox.com'

    function addQsParams(url, qsParams) {
        var qsUrl = url + '?';
        var qsArray = []
        for (var qsp in qsParams) {
            qsArray.push(qsp + '=' + qsParams[qsp]);
        }
        return qsUrl + qsArray.join('&') + '&access_token=' + MapboxApi.ACCESS_TOKEN;
    }

    async function forwardGeocodeSearchPlaces(searchText) {
        var geocodeUrl = BASE_URL + '/geocoding/v5/mapbox.places/';
        searchText = String(searchText);

        var requestUrl = geocodeUrl + `${searchText}.json`;

        requestUrl = addQsParams(requestUrl, {
            types: 'place'
        });

        var jqAjax;
        var p = new Promise(function(res, rej) {
            jqAjax = $.ajax({
                url: requestUrl
                }).done(function(data){
                    res(data);
                });
        });
        p.jqAjax = jqAjax;
        return p;
    }

    async function forwardGeocodeSearchPostalCodes(searchText) {
        var geocodeUrl = BASE_URL + '/geocoding/v5/mapbox.places/';
        searchText = String(searchText);

        var requestUrl = geocodeUrl + `${searchText}.json`;

        requestUrl = addQsParams(requestUrl, {
            types: 'postcode'
        });

        var jqAjax;
        var p = new Promise(function(res, rej) {
            jqAjax = $.ajax({
                url: requestUrl
                }).done(function(data){
                    res(data);
                });
        });
        p.jqAjax = jqAjax;
        return p;
    }

    async function reverseGeocodeSearchPlacesLatLong(lat, long) {
        var geocodeUrl = BASE_URL + '/geocoding/v5/mapbox.places/';

        var requestUrl = geocodeUrl + `${long},${lat}.json`;

        requestUrl = addQsParams(requestUrl, {
            types: 'place'
        });

        var retData = null;

        var jqAjax;
        var p = new Promise(function(res, rej) {
            jqAjax = $.ajax({
                url: requestUrl
                }).done(function(data){
                    res(data);
                });
        });
        p.jqAjax = jqAjax;
        return p;
    }

    async function reverseGeocodeSearchPostalCodesLatLong(lat, long) {
        var geocodeUrl = BASE_URL + '/geocoding/v5/mapbox.places/';

        var requestUrl = geocodeUrl + `${long},${lat}.json`;

        requestUrl = addQsParams(requestUrl, {
            types: 'postcode'
        });

        var retData = null;

        var jqAjax;
        var p = new Promise(function(res, rej) {
            jqAjax = $.ajax({
                url: requestUrl
                }).done(function(data){
                    res(data);
                });
        });
        p.jqAjax = jqAjax;
        return p;
    }

    return {
        //constants
        ACCESS_TOKEN: ACCESS_TOKEN
        //fns
        , forwardGeocodeSearchPlaces: forwardGeocodeSearchPlaces
        , forwardGeocodeSearchPostalCodes: forwardGeocodeSearchPostalCodes
        , reverseGeocodeSearchPlacesLatLong: reverseGeocodeSearchPlacesLatLong
        , reverseGeocodeSearchPostalCodesLatLong: reverseGeocodeSearchPostalCodesLatLong
    }
})();

async function getLatLongCenterOfZip(zipCode) {
    var centerLatLong = null;

    var responseData = await MapboxApi.forwardGeocodeSearchPostalCodes(zipCode);
    var resultsArray = responseData.features || [];
    
    if (resultsArray.length > 0) {
        topResult = resultsArray[0];
        centerLatLong = topResult.center.reverse();
    }

    return centerLatLong;
}

async function getPlaceNameFromLatLong(lat, long) {
    var nameLatLong = null;

    var responseData = await MapboxApi.reverseGeocodeSearchPlacesLatLong(lat, long);
    var resultsArray = responseData.features || [];
    
    if (resultsArray.length > 0) {
        topResult = resultsArray[0];
        nameLatLong = topResult.place_name;
    }

    return nameLatLong;
}

async function getPostalCodeFromLatLong(lat, long) {
    var postCode = null;

    var responseData = await MapboxApi.reverseGeocodeSearchPostalCodesLatLong(lat, long);
    var resultsArray = responseData.features || [];

    if (resultsArray.length > 0) {
        topResult = resultsArray[0];
        postCode = topResult.text;
    }

    return postCode;
}

function bindMapSearchAutocomplete(params) {
    params = params || {};
    var mapApi = params.mapApi;
    var $input = params.jqInput;
    var $datalist = params.jqDatalist;
    var onChange = params.onChange;
    var min_delay = 300; //300ms
    var minLength = 3;
    var datalistOptionTemplateHtml = '<option></option>';

    //unbind prev events
    $input.off('.msautocomplete');
    $datalist.off('.msautocomplete');

    //https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
    function delay(callback, ms) {
        var timer = 0;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
            callback.apply(context, args);
            }, ms || 0);
        };
    }

    //this acts as a datalist click handler
    $input.on('change.msautocomplete', function (e) {
        var $input = $(this);
        var $inputText = $input.val();
        var name = null;
        var center = null;
        $datalist.find('> option').each(function () {
            var $option = $(this);
            if ($option.attr('value') === $inputText) {
                // selectOption($option.data('center'));
                name = $input.val()
                center = $option.data('center')
            }
        });
        if (typeof onChange === 'function') {
            onChange(name, center);
        }
    });
      
    $input.on('keyup.msautocomplete', delay(function (e) {
        var $input = $(this);
        var searchText = $input.val();

        if (searchText.length >= 3) {
            loadDatalistResults(searchText);
        } else {
            clearDatalistResults();
        }
    }, min_delay));

    var ajaxObj;
    function loadDatalistResults(searchText) {
        if (ajaxObj != null) {
            ajaxObj.abort();
            ajaxObj = null;
        }

        var promise = MapboxApi.forwardGeocodeSearchPlaces(searchText);
        (async function () {
            var data = await promise;
            var features = data.features;
            clearDatalistResults();
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                var $thisOption = $(datalistOptionTemplateHtml);
                $thisOption.attr('value', feature.place_name);
                $thisOption.data('center', feature.center.reverse());
                $datalist.append($thisOption);
            }
        })();
        ajaxObj = promise.jqAjax;
    }

    function clearDatalistResults() {
        $datalist.children().not('.fixed-option').remove();
    }

    // function selectOption(center) {
    //     mapApi.panTo(Leaflet.latLng(center[1], center[0]), {
    //         animate: true
    //     });
    // }
}
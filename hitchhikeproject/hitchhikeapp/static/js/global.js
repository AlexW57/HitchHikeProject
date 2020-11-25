function jsonParse(jsonString) {
    jsonString = jsonString || '';
    jsonString = jsonString.replace(/'/g,'"');
    return JSON.parse(jsonString);
}

function showErrorPopup(msg) {
    $.alert({
        title: 'Error',
        content: msg,
    });
}

function getCurrentUserId() {
    return tryParseInt($('#currentUserId').text(), null);
}

$.fn.addEmptyTableRow = function (text='No records to display') {
    var $table = $(this);
    var colspan = $table.find('tbody > tr:first > td').length;
    $table.find('tbody > tr').remove();
    $table.find('tbody').append(`<tr style="text-align: center;"><td colspan="${colspan}">${text}</td></tr>`);
}

$.expr[':'].icontains = $.expr.createPseudo(function( text ) {
    text = text.toLowerCase();
    return function (el) {
        return ~$.text(el).toLowerCase().indexOf( text );
    }
});

//rating is between 0 and 5
$.fn.insertRating = function (rating) {
    var $container = $(this);
    $container.empty();

    var getStarHtml = function (isActivated) {
        return `<i class="fa fa-star" style="margin-right: 4px; color: ${ isActivated ? 'yellow' : 'lightgrey'};"></i>`
    }
    
    var innerStarHtmlArr = [];
    for (var i = 1; i <= 5; i++) {
        innerStarHtmlArr.push(getStarHtml(i <= rating));
    }

    $container.html(`
        <span style="background-color: slategrey; padding: 5px; border-radius: 5px; height: 15px;">
            ${ innerStarHtmlArr.join('') }
        </span>
        `);
}

/* CONSTANTS */

var rideStatus = {
    Upcoming: 10
    , Completed: 20
}

var userRole = {
    Driver: 10
    , Rider : 20
}


//  re-map variables
var Leaflet = L;
var NS = NS || {};

NS.App = (function () {

    var URL_API = "";
    var query = "";
    var geocoder = "";

    // Initialize the application
    var init = function () {
        geocoder = new google.maps.Geocoder;
        URL_API = 'https://query.yahooapis.com/v1/public/yql?q=';
        query = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='%s') and u='c'&format=json";
        NS.App.scroll();
        console.info('Application initialized...');
    };

    // Get weather
    var weatherGet = function (term) {
        var url = URL_API + query.replace("%s", term);
        $.ajax({
            type: "GET",
            url: url,
            async: true,
            success: function (data) {
                if (data.query.count > 0) {
                    $('#result').css({'display': 'block'});
                    $('html, body').animate({
                        scrollTop: $("#result").offset().top
                    }, 500);
                    NS.App.weatherSet(data.query.results.channel);

                } else {
                    $("#modalCity").html(term);
                    $('#info').modal("toggle");
                    $('#result').css({'display': 'none'});
                }
                $("#term").val('');
                $('#search').html('<i class="fa fa-search"></i> Search');
                $('#location').html('<i class="fa fa-location-arrow"></i> Use location');
            },
            error: function (data) {
                console.log(data);
            }
        });
    };

    // Present weather data
    var weatherSet = function (data) {

        var items = document.getElementById('items');
        var current = document.getElementById('current');

        $('#city').html(data.location.city + ", " + data.location.country);

        var div = document.createElement('div');
        div.className = 'col-md-6 col col-md-offset-3';

        var currentDay = data.item.forecast[0].day;
        var currentDate = data.item.forecast[0].date;
        var currentText = data.item.forecast[0].text;
        var img = data.item.forecast[0].text;
        var currentTemp = data.item.condition.temp;
        var currentLowTemp = data.item.forecast[0].low;
        var currentHighTemp = data.item.forecast[0].high;

        var html = '<div class="card card-member">';
        html = html + '<div class="content">';
        html = html + '<p class="small-text">' + currentDay + ', ' + currentDate + '</p>';
        html = html + '<div class="avatar avatar-danger">';
        html = html + '<img alt="" class="img-circle" src = "assets/img/icons/' + img + '.svg" / >';
        html = html + '</div>';
        html = html + '<div class="description">';
        html = html + '<h3 class="title">' + currentText + '</h3>';
        html = html + '<p class="small-text">Low ' + currentLowTemp + ' ºC | Wigh ' + currentHighTemp + ' ºC</p>';
        html = html + '<p class="small-text">Current: ' + currentTemp + ' ºC</p>';
        html = html + '</div>';
        html = html + '</div>';
        html = html + '</div>';
        div.innerHTML = html;
        current.appendChild(div);


        for (var i = 1; i < 5; i++) {
            var newdiv = document.createElement('div');
            newdiv.className = 'col-md-3';

            var day = data.item.forecast[i].day;
            var date = data.item.forecast[i].date;
            var text = data.item.forecast[i].text;
            var lowTemp = data.item.forecast[i].low;
            var highTemp = data.item.forecast[i].high;

            var html = '<div class="card card-member">';
            html = html + '<div class="content">';
            html = html + '<p class="small-text">' + day + ', ' + date + '</p>';
            html = html + '<div class="avatar avatar-danger">';
            html = html + '<img alt="" class="img-circle" src = "assets/img/icons/' + text + '.svg" / >';
            html = html + '</div>';
            html = html + '<div class="description">';
            html = html + '<h3 class="title">' + text + '</h3>';
            html = html + '<p class="small-text">Low: ' + lowTemp + ' ºC | Wigh: ' + highTemp + ' ºC</p>';
            html = html + '</div>';
            html = html + '</div>';
            html = html + '</div>';
            newdiv.innerHTML = html;
            items.appendChild(newdiv);
        }
    };

    // On location success
    var locationSuccess = function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        var latlng = {lat: lat, lng: lng};
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === 'OK') {
                if (results[1]) {
                    var location = results[1].formatted_address;
                    NS.App.weatherGet(location);
                } else {
                    $("#errorMessage").html('No results found');
                    $('#error').modal("toggle");
                }
            } else {
                $("#errorMessage").html('Geocoder failed due to: ' + status);
                $('#error').modal("toggle");
            }
        });

    };

    // On location error
    var locationError = function (error) {
        switch (error.code) {
            case error.TIMEOUT:
                $("#errorMessage").html("A timeout occured! Please try again!");
                break;
            case error.POSITION_UNAVAILABLE:
                $("#errorMessage").html('We can\'t detect your location!');
                break;
            case error.PERMISSION_DENIED:
                $("#errorMessage").html('Please allow geolocation access for this to work.');
                break;
            case error.UNKNOWN_ERROR:
                $("#errorMessage").html('An unknown error occured!');
                break;
        }
        $('#location').html('<i class="fa fa-location-arrow"></i> Use location');
        $('#error').modal("toggle");
    };

    // Scroll to top
    var scroll = function () {
        // Scroll to top
        $('body').append('<div id="toTop"><span class="fa fa-chevron-up fa-2x"></span></div>');
        $(window).scroll(function () {
            if ($(this).scrollTop() !== 0) {
                $('#toTop').fadeIn();
            } else {
                $('#toTop').fadeOut();
            }
        });

    };

    // Share app
    var share = function (url) {
        window.open(url, '_blank');
    };

    // Return the public facing methods for the App
    return {
        init: init,
        weatherGet: weatherGet,
        weatherSet: weatherSet,
        locationSuccess: locationSuccess,
        locationError: locationError,
        scroll: scroll,
        share: share
    };

}());

$('#search').click(function () {
    var term = $('#term').val();
    if (term !== "") {
        $("#items, #current").html('');
        $('#search').html('<i class="fa fa-circle-o-notch fa-spin fa-lg"></i>');
        NS.App.weatherGet(term);
    }
});

$('#term').keypress(function (e) {
    var key = e.which;
    if (key === 13) {
        $('#search').click();
    }
});

$('#location').click(function () {
    $("#items, #current").html('');
    $('#location').html('<i class="fa fa-circle-o-notch fa-spin fa-lg"></i>');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(NS.App.locationSuccess, NS.App.locationError);
    } else {
        $("#errorMessage").html("Your browser does not support Geolocation!");
        $('#error').modal("toggle");
    }
});

$('#facebook').click(function () {
    var url = 'https://www.facebook.com/sharer/sharer.php?u=' + window.location.href;
    NS.App.share(url);
});

$('#twitter').click(function () {
    var url = 'https://twitter.com/intent/tweet?url=' + window.location.href + '&text=' + encodeURIComponent("Weather Forecast App");
    NS.App.share(url.replace('#', ''));
});

$('#toTop').click(function () {
    $("html, body").animate({scrollTop: 0}, 600);
    $('#term').focus();
});

$(function () {
    NS.App.init();
    new google.maps.places.SearchBox(document.getElementById('term'));
    $('#toTop').click(function () {
        $("html, body").animate({scrollTop: 0}, 600);
        $('#term').focus();
    });
});


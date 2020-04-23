var openWeatherMapsAPIKey = "788d5638d7c8e354a162d6c9747d1bdf";
var currentCity = "";
var lastCity = "";

function getURLParams() {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('key')) {
     openWeatherMapsAPIKey = urlParams.get('key');
    }
};

// https://api.jquery.com/jQuery.ajax/
// https://www.xul.fr/en/html5/fetch.php
function getBackgroundImage(){
    let unsplashKey="R_fPrwXAPD_TNN3gw5mXZOhXQ52yQ8aPTLvMPRe3U4Q";
    let bgQuery="https://api.unsplash.com/search/photos?client_id="+unsplashKey+"&query="+currentCity;
    $.ajax({
        url: bgQuery,
        method: "GET"
    }).done(function (response) {
        if (response.total>0){
            let bgImage = response.results[0].urls.regular;
            let artistCredit = `Photo by <a href="${response.results[0].user.links.html}">${response.results[0].user.name}</a> on <a href="https://unsplash.com">Unsplash</a>`;
            $('#header').attr("style", `background-image: url(${bgImage})`);
            $('#artist-credit').html(artistCredit);
        } else {
            console.log("No Unsplash Image Results");
            $('#header').attr("style", `background-image: url("https://images.unsplash.com/photo-1530908295418-a12e326966ba?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjk5MjM4fQ")`);
            $('#artist-credit').html(`Photo by <a href="https://unsplash.com/@kenrickmills">Kenrick Mills</a> on <a href="https://unsplash.com">Unsplash</a>`);
        }
        
    }).fail(function(response){
        console.log("Unsplash API Error: rate limit likely exceeded.");
        $('#header').attr("style", `background-image: url("https://images.unsplash.com/photo-1530908295418-a12e326966ba?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjk5MjM4fQ")`);
        $('#artist-credit').html(`Photo by <a href="https://unsplash.com/@kenrickmills">Kenrick Mills</a> on <a href="https://unsplash.com">Unsplash</a>`);
    });
};

// https://api.jquery.com/jQuery.ajax/
// https://www.xul.fr/en/html5/fetch.php
function getCurrentConditions(event) {
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();
    let longitude;
    let latitude;
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + openWeatherMapsAPIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function (response) {
        saveCity(city);
        $('#search-error').text("");
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        renderCities();
        getBackgroundImage();
        getFiveDayForecast(event);
        $('#header-text').text(response.name);
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY) h:mma")}<img src="${currentWeatherIcon}"></h3>
            <br>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">Mid-day UV Index:</li>
            </ul>`;
        $('#current-weather').html(currentWeatherHTML);
        latitude = response.coord.lat;
        longitude = response.coord.lon;
        let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + openWeatherMapsAPIKey;
        uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;
        $.ajax({
            url: uvQueryURL,
            method: "GET"
        }).done(function (response) {
            let uvIndex = response.value;
            $('#uvIndex').html(`Mid-day UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-green");
            } else if (uvIndex>=3 && uvIndex<6){
                $('#uvVal').attr("class", "uv-yellow");
            } else if (uvIndex>=6 && uvIndex<8){
                $('#uvVal').attr("class", "uv-orange");
            } else if (uvIndex>=8 && uvIndex<11){
                $('#uvVal').attr("class", "uv-red");
            } else if (uvIndex>=11){
                $('#uvVal').attr("class", "uv-violet");
            }
        });
    })
        .fail(function () {
            console.log("Current Weather API Error: city likely not found.");
            $('#search-error').text("City not found.");
        });
};

// https://api.jquery.com/jQuery.ajax/
// https://www.xul.fr/en/html5/fetch.php
function getFiveDayForecast(event) {
    let city = $('#search-city').val();
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + openWeatherMapsAPIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function (response) {
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                <ul class="list-unstyled p-3">
                <li>${thisMoment.format("MM/DD/YY")}</li>
                <li class="weather-icon"><img src="${iconURL}"></li>
                <li>Temp: ${dayData.main.temp}&#8457;</li>
                <li>Humidity: ${dayData.main.humidity}%</li>
                </ul>
                </div>
                <br>`;
            }
        };
        fiveDayForecastHTML += `</div>`;
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
        .fail(function () {
            console.log("Forecast API Error");
        });
};

function saveCity(newCity) {
    let cityExists = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
};

function renderCities() {
    $('#city-results').empty();
    if (localStorage.length===0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Los Angeles");
        }
    } else {
        let lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);
        $('#search-city').attr("value", lastCity);
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            if (currentCity===""){
                currentCity=lastCity;
            }
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#city-results').prepend(cityEl);
        }
        if (localStorage.length>0){
            $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        } else {
            $('#clear-storage').html('');
        }
    }
    
};

function createEventListeners() {
    $('#search-button').on("click", function (event) {
        event.preventDefault();
        currentCity = $('#search-city').val();
        currentCity = $('#search-city').val();
        getCurrentConditions(event);
    });

    $('#city-results').on("click", function (event) {
        event.preventDefault();
        $('#search-city').val(event.target.textContent);
        currentCity=$('#search-city').val();
        getCurrentConditions(event);
        getBackgroundImage();
    });

    $("#clear-storage").on("click", function(event){
        localStorage.clear();
        renderCities();
    });
};

function mainApp() {
    getURLParams();
    renderCities();
    getCurrentConditions();
    createEventListeners();
};

mainApp();
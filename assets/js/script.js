var owmApi = "788d5638d7c8e354a162d6c9747d1bdf";
var usApi = "R_fPrwXAPD_TNN3gw5mXZOhXQ52yQ8aPTLvMPRe3U4Q";
var currentCity = "";
var lastCity = "";
var city = $('search-city').val();
var apiURL = "https://api.openweathermap.org/data/2.5/weather?=" + city + "&units=imperial" + "&APPID=" + owmApi;

// Use URLSearchParams to get URL parameters and check url for API key
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
var getUrlPar = function() {
    let urlPar = new URLSearchParams(window.location.search);
    if (urlPar.has('key')) {
        owmApi = urlPar.get('key');
    }
};

// current weather
var getCurrentWeather = function (event) {
    currentCity = city;
    let longitude;
    let latitude;
    
    fetch(apiUrl).done(function(response) {
        saveCity(city);
        $('#search-error').text("");
        currentWeatherIcon="https://openwathermap.org/img/w/" + response.weather[0].icon + ".png";
        let UTCtime = response.dt;
        let timeOffset = response.timezone;
        let timeOffsetHours = timeOffset / 60 / 60;
        let currentMoment = moment.unix(UTCtime).utc().utcOffset(timeOffsetHours);
        renderCities();
        getBackgroundImage();
        getFiveDay(event);
        $('header-text').text(response.name);
        let currentHTML = `
            <h3>Current Conditions<img src="${currentWeatherIcon}"></h3>
            <h6>${currentMoment.format("MM/DD/YY h:mma")} local time</h6>
            <br>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
            </ul>`;
        $('#current-weather').html(currentHTML);
        latitude = response.coord.lat;
        longitude = response.coord.lat;
    })
        .fail(function () {
            console.log("Current Weather API Error: try another city.");
            $('#search-error').text("City not found!");
        });
};

// five day forcast
var getFiveDay = function(event) {
    fetch(apiUrl).done(function(response) {
        let fiveDayHTML = `
        <h2>5-Day Forecast</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        for(let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeOffset = response.city.timezone;
            let timeOffsetHours = timeOffset; / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weahter[0].icon + ".png";
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss:") === "13:00:00") {
                fiveDayHTML += `
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
        fiveDayHTML += '</div>';
        $('#five-day-forecast').html(fiveDayHTML);
})
    .fail(function() {
        console.log("Forecast API Error");
    });
}
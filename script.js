const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFound = document.querySelector("[data-notFound]");

const API_key = process.env.OPENWEATHER_KEY;
let oldTab = userTab;
oldTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(newTab){
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            notFound.classList.remove("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            notFound.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    } 
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    notFound.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        if (data.cod !== 200) {
            notFound.classList.add("active");
            return;
        }
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    const latitude = document.querySelector("[data-latitude]");
    const longitude = document.querySelector("[data-longitude]");
    const temp_min = document.querySelector("[data-temp-min]");
    const temp_max = document.querySelector("[data-temp-max]");
    const pressure = document.querySelector("[data-pressure]");
    const visibility = document.querySelector("[data-visibility]");
    const sunrise = document.querySelector("[data-sunrise]");
    const sunset = document.querySelector("[data-sunset]");

    cityName.textContent = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.textContent = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.textContent = `${weatherInfo?.main?.temp} °C`;
    windspeed.textContent = `${weatherInfo?.wind?.speed} m/s`;
    humidity.textContent = `${weatherInfo?.main?.humidity}%`;
    cloudiness.textContent = `${weatherInfo?.clouds?.all}%`;
    latitude.textContent = `Lat: ${weatherInfo?.coord?.lat.toFixed(3)}`;
    longitude.textContent = `Lon: ${weatherInfo?.coord?.lon.toFixed(3)}`;
    temp_min.textContent = `Min: ${weatherInfo?.main?.temp_min} °C`;
    temp_max.textContent = `Max: ${weatherInfo?.main?.temp_max} °C`;
    pressure.textContent = `${weatherInfo?.main?.pressure} hPa`;
    visibility.textContent = `${weatherInfo?.visibility/1000} km`;

    const sunriseLocal = new Date((weatherInfo?.sys?.sunrise) * 1000);
    const sunsetLocal = new Date((weatherInfo?.sys?.sunset) * 1000);
    const options = { hour: "2-digit", minute: "2-digit" };
    const sunriseTime = sunriseLocal.toLocaleTimeString([], options);
    const sunsetTime = sunsetLocal.toLocaleTimeString([], options);
    sunrise.textContent = sunriseTime + " IST";
    sunset.textContent = sunsetTime + " IST";
    console.log(weatherInfo?.rain);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        window.alert("No Geolocation API support available");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    } else {
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if (data.cod !== 200) {
            notFound.classList.add("active");
            return;
        }
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
    }
}


const API_KEY = '5a2f7125d3254e451adfb08cdcdffb0d';
const IMAGE_ACCESS_KEY="dvoOoeKaJsvlOfa_K3aDH74aIyj7CrZGxaGP6vmpldg";
// to get the actual longitude latitude
window.addEventListener("DOMContentLoaded", () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            getWeatherByCoords(lat,lon);
        },
        error => {
            console.log(error);
            getWeatherByCity("Delhi");
        }
    );
});
function showLoader() {
    document.getElementById("card-loader")
        .classList.add("active");
}

function hideLoader() {
    document.getElementById("card-loader")
        .classList.remove("active");
}
//find current location weather with lat and lon
async function getWeatherByCoords(lat, lon) {
    showLoader()
    try {
        const realTimeApiUrl =`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const res = await fetch(realTimeApiUrl);
        if (!res.ok) throw new Error("Location not found");
        const data = await res.json();
        displayCurrentWeather(data);
        // displayForecast(data);
        hideErrorMsg()
    } 
    catch(error){
        showErrorMsg(error.message)
        
}
finally{
    hideLoader();
}

}
async function getWeatherByCity(city){
    showLoader();
    try{
        const searchResponse=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!searchResponse.ok) throw new Error("Location not found");
        const searchData=await searchResponse.json();
        displayCurrentWeather(searchData);
        hideErrorMsg()
    }
    catch(error){
        showErrorMsg(error.message)
        console.log(error.message);
    }
    finally{
        hideLoader()
    }

}


async function displayCurrentWeather(RealWheatherData) { 
    showLoader()  
    try {
        document.getElementById("place").innerHTML=RealWheatherData.name;
        document.getElementById("temprature").innerHTML=Math.round(RealWheatherData.main.temp);
        document.getElementById("condition").innerHTML=RealWheatherData.weather[0].description;
        document.getElementById("humidity").innerHTML=Math.round(RealWheatherData.main.humidity);
        document.getElementById("wind").innerHTML=Math.round(RealWheatherData.wind.speed*3.6)+ " km/h";
        document.getElementById("visibility").innerHTML=Math.round(RealWheatherData.visibility/1000 )+" km";
        document.getElementById("feeling-temprature").innerHTML=Math.round(RealWheatherData.main.feels_like);
        setupFavoriteToggle(); 
        displayFavourites();
        displayImage(RealWheatherData.name);
        displayForcast(RealWheatherData.name);
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        if (favorites.includes(RealWheatherData.name.toLowerCase())) {
        document.querySelector(".bi-heart-fill").style.color = "red";
        } else {
        document.querySelector(".bi-heart-fill").style.color = "white";
        }

    } catch (error) {
        console.log("Error:",error.message);
    }
    finally{
        hideLoader();
    }
       

}
async function displayImage(city) {
        try{

        const weatherCard=document.getElementById("weatherCard");
        const imageResponse=await fetch(`https://api.unsplash.com/search/photos?query=${city}&per_page=1&client_id=${IMAGE_ACCESS_KEY}`);
        const imageData=await imageResponse.json();
        const imageUrl=imageData.results[0]?.urls?.regular??`image.png`;
        weatherCard.style.backgroundImage=`url(${imageUrl})`;
        weatherCard.style.backgroundSize="cover";
    }
    catch(error){
        console.log(error.message)
    }

}

async function displayForcast(city) {
    try{
        const forecastFetch=await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData=await forecastFetch.json()
        const fiveDaysForeCast= weatherData.list.filter(item =>
            item.dt_txt.includes("12:00:00"));
        //set 5 days temprature
        const tempArray=document.querySelectorAll(".temp-section");
            tempArray.forEach((temp,index)=>{           
                temp.innerHTML=`${Math.round(fiveDaysForeCast[index].main.temp)}°C`;
            })
        const conditionArray=document.querySelectorAll(".condition-section"); 
        conditionArray.forEach((condition,index)=>{           
                condition.innerHTML=`${fiveDaysForeCast[index].weather[0].description}`;
            }) 
        const dateArray=document.querySelectorAll(".day-top"); 
        dateArray.forEach((date,index)=>{           
                let dateSlice=`${fiveDaysForeCast[index].dt_txt}`;
                date.innerHTML=dateSlice.slice(0,10);
            }) 
        const iconArray = document.querySelectorAll(".icon-forecast");

        iconArray.forEach((iconElement, index) => {
        const forecastDay = fiveDaysForeCast[index]; // forecast object
        const iconCode = forecastDay.weather[0].icon; // e.g. "04d"
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        iconElement.innerHTML = `<img src="${iconUrl}" alt="${forecastDay.weather[0].description}" />`;
});
    
}
catch(error){
    console.log(error.message);
}
}
    

const search=()=>{
    const city=document.getElementById("cityInput").value
    if(city){
    getWeatherByCity(city);
    }   
}
const debouncing=(func,delay)=>{
    let timer;
    return function(...args){
        clearTimeout(timer);
        timer=setTimeout(()=>{          
            func.apply(this,args);
        },delay)
    }
}
const call=debouncing(search,1000);


// Utility: safely get favorites from localStorage
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
    displayFavourites();
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Call this AFTER you set #place.textContent with real data
function setupFavoriteToggle() {
  const heartIcon = document.querySelector(".bi-heart-fill");
  const placeElement = document.getElementById("place");
  const city = placeElement.textContent.trim().toLowerCase();

  let favorites = getFavorites();

  // Restore state
  if (favorites.includes(city)) {
    heartIcon.classList.add("active");
    heartIcon.style.color = "red";
  } else {
    heartIcon.classList.remove("active");
    heartIcon.style.color = "white";
  }

  // Toggle on click
  heartIcon.onclick = () => {
    let favorites = getFavorites();

    if (heartIcon.classList.contains("active")) {
      favorites = favorites.filter(fav => fav !== city);
      heartIcon.classList.remove("active");
      heartIcon.style.color = "white";
    } else {
      if (!favorites.includes(city)) {
        favorites.push(city);
      }
      heartIcon.classList.add("active");
      heartIcon.style.color = "red";
    }

    saveFavorites(favorites);
    // refresh list instantly
    displayFavourites(); 
  };
}

// Display FavourateList
function displayFavourites(){
    const container = document.getElementById("favoritesList");
    container.innerHTML = ""; // clear before re-render

    const favArray = JSON.parse(localStorage.getItem("favorites")) || [];
    favArray.forEach((place) => {
    let btn = document.createElement("button");
    btn.textContent = place;
    btn.style.padding = "10px 20px";
    btn.style.margin = "10px";
    btn.style.cursor = "pointer";
    btn.style.width = "150px";


    // Add click event to fetch weather for that city
    btn.addEventListener("click", () => {
      getWeatherByCity(place);
    });

    container.appendChild(btn);
  });
}

// theme button
const themeBtn = document.querySelector(".themeBtn");

// Restore theme from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
  themeBtn.textContent = "☀️"; // show sun icon
}

// Toggle theme on click
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  if (document.body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
    themeBtn.textContent = "☀️"; // switch to sun
  } else {
    localStorage.setItem("theme", "light");
    themeBtn.textContent = "🌙"; // switch to moon
  }
});

// to show error Msg function
function showErrorMsg(){
    document.getElementById("errorMsg").style.display="block";
}
function hideErrorMsg(){
    document.getElementById("errorMsg").style.display="none";
}

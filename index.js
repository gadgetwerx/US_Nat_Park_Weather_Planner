'use strict';

// NP api and search
const NPapiKey = 'HvNWtEydQ6YkISY3de3cd6bzXDWkDAtwQ6vlm0vq'; //National Park Service API key
const NPsearchURL = 'https://api.nps.gov/api/v1/parks';      //NPS query to return infor for chosen park
// AW search
const AWapiKey = 'v9J8A08TNlM3hR6OZPInQcfGoRVmgAcK'; //Alternate AW API Key
const AWsearchLKURL = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search'; //AW query LocationKey PRE-fix. Query to be added below
const AWsearchWURL = 'https://dataservice.accuweather.com/forecasts/v1/daily/5day/'; //AW query Forecast PRE-fix. Query to be added later.
// Global vars
let totalParkResults, updatedLatLong, searchState,randImages, chosenImage, parkImages;

function stateMenu(location){     //Re-usable form
  $(location).append(
`<h2>Choose a State</h2><br>
<form id="js-stateMenuForm">
      <label class="label" for="search-by">Search by:</label>
      <select id="state" name="states">
          <option value="nil">States</option>
          <option disabled>──────────</option>
          <option value="AL">Alabama - AL</option>
          <option value="AK">Alaska - AK</option>
          <option value="AZ">Arizona - AZ</option>
          <option value="AR">Arkansas - AR</option>
          <option value="CA">California - CA</option>
          <option value="CO">Colorado - CO</option>
          <option value="CT">Connecticut - CT</option>
          <option value="DE">Delaware - DE</option>
          <option value="FL">Florida - FL</option>
          <option value="GA">Georgia - GA</option>
          <option value="HI">Hawaii - HI</option>
          <option value="ID">Idaho - ID</option>
          <option value="IL">Illinois - IL</option>
          <option value="IN">Indiana - IN</option>
          <option value="IA">Iowa - IA</option>
          <option value="KS">Kansas - KS</option>
          <option value="KY">Kentucky - KY</option>
          <option value="LA">Louisiana - LA</option>
          <option value="ME">Maine - ME</option>
          <option value="MD">Maryland - MD</option>
          <option value="MA">Massachusetts - MA</option>
          <option value="MI">Michigan - MI</option>
          <option value="MN">Minnesota - MN</option>
          <option value="MS">Mississippi - MS</option>
          <option value="MO">Missouri - MO</option>
          <option value="MT">Montana - MT</option>
          <option value="NE">Nebraska - NE</option>
          <option value="NV">Nevada - NV</option>
          <option value="NH">New Hampshire - NH</option>
          <option value="NJ">New Jersey - NJ</option>
          <option value="NM">New Mexico - NM</option>
          <option value="NY">New York - NY</option>
          <option value="NC">North Carolina - NC</option>
          <option value="ND">North Dakota - ND</option>
          <option value="OH">Ohio - OH</option>
          <option value="OK">Oklahoma - OK</option>
          <option value="OR">Oregon - OR</option>
          <option value="PA">Pennsylvania - PA</option>
          <option value="RI">Rhode Island - RI</option>
          <option value="SC">South Carolina - SC</option>
          <option value="SD">South Dakota - SD</option>
          <option value="TN">Tennessee - TN</option>
          <option value="TX">Texas - TX</option>
          <option value="UT">Utah - UT</option>
          <option value="VT">Vermont - VT</option>
          <option value="VA">Virginia - VA</option>
          <option value="WA">Washington - WA</option>
          <option value="WV">West Virginia - WV</option>
          <option value="WI">Wisconsin - WI</option>
          <option disabled></option>
          <option value="nil">US Commonwealth and Territories</option>
          <option disabled>──────────</option>
          <option value="AS">American Samoa - AS</option>
          <option value="DC">District of Columbia - DC</option>
          <option value="FM">Federated States of Micronesia - FM</option>
          <option value="GU">Guam - GU</option>
          <option value="MH">Marshall Islands - MH</option>
          <option value="MP">Northern Mariana Islands - MP</option>
          <option value="PW">Palau - PW</option>
          <option value="PR">Puerto Rico - PR</option>
          <option value="VI">Virgin Islands - VI</option>
      </select>
      <input type="submit" value="Go!">
  </form>
  <br>`
  )
};

function formatQueryParams(params) {  //function takes query params and puts them to gether
    const queryItems = Object.keys(params)  //takes params from object, and puts them into a var to be joined by an ampersand below.
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&'); //Joins items with ampersand
}

//TRIGGER
//listening for event on the pop-up menu
function watchForm() {
  // console.log('watchForm');
  $('form').submit(event => {
    event.preventDefault();
    $('#js-error-message').empty();
    if ($('#js-stateMenuForm :selected').val() === "nil"){
      return;
      } else {
        var searchState = $('#js-stateMenuForm :selected').val(); //invoked state code value stored in searchState
      }

    getParks(searchState); //calls getParks and sends the state code
  });
}

//GET PARKS PARAMS and FETCH
function getParks(query) { //function defines the query and fetch url
  // console.log("getParks");
  const params = {
      api_key: NPapiKey,
      stateCode: query,
      fields: "images"    //assigns images to fields. This is a non-standard field that must be requested.
  };
  const queryString = formatQueryParams(params)
  const url = NPsearchURL + '?' + queryString;

  //Fetch request uses the pre-glued url.
  fetch(url)                                    
      .then(response => {   
      if (response.ok) {
          return response.json();
      }
      // console.log('fetch 1');
      throw new Error(response.statusText);
      })
      .then(responseJson => displayResults(responseJson, query)) //good Request?, send responsJson to displayResults.
      .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
      });
}

//DISPLAY PARKS
function displayResults(responseJson, query) {
    // console.log('displayResults_0');
    $('#selectStatePage').empty();
    $('nav').empty();
    stateMenu('nav');
    $('#state').val(query);
    watchForm();
    $('#parks').empty();
    totalParkResults = responseJson.data;  //Assigns chosen park data to totalParkResults for later use.
    for (var i = 0; i < responseJson.data.length; i++){ //Loop thru the total number of parks (length)
      let latLong = `${responseJson.data[i].latLong}`;
      // console.log(`latLong is ${latLong}`);
      let sorry = "";                                   //creates sorry var in case there is no latLong from api
        if (!latLong){
          sorry = "We're sorry. There is no specific location data available for this entry. Weather forecast MAY not be available."
        } else {
          //converts api latLong into a usable version
          let latLongArr = latLong.split(", ");
          let lat = latLongArr[0].replace("lat:","");
          let long = latLongArr[1].replace("long:",",");
          var updatedLatLong = lat + long;
        }
        // console.log('displayResults_1');
        // This section determines if there is a picture when one is expected. If yes, display it, else put a dummy apology in.
        if(responseJson.data[i].images.length < 1){
          parkImages = `<img style= height=70% width=70% src="imgs/missingimage.png">`;
        } else {
          let numImages;
          numImages = responseJson.data[i].images.length;
          randImages = Math.floor(Math.random() * (numImages - 1));
          parkImages = `<img id="parkImages" style= "box-shadow: 3px 3px #666; margin: 0 auto;" height="336" src="${responseJson.data[i].images[randImages].url}?width=500" onerror="deadLink(parkImages)">`;
          // console.log("parkImages sez " + parkImages);
        }
     
        // console.log('displayResults_2');
        // console.log("parkImages sez " + parkImages);
        //Prepare'#parks'. Collect in background until ready to reveal
        $('#parks').append(
          `
          <div class="parkBg" data-result-id="${responseJson.data[i].id}" data-latlong="${updatedLatLong}" data-randimages="${randImages}"> 
            <div class="parkContainer"> 
                  ${parkImages}
              <br>
              <h3>${responseJson.data[i].fullName}</h3>
              <br>
              <p>${responseJson.data[i].description}</p>
              <br>
              <p class="red">${sorry}</p>
              <h4>Click here for weather forecast</h4>
            </div> 
          </div>
          <br>
          `
        );
        // console.log('displayResults_3');
        $('#forecast').empty();
        $('#parks').show();//show hidden layout.
    };
     
    //TRIGGER. Park clicked on will prep to get the locationKey for that park
    $('.parkBg').on("click", function(e){
      e.preventDefault();
      let targetParkId = $(this).data("result-id");
      let latLong = $(this).data("latlong"); 
      chosenImage = $(this).data("randimages");
      getLocationKey(targetParkId, latLong);
    });
}


//GET LOCATION ID FROM AW
function getLocationKey(parkId, query) {

  const params = {
        apikey: AWapiKey,
        q: query
    };
    const queryString = formatQueryParams(params)
    const url = AWsearchLKURL + '?' + queryString;
    fetch(url)
        .then(response => {                             
        if (response.ok) {                              
            return response.json();                     
        }
        throw new Error(response.statusText);
        })
        .then(responseJson => fetchForecast(responseJson.Key, parkId))
        .catch(err => {
        $('#js-error-message').text(`Houston, we have a problem: ${err.message}`);
        });
}

//GET FORECAST USING LOCATION ID and FETCH
function fetchForecast(query, parkId) {      
  const url = AWsearchWURL + query + '?' + "apikey=" + AWapiKey;

  fetch(url)
    .then(response => {
    if (response.ok) {
        return response.json();
    }
    throw new Error(response.statusText);
    })
    .then(responseJson => displayParkForecast(responseJson, parkId))
    .catch(err => {
      $('#js-error-message').text(`WILSON!!!: ${err.message}`);
    })
  };
    
function displayParkForecast(forecast, parkId){
      let target;
      for ( let i=0;i<totalParkResults.length;i++){ //iterates through the totalParksResults object
        if(parkId == totalParkResults[i].id){       //until it matches the parkId value
          target = totalParkResults[i];             //assigns the correct totalParkResults object value to target
          break;                                    //breaks out on success
        }
      }
      let myday;
      let mydateObj = {};
      let weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

      let temperatureObj = {};
      let wIconNum;                   // creates wIconNum var
      let wIcon = {};                 // creates wIcon object

      //iterates, and conforms day to usable.
      for ( let i = 0; i<forecast.DailyForecasts.length; i++){
        myday = `${forecast.DailyForecasts[i].Date}`;
        myday = new Date(myday);
        myday = myday.getDay();  
        mydateObj[i] = weekday[myday];

        //conforms temps and forecasts to usable
        temperatureObj['high' + i] = `${forecast.DailyForecasts[i].Temperature.Maximum.Value}`;
        temperatureObj['low' + i] = `${forecast.DailyForecasts[i].Temperature.Minimum.Value}`;
        wIconNum = `${forecast.DailyForecasts[i].Day.Icon}`;    //assigns the weather icon number
        wIconNum = parseInt(wIconNum);    //Converts to an Int
  

        //if wIconNum < 10, converts to a string and adds a zero in the tens place to conform to the url address name
        if (wIconNum < 10){               
          wIconNum = wIconNum.toString();
          wIconNum = 0 + wIconNum;
        }
        wIcon[i] = "https://developer.accuweather.com/sites/default/files/" + wIconNum + "-s.png";  //glues prefix, wIconNum, and postfix
        temperatureObj['phrase' + i] = `${forecast.DailyForecasts[i].Day.IconPhrase}`;  //assigns associated weather phrase to temperatureObj.phrasei
      }

      let imgF;   
        if(target.images.length > 0){
          imgF = `<img id="imgF" style= "box-shadow: 3px 3px #666;" src="${target.images[chosenImage].url}?width=500">`;
          // console.log('What the hell?');
          // console.log(`${target.images[chosenImage].url}`);
        } else {
          imgF = `<img style= "height: 70%; width: 100%;" src="imgs/missingimage.png">`;
        }

      //following markup to be inserted inside 'id = forecast'.
      $('#forecast').append(       
        `
        <section class="forecastBg">
          <div id="fPicDesc">
            ${imgF}
            <br>
            <h3>${target.fullName}</h3>
            <br>
            <p>${target.description}</p>
          </div>

          <div id="forecastField">

                <div id="label">
                <br>
                  <h4>5-Day Forecast</h4>
                </div>
                <br>
    
                <div id="dayFieldHolder">
                      <div class="dayField">
                        <div>
                          <div class="day">${mydateObj[0]}</div>
                          <div><img class="wIcon" src=${wIcon[0]}></div>
                          <div class="temp">${temperatureObj.phrase0}</div>
                        </div>
                        <div class="high"><strong>High</strong><br>${temperatureObj.high0}°</div>
                        <div class="low"><strong>Low</strong><br>${temperatureObj.low0}°</div>
                      </div>
                  
                      <div class="dayField">
                        <div>
                          <div class="day">${mydateObj[1]}</div>
                          <div><img class="wIcon" src=${wIcon[1]}></div>
                          <div class="temp">${temperatureObj.phrase1}</div>
                        </div>
                        <div class="high"><strong>High</strong><br>${temperatureObj.high1}°</div>
                        <div class="low"><strong>Low</strong><br>${temperatureObj.low1}°</div>
                      </div>
                      
                      <div class="dayField">
                        <div>
                          <div class="day">${mydateObj[2]}</div>
                          <div><img class="wIcon" src=${wIcon[2]}></div>
                          <div class="temp">${temperatureObj.phrase2}</div>
                        </div>
                        <div class="high"><strong>High</strong><br>${temperatureObj.high2}°</div>
                        <div class="low"><strong>Low</strong><br>${temperatureObj.low2}°</div>
                      </div>
                      
                      <div class="dayField">
                        <div>
                          <div class="day">${mydateObj[3]}</div>
                          <div><img class="wIcon" src=${wIcon[3]}></div>
                          <div class="temp">${temperatureObj.phrase3}</div>
                        </div>
                        <div class="high"><strong>High</strong><br>${temperatureObj.high3}°</div>
                        <div class="low"><strong>Low</strong><br>${temperatureObj.low3}°</div>
                      </div>
                      
                      <div class="dayField">
                        <div>
                          <div class="day">${mydateObj[4]}</div>
                          <div><img class="wIcon" src=${wIcon[4]}></div>
                          <div class="temp">${temperatureObj.phrase4}</div>
                        </div>
                        <div class="high"><strong>High</strong><br>${temperatureObj.high4}°</div>
                        <div class="low"><strong>Low</strong><br>${temperatureObj.low4}°</div>
                      </div>
                  </div>
          </div>
        </section>
        `
      );

      $('#parks').empty();
      $('#forecast').show();
}

function deadLink(){
// alert("is this working?");
  // // parkImages = `<img id="parkImages" style= "box-shadow: 3px 3px #666; margin: 0 auto;" height="336" src="${responseJson.data[i].images[randImages].url}?width=500">`;
  parkImages = `<img style= "height: 70%; width: 100%;" src="imgs/missingimage.png">`;
  // console.log(parkImages);
  return parkImages;
}
stateMenu('#statePopup');

watchForm();
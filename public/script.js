let logedInUser;

let locations;
//Array to save all created markers
let markerArray = [];

//is set when when a info window is displayed
let currentlyShownInfoWindow;

//are both set in the onClick listener to change the location
let indexOfLocationToChange;
let placeToChange;
//to add the location
let addThePlace;

//both google autocomplete search boxes for changing and adding locations
let autocompleteAddNew;
let autocompleteChange;

//Google geocoder object to translate locations to adresses
let geocoder;

//gets all globaly required html elements
const loginForm = document.getElementById("login-form");
const addForm = document.getElementById("add-form");
const usernameForm = document.getElementById("username-form");
const passwordForm = document.getElementById("password-form");
const loginButton = document.getElementById("login-btn");
const usernameError = document.getElementById("username-error");
const passwordError = document.getElementById("password-error");
const welcomeText = document.getElementById("welcome-text");
const sidebarWrapper = document.getElementById("sidebar-wrapper");
const addLocationBtn = document.getElementById("header-btn-add");
const changeTitel = document.getElementById("change-title");
const changeDescription = document.getElementById("change-description");
const changeAdress = document.getElementById("change-adress");
const addLocationTitel = document.getElementById("add-location-titel");
const addLocationDescription = document.getElementById(
  "add-location-description"
);
const addLocationAddress = document.getElementById("add-location-address");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await validateInputs();
});

const validateInputs = async () => {
  usernameError.innerText = "";
  passwordError.innerText = "";
  const username = usernameForm.value.trim();
  const password = passwordForm.value.trim();

  const response = await fetch("/user", {
    //usr
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  console.log("response: bla ", response);
  console.log(response.status);

  if (response.status === 400) {
    usernameError.innerText = "Username not found";
    usernameForm.value = "";
    passwordForm.value = "";
    return;
  } else if (response.status === 401) {
    passwordError.innerText = "Incorrect username or password";
    passwordForm.value = "";
    return;
  } else {
    console.log("Else");
    const user = await response.json();
    handleLoggedInUser(user);
  }

  // Handle the logged-in user based on the response
};

const handleLoggedInUser = (user) => {
  console.log("handle");
  // Adjust the logic to handle the logged-in user based on the backend response
  logedInUser = user;
  console.log("loged in user:", logedInUser.name);

  if (logedInUser.role === "admin") {
    welcomeText.innerText = `Welcome ${logedInUser.name}! This Map shows Locations with missing Bikelines`;
    loginWrapper.style.display = "none";
    mapMain.style.display = "revert";
    addLocationBtn.style.display = "revert";
    welcomeText.style.marginLeft = "0px";
  } else if (logedInUser.role === "non-admin") {
    welcomeText.innerText = `Welcome ${logedInUser.name}! This Map shows Locations with missing Bikelines`;
    loginWrapper.style.display = "none";
    mapMain.style.display = "revert";
    addLocationBtn.style.display = "none";
    welcomeText.style.marginLeft = "500px";
  }
};


// iterates through the locations array and makes Markers from the entrys. Then adds them to the map
async function initMarkers() {
  markerArray = [];

  const response = await fetch("/loc", {
    //usr
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
  });

  locations = await response.json();
  console.log(locations);
  console.log("response: bla ", response);
  console.log(response.status);

  locations.forEach((loc, index) => {
    let marker = new google.maps.Marker({
      position: loc.location,
      map: map,
      title: loc.title,
    });
    let description;
    if (loc.desc === undefined) {
      description = "";
    } else {
      description = loc.desc;
    }

    // builds a Info Window that displays the description and adds a Change location button
    const infowindowAdmina = new google.maps.InfoWindow({
      content:
        `<h2>${loc.title}</h2><p>${description}</p><div id="change-location-btn-wrapper"><button id="change-location-btn" onClick="changeLocation(` +
        index +
        `)">Change Location</button></div>`,
      ariaLabel: loc.title,
    });
    //builds a info window without the Change location button for the normalo user
    const infowindowNormalo = new google.maps.InfoWindow({
      content: `<h2>${loc.title}</h2><p>${description}</p>`,
      ariaLabel: loc.title,
    });

    //adds listener to marker that shows a different info window depending on the logedin user
    google.maps.event.addListener(marker, "click", function () {
      if (logedInUser.role === "admin") {
        if (currentlyShownInfoWindow !== undefined) {
          currentlyShownInfoWindow.close();
        }
        infowindowAdmina.open({
          anchor: marker,
          map,
        });
        currentlyShownInfoWindow = infowindowAdmina;
      } else {
        if (currentlyShownInfoWindow !== undefined) {
          currentlyShownInfoWindow.close();
        }
        infowindowNormalo.open({
          anchor: marker,
          map,
        });
        currentlyShownInfoWindow = infowindowNormalo;
      }
    });
    marker.setMap(map);
    markerArray.push(marker);
  });
  populateSidebar();
}

//adds all location entrys into a sidebar and adds a listener to open the infowindow of the corresponding Marker
function populateSidebar() {
  sidebarWrapper.innerHTML = "";
  const sidebarHeadline = document.createElement("h2");
  sidebarHeadline.innerText = "Locations";
  document.getElementById("sidebar-wrapper").appendChild(sidebarHeadline);

  locations.forEach((loc, index) => {
    const htmlString = `<h4 id="location-headline">${loc.title}</h4>`;

    const locListItem = document.createElement("div");
    locListItem.setAttribute("id", "loc-list-item");
    locListItem.innerHTML = htmlString;
    locListItem.addEventListener("click", () => {
      openInfoWindow(index);
    });
    document.getElementById("sidebar-wrapper").appendChild(locListItem);
  });
}

//iterates trough the locations array and adds a formated address to the entry with a Geocoder if ther isnt already one
function getFormatedAdresses() {
  locations.forEach((loc, index) => {
    if (loc.formatedAdress !== undefined) {
      return;
    } else {
      geocoder
        .geocode({ location: loc.location })
        .then((response) => {
          if (response.results[0]) {
            loc.formatedAdress = response.results[0].formatted_address;
          } else {
            window.alert("No results found");
          }
        })
        .catch((e) => window.alert("Geocoder failed due to: " + e));
    }
  });
}

//callback funtion for the Google Maps init script
let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map-screen"), {
    center: { lat: 52.523618598450824, lng: 13.41136010320009 },
    zoom: 12,
  });

  // adds google autocomplete functionality to the search boxes in the add and change Location sites
  const inputAddNew = document.getElementById("add-location-address");
  autocompleteAddNew = new google.maps.places.Autocomplete(inputAddNew, {
    fields: ["place_id", "geometry", "name", "formatted_address"],
  });

  const inputChange = document.getElementById("change-adress");
  autocompleteChange = new google.maps.places.Autocomplete(inputChange, {
    fields: ["place_id", "geometry", "name", "formatted_address"],
  });

  //listener for the autocomplete search box in the change location site
  autocompleteChange.addListener("place_changed", () => {
    placeToChange = autocompleteChange.getPlace();
    console.log(placeToChange);
  });
  autocompleteAddNew.addListener("place_changed", () => {
    addThePlace = autocompleteAddNew.getPlace();
    console.log(addThePlace);
  });

  geocoder = new google.maps.Geocoder();

  //calls the the other init functions after the google maps library is loaded
  await initMarkers();
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addLocation();
});

function addLocation() {
  let newLocationTitle = addLocationTitel.value.trim();
  let newLocationDescription = addLocationDescription.value.trim();

  // Validate inputs
  if (!newLocationTitle) {
    alert("Please enter a title for the new location.");
    return;
  }

  // Get the selected place from the autocomplete
  let place = addThePlace;

  if (!place || !place.geometry || !place.geometry.location) {
    alert(
      "Invalid or incomplete address. Please select a valid address from the suggestions."
    );
    return;
  }

  // Geocode the selected place to get the formatted address
  geocoder
    .geocode({ placeId: place.place_id })
    .then(({ results }) => {
      if (results && results.length > 0) {
        let formattedAddress = results[0].formatted_address;
        let position = results[0].geometry.location;

        // Create a new location object with the entered data, the selected place details, and the formatted address
        let newLocation = {
          title: newLocationTitle,
          desc: newLocationDescription,
          location: {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          },
          formatedAdress: formattedAddress,
        };

        addLocationInGeocoder(newLocation);
        console.log(newLocation);
      }
    })
    .catch((e) => window.alert("Geocoder failed due to: " + e));
}

async function addLocationInGeocoder(newLocation) {
  const response = await fetch("/loc", {
    //usr
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newLocation),
  });

  initMap();
  mapMain.style.display = "revert";
  addLocationWrapper.style.display = "none";
}

//onClick funtion specified in the ChangeLocations Buttons
//populates the form with correct data based on the index paramater in the function call
function changeLocation(index) {
  //this shows selected location details on update/delete screen
  var nameElement = document.querySelector(".name");
  var addressElement = document.querySelector(".address");

  nameElement.innerHTML = `<h2 class="name">${locations[index].title}</h2>`;
  addressElement.innerHTML = `<div class="address">${locations[index].desc}</div>`;

  placeToChange = undefined;
  changeTitel.value = locations[index].title;
  changeDescription.value = locations[index].desc;
  if (locations[index].formatedAdress !== undefined) {
    changeAdress.value = locations[index].formatedAdress;
  } else {
    changeAdress.value = locations[index].title;
  }

  indexOfLocationToChange = index;
  mapMain.style.display = "none";
  deleteWrapper.style.display = "revert";
}

//listener to delete a location
const deleteBtn = document.getElementById("delete-button");
deleteBtn.addEventListener("click", async () => {
  const id = locations[indexOfLocationToChange]._id;

  const response = await fetch("/loc/" + id, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
    },
  });
  initMap();
  mapMain.style.display = "revert";
  deleteWrapper.style.display = "none";
});

//listener on the change location Button in the change location form
const editBtn = document.getElementById("edit-button");
editBtn.addEventListener("click", async () => {
  const titelError = document.getElementById("titel-error");
  titelError.innerText = "";
  const addressError = document.getElementById("address-error");
  addressError.innerText = "";

  //validates the change form
  if (changeTitel.value === "") {
    titelError.innerText = "Enter a Title";
  } else if (changeAdress.value === "") {
    addressError.innerText = "Enter a Address";
  }
  //if no new location is selected via the autocomplete searchbox only the title and description
  //is changed and the old location is kept
  else if (placeToChange === undefined && changeAdress.value !== "") {
    const id = locations[indexOfLocationToChange]._id;
    const response = await fetch("/loc/" + id, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: changeTitel.value,
        desc: changeDescription.value,
      }),
    });
    initMap();
    mapMain.style.display = "revert";
    deleteWrapper.style.display = "none";
  } else {
    //uses the geocoder to get the location data from the autocomplete searchbox
    geocoder
      .geocode({ placeId: placeToChange.place_id })
      .then(({ results }) => {
        let titleToChange = changeTitel.value;
        let descToChange = changeDescription.value;
        let locationToChange = results[0].geometry.location;
        let formatedAdressToChange = results[0].formatted_address;

        updateInGeocoder(
          titleToChange,
          descToChange,
          locationToChange,
          formatedAdressToChange
        );
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
  }
});

async function updateInGeocoder(
  titleToChange,
  descToChange,
  locationToChange,
  formatedAdressToChange
) {
  const id = locations[indexOfLocationToChange]._id;
  const response = await fetch("/loc/" + id, {
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: titleToChange,
      desc: descToChange,
      location: locationToChange,
      formatedAdress: formatedAdressToChange,
    }),
  });

  initMap();
  mapMain.style.display = "revert";
  deleteWrapper.style.display = "none";
}

//onClick function for the items in the maps sidebar, that opens the corresponding info window of that marker
function openInfoWindow(index) {
  google.maps.event.trigger(markerArray[index], "click");
}

/*
Gets the wrapper for the different pages and 
then  sets the display Property for all of them to "none" except 
the Login Screen
*/
const loginWrapper = document.getElementById("login-wrapper-wrapper");
loginWrapper.style.display = "revert";

const mapMain = document.getElementById("map-main");
mapMain.style.display = "none";

const addLocationWrapper = document.getElementById("add-location-wrapper");
addLocationWrapper.style.display = "none";

const deleteWrapper = document.getElementById("delete-wrapper");
deleteWrapper.style.display = "none";

/*
onClickListener for some of the Buttons that hides one page und shows another
*/

let btnAddLocation = document.querySelector(".btn-add-location");
btnAddLocation.addEventListener("click", () => {
  addLocationTitel.value = "";
  addLocationDescription.value = "";
  addLocationAddress.value = "";
  addThePlace = undefined;
  addLocationWrapper.style.display = "revert";
  mapMain.style.display = "none";
});

let btnLogout = document.querySelector(".btn-add-logout");
btnLogout.addEventListener("click", () => {
  usernameForm.value = "";
  passwordForm.value = "";
  loginWrapper.style.display = "revert";
  mapMain.style.display = "none";
  initMap();
});

let btnCancelAdd = document.querySelector("#cancel-oval-button2");
btnCancelAdd.addEventListener("click", () => {
  addLocationWrapper.style.display = "none";
  mapMain.style.display = "revert";
});

let btnCancelDelete = document.querySelector("#cancel-oval-button");
btnCancelDelete.addEventListener("click", () => {
  deleteWrapper.style.display = "none";
  mapMain.style.display = "revert";
});

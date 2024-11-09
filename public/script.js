let HERE_API_KEY;

// Fetch API key from server-side

/**
 * Moves the map to display over Berlin
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
//42°23'29"N 72°31'34"W
class MapManager{
  constructor(apiKey, containerId) {
    this.platform = new H.service.Platform({
        apiKey: apiKey
    });
    this.defaultLayers = this.platform.createDefaultLayers();
    // Initialize the map centered over UMASS
    this.map = new H.Map(
        document.getElementById(containerId),
        this.defaultLayers.vector.normal.map,
        {
            center: { lat: 42.39139, lng: -72.52611 },
            zoom: 4,
            pixelRatio: window.devicePixelRatio || 1
        }
    );

    // Add resize listener for responsiveness
    window.addEventListener("resize", () => this.map.getViewPort().resize());

    // Enable default interactions (pan, zoom)
    this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    this.ui = H.ui.UI.createDefault(this.map, this.defaultLayers);
  }

  moveTo(lat, lng, zoom = 14) {
    this.map.setCenter({ lat, lng });
    this.map.setZoom(zoom);
  }

  getMap() {
      return this.map;
  }
}

class MarkerManager {
  constructor(map) {
      this.map = map;
  }

  // Places a marker at the specified coordinates with a custom icon (if provided)
  placeMarker(lat, lng, iconPath = null) {
      const coords = { lat, lng };
      const icon = iconPath ? new H.map.Icon(iconPath) : this.pinIcon();
      const marker = new H.map.Marker(coords, { icon });
      this.map.addObject(marker);
  }


  // Sets up a listener to place a marker on map click/tap events
  enableClickToPlaceMarker(iconPath = null) {
      this.map.addEventListener('tap', async (evt) => {
          const coords = this.map.screenToGeo(
              evt.currentPointer.viewportX,
              evt.currentPointer.viewportY
          );
          this.placeMarker(coords.lat, coords.lng, iconPath);
          // Saves pin to database
          await savePin(coords.lat, coords.lng);
          console.log('Marker placed at:', coords.lat, coords.lng);
      });
  }

  pinIcon() {
    const selectedOption = getSelectedOption();
    if (selectedOption === "Event") {
      return new H.map.Icon(
        '<svg class="w-[50px] h-[50px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="black" fill="yellow" viewBox="0 0 24 24">' +
        '<path fill-rule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clip-rule="evenodd"/>' +
        '</svg>'
        );
    }
    else if (selectedOption === "Suspicious Activity") {
      return new H.map.Icon(
        '<svg class="w-[50px] h-[50px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="black" fill="red" viewBox="0 0 24 24">' +
        '<path fill-rule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clip-rule="evenodd"/>' +
        '</svg>'
        );
    }
    else if (selectedOption === "Lost Item") {
      return new H.map.Icon(
        '<svg class="w-[50px] h-[50px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="black" fill="blue" viewBox="0 0 24 24">' +
        '<path fill-rule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clip-rule="evenodd"/>' +
        '</svg>'
        );
    }
    return new H.map.Icon(
    '<svg class="w-[50px] h-[50px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="black" fill="grey" viewBox="0 0 24 24">' +
    '<path fill-rule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clip-rule="evenodd"/>' +
    '</svg>'
    );
  }
}

// Loads pins from the database and adds them to the map
async function loadPins(markerManager) {
  try {
    const response = await fetch('/api/pins');
    const pins = await response.json();
    pins.forEach(pin => {
      markerManager.placeMarker(pin.lat, pin.lng, null);
    });
  } catch (error) {
    console.error("Failed to load pins:", error);
  }
}

// Saves a pin to the database
async function savePin(lat, lng) {
  try {
    const response = await fetch('/api/pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lat, lng, userId: 'user123' }) // Replace with actual user ID if needed
    });
    const newPin = await response.json();
    console.log("New pin saved:", newPin);
  } catch (error) {
    console.error("Failed to save pin:", error);
  }
}

function initializeMap() {
  if (!apiKey) {
    console.error("API key is not available.");
    return;
  }

  const mapManager = new MapManager(apiKey, "map"); // Initializes the map in the div with id 'map'
  
  // Move the map to a specific location (e.g., Amherst) and place a default marker
  mapManager.moveTo(42.39139, -72.52611);
  
  const markerManager = new MarkerManager(mapManager.getMap()); // Manages markers on the map
  
  // Load pins from database
  loadPins(markerManager);

  // Enable click-to-place marker functionality
  markerManager.enableClickToPlaceMarker(null);
}

// Auto executes once window loads
window.onload = function () {
  fetch('/api/config')
    .then(response => response.json())
    .then(data => {
      apiKey = data.apiKey;

      // Initialize the map after the API key is available
      initializeMap();
    })
    .catch(error => console.error('Error fetching config:', error));

};

function getSelectedOption() {
  const options = document.getElementsByName("pinType")

  for (const option of options) {
    if (option.checked) {
      return option.value;
    }
  }
  return null;
}
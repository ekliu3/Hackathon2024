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
        '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M1.604 24c1.853-2.784 7.647-8.21 13.919-9.494l.525 3.276c-3.773.264-9.01 2.523-14.444 6.218zm-1.604-1c2.037-2.653 6.013-6.906 6.226-15.092l-3.271.561c.418 4.888-1.546 10.626-2.955 14.531zm20.827-11.423l.802 2.4 2.371.883-2.035 1.504-.107 ' +
        '2.528-2.06-1.471-2.437.68.763-2.413-1.4-2.109 2.531-.02 1.572-1.982zm-11.911 3.677h-.018c-.268 0-.49-.213-.499-.483-.098-2.877.511-4.87 3.798-5.24 1.953-.219 2.029-1.116 2.135-2.357.099-1.171.235-2.775 2.737-2.959 1.23-.09 1.908-.307 2.267-.725.407-.475.528-1.357.403-2.948-.022-.275.184-.516.459-.538.254-.019.516.184.537.46.151 1.906-.035 2.972-.64 ' +
        '3.678-.556.647-1.411.957-2.953 1.07-1.651.122-1.712.846-1.814 2.046-.106 1.247-.251 2.956-3.02 3.267-2.33.262-3.011 1.247-2.91 4.212.01.276-.207.507-.482.517zm12.084-9.254c1.104 0 2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2zm-13.715-4.058l-2.531.017-1.601-1.959-.766 2.412-2.359.918 2.058 1.473.144 2.527 2.037-1.501 2.447.643-.798-2.401 1.369-2.129zm3.715.058c1.104 0 ' +
        '2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2z"/></svg>'
        );
    }
    else if (selectedOption === "Suspicious Activity") {
      return new H.map.Icon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.753 18.305c-.261-.586-.789-.991-1.871-1.241-2.293-.529-4.428-.993-3.393-2.945 3.145-5.942.833-9.119-2.489-9.119-3.388 0-5.644 3.299-2.489 9.119 1.066 1.964-1.148 2.427-3.393 2.945-1.084.25-1.608.658-1.867 ' +
        '1.246-1.405-1.723-2.251-3.919-2.251-6.31 0-5.514 4.486-10 10-10s10 4.486 10 10c0 2.389-.845 4.583-2.247 6.305z"/></svg>'
        );
    }
    else if (selectedOption === "Lost Item") {
      return new H.map.Icon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 12.242v7.894l-4.291.864-.709-3.827 4.005-5.909c.331.382.352.46.995.978zm2 1.176v8.015l2.732 2.567 3.268-2.567-1.052-1.109 1.052-1.108-1.052-1.108 1.052-1.108v-3.583c-.941.381-1.955.583-3.001.583-1.045 ' +
        '0-2.059-.202-2.999-.582zm7.242-11.661c-2.131-2.131-5.424-2.25-7.687-.651-1.174.821-1.96 ' +
        '1.94-2.335 3.378-1.664-.087-2.72-.905-2.72-1.484 0-.6 1.128-1.46 2.898-1.494.42-.524.67-.822 1.42-1.36-.42-.086-.856-.146-1.318-.146-2.485 0-4.5 1.343-4.5 3 0 1.936 2.526 3 4.5 3 2.818 0 5.337-1.892 4.252-3.967.567-.912 1.682-.902 2.309-.275.975.975.24 2.625-1.146 2.544-.862 2.006-3.376 3-5.794 2.879.225 ' +
        '1.122.768 2.192 1.638 3.062 2.342 2.344 6.141 2.343 8.484 0 1.17-1.172 1.757-2.708 1.757-4.244 0-1.535-.586-3.07-1.758-4.242z"/></svg>'
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
      markerManager.placeMarker(pin.lat, pin.lng, null, pin.logo);
    });
  } catch (error) {
    console.error("Failed to load pins:", error);
  }
}

// Saves a pin to the database
async function savePin(lat, lng, logo) {
  try {
    const response = await fetch('/api/pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lat, lng, userId: 'user123', logo }) // Replace with actual user ID if needed
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
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
    console.log(iconPath)
      const coords = { lat, lng};
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
          await savePin(coords.lat, coords.lng, iconPath);
          console.log('Marker placed at:', coords.lat, coords.lng);
      });
  }

  pinIcon() {
    const selectedOption = getSelectedOption();
    if (selectedOption === "Event") {
      return new H.map.Icon(
        '<svg width="24" height="24" fill="darkturquoise" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M21.981 7.009c-1.222-.733-2.473-.752-3.57-.254-.085 3.098-1.47 5.561-3.115 7.04.19.897.558 1.635.984 2.123l-1.204.733.729.437c-.875 1.531-1.372 4.054-1.228 6.442.015.265.236.47.499.47.287 0 .516-.242.499-.531-.146-2.422.402-4.65 1.086-5.867l.762.457.008-1.457c1.569.33 ' +
        '4.302-.524 5.818-3.253 1.282-2.309.995-4.983-1.268-6.34m-4.457-.55c0-3.566-2.051-6.459-5.542-6.459-3.493 0-5.543 2.893-5.543 6.459 0 4.384 2.709 7.077 4.751 7.697l-.954 1.542h1.151c-.544 1.958-.178 2.961.155 3.85.35.933.651 1.738-.132 3.772-.099.258.029.547.288.646l.179.034c.202 0 .391-.122.467-.321.918-2.388.521-3.452.136-4.48-.32-.857-.611-1.682-.047-3.501h1.325l-.96-1.552c2.039-.657 ' +
        '4.726-3.42 4.726-7.687m-9.32 10.634l.738-.442-1.232-.697c.425-.472.794-1.197.993-2.077-1.673-1.46-3.076-3.949-3.153-7.147-1.082-.471-2.313-.442-3.513.279-2.263 1.357-2.55 4.031-1.268 6.34 1.53 2.754 4.3 3.6 5.862 3.246l-.035 1.464.752-.452c1.005 1.65 1.317 4.058 1.156 5.848-.025.275.179.518.453.543l.047.002c.256 0 .474-.196.497-.455.164-1.822-.104-4.497-1.297-6.452m13.588-13.584l-1.182.009.653.985-.356 '+
        '1.126 1.138-.317.963.687.05-1.181.95-.702-1.107-.413-.374-1.12-.735.926zm-19.199 15.329l-1.181.009.653.985-.356 1.127 1.138-.318.962.688.051-1.181.95-.702-1.108-.413-.374-1.121-.735.926zm.407-17.232c0 .769.625 1.393 1.395 1.393.769 0 1.394-.624 1.394-1.393s-.625-1.393-1.394-1.393c-.77 0-1.395.624-1.395 1.393m-2.001 3.131c0 .552.45 1 1.001 1 .553 0 1-.448 1-1s-.447-1-1-1c-.551 0-1.001.448-1.001 1m17.371-3.737c0 '+
        '.552.448 1 1 1s1.001-.448 1.001-1-.449-1-1.001-1c-.552 0-1 .448-1 1m2.371 17.12c.828 0 1.501.673 1.501 1.5 0 .828-.673 1.5-1.501 1.5-.828 0-1.501-.672-1.501-1.5 0-.827.673-1.5 1.501-1.5"/></svg>'
        );
    }
    else if (selectedOption === "Suspicious Activity") {
      return new H.map.Icon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" viewBox="0 0 24 24"><path d="M18.5 10.2c0 2.57-2.1 5.79-6.16 9.51l-.34.3l-.34-.31C7.6 15.99 5.5 12.77 5.5 10.2c0-3.84 2.82-6.7 6.5-6.7s6.5 2.85 6.5 6.7z" fill-opacity=".3"/><path d="M12 11c1.33 0 4 .67 4 2v.16c-.97 1.12-2.4 1.84-4 1.84s-3.03-.72-4-1.84V13c0-1.33 2.67-2 4-2zm0-1c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2zm6 .2C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14c4.05-3.7 6-6.8 6-9.14zM12 2c4.2 0 8 3.22 8 8.2c0 3.32-2.67 7.25-8 11.8c-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z"/></svg>'
        // '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512"><path d="M0 0 C1.15119072 -0.0146228 1.15119072 -0.0146228 2.32563782 -0.02954102 C19.81819288 -0.2058917 36.64215893 0.12967846 53.75 4.23828125 C54.88840332 4.50318359 54.88840332 4.50318359 56.04980469 4.7734375 C100.91538912 15.56515937 139.88659469 45.99102873 164.25732422 84.66064453 C190.94002441 128.29251295 196.42022783' +
        // '178.50589674 184.70703125 227.7578125 C179.18893567 249.62301091 171.31706867 270.83922421 161.75 291.23828125 C161.29544434 292.22135254 160.84088867 293.20442383 160.37255859 294.21728516 C142.3844179 333.03834625 120.65921078 370.39793976 95.66796875 405.140625 C93.0407199 408.80029291 90.51741597 412.52359234 88.00244141 416.26098633 C82.05351243 425.0879975 75.75694301 433.54300655 69.16015625' + 
        // '441.89453125 C65.90593842 446.0167242 62.75525473 450.20908956 59.625 454.42578125 C55.26234149 460.28575617 50.78511047 466.03741459 46.18798828 471.71533203 C43.6888315 474.80300786 41.22599404 477.90791595 38.83203125 481.078125 C26.50114283 497.35211584 26.50114283 497.35211584 15.75 499.23828125 C8.33857511 499.98897806 1.62005763 498.99693771 -4.53515625 494.609375 C-10.23325377 489.77136767 -14.73213113' + 
        // '484.15767879 -19.25 478.23828125 C-20.50397971 476.64484844 -21.75810537 475.05152697 -23.01538086 473.46069336 C-24.91631633 471.05252317 -26.80688412 468.63629183 -28.69775391 466.22021484 C-29.75878272 464.86547563 -30.82101312 463.51167687 -31.88427734 462.15869141 C-38.49345378 453.74683871 -45.02194189 445.2832364 -51.375 436.67578125 C-51.88780518 435.98202393 -52.40061035 435.2882666 -52.92895508 434.57348633' + 
        // 'C-63.04154944 420.79239864 -72.72363743 406.72051043 -82.1875 392.48828125 C-82.9699559 391.31273178 -82.9699559 391.31273178 -83.76821899 390.11343384 C-101.55692414 363.36499021 -117.76235824 335.92391012 -132.25 307.23828125 C-132.71647949 306.31611816 -133.18295898 305.39395508 -133.66357422 304.44384766 C-151.20767884 269.48459403 -168.20588273 228.79227734 -168.453125 189.03125 C-168.46018463 188.27254105' + 
        // '-168.46724426 187.51383209 -168.47451782 186.73213196 C-168.70295712 154.97683744 -168.70295712 154.97683744 -165.25 141.23828125 C-165.04068848 140.39458984 -164.83137695 139.55089844 -164.61572266 138.68164062 C-158.29590721 113.86753158 -148.04703075 90.51157113 -132.25 70.23828125 C-131.58097656 69.34753906 -130.91195312 68.45679687 -130.22265625 67.5390625 C-101.42683274 30.56323538 -58.65523573 7.2602939' +
        // '-12.4987793 0.70556641 C-8.32744022 0.19920562 -4.19898968 0.04455256 0 0 Z M-27.40234375 68.9453125 C-38.06195129 82.17404321 -40.7917713 95.67878474 -39.25 112.23828125 C-36.68863696 125.92937652 -28.17667393 137.43107855 -17 145.42578125 C-5.47944905 152.80366833 7.52715578 154.71297027 20.9453125 152.77734375 C35.98685145 149.4391432 46.44799869 141.29218691 54.73046875 128.62890625 C61.57786049 117.13270503' + 
        // '63.53300469 104.35259055 60.625 91.30078125 C56.57281237 76.70154451 48.86025473 65.85965988 35.75 58.23828125 C13.67900504 47.70625283 -10.11000095 50.58773298 -27.40234375 68.9453125 Z M-60.25 217.23828125 C-61.25417969 217.72039062 -62.25835937 218.2025 -63.29296875 218.69921875 C-76.37403907 225.37812913 -86.03861446 234.14375942 -91 248.09765625 C-91.45371184 251.9825639 -89.72011946 254.5669894 -87.54296875' + 
        // '257.67578125 C-64.93424708 285.19214751 -36.26890213 303.09357319 -0.23828125 306.88671875 C30.30865169 309.73747344 61.83033249 300.66363207 85.92578125 281.59765625 C86.85777344 280.8190625 87.78976562 280.04046875 88.75 279.23828125 C89.73355469 278.4184375 90.71710938 277.59859375 91.73046875 276.75390625 C97.4736988 271.80834704 102.65518778 266.3853117 107.5625 260.61328125 C108.09681641 260.01628418 108.63113281' + 
        // '259.41928711 109.18164062 258.80419922 C111.99018766 255.36288541 113.11850802 253.09607447 112.73828125 248.59765625 C110.75761617 237.83630994 102.88796771 229.98763427 94.23022461 223.95458984 C74.59447763 210.86039763 50.86536448 204.61609896 27.75 201.23828125 C26.51830078 201.04105469 26.51830078 201.04105469 25.26171875 200.83984375 C23.08564531 200.53658681 20.94390253 200.36137149 18.75 200.23828125 C17.70070313' + 
        // '200.17382812 16.65140625 200.109375 15.5703125 200.04296875 C-10.40978956 199.23277846 -36.98200292 205.90192672 -60.25 217.23828125 Z " fill="#1C1C1C" transform="translate(168.25,-0.23828125)"/></svg>'
        );
    }
    else if (selectedOption === "Lost Item") {
      return new H.map.Icon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="black" fill="gold" viewBox="0 0 24 24"><path d="M9 12.242v7.894l-4.291.864-.709-3.827 4.005-5.909c.331.382.352.46.995.978zm2 1.176v8.015l2.732 2.567 3.268-2.567-1.052-1.109 1.052-1.108-1.052-1.108 1.052-1.108v-3.583c-.941.381-1.955.583-3.001.583-1.045 ' +
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
      markerManager.placeMarker(pin.lat, pin.lng, pin.logo);
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
      body: JSON.stringify({ lat, lng, logo }) 
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
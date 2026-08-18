const mapElement = document.getElementById("map");

if (mapElement) {
  const mapToken = mapElement.dataset.mapToken;
  const listingTitle = mapElement.dataset.listingTitle;
  const listingLocation = mapElement.dataset.listingLocation;

  let listingCoordinates = null;

  try {
    listingCoordinates = JSON.parse(
      mapElement.dataset.listingCoordinates || "null"
    );
  } catch (error) {
    console.error("Could not read listing coordinates:", error);
  }

  const validCoordinates =
    Array.isArray(listingCoordinates) &&
    listingCoordinates.length === 2 &&
    Number.isFinite(listingCoordinates[0]) &&
    Number.isFinite(listingCoordinates[1]);

  if (!mapToken) {
    mapElement.innerHTML = "<p>Mapbox token is missing.</p>";
  } else if (!validCoordinates) {
    mapElement.innerHTML =
      "<p>Location coordinates are not available for this listing.</p>";
  } else {
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: listingCoordinates,
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl());

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h6>${listingTitle}</h6><p>${listingLocation}</p>`
    );

    new mapboxgl.Marker({ color: "#fe424d" })
      .setLngLat(listingCoordinates)
      .setPopup(popup)
      .addTo(map);
  }
}
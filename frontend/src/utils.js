export const locateUser = (setUserLocation, generateStations) => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setUserLocation(loc);
      generateStations(loc);
    },
    () => alert("Location permission denied"),
    { enableHighAccuracy: true }
  );
};

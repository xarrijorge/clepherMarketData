// get the user location on startup
export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  export const getUserLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              reject(new Error("User denied the request for Geolocation."));
              break;
            case err.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable."));
              break;
            case err.TIMEOUT:
              reject(new Error("The request to get user location timed out."));
              break;
            default:
              reject(new Error("An unknown error occurred."));
              break;
          }
        }
      );
    });
  };

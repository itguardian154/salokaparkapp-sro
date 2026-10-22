const hostname = window.location.hostname;

const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("10.") ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("172.");

const isStaging =
  hostname.includes("staging") ||
  hostname.includes("dev") ||
  hostname.includes("test");

const API_URLS = isLocal
  ? {
      sro: "http://192.168.0.140:8000/api/",
      // sro: "https://stagingsrvsro.salokapark.app/api/",
      provinces: "https://serviceevent.salokapark.app/api/get-provinces",
      cities: "https://serviceevent.salokapark.app/api/get-regencies",
      lokahr: "https://lokahr.salokapark.app/api/",
    }
  : isStaging
    ? {
        sro: "https://stagingsrvsro.salokapark.app/api/",
        provinces: "https://serviceevent.salokapark.app/api/get-provinces",
        cities: "https://serviceevent.salokapark.app/api/get-regencies",
        lokahr: "https://lokahr.salokapark.app/api/",
      }
    : {
        sro: "https://srvsro.salokapark.app/api/",
        provinces: "https://serviceevent.salokapark.app/api/get-provinces",
        cities: "https://serviceevent.salokapark.app/api/get-regencies",
        lokahr: "https://lokahr.salokapark.app/api/",
      };

export default API_URLS;

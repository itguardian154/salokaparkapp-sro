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
      sro: "http://10.10.100.69:8710/api/",
      partner: "http://10.10.100.69:8710/api/partners",
      provinces: "http://10.10.100.69:8710/api/provinces",
      cities: "http://10.10.100.69:8710/api/cities",
      lokahr: "https://lokahr.salokapark.app/api/",
    }
  : isStaging
    ? {
        sro: "http://10.10.100.69:8710/api/",
        partner: "http://10.10.100.69:8710/api/partners",
        provinces: "http://10.10.100.69:8710/api/provinces",
        cities: "http://10.10.100.69:8710/api/cities",
        lokahr: "https://lokahr.salokapark.app/api/",
      }
    : {
        sro: "http://10.10.100.69:8710/api/",
        partner: "http://10.10.100.69:8710/api/partners",
        provinces: "http://10.10.100.69:8710/api/provinces",
        cities: "http://10.10.100.69:8710/api/cities",
        lokahr: "https://lokahr.salokapark.app/api/",
      };

export default API_URLS;

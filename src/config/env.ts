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
          login: "http://192.168.0.140:8000/api/",
      }
    : isStaging
    ? {
          login: "http://192.168.0.140:8000/api/",
      }
    : {
          login: "http://192.168.0.140:8000/api/",
      };

export default API_URLS;
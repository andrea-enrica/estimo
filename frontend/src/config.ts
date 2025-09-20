interface AppConfig {
  baseUrl: string;   // REST
  serverUrl: string; // SockJS/STOMP endpoint
}

const appConfig: AppConfig = {
  baseUrl: process.env.REACT_APP_BASE_URL || "",
  serverUrl: process.env.REACT_APP_SERVER_URL || ""
};

export default appConfig;

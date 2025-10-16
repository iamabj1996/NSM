import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

axios.defaults.headers.put["Content-Type"] = "application/json";

if (process.env.NODE_ENV === "development") {
  console.log("this ran");
  const username = "react.app@nuvolo.com";
  const password = "Nuvolo@123";
  axios.defaults.auth = {
    username,
    password,
  };
} else {
  axios.defaults.headers["X-UserToken"] = window.servicenowUserToken;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

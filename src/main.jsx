import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
const application = <React.StrictMode><HelmetProvider><BrowserRouter><App /></BrowserRouter></HelmetProvider></React.StrictMode>;
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, application);
else ReactDOM.createRoot(root).render(application);

import "./styles/upgrade.css";

import "./styles/customer.css";

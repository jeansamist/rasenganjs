import React from "react";
import ReactDOM from "react-dom/client";
// @ts-ignore
import App from "./../../../../src/main";
import { Component, ErrorBoundary } from "../core/components/index.js";
// @ts-ignore
import config from "./../../../../rasengan.config.js";

import * as pkg from "react-helmet-async";

// @ts-ignore
const { HelmetProvider } = pkg.default || pkg;

ReactDOM.hydrateRoot(
  document.getElementById("root") as HTMLElement,
  config.reactStrictMode ? (
    <React.StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <App Component={Component} />
        </ErrorBoundary>
      </HelmetProvider>
    </React.StrictMode>
  ) : (
    <HelmetProvider>
      <ErrorBoundary>
        <App Component={Component} />
      </ErrorBoundary>
    </HelmetProvider>
  )
);

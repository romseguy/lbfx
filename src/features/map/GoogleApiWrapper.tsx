//@ts-nocheck
import React from "react";

import { isServer } from "utils/isServer";
import GoogleApi from "./GoogleApi";
import { ScriptCache } from "./ScriptCache";

const serialize = (obj) => JSON.stringify(obj);
const isSame = (obj1, obj2) =>
  obj1 === obj2 || serialize(obj1) === serialize(obj2);

const defaultCreateCache = (options) => {
  options = options || {};
  const apiKey = options.apiKey;
  const libraries = options.libraries || ["places"];
  const version = options.version || "3";
  const language = options.language || "en";
  const url = options.url;
  const client = options.client;
  const region = options.region;

  return ScriptCache({
    google: GoogleApi({
      apiKey: apiKey,
      language: language,
      libraries: libraries,
      version: version,
      url: url,
      client: client,
      region: region
    })
  });
};

export const withGoogleApi =
  (input) => (WrappedComponent: React.ComponentType<any>) => {
    return class Wrapper extends React.Component<any, any> {
      constructor(props) {
        super(props);

        // Build options from input
        const options = typeof input === "function" ? input(props) : input;

        // Initialize required Google scripts and other configured options
        this.initialize(options);

        this.state = {
          loaded: false,
          map: null,
          google: null,
          options: options
        };

        this.mapRef = React.createRef();
      }

      UNSAFE_componentWillReceiveProps(props) {
        // Do not update input if it's not dynamic
        if (typeof input !== "function") {
          return;
        }

        // Get options to compare
        const prevOptions = this.state.options;
        const options = typeof input === "function" ? input(props) : input;

        // Ignore when options are not changed
        if (isSame(options, prevOptions)) {
          return;
        }

        // Initialize with new options
        this.initialize(options);

        // Save new options in component state,
        // and remove information about previous API handlers
        this.setState({
          options: options,
          loaded: false,
          google: null
        });
      }

      componentWillUnmount() {
        if (this.unregisterLoadHandler) {
          this.unregisterLoadHandler();
        }
      }

      initialize(options) {
        // Avoid race condition: remove previous 'load' listener
        if (this.unregisterLoadHandler) {
          this.unregisterLoadHandler();
          this.unregisterLoadHandler = null;
        }

        // Load cache factory
        const createCache = options.createCache || defaultCreateCache;

        // Build script
        this.scriptCache = createCache(options);
        this.unregisterLoadHandler = this.scriptCache.google.onLoad(
          this.onLoad.bind(this)
        );
      }

      onLoad(err, tag) {
        this._gapi = window.google;

        this.setState({ loaded: true, google: this._gapi });
      }

      render() {
        if (isServer()) return <WrappedComponent {...this.props} />;

        const props = Object.assign({}, this.props, {
          loaded: this.state.loaded,
          google: window.google
        });

        return <WrappedComponent {...props} />;
        // return (
        //   <div>
        //     <WrappedComponent {...props} />
        //     <div ref={this.mapRef} />
        //   </div>
        // );
      }
    };
  };

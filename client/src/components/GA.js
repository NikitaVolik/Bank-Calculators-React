// client/src/components/GA.js

import ReactGA from "react-ga4";

const initGA = () => {
  ReactGA.initialize([
    {
      trackingId: "G-YMK1LMR7B4",
      gtagOptions: {
        debug_mode: true // Включаем DebugView
      }
    }
  ])
};

const trackPageview = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

const handleClickGA = (params) => {
  console.log(params)
  ReactGA.event(params);
};

export { initGA, trackPageview, handleClickGA };
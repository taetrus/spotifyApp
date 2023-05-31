import React, { useEffect } from "react";
import axios from "axios";

const CallbackPage: React.FC = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    //TODO devam

    const hash = window.location.hash
      .substring(1)
      .split("&")
      .reduce(function (initial: any, item) {
        if (item) {
          const parts = item.split("=");
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});
    window.location.hash = "";

    // Set the access token to the local storage
    localStorage.setItem("spotify_access_token", hash.access_token);

    // Redirect the user to the home page
    window.location.href = "/";
  }, []);

  return <div>Redirecting...</div>;
};

export default CallbackPage;

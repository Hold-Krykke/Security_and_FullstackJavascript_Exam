const ClientID = "6c1763eb62e5cabb9ebe";
// Endpoint
const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint:
    "https://github.com/settings/connections/applications/<CLIENT_ID>",
};
// Request
const [request, response, promptAsync] = useAuthRequest(
  {
    clientId: "CLIENT_ID",
    scopes: ["identity"],
    // For usage in managed apps using the proxy
    redirectUri: makeRedirectUri({
      // For usage in bare and standalone
      native: "your.app://redirect",
    }),
  },
  discovery
);

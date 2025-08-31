// Chromium manifest v3 uses workers and can only loads 1 background script. Use importScripts to import everything.
if (typeof browser === "undefined") {
  importScripts(`./background/libs/graphql-ws.js`);
}

const resetCaidoConfig = () => {
  chrome.storage.local.get("caidoConfig", (storageData) => {
      storageData.caidoConfig.accessToken = null;
      storageData.caidoConfig.refreshToken = null;
      storageData.caidoConfig.accessTokenExpiration = null;
      storageData.caidoConfig.refreshTokenExpiration = null;
      storageData.caidoConfig.pluginId = null;
      storageData.caidoConfig.enabled = false;
      extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Caido session has been cleared." });
      extensionAPI.storage.local.set({ caidoConfig: storageData.caidoConfig });
  });

  chrome.tabs.create({ url: chrome.runtime.getURL("/src/options/options.html?caidoErrorMsg=You+must+(re)connect+to+Caido!#caido") });
}

// Authentication flow step 1: Get a verifcation URL, and a request ID
const startAuthenticationFlow = async (url) => {
  try {
    extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Starting Caido authentication flow..." });
    const parsedURL = new URL(url);
    const response = await fetch(`${parsedURL.origin}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
          mutation startAuthenticationFlow {
            startAuthenticationFlow {
              request {
                id
                expiresAt
                userCode
                verificationUrl
              }
            }
          }
        `
      })
    }).catch((fetchError) => {
      extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `Network error during authentication flow: ${fetchError.message}` });
      return;
    });

    if (!response.ok) {
      extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `Invalid HTTP status: ${response.status}` });
      return;
    }

    const data = await response.json();
    const { id: authId, userCode: authCode, verificationUrl: authUrl } = data.data.startAuthenticationFlow.request; 

    extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Opening the Caido authorization page..." });
    extensionAPI.tabs.create({ url: authUrl });

    extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Initializing the authentication token subscription..." });
    subscribeToAuthToken(parsedURL.origin, parsedURL.host, authId);
  } catch (error) {
    extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `${error}` });
  }
};

// Authentication flow step 2: Wait for the user to accept the authorization on the browser and retrieve the refresh & access tokens
const subscribeToAuthToken = (origin, host, requestId) => {
  const { createClient } = graphqlWs;

  const websocketClient = createClient({
    url: `ws://${host}/ws/graphql`,
    lazy: false,
    on: {
      connected: (socket) => {
        extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Websocket connection established!" });

        websocketClient.subscribe(
          {
            query: `
              subscription {
                createdAuthenticationToken(requestId: "${requestId}") {
                  token {
                    refreshToken
                    accessToken
                  }
                }
              }
            `
          },
          {
            next: (data) => {
              if (data?.data?.createdAuthenticationToken?.token?.accessToken && data?.data?.createdAuthenticationToken?.token?.refreshToken) {
                extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Authentication flow completed! Caido can now be used as a webhook!" });

                chrome.storage.local.get("caidoConfig", (storageData) => {
                  if (storageData.caidoConfig) {
                    storageData.caidoConfig.accessToken = data.data.createdAuthenticationToken.token.accessToken;
                    storageData.caidoConfig.refreshToken = data.data.createdAuthenticationToken.token.refreshToken;

                    let now;
                    now = new Date();
                    storageData.caidoConfig.accessTokenExpiration = new Date(now.setDate(now.getDate() + 7)).getTime();

                    now = new Date();
                    storageData.caidoConfig.refreshTokenExpiration = new Date(now.setDate(now.getMonth() + 3)).getTime();

                    storageData.caidoConfig.enabled = true;
                    extensionAPI.storage.local.set({ caidoConfig: storageData.caidoConfig });

                    // Get the DOMLogger plugin ID and store it
                    getDOMLoggerPluginID(origin, storageData.caidoConfig.accessToken);
                  }
                });
              } else {
                extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Something went wrong! Auth token is missing!" });
              }
            },
            error: (error) => {
              extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `Something went wrong! Auth token subscription error: ${error}` });
            }
          }
        );
      },
      closed: (event) => {
        extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Websocket connection closed!" });
      },
      error: (error) => {
        extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `Websocket connection error: ${error}` });
      },
    },
  });
};

// Authentication flow step 3: Retrieve the DOMLogger plugin ID
const getDOMLoggerPluginID = async (origin, accessToken) => {
  try {
    extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Retrieving the DOMLogger++ plugin ID..." });
    const response = await fetch(`${origin}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        query: `
          query Plugins {
            pluginPackages {
              name
              plugins {
                id
                manifestId
              }
            }
          }
        `
      })
    }).catch((fetchError) => {
      extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `Error retrieving DOMLogger plugin ID: ${fetchError.message}` });
      resetCaidoConfig();
      return;
    });

    const data = await response.json();
    const plugin = data.data.pluginPackages.filter(p => p.name === "DOMLogger++");

    if (plugin.length === 0) {
      extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "DOMLogger++ plugin not found! Clearing the Caido session..." });
      resetCaidoConfig();
      return;
    }

    chrome.storage.local.get("caidoConfig", (storageData) => {
      if (storageData.caidoConfig) {
        const pluginId = plugin[0].plugins[0].id;
        storageData.caidoConfig.pluginId = pluginId;
        extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `DOMLogger++ plugin ID found: ${pluginId}` });
        extensionAPI.storage.local.set({ caidoConfig: storageData.caidoConfig });
      }
    });
  } catch (error) {
    extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: `Error retrieving DOMLogger plugin ID: ${error}` });
    resetCaidoConfig();
  }
};

// Refresh access token
const refreshAccessToken = async (origin, refreshToken) => {
  return new Promise((resolve, reject) => {
    try {
      extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Refreshing the access token..." });

      fetch(`${origin}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `
            mutation RefreshAuthenticationTokenPayload {
              refreshAuthenticationToken(refreshToken: "${refreshToken}") {
                token {
                  refreshToken
                  accessToken
                }
              }
            }
          `
        })
      })
      .then(async (response) => {
        if (!response) {
          reject(new Error("No response received"));
          resetCaidoConfig();
          return;
        }

        const data = await response.json();

        if (data?.data?.refreshAuthenticationToken?.token?.accessToken) {
          chrome.storage.local.get("caidoConfig", (storageData) => {
            if (storageData.caidoConfig) {
              storageData.caidoConfig.accessToken = data.data.refreshAuthenticationToken.token.accessToken;
              storageData.caidoConfig.refreshToken = data.data.refreshAuthenticationToken.token.refreshToken;

              let now;
              now = new Date();
              storageData.caidoConfig.accessTokenExpiration = new Date(now.setDate(now.getDate() + 7)).getTime();

              now = new Date();
              storageData.caidoConfig.refreshTokenExpiration = new Date(now.setDate(now.getMonth() + 3)).getTime();

              extensionAPI.storage.local.set({ caidoConfig: storageData.caidoConfig }, () => {
                extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: "Access token refreshed!" });
                resolve(data.data.refreshAuthenticationToken.token.accessToken);
              });
            }
          });
        } else {
          resetCaidoConfig();
          reject(new Error("Something went wrong! Access token is missing! Refresh failed!"));
        }
      })
      .catch((fetchError) => {
        const errorMsg = `Error refreshing access token: ${fetchError.message}`;
        extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: errorMsg });
        resetCaidoConfig();
        reject(fetchError);
      });
    } catch (error) {
      const errorMsg = `Error refreshing access token: ${error.message}`;
      extensionAPI.runtime.sendMessage({ action: "caido-auth-log", data: errorMsg });
      resetCaidoConfig();
      reject(error);
    }
  });
};
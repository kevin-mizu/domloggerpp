// https://cdn.jsdelivr.net/npm/graphql-ws@6.0.6/umd/graphql-ws.js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.graphqlWs = {}));
})(this, (function (exports) { 'use strict';

  function extendedTypeof(val) {
    if (val === null) {
      return "null";
    }
    if (Array.isArray(val)) {
      return "array";
    }
    return typeof val;
  }
  function isObject(val) {
    return extendedTypeof(val) === "object";
  }
  function areGraphQLFormattedErrors(obj) {
    return Array.isArray(obj) && // must be at least one error
    obj.length > 0 && // error has at least a message
    obj.every((ob) => "message" in ob);
  }
  function limitCloseReason(reason, whenTooLong) {
    return reason.length < 124 ? reason : whenTooLong;
  }

  const GRAPHQL_TRANSPORT_WS_PROTOCOL = "graphql-transport-ws";
  const DEPRECATED_GRAPHQL_WS_PROTOCOL = "graphql-ws";
  var CloseCode = /* @__PURE__ */ ((CloseCode2) => {
    CloseCode2[CloseCode2["InternalServerError"] = 4500] = "InternalServerError";
    CloseCode2[CloseCode2["InternalClientError"] = 4005] = "InternalClientError";
    CloseCode2[CloseCode2["BadRequest"] = 4400] = "BadRequest";
    CloseCode2[CloseCode2["BadResponse"] = 4004] = "BadResponse";
    CloseCode2[CloseCode2["Unauthorized"] = 4401] = "Unauthorized";
    CloseCode2[CloseCode2["Forbidden"] = 4403] = "Forbidden";
    CloseCode2[CloseCode2["SubprotocolNotAcceptable"] = 4406] = "SubprotocolNotAcceptable";
    CloseCode2[CloseCode2["ConnectionInitialisationTimeout"] = 4408] = "ConnectionInitialisationTimeout";
    CloseCode2[CloseCode2["ConnectionAcknowledgementTimeout"] = 4504] = "ConnectionAcknowledgementTimeout";
    CloseCode2[CloseCode2["SubscriberAlreadyExists"] = 4409] = "SubscriberAlreadyExists";
    CloseCode2[CloseCode2["TooManyInitialisationRequests"] = 4429] = "TooManyInitialisationRequests";
    return CloseCode2;
  })(CloseCode || {});
  var MessageType = /* @__PURE__ */ ((MessageType2) => {
    MessageType2["ConnectionInit"] = "connection_init";
    MessageType2["ConnectionAck"] = "connection_ack";
    MessageType2["Ping"] = "ping";
    MessageType2["Pong"] = "pong";
    MessageType2["Subscribe"] = "subscribe";
    MessageType2["Next"] = "next";
    MessageType2["Error"] = "error";
    MessageType2["Complete"] = "complete";
    return MessageType2;
  })(MessageType || {});
  function validateMessage(val) {
    if (!isObject(val)) {
      throw new Error(
        `Message is expected to be an object, but got ${extendedTypeof(val)}`
      );
    }
    if (!val.type) {
      throw new Error(`Message is missing the 'type' property`);
    }
    if (typeof val.type !== "string") {
      throw new Error(
        `Message is expects the 'type' property to be a string, but got ${extendedTypeof(
        val.type
      )}`
      );
    }
    switch (val.type) {
      case "connection_init" /* ConnectionInit */:
      case "connection_ack" /* ConnectionAck */:
      case "ping" /* Ping */:
      case "pong" /* Pong */: {
        if (val.payload != null && !isObject(val.payload)) {
          throw new Error(
            `"${val.type}" message expects the 'payload' property to be an object or nullish or missing, but got "${val.payload}"`
          );
        }
        break;
      }
      case "subscribe" /* Subscribe */: {
        if (typeof val.id !== "string") {
          throw new Error(
            `"${val.type}" message expects the 'id' property to be a string, but got ${extendedTypeof(
            val.id
          )}`
          );
        }
        if (!val.id) {
          throw new Error(
            `"${val.type}" message requires a non-empty 'id' property`
          );
        }
        if (!isObject(val.payload)) {
          throw new Error(
            `"${val.type}" message expects the 'payload' property to be an object, but got ${extendedTypeof(
            val.payload
          )}`
          );
        }
        if (typeof val.payload.query !== "string") {
          throw new Error(
            `"${val.type}" message payload expects the 'query' property to be a string, but got ${extendedTypeof(
            val.payload.query
          )}`
          );
        }
        if (val.payload.variables != null && !isObject(val.payload.variables)) {
          throw new Error(
            `"${val.type}" message payload expects the 'variables' property to be a an object or nullish or missing, but got ${extendedTypeof(
            val.payload.variables
          )}`
          );
        }
        if (val.payload.operationName != null && extendedTypeof(val.payload.operationName) !== "string") {
          throw new Error(
            `"${val.type}" message payload expects the 'operationName' property to be a string or nullish or missing, but got ${extendedTypeof(
            val.payload.operationName
          )}`
          );
        }
        if (val.payload.extensions != null && !isObject(val.payload.extensions)) {
          throw new Error(
            `"${val.type}" message payload expects the 'extensions' property to be a an object or nullish or missing, but got ${extendedTypeof(
            val.payload.extensions
          )}`
          );
        }
        break;
      }
      case "next" /* Next */: {
        if (typeof val.id !== "string") {
          throw new Error(
            `"${val.type}" message expects the 'id' property to be a string, but got ${extendedTypeof(
            val.id
          )}`
          );
        }
        if (!val.id) {
          throw new Error(
            `"${val.type}" message requires a non-empty 'id' property`
          );
        }
        if (!isObject(val.payload)) {
          throw new Error(
            `"${val.type}" message expects the 'payload' property to be an object, but got ${extendedTypeof(
            val.payload
          )}`
          );
        }
        break;
      }
      case "error" /* Error */: {
        if (typeof val.id !== "string") {
          throw new Error(
            `"${val.type}" message expects the 'id' property to be a string, but got ${extendedTypeof(
            val.id
          )}`
          );
        }
        if (!val.id) {
          throw new Error(
            `"${val.type}" message requires a non-empty 'id' property`
          );
        }
        if (!areGraphQLFormattedErrors(val.payload)) {
          throw new Error(
            `"${val.type}" message expects the 'payload' property to be an array of GraphQL errors, but got ${JSON.stringify(
            val.payload
          )}`
          );
        }
        break;
      }
      case "complete" /* Complete */: {
        if (typeof val.id !== "string") {
          throw new Error(
            `"${val.type}" message expects the 'id' property to be a string, but got ${extendedTypeof(
            val.id
          )}`
          );
        }
        if (!val.id) {
          throw new Error(
            `"${val.type}" message requires a non-empty 'id' property`
          );
        }
        break;
      }
      default:
        throw new Error(`Invalid message 'type' property "${val.type}"`);
    }
    return val;
  }
  function parseMessage(data, reviver) {
    return validateMessage(
      typeof data === "string" ? JSON.parse(data, reviver) : data
    );
  }
  function stringifyMessage(msg, replacer) {
    validateMessage(msg);
    return JSON.stringify(msg, replacer);
  }

  function createClient(options) {
    const {
      url,
      connectionParams,
      lazy = true,
      onNonLazyError = console.error,
      lazyCloseTimeout: lazyCloseTimeoutMs = 0,
      keepAlive = 0,
      disablePong,
      connectionAckWaitTimeout = 0,
      retryAttempts = 5,
      retryWait = async function randomisedExponentialBackoff(retries2) {
        const retryDelaySeconds = Math.pow(2, retries2);
        await new Promise(
          (resolve) => setTimeout(
            resolve,
            retryDelaySeconds * 1e3 + // add random timeout from 300ms to 3s
            Math.floor(Math.random() * (3e3 - 300) + 300)
          )
        );
      },
      shouldRetry = isLikeCloseEvent,
      on,
      webSocketImpl,
      /**
       * Generates a v4 UUID to be used as the ID using `Math`
       * as the random number generator. Supply your own generator
       * in case you need more uniqueness.
       *
       * Reference: https://gist.github.com/jed/982883
       */
      generateID = function generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
          return v.toString(16);
        });
      },
      jsonMessageReplacer: replacer,
      jsonMessageReviver: reviver
    } = options;
    let ws;
    if (webSocketImpl) {
      if (!isWebSocket(webSocketImpl)) {
        throw new Error("Invalid WebSocket implementation provided");
      }
      ws = webSocketImpl;
    } else if (typeof WebSocket !== "undefined") {
      ws = WebSocket;
    } else if (typeof global !== "undefined") {
      ws = global.WebSocket || // @ts-expect-error: Support more browsers
      global.MozWebSocket;
    } else if (typeof window !== "undefined") {
      ws = window.WebSocket || // @ts-expect-error: Support more browsers
      window.MozWebSocket;
    }
    if (!ws)
      throw new Error(
        "WebSocket implementation missing; on Node you can `import WebSocket from 'ws';` and pass `webSocketImpl: WebSocket` to `createClient`"
      );
    const WebSocketImpl = ws;
    const emitter = (() => {
      const message = /* @__PURE__ */ (() => {
        const listeners2 = {};
        return {
          on(id, listener) {
            listeners2[id] = listener;
            return () => {
              delete listeners2[id];
            };
          },
          emit(message2) {
            if ("id" in message2) listeners2[message2.id]?.(message2);
          }
        };
      })();
      const listeners = {
        connecting: on?.connecting ? [on.connecting] : [],
        opened: on?.opened ? [on.opened] : [],
        connected: on?.connected ? [on.connected] : [],
        ping: on?.ping ? [on.ping] : [],
        pong: on?.pong ? [on.pong] : [],
        message: on?.message ? [message.emit, on.message] : [message.emit],
        closed: on?.closed ? [on.closed] : [],
        error: on?.error ? [on.error] : []
      };
      return {
        onMessage: message.on,
        on(event, listener) {
          const l = listeners[event];
          l.push(listener);
          return () => {
            l.splice(l.indexOf(listener), 1);
          };
        },
        emit(event, ...args) {
          for (const listener of [...listeners[event]]) {
            listener(...args);
          }
        }
      };
    })();
    function errorOrClosed(cb) {
      const listening = [
        // errors are fatal and more critical than close events, throw them first
        emitter.on("error", (err) => {
          listening.forEach((unlisten) => unlisten());
          cb(err);
        }),
        // closes can be graceful and not fatal, throw them second (if error didnt throw)
        emitter.on("closed", (event) => {
          listening.forEach((unlisten) => unlisten());
          cb(event);
        })
      ];
    }
    let connecting, locks = 0, lazyCloseTimeout, retrying = false, retries = 0, disposed = false;
    async function connect() {
      clearTimeout(lazyCloseTimeout);
      const [socket, throwOnClose] = await (connecting ?? (connecting = new Promise(
        (connected, denied) => (async () => {
          if (retrying) {
            await retryWait(retries);
            if (!locks) {
              connecting = undefined;
              return denied({ code: 1e3, reason: "All Subscriptions Gone" });
            }
            retries++;
          }
          emitter.emit("connecting", retrying);
          const socket2 = new WebSocketImpl(
            typeof url === "function" ? await url() : url,
            GRAPHQL_TRANSPORT_WS_PROTOCOL
          );
          let connectionAckTimeout, queuedPing;
          function enqueuePing() {
            if (isFinite(keepAlive) && keepAlive > 0) {
              clearTimeout(queuedPing);
              queuedPing = setTimeout(() => {
                if (socket2.readyState === WebSocketImpl.OPEN) {
                  socket2.send(stringifyMessage({ type: MessageType.Ping }));
                  emitter.emit("ping", false, undefined);
                }
              }, keepAlive);
            }
          }
          errorOrClosed((errOrEvent) => {
            connecting = undefined;
            clearTimeout(connectionAckTimeout);
            clearTimeout(queuedPing);
            denied(errOrEvent);
            if (errOrEvent instanceof TerminatedCloseEvent) {
              socket2.close(4499, "Terminated");
              socket2.onerror = null;
              socket2.onclose = null;
            }
          });
          socket2.onerror = (err) => emitter.emit("error", err);
          socket2.onclose = (event) => emitter.emit("closed", event);
          socket2.onopen = async () => {
            try {
              emitter.emit("opened", socket2);
              const payload = typeof connectionParams === "function" ? await connectionParams() : connectionParams;
              if (socket2.readyState !== WebSocketImpl.OPEN) return;
              socket2.send(
                stringifyMessage(
                  payload ? {
                    type: MessageType.ConnectionInit,
                    payload
                  } : {
                    type: MessageType.ConnectionInit
                    // payload is completely absent if not provided
                  },
                  replacer
                )
              );
              if (isFinite(connectionAckWaitTimeout) && connectionAckWaitTimeout > 0) {
                connectionAckTimeout = setTimeout(() => {
                  socket2.close(
                    CloseCode.ConnectionAcknowledgementTimeout,
                    "Connection acknowledgement timeout"
                  );
                }, connectionAckWaitTimeout);
              }
              enqueuePing();
            } catch (err) {
              emitter.emit("error", err);
              socket2.close(
                CloseCode.InternalClientError,
                limitCloseReason(
                  err instanceof Error ? err.message : String(err),
                  "Internal client error"
                )
              );
            }
          };
          let acknowledged = false;
          socket2.onmessage = ({ data }) => {
            try {
              const message = parseMessage(data, reviver);
              emitter.emit("message", message);
              if (message.type === "ping" || message.type === "pong") {
                emitter.emit(message.type, true, message.payload);
                if (message.type === "pong") {
                  enqueuePing();
                } else if (!disablePong) {
                  socket2.send(
                    stringifyMessage(
                      message.payload ? {
                        type: MessageType.Pong,
                        payload: message.payload
                      } : {
                        type: MessageType.Pong
                        // payload is completely absent if not provided
                      }
                    )
                  );
                  emitter.emit("pong", false, message.payload);
                }
                return;
              }
              if (acknowledged) return;
              if (message.type !== MessageType.ConnectionAck)
                throw new Error(
                  `First message cannot be of type ${message.type}`
                );
              clearTimeout(connectionAckTimeout);
              acknowledged = true;
              emitter.emit("connected", socket2, message.payload, retrying);
              retrying = false;
              retries = 0;
              connected([
                socket2,
                new Promise((_, reject) => errorOrClosed(reject))
              ]);
            } catch (err) {
              socket2.onmessage = null;
              emitter.emit("error", err);
              socket2.close(
                CloseCode.BadResponse,
                limitCloseReason(
                  err instanceof Error ? err.message : String(err),
                  "Bad response"
                )
              );
            }
          };
        })()
      )));
      if (socket.readyState === WebSocketImpl.CLOSING) await throwOnClose;
      let release = () => {
      };
      const released = new Promise((resolve) => release = resolve);
      return [
        socket,
        release,
        Promise.race([
          // wait for
          released.then(() => {
            if (!locks) {
              const complete = () => socket.close(1e3, "Normal Closure");
              if (isFinite(lazyCloseTimeoutMs) && lazyCloseTimeoutMs > 0) {
                lazyCloseTimeout = setTimeout(() => {
                  if (socket.readyState === WebSocketImpl.OPEN) complete();
                }, lazyCloseTimeoutMs);
              } else {
                complete();
              }
            }
          }),
          // or
          throwOnClose
        ])
      ];
    }
    function shouldRetryConnectOrThrow(errOrCloseEvent) {
      if (isLikeCloseEvent(errOrCloseEvent) && (isFatalInternalCloseCode(errOrCloseEvent.code) || [
        CloseCode.InternalServerError,
        CloseCode.InternalClientError,
        CloseCode.BadRequest,
        CloseCode.BadResponse,
        CloseCode.Unauthorized,
        // CloseCode.Forbidden, might grant access out after retry
        CloseCode.SubprotocolNotAcceptable,
        // CloseCode.ConnectionInitialisationTimeout, might not time out after retry
        // CloseCode.ConnectionAcknowledgementTimeout, might not time out after retry
        CloseCode.SubscriberAlreadyExists,
        CloseCode.TooManyInitialisationRequests
        // 4499, // Terminated, probably because the socket froze, we want to retry
      ].includes(errOrCloseEvent.code)))
        throw errOrCloseEvent;
      if (disposed) return false;
      if (isLikeCloseEvent(errOrCloseEvent) && errOrCloseEvent.code === 1e3)
        return locks > 0;
      if (!retryAttempts || retries >= retryAttempts) throw errOrCloseEvent;
      if (!shouldRetry(errOrCloseEvent)) throw errOrCloseEvent;
      return retrying = true;
    }
    if (!lazy) {
      (async () => {
        locks++;
        for (; ; ) {
          try {
            const [, , throwOnClose] = await connect();
            await throwOnClose;
          } catch (errOrCloseEvent) {
            try {
              if (!shouldRetryConnectOrThrow(errOrCloseEvent)) return;
            } catch (errOrCloseEvent2) {
              return onNonLazyError?.(errOrCloseEvent2);
            }
          }
        }
      })();
    }
    function subscribe(payload, sink) {
      const id = generateID(payload);
      let done = false, errored = false, releaser = () => {
        locks--;
        done = true;
      };
      (async () => {
        locks++;
        for (; ; ) {
          try {
            const [socket, release, waitForReleaseOrThrowOnClose] = await connect();
            if (done) return release();
            const unlisten = emitter.onMessage(id, (message) => {
              switch (message.type) {
                case MessageType.Next: {
                  sink.next(message.payload);
                  return;
                }
                case MessageType.Error: {
                  errored = true, done = true;
                  sink.error(message.payload);
                  releaser();
                  return;
                }
                case MessageType.Complete: {
                  done = true;
                  releaser();
                  return;
                }
              }
            });
            socket.send(
              stringifyMessage(
                {
                  id,
                  type: MessageType.Subscribe,
                  payload
                },
                replacer
              )
            );
            releaser = () => {
              if (!done && socket.readyState === WebSocketImpl.OPEN)
                socket.send(
                  stringifyMessage(
                    {
                      id,
                      type: MessageType.Complete
                    },
                    replacer
                  )
                );
              locks--;
              done = true;
              release();
            };
            await waitForReleaseOrThrowOnClose.finally(unlisten);
            return;
          } catch (errOrCloseEvent) {
            if (!shouldRetryConnectOrThrow(errOrCloseEvent)) return;
          }
        }
      })().then(() => {
        if (!errored) sink.complete();
      }).catch((err) => {
        sink.error(err);
      });
      return () => {
        if (!done) releaser();
      };
    }
    return {
      on: emitter.on,
      subscribe,
      iterate(request) {
        const pending = [];
        const deferred = {
          done: false,
          error: null,
          resolve: () => {
          }
        };
        const dispose = subscribe(request, {
          next(val) {
            pending.push(val);
            deferred.resolve();
          },
          error(err) {
            deferred.done = true;
            deferred.error = err;
            deferred.resolve();
          },
          complete() {
            deferred.done = true;
            deferred.resolve();
          }
        });
        const iterator = async function* iterator2() {
          for (; ; ) {
            if (!pending.length) {
              await new Promise((resolve) => deferred.resolve = resolve);
            }
            while (pending.length) {
              yield pending.shift();
            }
            if (deferred.error) {
              throw deferred.error;
            }
            if (deferred.done) {
              return;
            }
          }
        }();
        iterator.throw = async (err) => {
          if (!deferred.done) {
            deferred.done = true;
            deferred.error = err;
            deferred.resolve();
          }
          return { done: true, value: undefined };
        };
        iterator.return = async () => {
          dispose();
          return { done: true, value: undefined };
        };
        return iterator;
      },
      async dispose() {
        disposed = true;
        if (connecting) {
          const [socket] = await connecting;
          socket.close(1e3, "Normal Closure");
        }
      },
      terminate() {
        if (connecting) {
          emitter.emit("closed", new TerminatedCloseEvent());
        }
      }
    };
  }
  class TerminatedCloseEvent extends Error {
    name = "TerminatedCloseEvent";
    message = "4499: Terminated";
    code = 4499;
    reason = "Terminated";
    wasClean = false;
  }
  function isLikeCloseEvent(val) {
    return isObject(val) && "code" in val && "reason" in val;
  }
  function isFatalInternalCloseCode(code) {
    if ([
      1e3,
      // Normal Closure is not an erroneous close code
      1001,
      // Going Away
      1006,
      // Abnormal Closure
      1005,
      // No Status Received
      1012,
      // Service Restart
      1013,
      // Try Again Later
      1014
      // Bad Gateway
    ].includes(code))
      return false;
    return code >= 1e3 && code <= 1999;
  }
  function isWebSocket(val) {
    return typeof val === "function" && "constructor" in val && "CLOSED" in val && "CLOSING" in val && "CONNECTING" in val && "OPEN" in val;
  }

  exports.CloseCode = CloseCode;
  exports.DEPRECATED_GRAPHQL_WS_PROTOCOL = DEPRECATED_GRAPHQL_WS_PROTOCOL;
  exports.GRAPHQL_TRANSPORT_WS_PROTOCOL = GRAPHQL_TRANSPORT_WS_PROTOCOL;
  exports.MessageType = MessageType;
  exports.TerminatedCloseEvent = TerminatedCloseEvent;
  exports.createClient = createClient;
  exports.parseMessage = parseMessage;
  exports.stringifyMessage = stringifyMessage;
  exports.validateMessage = validateMessage;

}));

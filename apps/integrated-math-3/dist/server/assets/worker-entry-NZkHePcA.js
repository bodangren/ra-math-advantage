import require$$0, { AsyncLocalStorage as AsyncLocalStorage$1 } from "node:async_hooks";
import assetsManifest from "../__vite_rsc_assets_manifest.js";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
function tinyassert(value, message) {
  if (value) return;
  if (message instanceof Error) throw message;
  throw new TinyAssertionError(message, tinyassert);
}
var TinyAssertionError = class extends Error {
  constructor(message, stackStartFunction) {
    super(message ?? "TinyAssertionError");
    if (stackStartFunction && "captureStackTrace" in Error) Error.captureStackTrace(this, stackStartFunction);
  }
};
function safeFunctionCast(f) {
  return f;
}
function memoize(f, options) {
  const keyFn = ((...args) => args[0]);
  const cache = /* @__PURE__ */ new Map();
  return safeFunctionCast(function(...args) {
    const key = keyFn(...args);
    const value = cache.get(key);
    if (typeof value !== "undefined") return value;
    const newValue = f.apply(this, args);
    cache.set(key, newValue);
    return newValue;
  });
}
const SERVER_REFERENCE_PREFIX = "$$server:";
const SERVER_DECODE_CLIENT_PREFIX = "$$decode-client:";
function removeReferenceCacheTag(id) {
  return id.split("$$cache=")[0];
}
function setInternalRequire() {
  globalThis.__vite_rsc_require__ = (id) => {
    if (id.startsWith(SERVER_REFERENCE_PREFIX)) {
      id = id.slice(9);
      return globalThis.__vite_rsc_server_require__(id);
    }
    return globalThis.__vite_rsc_client_require__(id);
  };
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var server_edge = {};
var reactServerDomWebpackServer_edge_production = {};
var reactDom_reactServer = { exports: {} };
var reactDom_reactServer_production = {};
var react_reactServer = { exports: {} };
var react_reactServer_production = {};
var hasRequiredReact_reactServer_production;
function requireReact_reactServer_production() {
  if (hasRequiredReact_reactServer_production) return react_reactServer_production;
  hasRequiredReact_reactServer_production = 1;
  var ReactSharedInternals = { H: null, A: null };
  function formatProdErrorMessage(code2) {
    var url = "https://react.dev/errors/" + code2;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code2 + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var isArrayImpl = Array.isArray;
  function noop() {
  }
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty, assign = Object.assign;
  function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== refProp ? refProp : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
  }
  function isValidElement(object2) {
    return "object" === typeof object2 && null !== object2 && object2.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index) {
    return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
  }
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        )), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array2, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = false;
    if (null === children) invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(
                invokeCallback(children._payload),
                array2,
                escapedPrefix,
                nameSoFar,
                callback
              );
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array2, escapedPrefix, "", function(c) {
        return c;
      })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
        callback,
        escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
          userProvidedKeyEscapeRegex,
          "$&/"
        ) + "/") + invokeCallback
      )), array2.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0; i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
          nameSoFar,
          array2,
          escapedPrefix,
          type,
          callback
        );
    else if (i = getIteratorFn(children), "function" === typeof i)
      for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
          nameSoFar,
          array2,
          escapedPrefix,
          type,
          callback
        );
    else if ("object" === type) {
      if ("function" === typeof children.then)
        return mapIntoArray(
          resolveThenable(children),
          array2,
          escapedPrefix,
          nameSoFar,
          callback
        );
      array2 = String(children);
      throw Error(
        formatProdErrorMessage(
          31,
          "[object Object]" === array2 ? "object with keys {" + Object.keys(children).join(", ") + "}" : array2
        )
      );
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (-1 === payload._status) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(
        function(moduleObject) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 1, payload._result = moduleObject;
        },
        function(error) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 2, payload._result = error;
        }
      );
      -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
  }
  function createCacheRoot() {
    return /* @__PURE__ */ new WeakMap();
  }
  function createCacheNode() {
    return { s: 0, v: void 0, o: null, p: null };
  }
  react_reactServer_production.Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function() {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children)) throw Error(formatProdErrorMessage(143));
      return children;
    }
  };
  react_reactServer_production.Fragment = REACT_FRAGMENT_TYPE;
  react_reactServer_production.Profiler = REACT_PROFILER_TYPE;
  react_reactServer_production.StrictMode = REACT_STRICT_MODE_TYPE;
  react_reactServer_production.Suspense = REACT_SUSPENSE_TYPE;
  react_reactServer_production.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  react_reactServer_production.cache = function(fn) {
    return function() {
      var dispatcher = ReactSharedInternals.A;
      if (!dispatcher) return fn.apply(null, arguments);
      var fnMap = dispatcher.getCacheForType(createCacheRoot);
      dispatcher = fnMap.get(fn);
      void 0 === dispatcher && (dispatcher = createCacheNode(), fnMap.set(fn, dispatcher));
      fnMap = 0;
      for (var l = arguments.length; fnMap < l; fnMap++) {
        var arg = arguments[fnMap];
        if ("function" === typeof arg || "object" === typeof arg && null !== arg) {
          var objectCache = dispatcher.o;
          null === objectCache && (dispatcher.o = objectCache = /* @__PURE__ */ new WeakMap());
          dispatcher = objectCache.get(arg);
          void 0 === dispatcher && (dispatcher = createCacheNode(), objectCache.set(arg, dispatcher));
        } else
          objectCache = dispatcher.p, null === objectCache && (dispatcher.p = objectCache = /* @__PURE__ */ new Map()), dispatcher = objectCache.get(arg), void 0 === dispatcher && (dispatcher = createCacheNode(), objectCache.set(arg, dispatcher));
      }
      if (1 === dispatcher.s) return dispatcher.v;
      if (2 === dispatcher.s) throw dispatcher.v;
      try {
        var result = fn.apply(null, arguments);
        fnMap = dispatcher;
        fnMap.s = 1;
        return fnMap.v = result;
      } catch (error) {
        throw result = dispatcher, result.s = 2, result.v = error, error;
      }
    };
  };
  react_reactServer_production.cacheSignal = function() {
    var dispatcher = ReactSharedInternals.A;
    return dispatcher ? dispatcher.cacheSignal() : null;
  };
  react_reactServer_production.captureOwnerStack = function() {
    return null;
  };
  react_reactServer_production.cloneElement = function(element, config2, children) {
    if (null === element || void 0 === element)
      throw Error(formatProdErrorMessage(267, element));
    var props = assign({}, element.props), key = element.key;
    if (null != config2)
      for (propName in void 0 !== config2.key && (key = "" + config2.key), config2)
        !hasOwnProperty.call(config2, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config2.ref || (props[propName] = config2[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0; i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, props);
  };
  react_reactServer_production.createElement = function(type, config2, children) {
    var propName, props = {}, key = null;
    if (null != config2)
      for (propName in void 0 !== config2.key && (key = "" + config2.key), config2)
        hasOwnProperty.call(config2, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config2[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
  };
  react_reactServer_production.createRef = function() {
    return { current: null };
  };
  react_reactServer_production.forwardRef = function(render) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render };
  };
  react_reactServer_production.isValidElement = isValidElement;
  react_reactServer_production.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  react_reactServer_production.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: void 0 === compare ? null : compare
    };
  };
  react_reactServer_production.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  react_reactServer_production.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_reactServer_production.useDebugValue = function() {
  };
  react_reactServer_production.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  react_reactServer_production.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  react_reactServer_production.version = "19.2.4";
  return react_reactServer_production;
}
var hasRequiredReact_reactServer;
function requireReact_reactServer() {
  if (hasRequiredReact_reactServer) return react_reactServer.exports;
  hasRequiredReact_reactServer = 1;
  {
    react_reactServer.exports = requireReact_reactServer_production();
  }
  return react_reactServer.exports;
}
var hasRequiredReactDom_reactServer_production;
function requireReactDom_reactServer_production() {
  if (hasRequiredReactDom_reactServer_production) return reactDom_reactServer_production;
  hasRequiredReactDom_reactServer_production = 1;
  var React2 = requireReact_reactServer();
  function noop() {
  }
  var Internals = {
    d: {
      f: noop,
      r: function() {
        throw Error(
          "Invalid form element. requestFormReset must be passed a form that was rendered by React."
        );
      },
      D: noop,
      C: noop,
      L: noop,
      m: noop,
      X: noop,
      S: noop,
      M: noop
    },
    p: 0,
    findDOMNode: null
  };
  if (!React2.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE)
    throw Error(
      'The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.'
    );
  function getCrossOriginStringAs(as, input) {
    if ("font" === as) return "";
    if ("string" === typeof input)
      return "use-credentials" === input ? input : "";
  }
  reactDom_reactServer_production.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
  reactDom_reactServer_production.preconnect = function(href, options) {
    "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
  };
  reactDom_reactServer_production.prefetchDNS = function(href) {
    "string" === typeof href && Internals.d.D(href);
  };
  reactDom_reactServer_production.preinit = function(href, options) {
    if ("string" === typeof href && options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
      "style" === as ? Internals.d.S(
        href,
        "string" === typeof options.precedence ? options.precedence : void 0,
        {
          crossOrigin,
          integrity,
          fetchPriority
        }
      ) : "script" === as && Internals.d.X(href, {
        crossOrigin,
        integrity,
        fetchPriority,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0
      });
    }
  };
  reactDom_reactServer_production.preinitModule = function(href, options) {
    if ("string" === typeof href)
      if ("object" === typeof options && null !== options) {
        if (null == options.as || "script" === options.as) {
          var crossOrigin = getCrossOriginStringAs(
            options.as,
            options.crossOrigin
          );
          Internals.d.M(href, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      } else null == options && Internals.d.M(href);
  };
  reactDom_reactServer_production.preload = function(href, options) {
    if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      Internals.d.L(href, as, {
        crossOrigin,
        integrity: "string" === typeof options.integrity ? options.integrity : void 0,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0,
        type: "string" === typeof options.type ? options.type : void 0,
        fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
        referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
        imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
        imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
        media: "string" === typeof options.media ? options.media : void 0
      });
    }
  };
  reactDom_reactServer_production.preloadModule = function(href, options) {
    if ("string" === typeof href)
      if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0
        });
      } else Internals.d.m(href);
  };
  reactDom_reactServer_production.version = "19.2.4";
  return reactDom_reactServer_production;
}
var hasRequiredReactDom_reactServer;
function requireReactDom_reactServer() {
  if (hasRequiredReactDom_reactServer) return reactDom_reactServer.exports;
  hasRequiredReactDom_reactServer = 1;
  {
    reactDom_reactServer.exports = requireReactDom_reactServer_production();
  }
  return reactDom_reactServer.exports;
}
var hasRequiredReactServerDomWebpackServer_edge_production;
function requireReactServerDomWebpackServer_edge_production() {
  if (hasRequiredReactServerDomWebpackServer_edge_production) return reactServerDomWebpackServer_edge_production;
  hasRequiredReactServerDomWebpackServer_edge_production = 1;
  const __viteRscAsyncHooks = require$$0;
  globalThis.AsyncLocalStorage = __viteRscAsyncHooks.AsyncLocalStorage;
  var ReactDOM = requireReactDom_reactServer(), React2 = requireReact_reactServer(), REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ASYNC_ITERATOR = Symbol.asyncIterator;
  function handleErrorInNextTick(error) {
    setTimeout(function() {
      throw error;
    });
  }
  var LocalPromise = Promise, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : function(callback) {
    LocalPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
  }, currentView = null, writtenBytes = 0;
  function writeChunkAndReturn(destination, chunk) {
    if (0 !== chunk.byteLength)
      if (2048 < chunk.byteLength)
        0 < writtenBytes && (destination.enqueue(
          new Uint8Array(currentView.buffer, 0, writtenBytes)
        ), currentView = new Uint8Array(2048), writtenBytes = 0), destination.enqueue(chunk);
      else {
        var allowableBytes = currentView.length - writtenBytes;
        allowableBytes < chunk.byteLength && (0 === allowableBytes ? destination.enqueue(currentView) : (currentView.set(chunk.subarray(0, allowableBytes), writtenBytes), destination.enqueue(currentView), chunk = chunk.subarray(allowableBytes)), currentView = new Uint8Array(2048), writtenBytes = 0);
        currentView.set(chunk, writtenBytes);
        writtenBytes += chunk.byteLength;
      }
    return true;
  }
  var textEncoder = new TextEncoder();
  function stringToChunk(content) {
    return textEncoder.encode(content);
  }
  function byteLengthOfChunk(chunk) {
    return chunk.byteLength;
  }
  function closeWithError(destination, error) {
    "function" === typeof destination.error ? destination.error(error) : destination.close();
  }
  var CLIENT_REFERENCE_TAG$1 = Symbol.for("react.client.reference"), SERVER_REFERENCE_TAG = Symbol.for("react.server.reference");
  function registerClientReferenceImpl(proxyImplementation, id, async) {
    return Object.defineProperties(proxyImplementation, {
      $$typeof: { value: CLIENT_REFERENCE_TAG$1 },
      $$id: { value: id },
      $$async: { value: async }
    });
  }
  var FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice;
  function bind() {
    var newFn = FunctionBind.apply(this, arguments);
    if (this.$$typeof === SERVER_REFERENCE_TAG) {
      var args = ArraySlice.call(arguments, 1), $$typeof = { value: SERVER_REFERENCE_TAG }, $$id = { value: this.$$id };
      args = { value: this.$$bound ? this.$$bound.concat(args) : args };
      return Object.defineProperties(newFn, {
        $$typeof,
        $$id,
        $$bound: args,
        bind: { value: bind, configurable: true }
      });
    }
    return newFn;
  }
  var serverReferenceToString = {
    value: function() {
      return "function () { [omitted code] }";
    },
    configurable: true,
    writable: true
  }, PROMISE_PROTOTYPE = Promise.prototype, deepProxyHandlers = {
    get: function(target, name) {
      switch (name) {
        case "$$typeof":
          return target.$$typeof;
        case "$$id":
          return target.$$id;
        case "$$async":
          return target.$$async;
        case "name":
          return target.name;
        case "displayName":
          return;
        case "defaultProps":
          return;
        case "_debugInfo":
          return;
        case "toJSON":
          return;
        case Symbol.toPrimitive:
          return Object.prototype[Symbol.toPrimitive];
        case Symbol.toStringTag:
          return Object.prototype[Symbol.toStringTag];
        case "Provider":
          throw Error(
            "Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider."
          );
        case "then":
          throw Error(
            "Cannot await or return from a thenable. You cannot await a client module from a server component."
          );
      }
      throw Error(
        "Cannot access " + (String(target.name) + "." + String(name)) + " on the server. You cannot dot into a client module from a server component. You can only pass the imported name through."
      );
    },
    set: function() {
      throw Error("Cannot assign to a client module from a server module.");
    }
  };
  function getReference(target, name) {
    switch (name) {
      case "$$typeof":
        return target.$$typeof;
      case "$$id":
        return target.$$id;
      case "$$async":
        return target.$$async;
      case "name":
        return target.name;
      case "defaultProps":
        return;
      case "_debugInfo":
        return;
      case "toJSON":
        return;
      case Symbol.toPrimitive:
        return Object.prototype[Symbol.toPrimitive];
      case Symbol.toStringTag:
        return Object.prototype[Symbol.toStringTag];
      case "__esModule":
        var moduleId = target.$$id;
        target.default = registerClientReferenceImpl(
          function() {
            throw Error(
              "Attempted to call the default export of " + moduleId + " from the server but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component."
            );
          },
          target.$$id + "#",
          target.$$async
        );
        return true;
      case "then":
        if (target.then) return target.then;
        if (target.$$async) return;
        var clientReference = registerClientReferenceImpl({}, target.$$id, true), proxy = new Proxy(clientReference, proxyHandlers$1);
        target.status = "fulfilled";
        target.value = proxy;
        return target.then = registerClientReferenceImpl(
          function(resolve) {
            return Promise.resolve(resolve(proxy));
          },
          target.$$id + "#then",
          false
        );
    }
    if ("symbol" === typeof name)
      throw Error(
        "Cannot read Symbol exports. Only named exports are supported on a client module imported on the server."
      );
    clientReference = target[name];
    clientReference || (clientReference = registerClientReferenceImpl(
      function() {
        throw Error(
          "Attempted to call " + String(name) + "() from the server but " + String(name) + " is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component."
        );
      },
      target.$$id + "#" + name,
      target.$$async
    ), Object.defineProperty(clientReference, "name", { value: name }), clientReference = target[name] = new Proxy(clientReference, deepProxyHandlers));
    return clientReference;
  }
  var proxyHandlers$1 = {
    get: function(target, name) {
      return getReference(target, name);
    },
    getOwnPropertyDescriptor: function(target, name) {
      var descriptor = Object.getOwnPropertyDescriptor(target, name);
      descriptor || (descriptor = {
        value: getReference(target, name),
        writable: false,
        configurable: false,
        enumerable: false
      }, Object.defineProperty(target, name, descriptor));
      return descriptor;
    },
    getPrototypeOf: function() {
      return PROMISE_PROTOTYPE;
    },
    set: function() {
      throw Error("Cannot assign to a client module from a server module.");
    }
  }, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, previousDispatcher = ReactDOMSharedInternals.d;
  ReactDOMSharedInternals.d = {
    f: previousDispatcher.f,
    r: previousDispatcher.r,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule$1,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
  };
  function prefetchDNS(href) {
    if ("string" === typeof href && href) {
      var request = resolveRequest();
      if (request) {
        var hints = request.hints, key = "D|" + href;
        hints.has(key) || (hints.add(key), emitHint(request, "D", href));
      } else previousDispatcher.D(href);
    }
  }
  function preconnect(href, crossOrigin) {
    if ("string" === typeof href) {
      var request = resolveRequest();
      if (request) {
        var hints = request.hints, key = "C|" + (null == crossOrigin ? "null" : crossOrigin) + "|" + href;
        hints.has(key) || (hints.add(key), "string" === typeof crossOrigin ? emitHint(request, "C", [href, crossOrigin]) : emitHint(request, "C", href));
      } else previousDispatcher.C(href, crossOrigin);
    }
  }
  function preload(href, as, options) {
    if ("string" === typeof href) {
      var request = resolveRequest();
      if (request) {
        var hints = request.hints, key = "L";
        if ("image" === as && options) {
          var imageSrcSet = options.imageSrcSet, imageSizes = options.imageSizes, uniquePart = "";
          "string" === typeof imageSrcSet && "" !== imageSrcSet ? (uniquePart += "[" + imageSrcSet + "]", "string" === typeof imageSizes && (uniquePart += "[" + imageSizes + "]")) : uniquePart += "[][]" + href;
          key += "[image]" + uniquePart;
        } else key += "[" + as + "]" + href;
        hints.has(key) || (hints.add(key), (options = trimOptions(options)) ? emitHint(request, "L", [href, as, options]) : emitHint(request, "L", [href, as]));
      } else previousDispatcher.L(href, as, options);
    }
  }
  function preloadModule$1(href, options) {
    if ("string" === typeof href) {
      var request = resolveRequest();
      if (request) {
        var hints = request.hints, key = "m|" + href;
        if (hints.has(key)) return;
        hints.add(key);
        return (options = trimOptions(options)) ? emitHint(request, "m", [href, options]) : emitHint(request, "m", href);
      }
      previousDispatcher.m(href, options);
    }
  }
  function preinitStyle(href, precedence, options) {
    if ("string" === typeof href) {
      var request = resolveRequest();
      if (request) {
        var hints = request.hints, key = "S|" + href;
        if (hints.has(key)) return;
        hints.add(key);
        return (options = trimOptions(options)) ? emitHint(request, "S", [
          href,
          "string" === typeof precedence ? precedence : 0,
          options
        ]) : "string" === typeof precedence ? emitHint(request, "S", [href, precedence]) : emitHint(request, "S", href);
      }
      previousDispatcher.S(href, precedence, options);
    }
  }
  function preinitScript(src, options) {
    if ("string" === typeof src) {
      var request = resolveRequest();
      if (request) {
        var hints = request.hints, key = "X|" + src;
        if (hints.has(key)) return;
        hints.add(key);
        return (options = trimOptions(options)) ? emitHint(request, "X", [src, options]) : emitHint(request, "X", src);
      }
      previousDispatcher.X(src, options);
    }
  }
  function preinitModuleScript(src, options) {
    if ("string" === typeof src) {
      var request = resolveRequest();
      if (request) {
        var hints = request.hints, key = "M|" + src;
        if (hints.has(key)) return;
        hints.add(key);
        return (options = trimOptions(options)) ? emitHint(request, "M", [src, options]) : emitHint(request, "M", src);
      }
      previousDispatcher.M(src, options);
    }
  }
  function trimOptions(options) {
    if (null == options) return null;
    var hasProperties = false, trimmed = {}, key;
    for (key in options)
      null != options[key] && (hasProperties = true, trimmed[key] = options[key]);
    return hasProperties ? trimmed : null;
  }
  function getChildFormatContext(parentContext, type, props) {
    switch (type) {
      case "img":
        type = props.src;
        var srcSet = props.srcSet;
        if (!("lazy" === props.loading || !type && !srcSet || "string" !== typeof type && null != type || "string" !== typeof srcSet && null != srcSet || "low" === props.fetchPriority || parentContext & 3) && ("string" !== typeof type || ":" !== type[4] || "d" !== type[0] && "D" !== type[0] || "a" !== type[1] && "A" !== type[1] || "t" !== type[2] && "T" !== type[2] || "a" !== type[3] && "A" !== type[3]) && ("string" !== typeof srcSet || ":" !== srcSet[4] || "d" !== srcSet[0] && "D" !== srcSet[0] || "a" !== srcSet[1] && "A" !== srcSet[1] || "t" !== srcSet[2] && "T" !== srcSet[2] || "a" !== srcSet[3] && "A" !== srcSet[3])) {
          var sizes = "string" === typeof props.sizes ? props.sizes : void 0;
          var input = props.crossOrigin;
          preload(type || "", "image", {
            imageSrcSet: srcSet,
            imageSizes: sizes,
            crossOrigin: "string" === typeof input ? "use-credentials" === input ? input : "" : void 0,
            integrity: props.integrity,
            type: props.type,
            fetchPriority: props.fetchPriority,
            referrerPolicy: props.referrerPolicy
          });
        }
        return parentContext;
      case "link":
        type = props.rel;
        srcSet = props.href;
        if (!(parentContext & 1 || null != props.itemProp || "string" !== typeof type || "string" !== typeof srcSet || "" === srcSet))
          switch (type) {
            case "preload":
              preload(srcSet, props.as, {
                crossOrigin: props.crossOrigin,
                integrity: props.integrity,
                nonce: props.nonce,
                type: props.type,
                fetchPriority: props.fetchPriority,
                referrerPolicy: props.referrerPolicy,
                imageSrcSet: props.imageSrcSet,
                imageSizes: props.imageSizes,
                media: props.media
              });
              break;
            case "modulepreload":
              preloadModule$1(srcSet, {
                as: props.as,
                crossOrigin: props.crossOrigin,
                integrity: props.integrity,
                nonce: props.nonce
              });
              break;
            case "stylesheet":
              preload(srcSet, "stylesheet", {
                crossOrigin: props.crossOrigin,
                integrity: props.integrity,
                nonce: props.nonce,
                type: props.type,
                fetchPriority: props.fetchPriority,
                referrerPolicy: props.referrerPolicy,
                media: props.media
              });
          }
        return parentContext;
      case "picture":
        return parentContext | 2;
      case "noscript":
        return parentContext | 1;
      default:
        return parentContext;
    }
  }
  var supportsRequestStorage = "function" === typeof AsyncLocalStorage, requestStorage = supportsRequestStorage ? new AsyncLocalStorage() : null, TEMPORARY_REFERENCE_TAG = Symbol.for("react.temporary.reference"), proxyHandlers = {
    get: function(target, name) {
      switch (name) {
        case "$$typeof":
          return target.$$typeof;
        case "name":
          return;
        case "displayName":
          return;
        case "defaultProps":
          return;
        case "_debugInfo":
          return;
        case "toJSON":
          return;
        case Symbol.toPrimitive:
          return Object.prototype[Symbol.toPrimitive];
        case Symbol.toStringTag:
          return Object.prototype[Symbol.toStringTag];
        case "Provider":
          throw Error(
            "Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider."
          );
        case "then":
          return;
      }
      throw Error(
        "Cannot access " + String(name) + " on the server. You cannot dot into a temporary client reference from a server component. You can only pass the value through to the client."
      );
    },
    set: function() {
      throw Error(
        "Cannot assign to a temporary client reference from a server module."
      );
    }
  };
  function createTemporaryReference(temporaryReferences, id) {
    var reference = Object.defineProperties(
      function() {
        throw Error(
          "Attempted to call a temporary Client Reference from the server but it is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component."
        );
      },
      { $$typeof: { value: TEMPORARY_REFERENCE_TAG } }
    );
    reference = new Proxy(reference, proxyHandlers);
    temporaryReferences.set(reference, id);
    return reference;
  }
  function noop() {
  }
  var SuspenseException = Error(
    "Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`."
  );
  function trackUsedThenable(thenableState2, thenable, index) {
    index = thenableState2[index];
    void 0 === index ? thenableState2.push(thenable) : index !== thenable && (thenable.then(noop, noop), thenable = index);
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        "string" === typeof thenable.status ? thenable.then(noop, noop) : (thenableState2 = thenable, thenableState2.status = "pending", thenableState2.then(
          function(fulfilledValue) {
            if ("pending" === thenable.status) {
              var fulfilledThenable = thenable;
              fulfilledThenable.status = "fulfilled";
              fulfilledThenable.value = fulfilledValue;
            }
          },
          function(error) {
            if ("pending" === thenable.status) {
              var rejectedThenable = thenable;
              rejectedThenable.status = "rejected";
              rejectedThenable.reason = error;
            }
          }
        ));
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
        suspendedThenable = thenable;
        throw SuspenseException;
    }
  }
  var suspendedThenable = null;
  function getSuspendedThenable() {
    if (null === suspendedThenable)
      throw Error(
        "Expected a suspended thenable. This is a bug in React. Please file an issue."
      );
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }
  var currentRequest$1 = null, thenableIndexCounter = 0, thenableState = null;
  function getThenableStateAfterSuspending() {
    var state = thenableState || [];
    thenableState = null;
    return state;
  }
  var HooksDispatcher = {
    readContext: unsupportedContext,
    use,
    useCallback: function(callback) {
      return callback;
    },
    useContext: unsupportedContext,
    useEffect: unsupportedHook,
    useImperativeHandle: unsupportedHook,
    useLayoutEffect: unsupportedHook,
    useInsertionEffect: unsupportedHook,
    useMemo: function(nextCreate) {
      return nextCreate();
    },
    useReducer: unsupportedHook,
    useRef: unsupportedHook,
    useState: unsupportedHook,
    useDebugValue: function() {
    },
    useDeferredValue: unsupportedHook,
    useTransition: unsupportedHook,
    useSyncExternalStore: unsupportedHook,
    useId,
    useHostTransitionStatus: unsupportedHook,
    useFormState: unsupportedHook,
    useActionState: unsupportedHook,
    useOptimistic: unsupportedHook,
    useMemoCache: function(size) {
      for (var data = Array(size), i = 0; i < size; i++)
        data[i] = REACT_MEMO_CACHE_SENTINEL;
      return data;
    },
    useCacheRefresh: function() {
      return unsupportedRefresh;
    }
  };
  HooksDispatcher.useEffectEvent = unsupportedHook;
  function unsupportedHook() {
    throw Error("This Hook is not supported in Server Components.");
  }
  function unsupportedRefresh() {
    throw Error("Refreshing the cache is not supported in Server Components.");
  }
  function unsupportedContext() {
    throw Error("Cannot read a Client Context from a Server Component.");
  }
  function useId() {
    if (null === currentRequest$1)
      throw Error("useId can only be used while React is rendering");
    var id = currentRequest$1.identifierCount++;
    return "_" + currentRequest$1.identifierPrefix + "S_" + id.toString(32) + "_";
  }
  function use(usable) {
    if (null !== usable && "object" === typeof usable || "function" === typeof usable) {
      if ("function" === typeof usable.then) {
        var index = thenableIndexCounter;
        thenableIndexCounter += 1;
        null === thenableState && (thenableState = []);
        return trackUsedThenable(thenableState, usable, index);
      }
      usable.$$typeof === REACT_CONTEXT_TYPE && unsupportedContext();
    }
    if (usable.$$typeof === CLIENT_REFERENCE_TAG$1) {
      if (null != usable.value && usable.value.$$typeof === REACT_CONTEXT_TYPE)
        throw Error("Cannot read a Client Context from a Server Component.");
      throw Error("Cannot use() an already resolved Client Reference.");
    }
    throw Error("An unsupported type was passed to use(): " + String(usable));
  }
  var DefaultAsyncDispatcher = {
    getCacheForType: function(resourceType) {
      var JSCompiler_inline_result = (JSCompiler_inline_result = resolveRequest()) ? JSCompiler_inline_result.cache : /* @__PURE__ */ new Map();
      var entry = JSCompiler_inline_result.get(resourceType);
      void 0 === entry && (entry = resourceType(), JSCompiler_inline_result.set(resourceType, entry));
      return entry;
    },
    cacheSignal: function() {
      var request = resolveRequest();
      return request ? request.cacheController.signal : null;
    }
  }, ReactSharedInternalsServer = React2.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  if (!ReactSharedInternalsServer)
    throw Error(
      'The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.'
    );
  var isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf;
  function objectName(object2) {
    object2 = Object.prototype.toString.call(object2);
    return object2.slice(8, object2.length - 1);
  }
  function describeValueForErrorMessage(value) {
    switch (typeof value) {
      case "string":
        return JSON.stringify(
          10 >= value.length ? value : value.slice(0, 10) + "..."
        );
      case "object":
        if (isArrayImpl(value)) return "[...]";
        if (null !== value && value.$$typeof === CLIENT_REFERENCE_TAG)
          return "client";
        value = objectName(value);
        return "Object" === value ? "{...}" : value;
      case "function":
        return value.$$typeof === CLIENT_REFERENCE_TAG ? "client" : (value = value.displayName || value.name) ? "function " + value : "function";
      default:
        return String(value);
    }
  }
  function describeElementType(type) {
    if ("string" === typeof type) return type;
    switch (type) {
      case REACT_SUSPENSE_TYPE:
        return "Suspense";
      case REACT_SUSPENSE_LIST_TYPE:
        return "SuspenseList";
    }
    if ("object" === typeof type)
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          return describeElementType(type.render);
        case REACT_MEMO_TYPE:
          return describeElementType(type.type);
        case REACT_LAZY_TYPE:
          var payload = type._payload;
          type = type._init;
          try {
            return describeElementType(type(payload));
          } catch (x) {
          }
      }
    return "";
  }
  var CLIENT_REFERENCE_TAG = Symbol.for("react.client.reference");
  function describeObjectForErrorMessage(objectOrArray, expandedName) {
    var objKind = objectName(objectOrArray);
    if ("Object" !== objKind && "Array" !== objKind) return objKind;
    objKind = -1;
    var length = 0;
    if (isArrayImpl(objectOrArray)) {
      var str = "[";
      for (var i = 0; i < objectOrArray.length; i++) {
        0 < i && (str += ", ");
        var value = objectOrArray[i];
        value = "object" === typeof value && null !== value ? describeObjectForErrorMessage(value) : describeValueForErrorMessage(value);
        "" + i === expandedName ? (objKind = str.length, length = value.length, str += value) : str = 10 > value.length && 40 > str.length + value.length ? str + value : str + "...";
      }
      str += "]";
    } else if (objectOrArray.$$typeof === REACT_ELEMENT_TYPE)
      str = "<" + describeElementType(objectOrArray.type) + "/>";
    else {
      if (objectOrArray.$$typeof === CLIENT_REFERENCE_TAG) return "client";
      str = "{";
      i = Object.keys(objectOrArray);
      for (value = 0; value < i.length; value++) {
        0 < value && (str += ", ");
        var name = i[value], encodedKey = JSON.stringify(name);
        str += ('"' + name + '"' === encodedKey ? name : encodedKey) + ": ";
        encodedKey = objectOrArray[name];
        encodedKey = "object" === typeof encodedKey && null !== encodedKey ? describeObjectForErrorMessage(encodedKey) : describeValueForErrorMessage(encodedKey);
        name === expandedName ? (objKind = str.length, length = encodedKey.length, str += encodedKey) : str = 10 > encodedKey.length && 40 > str.length + encodedKey.length ? str + encodedKey : str + "...";
      }
      str += "}";
    }
    return void 0 === expandedName ? str : -1 < objKind && 0 < length ? (objectOrArray = " ".repeat(objKind) + "^".repeat(length), "\n  " + str + "\n  " + objectOrArray) : "\n  " + str;
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty, ObjectPrototype$1 = Object.prototype, stringify = JSON.stringify;
  function defaultErrorHandler(error) {
    console.error(error);
  }
  function RequestInstance(type, model, bundlerConfig, onError, onPostpone, onAllReady, onFatalError, identifierPrefix, temporaryReferences) {
    if (null !== ReactSharedInternalsServer.A && ReactSharedInternalsServer.A !== DefaultAsyncDispatcher)
      throw Error("Currently React only supports one RSC renderer at a time.");
    ReactSharedInternalsServer.A = DefaultAsyncDispatcher;
    var abortSet = /* @__PURE__ */ new Set(), pingedTasks = [], hints = /* @__PURE__ */ new Set();
    this.type = type;
    this.status = 10;
    this.flushScheduled = false;
    this.destination = this.fatalError = null;
    this.bundlerConfig = bundlerConfig;
    this.cache = /* @__PURE__ */ new Map();
    this.cacheController = new AbortController();
    this.pendingChunks = this.nextChunkId = 0;
    this.hints = hints;
    this.abortableTasks = abortSet;
    this.pingedTasks = pingedTasks;
    this.completedImportChunks = [];
    this.completedHintChunks = [];
    this.completedRegularChunks = [];
    this.completedErrorChunks = [];
    this.writtenSymbols = /* @__PURE__ */ new Map();
    this.writtenClientReferences = /* @__PURE__ */ new Map();
    this.writtenServerReferences = /* @__PURE__ */ new Map();
    this.writtenObjects = /* @__PURE__ */ new WeakMap();
    this.temporaryReferences = temporaryReferences;
    this.identifierPrefix = identifierPrefix || "";
    this.identifierCount = 1;
    this.taintCleanupQueue = [];
    this.onError = void 0 === onError ? defaultErrorHandler : onError;
    this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
    this.onAllReady = onAllReady;
    this.onFatalError = onFatalError;
    type = createTask(this, model, null, false, 0, abortSet);
    pingedTasks.push(type);
  }
  var currentRequest = null;
  function resolveRequest() {
    if (currentRequest) return currentRequest;
    if (supportsRequestStorage) {
      var store = requestStorage.getStore();
      if (store) return store;
    }
    return null;
  }
  function serializeThenable(request, task, thenable) {
    var newTask = createTask(
      request,
      thenable,
      task.keyPath,
      task.implicitSlot,
      task.formatContext,
      request.abortableTasks
    );
    switch (thenable.status) {
      case "fulfilled":
        return newTask.model = thenable.value, pingTask(request, newTask), newTask.id;
      case "rejected":
        return erroredTask(request, newTask, thenable.reason), newTask.id;
      default:
        if (12 === request.status)
          return request.abortableTasks.delete(newTask), 21 === request.type ? (haltTask(newTask), finishHaltedTask(newTask, request)) : (task = request.fatalError, abortTask(newTask), finishAbortedTask(newTask, request, task)), newTask.id;
        "string" !== typeof thenable.status && (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        ));
    }
    thenable.then(
      function(value) {
        newTask.model = value;
        pingTask(request, newTask);
      },
      function(reason) {
        0 === newTask.status && (erroredTask(request, newTask, reason), enqueueFlush(request));
      }
    );
    return newTask.id;
  }
  function serializeReadableStream(request, task, stream) {
    function progress(entry) {
      if (0 === streamTask.status)
        if (entry.done)
          streamTask.status = 1, entry = streamTask.id.toString(16) + ":C\n", request.completedRegularChunks.push(stringToChunk(entry)), request.abortableTasks.delete(streamTask), request.cacheController.signal.removeEventListener(
            "abort",
            abortStream
          ), enqueueFlush(request), callOnAllReadyIfReady(request);
        else
          try {
            streamTask.model = entry.value, request.pendingChunks++, tryStreamTask(request, streamTask), enqueueFlush(request), reader.read().then(progress, error);
          } catch (x$11) {
            error(x$11);
          }
    }
    function error(reason) {
      0 === streamTask.status && (request.cacheController.signal.removeEventListener("abort", abortStream), erroredTask(request, streamTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
    }
    function abortStream() {
      if (0 === streamTask.status) {
        var signal = request.cacheController.signal;
        signal.removeEventListener("abort", abortStream);
        signal = signal.reason;
        21 === request.type ? (request.abortableTasks.delete(streamTask), haltTask(streamTask), finishHaltedTask(streamTask, request)) : (erroredTask(request, streamTask, signal), enqueueFlush(request));
        reader.cancel(signal).then(error, error);
      }
    }
    var supportsBYOB = stream.supportsBYOB;
    if (void 0 === supportsBYOB)
      try {
        stream.getReader({ mode: "byob" }).releaseLock(), supportsBYOB = true;
      } catch (x) {
        supportsBYOB = false;
      }
    var reader = stream.getReader(), streamTask = createTask(
      request,
      task.model,
      task.keyPath,
      task.implicitSlot,
      task.formatContext,
      request.abortableTasks
    );
    request.pendingChunks++;
    task = streamTask.id.toString(16) + ":" + (supportsBYOB ? "r" : "R") + "\n";
    request.completedRegularChunks.push(stringToChunk(task));
    request.cacheController.signal.addEventListener("abort", abortStream);
    reader.read().then(progress, error);
    return serializeByValueID(streamTask.id);
  }
  function serializeAsyncIterable(request, task, iterable, iterator) {
    function progress(entry) {
      if (0 === streamTask.status)
        if (entry.done) {
          streamTask.status = 1;
          if (void 0 === entry.value)
            var endStreamRow = streamTask.id.toString(16) + ":C\n";
          else
            try {
              var chunkId = outlineModelWithFormatContext(
                request,
                entry.value,
                0
              );
              endStreamRow = streamTask.id.toString(16) + ":C" + stringify(serializeByValueID(chunkId)) + "\n";
            } catch (x) {
              error(x);
              return;
            }
          request.completedRegularChunks.push(stringToChunk(endStreamRow));
          request.abortableTasks.delete(streamTask);
          request.cacheController.signal.removeEventListener(
            "abort",
            abortIterable
          );
          enqueueFlush(request);
          callOnAllReadyIfReady(request);
        } else
          try {
            streamTask.model = entry.value, request.pendingChunks++, tryStreamTask(request, streamTask), enqueueFlush(request), iterator.next().then(progress, error);
          } catch (x$12) {
            error(x$12);
          }
    }
    function error(reason) {
      0 === streamTask.status && (request.cacheController.signal.removeEventListener(
        "abort",
        abortIterable
      ), erroredTask(request, streamTask, reason), enqueueFlush(request), "function" === typeof iterator.throw && iterator.throw(reason).then(error, error));
    }
    function abortIterable() {
      if (0 === streamTask.status) {
        var signal = request.cacheController.signal;
        signal.removeEventListener("abort", abortIterable);
        var reason = signal.reason;
        21 === request.type ? (request.abortableTasks.delete(streamTask), haltTask(streamTask), finishHaltedTask(streamTask, request)) : (erroredTask(request, streamTask, signal.reason), enqueueFlush(request));
        "function" === typeof iterator.throw && iterator.throw(reason).then(error, error);
      }
    }
    iterable = iterable === iterator;
    var streamTask = createTask(
      request,
      task.model,
      task.keyPath,
      task.implicitSlot,
      task.formatContext,
      request.abortableTasks
    );
    request.pendingChunks++;
    task = streamTask.id.toString(16) + ":" + (iterable ? "x" : "X") + "\n";
    request.completedRegularChunks.push(stringToChunk(task));
    request.cacheController.signal.addEventListener("abort", abortIterable);
    iterator.next().then(progress, error);
    return serializeByValueID(streamTask.id);
  }
  function emitHint(request, code2, model) {
    model = stringify(model);
    code2 = stringToChunk(":H" + code2 + model + "\n");
    request.completedHintChunks.push(code2);
    enqueueFlush(request);
  }
  function readThenable(thenable) {
    if ("fulfilled" === thenable.status) return thenable.value;
    if ("rejected" === thenable.status) throw thenable.reason;
    throw thenable;
  }
  function createLazyWrapperAroundWakeable(request, task, wakeable) {
    switch (wakeable.status) {
      case "fulfilled":
        return wakeable.value;
      case "rejected":
        break;
      default:
        "string" !== typeof wakeable.status && (wakeable.status = "pending", wakeable.then(
          function(fulfilledValue) {
            "pending" === wakeable.status && (wakeable.status = "fulfilled", wakeable.value = fulfilledValue);
          },
          function(error) {
            "pending" === wakeable.status && (wakeable.status = "rejected", wakeable.reason = error);
          }
        ));
    }
    return { $$typeof: REACT_LAZY_TYPE, _payload: wakeable, _init: readThenable };
  }
  function voidHandler() {
  }
  function processServerComponentReturnValue(request, task, Component, result) {
    if ("object" !== typeof result || null === result || result.$$typeof === CLIENT_REFERENCE_TAG$1)
      return result;
    if ("function" === typeof result.then)
      return createLazyWrapperAroundWakeable(request, task, result);
    var iteratorFn = getIteratorFn(result);
    return iteratorFn ? (request = {}, request[Symbol.iterator] = function() {
      return iteratorFn.call(result);
    }, request) : "function" !== typeof result[ASYNC_ITERATOR] || "function" === typeof ReadableStream && result instanceof ReadableStream ? result : (request = {}, request[ASYNC_ITERATOR] = function() {
      return result[ASYNC_ITERATOR]();
    }, request);
  }
  function renderFunctionComponent(request, task, key, Component, props) {
    var prevThenableState = task.thenableState;
    task.thenableState = null;
    thenableIndexCounter = 0;
    thenableState = prevThenableState;
    props = Component(props, void 0);
    if (12 === request.status)
      throw "object" === typeof props && null !== props && "function" === typeof props.then && props.$$typeof !== CLIENT_REFERENCE_TAG$1 && props.then(voidHandler, voidHandler), null;
    props = processServerComponentReturnValue(request, task, Component, props);
    Component = task.keyPath;
    prevThenableState = task.implicitSlot;
    null !== key ? task.keyPath = null === Component ? key : Component + "," + key : null === Component && (task.implicitSlot = true);
    request = renderModelDestructive(request, task, emptyRoot, "", props);
    task.keyPath = Component;
    task.implicitSlot = prevThenableState;
    return request;
  }
  function renderFragment(request, task, children) {
    return null !== task.keyPath ? (request = [
      REACT_ELEMENT_TYPE,
      REACT_FRAGMENT_TYPE,
      task.keyPath,
      { children }
    ], task.implicitSlot ? [request] : request) : children;
  }
  var serializedSize = 0;
  function deferTask(request, task) {
    task = createTask(
      request,
      task.model,
      task.keyPath,
      task.implicitSlot,
      task.formatContext,
      request.abortableTasks
    );
    pingTask(request, task);
    return serializeLazyID(task.id);
  }
  function renderElement(request, task, type, key, ref, props) {
    if (null !== ref && void 0 !== ref)
      throw Error(
        "Refs cannot be used in Server Components, nor passed to Client Components."
      );
    if ("function" === typeof type && type.$$typeof !== CLIENT_REFERENCE_TAG$1 && type.$$typeof !== TEMPORARY_REFERENCE_TAG)
      return renderFunctionComponent(request, task, key, type, props);
    if (type === REACT_FRAGMENT_TYPE && null === key)
      return type = task.implicitSlot, null === task.keyPath && (task.implicitSlot = true), props = renderModelDestructive(
        request,
        task,
        emptyRoot,
        "",
        props.children
      ), task.implicitSlot = type, props;
    if (null != type && "object" === typeof type && type.$$typeof !== CLIENT_REFERENCE_TAG$1)
      switch (type.$$typeof) {
        case REACT_LAZY_TYPE:
          var init2 = type._init;
          type = init2(type._payload);
          if (12 === request.status) throw null;
          return renderElement(request, task, type, key, ref, props);
        case REACT_FORWARD_REF_TYPE:
          return renderFunctionComponent(request, task, key, type.render, props);
        case REACT_MEMO_TYPE:
          return renderElement(request, task, type.type, key, ref, props);
      }
    else
      "string" === typeof type && (ref = task.formatContext, init2 = getChildFormatContext(ref, type, props), ref !== init2 && null != props.children && outlineModelWithFormatContext(request, props.children, init2));
    request = key;
    key = task.keyPath;
    null === request ? request = key : null !== key && (request = key + "," + request);
    props = [REACT_ELEMENT_TYPE, type, request, props];
    task = task.implicitSlot && null !== request ? [props] : props;
    return task;
  }
  function pingTask(request, task) {
    var pingedTasks = request.pingedTasks;
    pingedTasks.push(task);
    1 === pingedTasks.length && (request.flushScheduled = null !== request.destination, 21 === request.type || 10 === request.status ? scheduleMicrotask(function() {
      return performWork(request);
    }) : setTimeout(function() {
      return performWork(request);
    }, 0));
  }
  function createTask(request, model, keyPath, implicitSlot, formatContext, abortSet) {
    request.pendingChunks++;
    var id = request.nextChunkId++;
    "object" !== typeof model || null === model || null !== keyPath || implicitSlot || request.writtenObjects.set(model, serializeByValueID(id));
    var task = {
      id,
      status: 0,
      model,
      keyPath,
      implicitSlot,
      formatContext,
      ping: function() {
        return pingTask(request, task);
      },
      toJSON: function(parentPropertyName, value) {
        serializedSize += parentPropertyName.length;
        var prevKeyPath = task.keyPath, prevImplicitSlot = task.implicitSlot;
        try {
          var JSCompiler_inline_result = renderModelDestructive(
            request,
            task,
            this,
            parentPropertyName,
            value
          );
        } catch (thrownValue) {
          if (parentPropertyName = task.model, parentPropertyName = "object" === typeof parentPropertyName && null !== parentPropertyName && (parentPropertyName.$$typeof === REACT_ELEMENT_TYPE || parentPropertyName.$$typeof === REACT_LAZY_TYPE), 12 === request.status)
            task.status = 3, 21 === request.type ? (prevKeyPath = request.nextChunkId++, prevKeyPath = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath), JSCompiler_inline_result = prevKeyPath) : (prevKeyPath = request.fatalError, JSCompiler_inline_result = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath));
          else if (value = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue, "object" === typeof value && null !== value && "function" === typeof value.then) {
            JSCompiler_inline_result = createTask(
              request,
              task.model,
              task.keyPath,
              task.implicitSlot,
              task.formatContext,
              request.abortableTasks
            );
            var ping = JSCompiler_inline_result.ping;
            value.then(ping, ping);
            JSCompiler_inline_result.thenableState = getThenableStateAfterSuspending();
            task.keyPath = prevKeyPath;
            task.implicitSlot = prevImplicitSlot;
            JSCompiler_inline_result = parentPropertyName ? serializeLazyID(JSCompiler_inline_result.id) : serializeByValueID(JSCompiler_inline_result.id);
          } else
            task.keyPath = prevKeyPath, task.implicitSlot = prevImplicitSlot, request.pendingChunks++, prevKeyPath = request.nextChunkId++, prevImplicitSlot = logRecoverableError(request, value), emitErrorChunk(request, prevKeyPath, prevImplicitSlot), JSCompiler_inline_result = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath);
        }
        return JSCompiler_inline_result;
      },
      thenableState: null
    };
    abortSet.add(task);
    return task;
  }
  function serializeByValueID(id) {
    return "$" + id.toString(16);
  }
  function serializeLazyID(id) {
    return "$L" + id.toString(16);
  }
  function encodeReferenceChunk(request, id, reference) {
    request = stringify(reference);
    id = id.toString(16) + ":" + request + "\n";
    return stringToChunk(id);
  }
  function serializeClientReference(request, parent, parentPropertyName, clientReference) {
    var clientReferenceKey = clientReference.$$async ? clientReference.$$id + "#async" : clientReference.$$id, writtenClientReferences = request.writtenClientReferences, existingId = writtenClientReferences.get(clientReferenceKey);
    if (void 0 !== existingId)
      return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? serializeLazyID(existingId) : serializeByValueID(existingId);
    try {
      var config2 = request.bundlerConfig, modulePath = clientReference.$$id;
      existingId = "";
      var resolvedModuleData = config2[modulePath];
      if (resolvedModuleData) existingId = resolvedModuleData.name;
      else {
        var idx = modulePath.lastIndexOf("#");
        -1 !== idx && (existingId = modulePath.slice(idx + 1), resolvedModuleData = config2[modulePath.slice(0, idx)]);
        if (!resolvedModuleData)
          throw Error(
            'Could not find the module "' + modulePath + '" in the React Client Manifest. This is probably a bug in the React Server Components bundler.'
          );
      }
      if (true === resolvedModuleData.async && true === clientReference.$$async)
        throw Error(
          'The module "' + modulePath + '" is marked as an async ESM module but was loaded as a CJS proxy. This is probably a bug in the React Server Components bundler.'
        );
      var JSCompiler_inline_result = true === resolvedModuleData.async || true === clientReference.$$async ? [resolvedModuleData.id, resolvedModuleData.chunks, existingId, 1] : [resolvedModuleData.id, resolvedModuleData.chunks, existingId];
      request.pendingChunks++;
      var importId = request.nextChunkId++, json = stringify(JSCompiler_inline_result), row = importId.toString(16) + ":I" + json + "\n", processedChunk = stringToChunk(row);
      request.completedImportChunks.push(processedChunk);
      writtenClientReferences.set(clientReferenceKey, importId);
      return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? serializeLazyID(importId) : serializeByValueID(importId);
    } catch (x) {
      return request.pendingChunks++, parent = request.nextChunkId++, parentPropertyName = logRecoverableError(request, x), emitErrorChunk(request, parent, parentPropertyName), serializeByValueID(parent);
    }
  }
  function outlineModelWithFormatContext(request, value, formatContext) {
    value = createTask(
      request,
      value,
      null,
      false,
      formatContext,
      request.abortableTasks
    );
    retryTask(request, value);
    return value.id;
  }
  function serializeTypedArray(request, tag, typedArray) {
    request.pendingChunks++;
    var bufferId = request.nextChunkId++;
    emitTypedArrayChunk(request, bufferId, tag, typedArray, false);
    return serializeByValueID(bufferId);
  }
  function serializeBlob(request, blob) {
    function progress(entry) {
      if (0 === newTask.status)
        if (entry.done)
          request.cacheController.signal.removeEventListener("abort", abortBlob), pingTask(request, newTask);
        else
          return model.push(entry.value), reader.read().then(progress).catch(error);
    }
    function error(reason) {
      0 === newTask.status && (request.cacheController.signal.removeEventListener("abort", abortBlob), erroredTask(request, newTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
    }
    function abortBlob() {
      if (0 === newTask.status) {
        var signal = request.cacheController.signal;
        signal.removeEventListener("abort", abortBlob);
        signal = signal.reason;
        21 === request.type ? (request.abortableTasks.delete(newTask), haltTask(newTask), finishHaltedTask(newTask, request)) : (erroredTask(request, newTask, signal), enqueueFlush(request));
        reader.cancel(signal).then(error, error);
      }
    }
    var model = [blob.type], newTask = createTask(request, model, null, false, 0, request.abortableTasks), reader = blob.stream().getReader();
    request.cacheController.signal.addEventListener("abort", abortBlob);
    reader.read().then(progress).catch(error);
    return "$B" + newTask.id.toString(16);
  }
  var modelRoot = false;
  function renderModelDestructive(request, task, parent, parentPropertyName, value) {
    task.model = value;
    if (value === REACT_ELEMENT_TYPE) return "$";
    if (null === value) return null;
    if ("object" === typeof value) {
      switch (value.$$typeof) {
        case REACT_ELEMENT_TYPE:
          var elementReference = null, writtenObjects = request.writtenObjects;
          if (null === task.keyPath && !task.implicitSlot) {
            var existingReference = writtenObjects.get(value);
            if (void 0 !== existingReference)
              if (modelRoot === value) modelRoot = null;
              else return existingReference;
            else
              -1 === parentPropertyName.indexOf(":") && (parent = writtenObjects.get(parent), void 0 !== parent && (elementReference = parent + ":" + parentPropertyName, writtenObjects.set(value, elementReference)));
          }
          if (3200 < serializedSize) return deferTask(request, task);
          parentPropertyName = value.props;
          parent = parentPropertyName.ref;
          request = renderElement(
            request,
            task,
            value.type,
            value.key,
            void 0 !== parent ? parent : null,
            parentPropertyName
          );
          "object" === typeof request && null !== request && null !== elementReference && (writtenObjects.has(request) || writtenObjects.set(request, elementReference));
          return request;
        case REACT_LAZY_TYPE:
          if (3200 < serializedSize) return deferTask(request, task);
          task.thenableState = null;
          parentPropertyName = value._init;
          value = parentPropertyName(value._payload);
          if (12 === request.status) throw null;
          return renderModelDestructive(request, task, emptyRoot, "", value);
        case REACT_LEGACY_ELEMENT_TYPE:
          throw Error(
            'A React Element from an older version of React was rendered. This is not supported. It can happen if:\n- Multiple copies of the "react" package is used.\n- A library pre-bundled an old copy of "react" or "react/jsx-runtime".\n- A compiler tries to "inline" JSX instead of using the runtime.'
          );
      }
      if (value.$$typeof === CLIENT_REFERENCE_TAG$1)
        return serializeClientReference(
          request,
          parent,
          parentPropertyName,
          value
        );
      if (void 0 !== request.temporaryReferences && (elementReference = request.temporaryReferences.get(value), void 0 !== elementReference))
        return "$T" + elementReference;
      elementReference = request.writtenObjects;
      writtenObjects = elementReference.get(value);
      if ("function" === typeof value.then) {
        if (void 0 !== writtenObjects) {
          if (null !== task.keyPath || task.implicitSlot)
            return "$@" + serializeThenable(request, task, value).toString(16);
          if (modelRoot === value) modelRoot = null;
          else return writtenObjects;
        }
        request = "$@" + serializeThenable(request, task, value).toString(16);
        elementReference.set(value, request);
        return request;
      }
      if (void 0 !== writtenObjects)
        if (modelRoot === value) {
          if (writtenObjects !== serializeByValueID(task.id))
            return writtenObjects;
          modelRoot = null;
        } else return writtenObjects;
      else if (-1 === parentPropertyName.indexOf(":") && (writtenObjects = elementReference.get(parent), void 0 !== writtenObjects)) {
        existingReference = parentPropertyName;
        if (isArrayImpl(parent) && parent[0] === REACT_ELEMENT_TYPE)
          switch (parentPropertyName) {
            case "1":
              existingReference = "type";
              break;
            case "2":
              existingReference = "key";
              break;
            case "3":
              existingReference = "props";
              break;
            case "4":
              existingReference = "_owner";
          }
        elementReference.set(value, writtenObjects + ":" + existingReference);
      }
      if (isArrayImpl(value)) return renderFragment(request, task, value);
      if (value instanceof Map)
        return value = Array.from(value), "$Q" + outlineModelWithFormatContext(request, value, 0).toString(16);
      if (value instanceof Set)
        return value = Array.from(value), "$W" + outlineModelWithFormatContext(request, value, 0).toString(16);
      if ("function" === typeof FormData && value instanceof FormData)
        return value = Array.from(value.entries()), "$K" + outlineModelWithFormatContext(request, value, 0).toString(16);
      if (value instanceof Error) return "$Z";
      if (value instanceof ArrayBuffer)
        return serializeTypedArray(request, "A", new Uint8Array(value));
      if (value instanceof Int8Array)
        return serializeTypedArray(request, "O", value);
      if (value instanceof Uint8Array)
        return serializeTypedArray(request, "o", value);
      if (value instanceof Uint8ClampedArray)
        return serializeTypedArray(request, "U", value);
      if (value instanceof Int16Array)
        return serializeTypedArray(request, "S", value);
      if (value instanceof Uint16Array)
        return serializeTypedArray(request, "s", value);
      if (value instanceof Int32Array)
        return serializeTypedArray(request, "L", value);
      if (value instanceof Uint32Array)
        return serializeTypedArray(request, "l", value);
      if (value instanceof Float32Array)
        return serializeTypedArray(request, "G", value);
      if (value instanceof Float64Array)
        return serializeTypedArray(request, "g", value);
      if (value instanceof BigInt64Array)
        return serializeTypedArray(request, "M", value);
      if (value instanceof BigUint64Array)
        return serializeTypedArray(request, "m", value);
      if (value instanceof DataView)
        return serializeTypedArray(request, "V", value);
      if ("function" === typeof Blob && value instanceof Blob)
        return serializeBlob(request, value);
      if (elementReference = getIteratorFn(value))
        return parentPropertyName = elementReference.call(value), parentPropertyName === value ? (value = Array.from(parentPropertyName), "$i" + outlineModelWithFormatContext(request, value, 0).toString(16)) : renderFragment(request, task, Array.from(parentPropertyName));
      if ("function" === typeof ReadableStream && value instanceof ReadableStream)
        return serializeReadableStream(request, task, value);
      elementReference = value[ASYNC_ITERATOR];
      if ("function" === typeof elementReference)
        return null !== task.keyPath ? (request = [
          REACT_ELEMENT_TYPE,
          REACT_FRAGMENT_TYPE,
          task.keyPath,
          { children: value }
        ], request = task.implicitSlot ? [request] : request) : (parentPropertyName = elementReference.call(value), request = serializeAsyncIterable(
          request,
          task,
          value,
          parentPropertyName
        )), request;
      if (value instanceof Date) return "$D" + value.toJSON();
      request = getPrototypeOf(value);
      if (request !== ObjectPrototype$1 && (null === request || null !== getPrototypeOf(request)))
        throw Error(
          "Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported." + describeObjectForErrorMessage(parent, parentPropertyName)
        );
      return value;
    }
    if ("string" === typeof value) {
      serializedSize += value.length;
      if ("Z" === value[value.length - 1] && parent[parentPropertyName] instanceof Date)
        return "$D" + value;
      if (1024 <= value.length && null !== byteLengthOfChunk)
        return request.pendingChunks++, task = request.nextChunkId++, emitTextChunk(request, task, value, false), serializeByValueID(task);
      request = "$" === value[0] ? "$" + value : value;
      return request;
    }
    if ("boolean" === typeof value) return value;
    if ("number" === typeof value)
      return Number.isFinite(value) ? 0 === value && -Infinity === 1 / value ? "$-0" : value : Infinity === value ? "$Infinity" : -Infinity === value ? "$-Infinity" : "$NaN";
    if ("undefined" === typeof value) return "$undefined";
    if ("function" === typeof value) {
      if (value.$$typeof === CLIENT_REFERENCE_TAG$1)
        return serializeClientReference(
          request,
          parent,
          parentPropertyName,
          value
        );
      if (value.$$typeof === SERVER_REFERENCE_TAG)
        return task = request.writtenServerReferences, parentPropertyName = task.get(value), void 0 !== parentPropertyName ? request = "$h" + parentPropertyName.toString(16) : (parentPropertyName = value.$$bound, parentPropertyName = null === parentPropertyName ? null : Promise.resolve(parentPropertyName), request = outlineModelWithFormatContext(
          request,
          { id: value.$$id, bound: parentPropertyName },
          0
        ), task.set(value, request), request = "$h" + request.toString(16)), request;
      if (void 0 !== request.temporaryReferences && (request = request.temporaryReferences.get(value), void 0 !== request))
        return "$T" + request;
      if (value.$$typeof === TEMPORARY_REFERENCE_TAG)
        throw Error(
          "Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server."
        );
      if (/^on[A-Z]/.test(parentPropertyName))
        throw Error(
          "Event handlers cannot be passed to Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName) + "\nIf you need interactivity, consider converting part of this to a Client Component."
        );
      throw Error(
        'Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.' + describeObjectForErrorMessage(parent, parentPropertyName)
      );
    }
    if ("symbol" === typeof value) {
      task = request.writtenSymbols;
      elementReference = task.get(value);
      if (void 0 !== elementReference)
        return serializeByValueID(elementReference);
      elementReference = value.description;
      if (Symbol.for(elementReference) !== value)
        throw Error(
          "Only global symbols received from Symbol.for(...) can be passed to Client Components. The symbol Symbol.for(" + (value.description + ") cannot be found among global symbols.") + describeObjectForErrorMessage(parent, parentPropertyName)
        );
      request.pendingChunks++;
      parentPropertyName = request.nextChunkId++;
      parent = encodeReferenceChunk(
        request,
        parentPropertyName,
        "$S" + elementReference
      );
      request.completedImportChunks.push(parent);
      task.set(value, parentPropertyName);
      return serializeByValueID(parentPropertyName);
    }
    if ("bigint" === typeof value) return "$n" + value.toString(10);
    throw Error(
      "Type " + typeof value + " is not supported in Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName)
    );
  }
  function logRecoverableError(request, error) {
    var prevRequest = currentRequest;
    currentRequest = null;
    try {
      var onError = request.onError;
      var errorDigest = supportsRequestStorage ? requestStorage.run(void 0, onError, error) : onError(error);
    } finally {
      currentRequest = prevRequest;
    }
    if (null != errorDigest && "string" !== typeof errorDigest)
      throw Error(
        'onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof errorDigest + '" instead'
      );
    return errorDigest || "";
  }
  function fatalError(request, error) {
    var onFatalError = request.onFatalError;
    onFatalError(error);
    null !== request.destination ? (request.status = 14, closeWithError(request.destination, error)) : (request.status = 13, request.fatalError = error);
    request.cacheController.abort(
      Error("The render was aborted due to a fatal error.", { cause: error })
    );
  }
  function emitErrorChunk(request, id, digest) {
    digest = { digest };
    id = id.toString(16) + ":E" + stringify(digest) + "\n";
    id = stringToChunk(id);
    request.completedErrorChunks.push(id);
  }
  function emitModelChunk(request, id, json) {
    id = id.toString(16) + ":" + json + "\n";
    id = stringToChunk(id);
    request.completedRegularChunks.push(id);
  }
  function emitTypedArrayChunk(request, id, tag, typedArray, debug) {
    debug ? request.pendingDebugChunks++ : request.pendingChunks++;
    debug = new Uint8Array(
      typedArray.buffer,
      typedArray.byteOffset,
      typedArray.byteLength
    );
    typedArray = 2048 < typedArray.byteLength ? debug.slice() : debug;
    debug = typedArray.byteLength;
    id = id.toString(16) + ":" + tag + debug.toString(16) + ",";
    id = stringToChunk(id);
    request.completedRegularChunks.push(id, typedArray);
  }
  function emitTextChunk(request, id, text, debug) {
    if (null === byteLengthOfChunk)
      throw Error(
        "Existence of byteLengthOfChunk should have already been checked. This is a bug in React."
      );
    debug ? request.pendingDebugChunks++ : request.pendingChunks++;
    text = stringToChunk(text);
    debug = text.byteLength;
    id = id.toString(16) + ":T" + debug.toString(16) + ",";
    id = stringToChunk(id);
    request.completedRegularChunks.push(id, text);
  }
  function emitChunk(request, task, value) {
    var id = task.id;
    "string" === typeof value && null !== byteLengthOfChunk ? emitTextChunk(request, id, value, false) : value instanceof ArrayBuffer ? emitTypedArrayChunk(request, id, "A", new Uint8Array(value), false) : value instanceof Int8Array ? emitTypedArrayChunk(request, id, "O", value, false) : value instanceof Uint8Array ? emitTypedArrayChunk(request, id, "o", value, false) : value instanceof Uint8ClampedArray ? emitTypedArrayChunk(request, id, "U", value, false) : value instanceof Int16Array ? emitTypedArrayChunk(request, id, "S", value, false) : value instanceof Uint16Array ? emitTypedArrayChunk(request, id, "s", value, false) : value instanceof Int32Array ? emitTypedArrayChunk(request, id, "L", value, false) : value instanceof Uint32Array ? emitTypedArrayChunk(request, id, "l", value, false) : value instanceof Float32Array ? emitTypedArrayChunk(request, id, "G", value, false) : value instanceof Float64Array ? emitTypedArrayChunk(request, id, "g", value, false) : value instanceof BigInt64Array ? emitTypedArrayChunk(request, id, "M", value, false) : value instanceof BigUint64Array ? emitTypedArrayChunk(request, id, "m", value, false) : value instanceof DataView ? emitTypedArrayChunk(request, id, "V", value, false) : (value = stringify(value, task.toJSON), emitModelChunk(request, task.id, value));
  }
  function erroredTask(request, task, error) {
    task.status = 4;
    error = logRecoverableError(request, error);
    emitErrorChunk(request, task.id, error);
    request.abortableTasks.delete(task);
    callOnAllReadyIfReady(request);
  }
  var emptyRoot = {};
  function retryTask(request, task) {
    if (0 === task.status) {
      task.status = 5;
      var parentSerializedSize = serializedSize;
      try {
        modelRoot = task.model;
        var resolvedModel = renderModelDestructive(
          request,
          task,
          emptyRoot,
          "",
          task.model
        );
        modelRoot = resolvedModel;
        task.keyPath = null;
        task.implicitSlot = false;
        if ("object" === typeof resolvedModel && null !== resolvedModel)
          request.writtenObjects.set(resolvedModel, serializeByValueID(task.id)), emitChunk(request, task, resolvedModel);
        else {
          var json = stringify(resolvedModel);
          emitModelChunk(request, task.id, json);
        }
        task.status = 1;
        request.abortableTasks.delete(task);
        callOnAllReadyIfReady(request);
      } catch (thrownValue) {
        if (12 === request.status)
          if (request.abortableTasks.delete(task), task.status = 0, 21 === request.type)
            haltTask(task), finishHaltedTask(task, request);
          else {
            var errorId = request.fatalError;
            abortTask(task);
            finishAbortedTask(task, request, errorId);
          }
        else {
          var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
          if ("object" === typeof x && null !== x && "function" === typeof x.then) {
            task.status = 0;
            task.thenableState = getThenableStateAfterSuspending();
            var ping = task.ping;
            x.then(ping, ping);
          } else erroredTask(request, task, x);
        }
      } finally {
        serializedSize = parentSerializedSize;
      }
    }
  }
  function tryStreamTask(request, task) {
    var parentSerializedSize = serializedSize;
    try {
      emitChunk(request, task, task.model);
    } finally {
      serializedSize = parentSerializedSize;
    }
  }
  function performWork(request) {
    var prevDispatcher = ReactSharedInternalsServer.H;
    ReactSharedInternalsServer.H = HooksDispatcher;
    var prevRequest = currentRequest;
    currentRequest$1 = currentRequest = request;
    try {
      var pingedTasks = request.pingedTasks;
      request.pingedTasks = [];
      for (var i = 0; i < pingedTasks.length; i++)
        retryTask(request, pingedTasks[i]);
      flushCompletedChunks(request);
    } catch (error) {
      logRecoverableError(request, error), fatalError(request, error);
    } finally {
      ReactSharedInternalsServer.H = prevDispatcher, currentRequest$1 = null, currentRequest = prevRequest;
    }
  }
  function abortTask(task) {
    0 === task.status && (task.status = 3);
  }
  function finishAbortedTask(task, request, errorId) {
    3 === task.status && (errorId = serializeByValueID(errorId), task = encodeReferenceChunk(request, task.id, errorId), request.completedErrorChunks.push(task));
  }
  function haltTask(task) {
    0 === task.status && (task.status = 3);
  }
  function finishHaltedTask(task, request) {
    3 === task.status && request.pendingChunks--;
  }
  function flushCompletedChunks(request) {
    var destination = request.destination;
    if (null !== destination) {
      currentView = new Uint8Array(2048);
      writtenBytes = 0;
      try {
        for (var importsChunks = request.completedImportChunks, i = 0; i < importsChunks.length; i++)
          request.pendingChunks--, writeChunkAndReturn(destination, importsChunks[i]);
        importsChunks.splice(0, i);
        var hintChunks = request.completedHintChunks;
        for (i = 0; i < hintChunks.length; i++)
          writeChunkAndReturn(destination, hintChunks[i]);
        hintChunks.splice(0, i);
        var regularChunks = request.completedRegularChunks;
        for (i = 0; i < regularChunks.length; i++)
          request.pendingChunks--, writeChunkAndReturn(destination, regularChunks[i]);
        regularChunks.splice(0, i);
        var errorChunks = request.completedErrorChunks;
        for (i = 0; i < errorChunks.length; i++)
          request.pendingChunks--, writeChunkAndReturn(destination, errorChunks[i]);
        errorChunks.splice(0, i);
      } finally {
        request.flushScheduled = false, currentView && 0 < writtenBytes && (destination.enqueue(
          new Uint8Array(currentView.buffer, 0, writtenBytes)
        ), currentView = null, writtenBytes = 0);
      }
    }
    0 === request.pendingChunks && (12 > request.status && request.cacheController.abort(
      Error(
        "This render completed successfully. All cacheSignals are now aborted to allow clean up of any unused resources."
      )
    ), null !== request.destination && (request.status = 14, request.destination.close(), request.destination = null));
  }
  function startWork(request) {
    request.flushScheduled = null !== request.destination;
    supportsRequestStorage ? scheduleMicrotask(function() {
      requestStorage.run(request, performWork, request);
    }) : scheduleMicrotask(function() {
      return performWork(request);
    });
    setTimeout(function() {
      10 === request.status && (request.status = 11);
    }, 0);
  }
  function enqueueFlush(request) {
    false === request.flushScheduled && 0 === request.pingedTasks.length && null !== request.destination && (request.flushScheduled = true, setTimeout(function() {
      request.flushScheduled = false;
      flushCompletedChunks(request);
    }, 0));
  }
  function callOnAllReadyIfReady(request) {
    0 === request.abortableTasks.size && (request = request.onAllReady, request());
  }
  function startFlowing(request, destination) {
    if (13 === request.status)
      request.status = 14, closeWithError(destination, request.fatalError);
    else if (14 !== request.status && null === request.destination) {
      request.destination = destination;
      try {
        flushCompletedChunks(request);
      } catch (error) {
        logRecoverableError(request, error), fatalError(request, error);
      }
    }
  }
  function finishHalt(request, abortedTasks) {
    try {
      abortedTasks.forEach(function(task) {
        return finishHaltedTask(task, request);
      });
      var onAllReady = request.onAllReady;
      onAllReady();
      flushCompletedChunks(request);
    } catch (error) {
      logRecoverableError(request, error), fatalError(request, error);
    }
  }
  function finishAbort(request, abortedTasks, errorId) {
    try {
      abortedTasks.forEach(function(task) {
        return finishAbortedTask(task, request, errorId);
      });
      var onAllReady = request.onAllReady;
      onAllReady();
      flushCompletedChunks(request);
    } catch (error) {
      logRecoverableError(request, error), fatalError(request, error);
    }
  }
  function abort(request, reason) {
    if (!(11 < request.status))
      try {
        request.status = 12;
        request.cacheController.abort(reason);
        var abortableTasks = request.abortableTasks;
        if (0 < abortableTasks.size)
          if (21 === request.type)
            abortableTasks.forEach(function(task) {
              return haltTask(task, request);
            }), setTimeout(function() {
              return finishHalt(request, abortableTasks);
            }, 0);
          else {
            var error = void 0 === reason ? Error(
              "The render was aborted by the server without a reason."
            ) : "object" === typeof reason && null !== reason && "function" === typeof reason.then ? Error(
              "The render was aborted by the server with a promise."
            ) : reason, digest = logRecoverableError(request, error, null), errorId = request.nextChunkId++;
            request.fatalError = errorId;
            request.pendingChunks++;
            emitErrorChunk(request, errorId, digest, error, false, null);
            abortableTasks.forEach(function(task) {
              return abortTask(task, request, errorId);
            });
            setTimeout(function() {
              return finishAbort(request, abortableTasks, errorId);
            }, 0);
          }
        else {
          var onAllReady = request.onAllReady;
          onAllReady();
          flushCompletedChunks(request);
        }
      } catch (error$26) {
        logRecoverableError(request, error$26), fatalError(request, error$26);
      }
  }
  function resolveServerReference(bundlerConfig, id) {
    var name = "", resolvedModuleData = bundlerConfig[id];
    if (resolvedModuleData) name = resolvedModuleData.name;
    else {
      var idx = id.lastIndexOf("#");
      -1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
      if (!resolvedModuleData)
        throw Error(
          'Could not find the module "' + id + '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.'
        );
    }
    return resolvedModuleData.async ? [resolvedModuleData.id, resolvedModuleData.chunks, name, 1] : [resolvedModuleData.id, resolvedModuleData.chunks, name];
  }
  var chunkCache = /* @__PURE__ */ new Map();
  function requireAsyncModule(id) {
    var promise = __vite_rsc_require__(id);
    if ("function" !== typeof promise.then || "fulfilled" === promise.status)
      return null;
    promise.then(
      function(value) {
        promise.status = "fulfilled";
        promise.value = value;
      },
      function(reason) {
        promise.status = "rejected";
        promise.reason = reason;
      }
    );
    return promise;
  }
  function ignoreReject() {
  }
  function preloadModule(metadata2) {
    for (var chunks = metadata2[1], promises = [], i = 0; i < chunks.length; ) {
      var chunkId = chunks[i++];
      chunks[i++];
      var entry = chunkCache.get(chunkId);
      if (void 0 === entry) {
        entry = __webpack_chunk_load__(chunkId);
        promises.push(entry);
        var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
        entry.then(resolve, ignoreReject);
        chunkCache.set(chunkId, entry);
      } else null !== entry && promises.push(entry);
    }
    return 4 === metadata2.length ? 0 === promises.length ? requireAsyncModule(metadata2[0]) : Promise.all(promises).then(function() {
      return requireAsyncModule(metadata2[0]);
    }) : 0 < promises.length ? Promise.all(promises) : null;
  }
  function requireModule2(metadata2) {
    var moduleExports = __vite_rsc_require__(metadata2[0]);
    if (4 === metadata2.length && "function" === typeof moduleExports.then)
      if ("fulfilled" === moduleExports.status)
        moduleExports = moduleExports.value;
      else throw moduleExports.reason;
    if ("*" === metadata2[2]) return moduleExports;
    if ("" === metadata2[2])
      return moduleExports.__esModule ? moduleExports.default : moduleExports;
    if (hasOwnProperty.call(moduleExports, metadata2[2]))
      return moduleExports[metadata2[2]];
  }
  var RESPONSE_SYMBOL = Symbol();
  function ReactPromise(status, value, reason) {
    this.status = status;
    this.value = value;
    this.reason = reason;
  }
  ReactPromise.prototype = Object.create(Promise.prototype);
  ReactPromise.prototype.then = function(resolve, reject) {
    switch (this.status) {
      case "resolved_model":
        initializeModelChunk(this);
    }
    switch (this.status) {
      case "fulfilled":
        if ("function" === typeof resolve) {
          for (var inspectedValue = this.value, cycleProtection = 0, visited = /* @__PURE__ */ new Set(); inspectedValue instanceof ReactPromise; ) {
            cycleProtection++;
            if (inspectedValue === this || visited.has(inspectedValue) || 1e3 < cycleProtection) {
              "function" === typeof reject && reject(Error("Cannot have cyclic thenables."));
              return;
            }
            visited.add(inspectedValue);
            if ("fulfilled" === inspectedValue.status)
              inspectedValue = inspectedValue.value;
            else break;
          }
          resolve(this.value);
        }
        break;
      case "pending":
      case "blocked":
        "function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
        "function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
        break;
      default:
        "function" === typeof reject && reject(this.reason);
    }
  };
  var ObjectPrototype = Object.prototype, ArrayPrototype = Array.prototype;
  function wakeChunk(response, listeners, value, chunk) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      "function" === typeof listener ? listener(value) : fulfillReference(response, listener, value, chunk.reason);
    }
  }
  function rejectChunk(response, listeners, error) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      "function" === typeof listener ? listener(error) : rejectReference(response, listener.handler, error);
    }
  }
  function triggerErrorOnChunk(response, chunk, error) {
    if ("pending" !== chunk.status && "blocked" !== chunk.status)
      chunk.reason.error(error);
    else {
      var listeners = chunk.reason;
      chunk.status = "rejected";
      chunk.reason = error;
      null !== listeners && rejectChunk(response, listeners, error);
    }
  }
  function createResolvedModelChunk(response, value, id) {
    var $jscomp$compprop2 = {};
    return new ReactPromise(
      "resolved_model",
      value,
      ($jscomp$compprop2.id = id, $jscomp$compprop2[RESPONSE_SYMBOL] = response, $jscomp$compprop2)
    );
  }
  function resolveModelChunk(response, chunk, value, id) {
    if ("pending" !== chunk.status)
      chunk = chunk.reason, "C" === value[0] ? chunk.close("C" === value ? '"$undefined"' : value.slice(1)) : chunk.enqueueModel(value);
    else {
      var resolveListeners = chunk.value, rejectListeners = chunk.reason;
      chunk.status = "resolved_model";
      chunk.value = value;
      value = {};
      chunk.reason = (value.id = id, value[RESPONSE_SYMBOL] = response, value);
      if (null !== resolveListeners)
        switch (initializeModelChunk(chunk), chunk.status) {
          case "fulfilled":
            wakeChunk(response, resolveListeners, chunk.value, chunk);
            break;
          case "blocked":
          case "pending":
            if (chunk.value)
              for (response = 0; response < resolveListeners.length; response++)
                chunk.value.push(resolveListeners[response]);
            else chunk.value = resolveListeners;
            if (chunk.reason) {
              if (rejectListeners)
                for (resolveListeners = 0; resolveListeners < rejectListeners.length; resolveListeners++)
                  chunk.reason.push(rejectListeners[resolveListeners]);
            } else chunk.reason = rejectListeners;
            break;
          case "rejected":
            rejectListeners && rejectChunk(response, rejectListeners, chunk.reason);
        }
    }
  }
  function createResolvedIteratorResultChunk(response, value, done) {
    var $jscomp$compprop4 = {};
    return new ReactPromise(
      "resolved_model",
      (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}",
      ($jscomp$compprop4.id = -1, $jscomp$compprop4[RESPONSE_SYMBOL] = response, $jscomp$compprop4)
    );
  }
  function resolveIteratorResultChunk(response, chunk, value, done) {
    resolveModelChunk(
      response,
      chunk,
      (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}",
      -1
    );
  }
  function loadServerReference$1(response, metaData, parentObject, key) {
    function reject(error) {
      var rejectListeners = blockedPromise.reason, erroredPromise = blockedPromise;
      erroredPromise.status = "rejected";
      erroredPromise.value = null;
      erroredPromise.reason = error;
      null !== rejectListeners && rejectChunk(response, rejectListeners, error);
      rejectReference(response, handler2, error);
    }
    var id = metaData.id;
    if ("string" !== typeof id || "then" === key) return null;
    var cachedPromise = metaData.$$promise;
    if (void 0 !== cachedPromise) {
      if ("fulfilled" === cachedPromise.status)
        return cachedPromise = cachedPromise.value, "__proto__" === key ? null : parentObject[key] = cachedPromise;
      initializingHandler ? (id = initializingHandler, id.deps++) : id = initializingHandler = { chunk: null, value: null, reason: null, deps: 1, errored: false };
      cachedPromise.then(
        resolveReference.bind(null, response, id, parentObject, key),
        rejectReference.bind(null, response, id)
      );
      return null;
    }
    var blockedPromise = new ReactPromise("blocked", null, null);
    metaData.$$promise = blockedPromise;
    var serverReference = resolveServerReference(response._bundlerConfig, id);
    cachedPromise = metaData.bound;
    if (id = preloadModule(serverReference))
      cachedPromise instanceof ReactPromise && (id = Promise.all([id, cachedPromise]));
    else if (cachedPromise instanceof ReactPromise)
      id = Promise.resolve(cachedPromise);
    else
      return cachedPromise = requireModule2(serverReference), id = blockedPromise, id.status = "fulfilled", id.value = cachedPromise;
    if (initializingHandler) {
      var handler2 = initializingHandler;
      handler2.deps++;
    } else
      handler2 = initializingHandler = {
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: false
      };
    id.then(function() {
      var resolvedValue = requireModule2(serverReference);
      if (metaData.bound) {
        var promiseValue = metaData.bound.value;
        promiseValue = isArrayImpl(promiseValue) ? promiseValue.slice(0) : [];
        if (1e3 < promiseValue.length) {
          reject(
            Error(
              "Server Function has too many bound arguments. Received " + promiseValue.length + " but the limit is 1000."
            )
          );
          return;
        }
        promiseValue.unshift(null);
        resolvedValue = resolvedValue.bind.apply(resolvedValue, promiseValue);
      }
      promiseValue = blockedPromise.value;
      var initializedPromise = blockedPromise;
      initializedPromise.status = "fulfilled";
      initializedPromise.value = resolvedValue;
      initializedPromise.reason = null;
      null !== promiseValue && wakeChunk(response, promiseValue, resolvedValue, initializedPromise);
      resolveReference(response, handler2, parentObject, key, resolvedValue);
    }, reject);
    return null;
  }
  function reviveModel(response, parentObj, parentKey, value, reference, arrayRoot) {
    if ("string" === typeof value)
      return parseModelString(
        response,
        parentObj,
        parentKey,
        value,
        reference,
        arrayRoot
      );
    if ("object" === typeof value && null !== value)
      if (void 0 !== reference && void 0 !== response._temporaryReferences && response._temporaryReferences.set(value, reference), isArrayImpl(value)) {
        if (null === arrayRoot) {
          var childContext = { count: 0, fork: false };
          response._rootArrayContexts.set(value, childContext);
        } else childContext = arrayRoot;
        1 < value.length && (childContext.fork = true);
        bumpArrayCount(childContext, value.length + 1, response);
        for (parentObj = 0; parentObj < value.length; parentObj++)
          value[parentObj] = reviveModel(
            response,
            value,
            "" + parentObj,
            value[parentObj],
            void 0 !== reference ? reference + ":" + parentObj : void 0,
            childContext
          );
      } else
        for (childContext in value)
          hasOwnProperty.call(value, childContext) && ("__proto__" === childContext ? delete value[childContext] : (parentObj = void 0 !== reference && -1 === childContext.indexOf(":") ? reference + ":" + childContext : void 0, parentObj = reviveModel(
            response,
            value,
            childContext,
            value[childContext],
            parentObj,
            null
          ), void 0 !== parentObj ? value[childContext] = parentObj : delete value[childContext]));
    return value;
  }
  function bumpArrayCount(arrayContext, slots, response) {
    if ((arrayContext.count += slots) > response._arraySizeLimit && arrayContext.fork)
      throw Error(
        "Maximum array nesting exceeded. Large nested arrays can be dangerous. Try adding intermediate objects."
      );
  }
  var initializingHandler = null;
  function initializeModelChunk(chunk) {
    var prevHandler = initializingHandler;
    initializingHandler = null;
    var _chunk$reason = chunk.reason, response = _chunk$reason[RESPONSE_SYMBOL];
    _chunk$reason = _chunk$reason.id;
    _chunk$reason = -1 === _chunk$reason ? void 0 : _chunk$reason.toString(16);
    var resolvedModel = chunk.value;
    chunk.status = "blocked";
    chunk.value = null;
    chunk.reason = null;
    try {
      var rawModel = JSON.parse(resolvedModel);
      resolvedModel = { count: 0, fork: false };
      var value = reviveModel(
        response,
        { "": rawModel },
        "",
        rawModel,
        _chunk$reason,
        resolvedModel
      ), resolveListeners = chunk.value;
      if (null !== resolveListeners)
        for (chunk.value = null, chunk.reason = null, rawModel = 0; rawModel < resolveListeners.length; rawModel++) {
          var listener = resolveListeners[rawModel];
          "function" === typeof listener ? listener(value) : fulfillReference(response, listener, value, resolvedModel);
        }
      if (null !== initializingHandler) {
        if (initializingHandler.errored) throw initializingHandler.reason;
        if (0 < initializingHandler.deps) {
          initializingHandler.value = value;
          initializingHandler.reason = resolvedModel;
          initializingHandler.chunk = chunk;
          return;
        }
      }
      chunk.status = "fulfilled";
      chunk.value = value;
      chunk.reason = resolvedModel;
    } catch (error) {
      chunk.status = "rejected", chunk.reason = error;
    } finally {
      initializingHandler = prevHandler;
    }
  }
  function reportGlobalError(response, error) {
    response._closed = true;
    response._closedReason = error;
    response._chunks.forEach(function(chunk) {
      "pending" === chunk.status ? triggerErrorOnChunk(response, chunk, error) : "fulfilled" === chunk.status && null !== chunk.reason && (chunk = chunk.reason, "function" === typeof chunk.error && chunk.error(error));
    });
  }
  function getChunk(response, id) {
    var chunks = response._chunks, chunk = chunks.get(id);
    chunk || (chunk = response._formData.get(response._prefix + id), chunk = "string" === typeof chunk ? createResolvedModelChunk(response, chunk, id) : response._closed ? new ReactPromise("rejected", null, response._closedReason) : new ReactPromise("pending", null, null), chunks.set(id, chunk));
    return chunk;
  }
  function fulfillReference(response, reference, value, arrayRoot) {
    var handler2 = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
    try {
      for (var localLength = 0, rootArrayContexts = response._rootArrayContexts, i = 1; i < path.length; i++) {
        var name = path[i];
        if ("object" !== typeof value || null === value || getPrototypeOf(value) !== ObjectPrototype && getPrototypeOf(value) !== ArrayPrototype || !hasOwnProperty.call(value, name))
          throw Error("Invalid reference.");
        value = value[name];
        if (isArrayImpl(value))
          localLength = 0, arrayRoot = rootArrayContexts.get(value) || arrayRoot;
        else if (arrayRoot = null, "string" === typeof value)
          localLength = value.length;
        else if ("bigint" === typeof value) {
          var n = Math.abs(Number(value));
          localLength = 0 === n ? 1 : Math.floor(Math.log10(n)) + 1;
        } else localLength = ArrayBuffer.isView(value) ? value.byteLength : 0;
      }
      var resolvedValue = map(response, value, parentObject, key);
      var referenceArrayRoot = reference.arrayRoot;
      null !== referenceArrayRoot && (null !== arrayRoot ? (arrayRoot.fork && (referenceArrayRoot.fork = true), bumpArrayCount(referenceArrayRoot, arrayRoot.count, response)) : 0 < localLength && bumpArrayCount(referenceArrayRoot, localLength, response));
    } catch (error) {
      rejectReference(response, handler2, error);
      return;
    }
    resolveReference(response, handler2, parentObject, key, resolvedValue);
  }
  function resolveReference(response, handler2, parentObject, key, resolvedValue) {
    "__proto__" !== key && (parentObject[key] = resolvedValue);
    "" === key && null === handler2.value && (handler2.value = resolvedValue);
    handler2.deps--;
    0 === handler2.deps && (parentObject = handler2.chunk, null !== parentObject && "blocked" === parentObject.status && (key = parentObject.value, parentObject.status = "fulfilled", parentObject.value = handler2.value, parentObject.reason = handler2.reason, null !== key && wakeChunk(response, key, handler2.value, parentObject)));
  }
  function rejectReference(response, handler2, error) {
    handler2.errored || (handler2.errored = true, handler2.value = null, handler2.reason = error, handler2 = handler2.chunk, null !== handler2 && "blocked" === handler2.status && triggerErrorOnChunk(response, handler2, error));
  }
  function getOutlinedModel(response, reference, parentObject, key, referenceArrayRoot, map) {
    reference = reference.split(":");
    var id = parseInt(reference[0], 16), chunk = getChunk(response, id);
    switch (chunk.status) {
      case "resolved_model":
        initializeModelChunk(chunk);
    }
    switch (chunk.status) {
      case "fulfilled":
        id = chunk.value;
        chunk = chunk.reason;
        for (var localLength = 0, rootArrayContexts = response._rootArrayContexts, i = 1; i < reference.length; i++) {
          localLength = reference[i];
          if ("object" !== typeof id || null === id || getPrototypeOf(id) !== ObjectPrototype && getPrototypeOf(id) !== ArrayPrototype || !hasOwnProperty.call(id, localLength))
            throw Error("Invalid reference.");
          id = id[localLength];
          isArrayImpl(id) ? (localLength = 0, chunk = rootArrayContexts.get(id) || chunk) : (chunk = null, "string" === typeof id ? localLength = id.length : "bigint" === typeof id ? (localLength = Math.abs(Number(id)), localLength = 0 === localLength ? 1 : Math.floor(Math.log10(localLength)) + 1) : localLength = ArrayBuffer.isView(id) ? id.byteLength : 0);
        }
        parentObject = map(response, id, parentObject, key);
        null !== referenceArrayRoot && (null !== chunk ? (chunk.fork && (referenceArrayRoot.fork = true), bumpArrayCount(referenceArrayRoot, chunk.count, response)) : 0 < localLength && bumpArrayCount(referenceArrayRoot, localLength, response));
        return parentObject;
      case "blocked":
        return initializingHandler ? (response = initializingHandler, response.deps++) : response = initializingHandler = { chunk: null, value: null, reason: null, deps: 1, errored: false }, referenceArrayRoot = {
          handler: response,
          parentObject,
          key,
          map,
          path: reference,
          arrayRoot: referenceArrayRoot
        }, null === chunk.value ? chunk.value = [referenceArrayRoot] : chunk.value.push(referenceArrayRoot), null === chunk.reason ? chunk.reason = [referenceArrayRoot] : chunk.reason.push(referenceArrayRoot), null;
      case "pending":
        throw Error("Invalid forward reference.");
      default:
        return initializingHandler ? (initializingHandler.errored = true, initializingHandler.value = null, initializingHandler.reason = chunk.reason) : initializingHandler = {
          chunk: null,
          value: null,
          reason: chunk.reason,
          deps: 0,
          errored: true
        }, null;
    }
  }
  function createMap(response, model) {
    if (!isArrayImpl(model)) throw Error("Invalid Map initializer.");
    if (true === model.$$consumed) throw Error("Already initialized Map.");
    response = new Map(model);
    model.$$consumed = true;
    return response;
  }
  function createSet(response, model) {
    if (!isArrayImpl(model)) throw Error("Invalid Set initializer.");
    if (true === model.$$consumed) throw Error("Already initialized Set.");
    response = new Set(model);
    model.$$consumed = true;
    return response;
  }
  function extractIterator(response, model) {
    if (!isArrayImpl(model)) throw Error("Invalid Iterator initializer.");
    if (true === model.$$consumed) throw Error("Already initialized Iterator.");
    response = model[Symbol.iterator]();
    model.$$consumed = true;
    return response;
  }
  function createModel(response, model, parentObject, key) {
    return "then" === key && "function" === typeof model ? null : model;
  }
  function parseTypedArray(response, reference, constructor, bytesPerElement, parentObject, parentKey, referenceArrayRoot) {
    function reject(error) {
      if (!handler2.errored) {
        handler2.errored = true;
        handler2.value = null;
        handler2.reason = error;
        var chunk = handler2.chunk;
        null !== chunk && "blocked" === chunk.status && triggerErrorOnChunk(response, chunk, error);
      }
    }
    reference = parseInt(reference.slice(2), 16);
    var key = response._prefix + reference;
    bytesPerElement = response._chunks;
    if (bytesPerElement.has(reference))
      throw Error("Already initialized typed array.");
    bytesPerElement.set(
      reference,
      new ReactPromise(
        "rejected",
        null,
        Error("Already initialized typed array.")
      )
    );
    reference = response._formData.get(key).arrayBuffer();
    if (initializingHandler) {
      var handler2 = initializingHandler;
      handler2.deps++;
    } else
      handler2 = initializingHandler = {
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: false
      };
    reference.then(function(buffer) {
      try {
        null !== referenceArrayRoot && bumpArrayCount(referenceArrayRoot, buffer.byteLength, response);
        var resolvedValue = constructor === ArrayBuffer ? buffer : new constructor(buffer);
        "__proto__" !== key && (parentObject[parentKey] = resolvedValue);
        "" === parentKey && null === handler2.value && (handler2.value = resolvedValue);
      } catch (x) {
        reject(x);
        return;
      }
      handler2.deps--;
      0 === handler2.deps && (buffer = handler2.chunk, null !== buffer && "blocked" === buffer.status && (resolvedValue = buffer.value, buffer.status = "fulfilled", buffer.value = handler2.value, buffer.reason = null, null !== resolvedValue && wakeChunk(response, resolvedValue, handler2.value, buffer)));
    }, reject);
    return null;
  }
  function resolveStream(response, id, stream, controller) {
    var chunks = response._chunks;
    stream = new ReactPromise("fulfilled", stream, controller);
    chunks.set(id, stream);
    response = response._formData.getAll(response._prefix + id);
    for (id = 0; id < response.length; id++)
      chunks = response[id], "string" === typeof chunks && ("C" === chunks[0] ? controller.close("C" === chunks ? '"$undefined"' : chunks.slice(1)) : controller.enqueueModel(chunks));
  }
  function parseReadableStream(response, reference, type) {
    function enqueue(value) {
      "bytes" !== type || ArrayBuffer.isView(value) ? controller.enqueue(value) : flightController.error(Error("Invalid data for bytes stream."));
    }
    reference = parseInt(reference.slice(2), 16);
    if (response._chunks.has(reference))
      throw Error("Already initialized stream.");
    var controller = null, closed = false, stream = new ReadableStream({
      type,
      start: function(c) {
        controller = c;
      }
    }), previousBlockedChunk = null, flightController = {
      enqueueModel: function(json) {
        if (null === previousBlockedChunk) {
          var chunk = createResolvedModelChunk(response, json, -1);
          initializeModelChunk(chunk);
          "fulfilled" === chunk.status ? enqueue(chunk.value) : (chunk.then(enqueue, flightController.error), previousBlockedChunk = chunk);
        } else {
          chunk = previousBlockedChunk;
          var chunk$31 = new ReactPromise("pending", null, null);
          chunk$31.then(enqueue, flightController.error);
          previousBlockedChunk = chunk$31;
          chunk.then(function() {
            previousBlockedChunk === chunk$31 && (previousBlockedChunk = null);
            resolveModelChunk(response, chunk$31, json, -1);
          });
        }
      },
      close: function() {
        if (!closed)
          if (closed = true, null === previousBlockedChunk)
            controller.close();
          else {
            var blockedChunk = previousBlockedChunk;
            previousBlockedChunk = null;
            blockedChunk.then(function() {
              return controller.close();
            });
          }
      },
      error: function(error) {
        if (!closed)
          if (closed = true, null === previousBlockedChunk)
            controller.error(error);
          else {
            var blockedChunk = previousBlockedChunk;
            previousBlockedChunk = null;
            blockedChunk.then(function() {
              return controller.error(error);
            });
          }
      }
    };
    resolveStream(response, reference, stream, flightController);
    return stream;
  }
  function FlightIterator(next) {
    this.next = next;
  }
  FlightIterator.prototype = {};
  FlightIterator.prototype[ASYNC_ITERATOR] = function() {
    return this;
  };
  function parseAsyncIterable(response, reference, iterator) {
    reference = parseInt(reference.slice(2), 16);
    if (response._chunks.has(reference))
      throw Error("Already initialized stream.");
    var buffer = [], closed = false, nextWriteIndex = 0, $jscomp$compprop5 = {};
    $jscomp$compprop5 = ($jscomp$compprop5[ASYNC_ITERATOR] = function() {
      var nextReadIndex = 0;
      return new FlightIterator(function(arg) {
        if (void 0 !== arg)
          throw Error(
            "Values cannot be passed to next() of AsyncIterables passed to Client Components."
          );
        if (nextReadIndex === buffer.length) {
          if (closed)
            return new ReactPromise(
              "fulfilled",
              { done: true, value: void 0 },
              null
            );
          buffer[nextReadIndex] = new ReactPromise("pending", null, null);
        }
        return buffer[nextReadIndex++];
      });
    }, $jscomp$compprop5);
    iterator = iterator ? $jscomp$compprop5[ASYNC_ITERATOR]() : $jscomp$compprop5;
    resolveStream(response, reference, iterator, {
      enqueueModel: function(value) {
        nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
          response,
          value,
          false
        ) : resolveIteratorResultChunk(
          response,
          buffer[nextWriteIndex],
          value,
          false
        );
        nextWriteIndex++;
      },
      close: function(value) {
        if (!closed)
          for (closed = true, nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
            response,
            value,
            true
          ) : resolveIteratorResultChunk(
            response,
            buffer[nextWriteIndex],
            value,
            true
          ), nextWriteIndex++; nextWriteIndex < buffer.length; )
            resolveIteratorResultChunk(
              response,
              buffer[nextWriteIndex++],
              '"$undefined"',
              true
            );
      },
      error: function(error) {
        if (!closed)
          for (closed = true, nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = new ReactPromise(
            "pending",
            null,
            null
          )); nextWriteIndex < buffer.length; )
            triggerErrorOnChunk(response, buffer[nextWriteIndex++], error);
      }
    });
    return iterator;
  }
  function parseModelString(response, obj, key, value, reference, arrayRoot) {
    if ("$" === value[0]) {
      switch (value[1]) {
        case "$":
          return null !== arrayRoot && bumpArrayCount(arrayRoot, value.length - 1, response), value.slice(1);
        case "@":
          return obj = parseInt(value.slice(2), 16), getChunk(response, obj);
        case "h":
          return arrayRoot = value.slice(2), getOutlinedModel(
            response,
            arrayRoot,
            obj,
            key,
            null,
            loadServerReference$1
          );
        case "T":
          if (void 0 === reference || void 0 === response._temporaryReferences)
            throw Error(
              "Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server."
            );
          return createTemporaryReference(
            response._temporaryReferences,
            reference
          );
        case "Q":
          return arrayRoot = value.slice(2), getOutlinedModel(response, arrayRoot, obj, key, null, createMap);
        case "W":
          return arrayRoot = value.slice(2), getOutlinedModel(response, arrayRoot, obj, key, null, createSet);
        case "K":
          obj = value.slice(2);
          obj = response._prefix + obj + "_";
          key = new FormData();
          response = response._formData;
          arrayRoot = Array.from(response.keys());
          for (value = 0; value < arrayRoot.length; value++)
            if (reference = arrayRoot[value], reference.startsWith(obj)) {
              for (var entries = response.getAll(reference), newKey = reference.slice(obj.length), j = 0; j < entries.length; j++)
                key.append(newKey, entries[j]);
              response.delete(reference);
            }
          return key;
        case "i":
          return arrayRoot = value.slice(2), getOutlinedModel(response, arrayRoot, obj, key, null, extractIterator);
        case "I":
          return Infinity;
        case "-":
          return "$-0" === value ? -0 : -Infinity;
        case "N":
          return NaN;
        case "u":
          return;
        case "D":
          return new Date(Date.parse(value.slice(2)));
        case "n":
          obj = value.slice(2);
          if (300 < obj.length)
            throw Error(
              "BigInt is too large. Received " + obj.length + " digits but the limit is 300."
            );
          null !== arrayRoot && bumpArrayCount(arrayRoot, obj.length, response);
          return BigInt(obj);
        case "A":
          return parseTypedArray(
            response,
            value,
            ArrayBuffer,
            1,
            obj,
            key,
            arrayRoot
          );
        case "O":
          return parseTypedArray(
            response,
            value,
            Int8Array,
            1,
            obj,
            key,
            arrayRoot
          );
        case "o":
          return parseTypedArray(
            response,
            value,
            Uint8Array,
            1,
            obj,
            key,
            arrayRoot
          );
        case "U":
          return parseTypedArray(
            response,
            value,
            Uint8ClampedArray,
            1,
            obj,
            key,
            arrayRoot
          );
        case "S":
          return parseTypedArray(
            response,
            value,
            Int16Array,
            2,
            obj,
            key,
            arrayRoot
          );
        case "s":
          return parseTypedArray(
            response,
            value,
            Uint16Array,
            2,
            obj,
            key,
            arrayRoot
          );
        case "L":
          return parseTypedArray(
            response,
            value,
            Int32Array,
            4,
            obj,
            key,
            arrayRoot
          );
        case "l":
          return parseTypedArray(
            response,
            value,
            Uint32Array,
            4,
            obj,
            key,
            arrayRoot
          );
        case "G":
          return parseTypedArray(
            response,
            value,
            Float32Array,
            4,
            obj,
            key,
            arrayRoot
          );
        case "g":
          return parseTypedArray(
            response,
            value,
            Float64Array,
            8,
            obj,
            key,
            arrayRoot
          );
        case "M":
          return parseTypedArray(
            response,
            value,
            BigInt64Array,
            8,
            obj,
            key,
            arrayRoot
          );
        case "m":
          return parseTypedArray(
            response,
            value,
            BigUint64Array,
            8,
            obj,
            key,
            arrayRoot
          );
        case "V":
          return parseTypedArray(
            response,
            value,
            DataView,
            1,
            obj,
            key,
            arrayRoot
          );
        case "B":
          return obj = parseInt(value.slice(2), 16), response._formData.get(response._prefix + obj);
        case "R":
          return parseReadableStream(response, value, void 0);
        case "r":
          return parseReadableStream(response, value, "bytes");
        case "X":
          return parseAsyncIterable(response, value, false);
        case "x":
          return parseAsyncIterable(response, value, true);
      }
      value = value.slice(1);
      return getOutlinedModel(response, value, obj, key, arrayRoot, createModel);
    }
    null !== arrayRoot && bumpArrayCount(arrayRoot, value.length, response);
    return value;
  }
  function createResponse(bundlerConfig, formFieldPrefix, temporaryReferences) {
    var backingFormData = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : new FormData(), arraySizeLimit = 4 < arguments.length && void 0 !== arguments[4] ? arguments[4] : 1e6, chunks = /* @__PURE__ */ new Map();
    return {
      _bundlerConfig: bundlerConfig,
      _prefix: formFieldPrefix,
      _formData: backingFormData,
      _chunks: chunks,
      _closed: false,
      _closedReason: null,
      _temporaryReferences: temporaryReferences,
      _rootArrayContexts: /* @__PURE__ */ new WeakMap(),
      _arraySizeLimit: arraySizeLimit
    };
  }
  function close(response) {
    reportGlobalError(response, Error("Connection closed."));
  }
  function loadServerReference(bundlerConfig, metaData) {
    var id = metaData.id;
    if ("string" !== typeof id) return null;
    var serverReference = resolveServerReference(bundlerConfig, id);
    bundlerConfig = preloadModule(serverReference);
    metaData = metaData.bound;
    return metaData instanceof Promise ? Promise.all([metaData, bundlerConfig]).then(function(_ref) {
      _ref = _ref[0];
      var fn = requireModule2(serverReference);
      if (1e3 < _ref.length)
        throw Error(
          "Server Function has too many bound arguments. Received " + _ref.length + " but the limit is 1000."
        );
      return fn.bind.apply(fn, [null].concat(_ref));
    }) : bundlerConfig ? Promise.resolve(bundlerConfig).then(function() {
      return requireModule2(serverReference);
    }) : Promise.resolve(requireModule2(serverReference));
  }
  function decodeBoundActionMetaData(body, serverManifest, formFieldPrefix, arraySizeLimit) {
    body = createResponse(
      serverManifest,
      formFieldPrefix,
      void 0,
      body,
      arraySizeLimit
    );
    close(body);
    body = getChunk(body, 0);
    body.then(function() {
    });
    if ("fulfilled" !== body.status) throw body.reason;
    return body.value;
  }
  reactServerDomWebpackServer_edge_production.createClientModuleProxy = function(moduleId) {
    moduleId = registerClientReferenceImpl({}, moduleId, false);
    return new Proxy(moduleId, proxyHandlers$1);
  };
  reactServerDomWebpackServer_edge_production.createTemporaryReferenceSet = function() {
    return /* @__PURE__ */ new WeakMap();
  };
  reactServerDomWebpackServer_edge_production.decodeAction = function(body, serverManifest) {
    var formData = new FormData(), action = null, seenActions = /* @__PURE__ */ new Set();
    body.forEach(function(value, key) {
      key.startsWith("$ACTION_") ? key.startsWith("$ACTION_REF_") ? seenActions.has(key) || (seenActions.add(key), value = "$ACTION_" + key.slice(12) + ":", value = decodeBoundActionMetaData(body, serverManifest, value), action = loadServerReference(serverManifest, value)) : key.startsWith("$ACTION_ID_") && !seenActions.has(key) && (seenActions.add(key), value = key.slice(11), action = loadServerReference(serverManifest, {
        id: value,
        bound: null
      })) : formData.append(key, value);
    });
    return null === action ? null : action.then(function(fn) {
      return fn.bind(null, formData);
    });
  };
  reactServerDomWebpackServer_edge_production.decodeFormState = function(actionResult, body, serverManifest) {
    var keyPath = body.get("$ACTION_KEY");
    if ("string" !== typeof keyPath) return Promise.resolve(null);
    var metaData = null;
    body.forEach(function(value, key) {
      key.startsWith("$ACTION_REF_") && (value = "$ACTION_" + key.slice(12) + ":", metaData = decodeBoundActionMetaData(body, serverManifest, value));
    });
    if (null === metaData) return Promise.resolve(null);
    var referenceId = metaData.id;
    return Promise.resolve(metaData.bound).then(function(bound) {
      return null === bound ? null : [actionResult, keyPath, referenceId, bound.length - 1];
    });
  };
  reactServerDomWebpackServer_edge_production.decodeReply = function(body, webpackMap, options) {
    if ("string" === typeof body) {
      var form = new FormData();
      form.append("0", body);
      body = form;
    }
    body = createResponse(
      webpackMap,
      "",
      options ? options.temporaryReferences : void 0,
      body,
      options ? options.arraySizeLimit : void 0
    );
    webpackMap = getChunk(body, 0);
    close(body);
    return webpackMap;
  };
  reactServerDomWebpackServer_edge_production.decodeReplyFromAsyncIterable = function(iterable, webpackMap, options) {
    function progress(entry) {
      if (entry.done) close(response);
      else {
        entry = entry.value;
        var name = entry[0];
        entry = entry[1];
        if ("string" === typeof entry) {
          response._formData.append(name, entry);
          var prefix = response._prefix;
          if (name.startsWith(prefix)) {
            var chunks = response._chunks;
            name = +name.slice(prefix.length);
            (chunks = chunks.get(name)) && resolveModelChunk(response, chunks, entry, name);
          }
        } else response._formData.append(name, entry);
        iterator.next().then(progress, error);
      }
    }
    function error(reason) {
      reportGlobalError(response, reason);
      "function" === typeof iterator.throw && iterator.throw(reason).then(error, error);
    }
    var iterator = iterable[ASYNC_ITERATOR](), response = createResponse(
      webpackMap,
      "",
      options ? options.temporaryReferences : void 0,
      void 0,
      options ? options.arraySizeLimit : void 0
    );
    iterator.next().then(progress, error);
    return getChunk(response, 0);
  };
  reactServerDomWebpackServer_edge_production.prerender = function(model, webpackMap, options) {
    return new Promise(function(resolve, reject) {
      var request = new RequestInstance(
        21,
        model,
        webpackMap,
        options ? options.onError : void 0,
        options ? options.onPostpone : void 0,
        function() {
          var stream = new ReadableStream(
            {
              type: "bytes",
              pull: function(controller) {
                startFlowing(request, controller);
              },
              cancel: function(reason) {
                request.destination = null;
                abort(request, reason);
              }
            },
            { highWaterMark: 0 }
          );
          resolve({ prelude: stream });
        },
        reject,
        options ? options.identifierPrefix : void 0,
        options ? options.temporaryReferences : void 0
      );
      if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(request, signal.reason);
        else {
          var listener = function() {
            abort(request, signal.reason);
            signal.removeEventListener("abort", listener);
          };
          signal.addEventListener("abort", listener);
        }
      }
      startWork(request);
    });
  };
  reactServerDomWebpackServer_edge_production.registerClientReference = function(proxyImplementation, id, exportName) {
    return registerClientReferenceImpl(
      proxyImplementation,
      id + "#" + exportName,
      false
    );
  };
  reactServerDomWebpackServer_edge_production.registerServerReference = function(reference, id, exportName) {
    return Object.defineProperties(reference, {
      $$typeof: { value: SERVER_REFERENCE_TAG },
      $$id: {
        value: null === exportName ? id : id + "#" + exportName,
        configurable: true
      },
      $$bound: { value: null, configurable: true },
      bind: { value: bind, configurable: true },
      toString: serverReferenceToString
    });
  };
  reactServerDomWebpackServer_edge_production.renderToReadableStream = function(model, webpackMap, options) {
    var request = new RequestInstance(
      20,
      model,
      webpackMap,
      options ? options.onError : void 0,
      options ? options.onPostpone : void 0,
      noop,
      noop,
      options ? options.identifierPrefix : void 0,
      options ? options.temporaryReferences : void 0
    );
    if (options && options.signal) {
      var signal = options.signal;
      if (signal.aborted) abort(request, signal.reason);
      else {
        var listener = function() {
          abort(request, signal.reason);
          signal.removeEventListener("abort", listener);
        };
        signal.addEventListener("abort", listener);
      }
    }
    return new ReadableStream(
      {
        type: "bytes",
        start: function() {
          startWork(request);
        },
        pull: function(controller) {
          startFlowing(request, controller);
        },
        cancel: function(reason) {
          request.destination = null;
          abort(request, reason);
        }
      },
      { highWaterMark: 0 }
    );
  };
  return reactServerDomWebpackServer_edge_production;
}
var hasRequiredServer_edge;
function requireServer_edge() {
  if (hasRequiredServer_edge) return server_edge;
  hasRequiredServer_edge = 1;
  var s;
  {
    s = requireReactServerDomWebpackServer_edge_production();
  }
  server_edge.renderToReadableStream = s.renderToReadableStream;
  server_edge.decodeReply = s.decodeReply;
  server_edge.decodeReplyFromAsyncIterable = s.decodeReplyFromAsyncIterable;
  server_edge.decodeAction = s.decodeAction;
  server_edge.decodeFormState = s.decodeFormState;
  server_edge.registerServerReference = s.registerServerReference;
  server_edge.registerClientReference = s.registerClientReference;
  server_edge.createClientModuleProxy = s.createClientModuleProxy;
  server_edge.createTemporaryReferenceSet = s.createTemporaryReferenceSet;
  return server_edge;
}
var server_edgeExports = requireServer_edge();
let init = false;
let requireModule;
function setRequireModule(options) {
  if (init) return;
  init = true;
  requireModule = (id) => {
    return options.load(removeReferenceCacheTag(id));
  };
  globalThis.__vite_rsc_server_require__ = memoize(async (id) => {
    if (id.startsWith(SERVER_DECODE_CLIENT_PREFIX)) {
      id = id.slice(SERVER_DECODE_CLIENT_PREFIX.length);
      id = removeReferenceCacheTag(id);
      const target = {};
      const getOrCreateClientReference = (name) => {
        return target[name] ??= server_edgeExports.registerClientReference(() => {
          throw new Error(`Unexpectedly client reference export '${name}' is called on server`);
        }, id, name);
      };
      return new Proxy(target, { getOwnPropertyDescriptor(_target, name) {
        if (typeof name !== "string" || name === "then") return Reflect.getOwnPropertyDescriptor(target, name);
        getOrCreateClientReference(name);
        return Reflect.getOwnPropertyDescriptor(target, name);
      } });
    }
    return requireModule(id);
  });
  setInternalRequire();
}
async function loadServerAction(id) {
  const [file, name] = id.split("#");
  return (await requireModule(file))[name];
}
function createServerManifest() {
  const cacheTag = "";
  return new Proxy({}, { get(_target, $$id, _receiver) {
    tinyassert(typeof $$id === "string");
    let [id, name] = $$id.split("#");
    tinyassert(id);
    tinyassert(name);
    return {
      id: SERVER_REFERENCE_PREFIX + id + cacheTag,
      name,
      chunks: [],
      async: true
    };
  } });
}
function createClientManifest(options) {
  const cacheTag = "";
  return new Proxy({}, { get(_target, $$id, _receiver) {
    tinyassert(typeof $$id === "string");
    let [id, name] = $$id.split("#");
    tinyassert(id);
    tinyassert(name);
    options?.onClientReference?.({
      id,
      name
    });
    return {
      id: id + cacheTag,
      name,
      chunks: [],
      async: true
    };
  } });
}
var client_edge = { exports: {} };
var reactServerDomWebpackClient_edge_production = {};
var hasRequiredReactServerDomWebpackClient_edge_production;
function requireReactServerDomWebpackClient_edge_production() {
  if (hasRequiredReactServerDomWebpackClient_edge_production) return reactServerDomWebpackClient_edge_production;
  hasRequiredReactServerDomWebpackClient_edge_production = 1;
  var ReactDOM = requireReactDom_reactServer(), decoderOptions = { stream: true }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveClientReference(bundlerConfig, metadata2) {
    if (bundlerConfig) {
      var moduleExports = bundlerConfig[metadata2[0]];
      if (bundlerConfig = moduleExports && moduleExports[metadata2[2]])
        moduleExports = bundlerConfig.name;
      else {
        bundlerConfig = moduleExports && moduleExports["*"];
        if (!bundlerConfig)
          throw Error(
            'Could not find the module "' + metadata2[0] + '" in the React Server Consumer Manifest. This is probably a bug in the React Server Components bundler.'
          );
        moduleExports = metadata2[2];
      }
      return 4 === metadata2.length ? [bundlerConfig.id, bundlerConfig.chunks, moduleExports, 1] : [bundlerConfig.id, bundlerConfig.chunks, moduleExports];
    }
    return metadata2;
  }
  function resolveServerReference(bundlerConfig, id) {
    var name = "", resolvedModuleData = bundlerConfig[id];
    if (resolvedModuleData) name = resolvedModuleData.name;
    else {
      var idx = id.lastIndexOf("#");
      -1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
      if (!resolvedModuleData)
        throw Error(
          'Could not find the module "' + id + '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.'
        );
    }
    return resolvedModuleData.async ? [resolvedModuleData.id, resolvedModuleData.chunks, name, 1] : [resolvedModuleData.id, resolvedModuleData.chunks, name];
  }
  var chunkCache = /* @__PURE__ */ new Map();
  function requireAsyncModule(id) {
    var promise = __vite_rsc_require__(id);
    if ("function" !== typeof promise.then || "fulfilled" === promise.status)
      return null;
    promise.then(
      function(value) {
        promise.status = "fulfilled";
        promise.value = value;
      },
      function(reason) {
        promise.status = "rejected";
        promise.reason = reason;
      }
    );
    return promise;
  }
  function ignoreReject() {
  }
  function preloadModule(metadata2) {
    for (var chunks = metadata2[1], promises = [], i = 0; i < chunks.length; ) {
      var chunkId = chunks[i++];
      chunks[i++];
      var entry = chunkCache.get(chunkId);
      if (void 0 === entry) {
        entry = __webpack_chunk_load__(chunkId);
        promises.push(entry);
        var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
        entry.then(resolve, ignoreReject);
        chunkCache.set(chunkId, entry);
      } else null !== entry && promises.push(entry);
    }
    return 4 === metadata2.length ? 0 === promises.length ? requireAsyncModule(metadata2[0]) : Promise.all(promises).then(function() {
      return requireAsyncModule(metadata2[0]);
    }) : 0 < promises.length ? Promise.all(promises) : null;
  }
  function requireModule2(metadata2) {
    var moduleExports = __vite_rsc_require__(metadata2[0]);
    if (4 === metadata2.length && "function" === typeof moduleExports.then)
      if ("fulfilled" === moduleExports.status)
        moduleExports = moduleExports.value;
      else throw moduleExports.reason;
    if ("*" === metadata2[2]) return moduleExports;
    if ("" === metadata2[2])
      return moduleExports.__esModule ? moduleExports.default : moduleExports;
    if (hasOwnProperty.call(moduleExports, metadata2[2]))
      return moduleExports[metadata2[2]];
  }
  function prepareDestinationWithChunks(moduleLoading, chunks, nonce$jscomp$0) {
    if (null !== moduleLoading)
      for (var i = 1; i < chunks.length; i += 2) {
        var nonce = nonce$jscomp$0, JSCompiler_temp_const = ReactDOMSharedInternals.d, JSCompiler_temp_const$jscomp$0 = JSCompiler_temp_const.X, JSCompiler_temp_const$jscomp$1 = moduleLoading.prefix + chunks[i];
        var JSCompiler_inline_result = moduleLoading.crossOrigin;
        JSCompiler_inline_result = "string" === typeof JSCompiler_inline_result ? "use-credentials" === JSCompiler_inline_result ? JSCompiler_inline_result : "" : void 0;
        JSCompiler_temp_const$jscomp$0.call(
          JSCompiler_temp_const,
          JSCompiler_temp_const$jscomp$1,
          { crossOrigin: JSCompiler_inline_result, nonce }
        );
      }
  }
  var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ASYNC_ITERATOR = Symbol.asyncIterator, isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf, ObjectPrototype = Object.prototype, knownServerReferences = /* @__PURE__ */ new WeakMap();
  function serializeNumber(number2) {
    return Number.isFinite(number2) ? 0 === number2 && -Infinity === 1 / number2 ? "$-0" : number2 : Infinity === number2 ? "$Infinity" : -Infinity === number2 ? "$-Infinity" : "$NaN";
  }
  function processReply(root, formFieldPrefix, temporaryReferences, resolve, reject) {
    function serializeTypedArray(tag, typedArray) {
      typedArray = new Blob([
        new Uint8Array(
          typedArray.buffer,
          typedArray.byteOffset,
          typedArray.byteLength
        )
      ]);
      var blobId = nextPartId++;
      null === formData && (formData = new FormData());
      formData.append(formFieldPrefix + blobId, typedArray);
      return "$" + tag + blobId.toString(16);
    }
    function serializeBinaryReader(reader) {
      function progress(entry) {
        entry.done ? (entry = nextPartId++, data.append(formFieldPrefix + entry, new Blob(buffer)), data.append(
          formFieldPrefix + streamId,
          '"$o' + entry.toString(16) + '"'
        ), data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data)) : (buffer.push(entry.value), reader.read(new Uint8Array(1024)).then(progress, reject));
      }
      null === formData && (formData = new FormData());
      var data = formData;
      pendingParts++;
      var streamId = nextPartId++, buffer = [];
      reader.read(new Uint8Array(1024)).then(progress, reject);
      return "$r" + streamId.toString(16);
    }
    function serializeReader(reader) {
      function progress(entry) {
        if (entry.done)
          data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data);
        else
          try {
            var partJSON = JSON.stringify(entry.value, resolveToJSON);
            data.append(formFieldPrefix + streamId, partJSON);
            reader.read().then(progress, reject);
          } catch (x) {
            reject(x);
          }
      }
      null === formData && (formData = new FormData());
      var data = formData;
      pendingParts++;
      var streamId = nextPartId++;
      reader.read().then(progress, reject);
      return "$R" + streamId.toString(16);
    }
    function serializeReadableStream(stream) {
      try {
        var binaryReader = stream.getReader({ mode: "byob" });
      } catch (x) {
        return serializeReader(stream.getReader());
      }
      return serializeBinaryReader(binaryReader);
    }
    function serializeAsyncIterable(iterable, iterator) {
      function progress(entry) {
        if (entry.done) {
          if (void 0 === entry.value)
            data.append(formFieldPrefix + streamId, "C");
          else
            try {
              var partJSON = JSON.stringify(entry.value, resolveToJSON);
              data.append(formFieldPrefix + streamId, "C" + partJSON);
            } catch (x) {
              reject(x);
              return;
            }
          pendingParts--;
          0 === pendingParts && resolve(data);
        } else
          try {
            var partJSON$21 = JSON.stringify(entry.value, resolveToJSON);
            data.append(formFieldPrefix + streamId, partJSON$21);
            iterator.next().then(progress, reject);
          } catch (x$22) {
            reject(x$22);
          }
      }
      null === formData && (formData = new FormData());
      var data = formData;
      pendingParts++;
      var streamId = nextPartId++;
      iterable = iterable === iterator;
      iterator.next().then(progress, reject);
      return "$" + (iterable ? "x" : "X") + streamId.toString(16);
    }
    function resolveToJSON(key, value) {
      if (null === value) return null;
      if ("object" === typeof value) {
        switch (value.$$typeof) {
          case REACT_ELEMENT_TYPE:
            if (void 0 !== temporaryReferences && -1 === key.indexOf(":")) {
              var parentReference = writtenObjects.get(this);
              if (void 0 !== parentReference)
                return temporaryReferences.set(parentReference + ":" + key, value), "$T";
            }
            throw Error(
              "React Element cannot be passed to Server Functions from the Client without a temporary reference set. Pass a TemporaryReferenceSet to the options."
            );
          case REACT_LAZY_TYPE:
            parentReference = value._payload;
            var init2 = value._init;
            null === formData && (formData = new FormData());
            pendingParts++;
            try {
              var resolvedModel = init2(parentReference), lazyId = nextPartId++, partJSON = serializeModel(resolvedModel, lazyId);
              formData.append(formFieldPrefix + lazyId, partJSON);
              return "$" + lazyId.toString(16);
            } catch (x) {
              if ("object" === typeof x && null !== x && "function" === typeof x.then) {
                pendingParts++;
                var lazyId$23 = nextPartId++;
                parentReference = function() {
                  try {
                    var partJSON$24 = serializeModel(value, lazyId$23), data$25 = formData;
                    data$25.append(formFieldPrefix + lazyId$23, partJSON$24);
                    pendingParts--;
                    0 === pendingParts && resolve(data$25);
                  } catch (reason) {
                    reject(reason);
                  }
                };
                x.then(parentReference, parentReference);
                return "$" + lazyId$23.toString(16);
              }
              reject(x);
              return null;
            } finally {
              pendingParts--;
            }
        }
        parentReference = writtenObjects.get(value);
        if ("function" === typeof value.then) {
          if (void 0 !== parentReference)
            if (modelRoot === value) modelRoot = null;
            else return parentReference;
          null === formData && (formData = new FormData());
          pendingParts++;
          var promiseId = nextPartId++;
          key = "$@" + promiseId.toString(16);
          writtenObjects.set(value, key);
          value.then(function(partValue) {
            try {
              var previousReference = writtenObjects.get(partValue);
              var partJSON$27 = void 0 !== previousReference ? JSON.stringify(previousReference) : serializeModel(partValue, promiseId);
              partValue = formData;
              partValue.append(formFieldPrefix + promiseId, partJSON$27);
              pendingParts--;
              0 === pendingParts && resolve(partValue);
            } catch (reason) {
              reject(reason);
            }
          }, reject);
          return key;
        }
        if (void 0 !== parentReference)
          if (modelRoot === value) modelRoot = null;
          else return parentReference;
        else
          -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference && (key = parentReference + ":" + key, writtenObjects.set(value, key), void 0 !== temporaryReferences && temporaryReferences.set(key, value)));
        if (isArrayImpl(value)) return value;
        if (value instanceof FormData) {
          null === formData && (formData = new FormData());
          var data$31 = formData;
          key = nextPartId++;
          var prefix = formFieldPrefix + key + "_";
          value.forEach(function(originalValue, originalKey) {
            data$31.append(prefix + originalKey, originalValue);
          });
          return "$K" + key.toString(16);
        }
        if (value instanceof Map)
          return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$Q" + key.toString(16);
        if (value instanceof Set)
          return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$W" + key.toString(16);
        if (value instanceof ArrayBuffer)
          return key = new Blob([value]), parentReference = nextPartId++, null === formData && (formData = new FormData()), formData.append(formFieldPrefix + parentReference, key), "$A" + parentReference.toString(16);
        if (value instanceof Int8Array) return serializeTypedArray("O", value);
        if (value instanceof Uint8Array) return serializeTypedArray("o", value);
        if (value instanceof Uint8ClampedArray)
          return serializeTypedArray("U", value);
        if (value instanceof Int16Array) return serializeTypedArray("S", value);
        if (value instanceof Uint16Array) return serializeTypedArray("s", value);
        if (value instanceof Int32Array) return serializeTypedArray("L", value);
        if (value instanceof Uint32Array) return serializeTypedArray("l", value);
        if (value instanceof Float32Array) return serializeTypedArray("G", value);
        if (value instanceof Float64Array) return serializeTypedArray("g", value);
        if (value instanceof BigInt64Array)
          return serializeTypedArray("M", value);
        if (value instanceof BigUint64Array)
          return serializeTypedArray("m", value);
        if (value instanceof DataView) return serializeTypedArray("V", value);
        if ("function" === typeof Blob && value instanceof Blob)
          return null === formData && (formData = new FormData()), key = nextPartId++, formData.append(formFieldPrefix + key, value), "$B" + key.toString(16);
        if (key = getIteratorFn(value))
          return parentReference = key.call(value), parentReference === value ? (key = nextPartId++, parentReference = serializeModel(
            Array.from(parentReference),
            key
          ), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$i" + key.toString(16)) : Array.from(parentReference);
        if ("function" === typeof ReadableStream && value instanceof ReadableStream)
          return serializeReadableStream(value);
        key = value[ASYNC_ITERATOR];
        if ("function" === typeof key)
          return serializeAsyncIterable(value, key.call(value));
        key = getPrototypeOf(value);
        if (key !== ObjectPrototype && (null === key || null !== getPrototypeOf(key))) {
          if (void 0 === temporaryReferences)
            throw Error(
              "Only plain objects, and a few built-ins, can be passed to Server Functions. Classes or null prototypes are not supported."
            );
          return "$T";
        }
        return value;
      }
      if ("string" === typeof value) {
        if ("Z" === value[value.length - 1] && this[key] instanceof Date)
          return "$D" + value;
        key = "$" === value[0] ? "$" + value : value;
        return key;
      }
      if ("boolean" === typeof value) return value;
      if ("number" === typeof value) return serializeNumber(value);
      if ("undefined" === typeof value) return "$undefined";
      if ("function" === typeof value) {
        parentReference = knownServerReferences.get(value);
        if (void 0 !== parentReference) {
          key = writtenObjects.get(value);
          if (void 0 !== key) return key;
          key = JSON.stringify(
            { id: parentReference.id, bound: parentReference.bound },
            resolveToJSON
          );
          null === formData && (formData = new FormData());
          parentReference = nextPartId++;
          formData.set(formFieldPrefix + parentReference, key);
          key = "$h" + parentReference.toString(16);
          writtenObjects.set(value, key);
          return key;
        }
        if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference))
          return temporaryReferences.set(parentReference + ":" + key, value), "$T";
        throw Error(
          "Client Functions cannot be passed directly to Server Functions. Only Functions passed from the Server can be passed back again."
        );
      }
      if ("symbol" === typeof value) {
        if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference))
          return temporaryReferences.set(parentReference + ":" + key, value), "$T";
        throw Error(
          "Symbols cannot be passed to a Server Function without a temporary reference set. Pass a TemporaryReferenceSet to the options."
        );
      }
      if ("bigint" === typeof value) return "$n" + value.toString(10);
      throw Error(
        "Type " + typeof value + " is not supported as an argument to a Server Function."
      );
    }
    function serializeModel(model, id) {
      "object" === typeof model && null !== model && (id = "$" + id.toString(16), writtenObjects.set(model, id), void 0 !== temporaryReferences && temporaryReferences.set(id, model));
      modelRoot = model;
      return JSON.stringify(model, resolveToJSON);
    }
    var nextPartId = 1, pendingParts = 0, formData = null, writtenObjects = /* @__PURE__ */ new WeakMap(), modelRoot = root, json = serializeModel(root, 0);
    null === formData ? resolve(json) : (formData.set(formFieldPrefix + "0", json), 0 === pendingParts && resolve(formData));
    return function() {
      0 < pendingParts && (pendingParts = 0, null === formData ? resolve(json) : resolve(formData));
    };
  }
  var boundCache = /* @__PURE__ */ new WeakMap();
  function encodeFormData(reference) {
    var resolve, reject, thenable = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    processReply(
      reference,
      "",
      void 0,
      function(body) {
        if ("string" === typeof body) {
          var data = new FormData();
          data.append("0", body);
          body = data;
        }
        thenable.status = "fulfilled";
        thenable.value = body;
        resolve(body);
      },
      function(e) {
        thenable.status = "rejected";
        thenable.reason = e;
        reject(e);
      }
    );
    return thenable;
  }
  function defaultEncodeFormAction(identifierPrefix) {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure)
      throw Error(
        "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
      );
    var data = null;
    if (null !== referenceClosure.bound) {
      data = boundCache.get(referenceClosure);
      data || (data = encodeFormData({
        id: referenceClosure.id,
        bound: referenceClosure.bound
      }), boundCache.set(referenceClosure, data));
      if ("rejected" === data.status) throw data.reason;
      if ("fulfilled" !== data.status) throw data;
      referenceClosure = data.value;
      var prefixedData = new FormData();
      referenceClosure.forEach(function(value, key) {
        prefixedData.append("$ACTION_" + identifierPrefix + ":" + key, value);
      });
      data = prefixedData;
      referenceClosure = "$ACTION_REF_" + identifierPrefix;
    } else referenceClosure = "$ACTION_ID_" + referenceClosure.id;
    return {
      name: referenceClosure,
      method: "POST",
      encType: "multipart/form-data",
      data
    };
  }
  function isSignatureEqual(referenceId, numberOfBoundArgs) {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure)
      throw Error(
        "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
      );
    if (referenceClosure.id !== referenceId) return false;
    var boundPromise = referenceClosure.bound;
    if (null === boundPromise) return 0 === numberOfBoundArgs;
    switch (boundPromise.status) {
      case "fulfilled":
        return boundPromise.value.length === numberOfBoundArgs;
      case "pending":
        throw boundPromise;
      case "rejected":
        throw boundPromise.reason;
      default:
        throw "string" !== typeof boundPromise.status && (boundPromise.status = "pending", boundPromise.then(
          function(boundArgs) {
            boundPromise.status = "fulfilled";
            boundPromise.value = boundArgs;
          },
          function(error) {
            boundPromise.status = "rejected";
            boundPromise.reason = error;
          }
        )), boundPromise;
    }
  }
  function registerBoundServerReference(reference, id, bound, encodeFormAction) {
    knownServerReferences.has(reference) || (knownServerReferences.set(reference, {
      id,
      originalBind: reference.bind,
      bound
    }), Object.defineProperties(reference, {
      $$FORM_ACTION: {
        value: void 0 === encodeFormAction ? defaultEncodeFormAction : function() {
          var referenceClosure = knownServerReferences.get(this);
          if (!referenceClosure)
            throw Error(
              "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
            );
          var boundPromise = referenceClosure.bound;
          null === boundPromise && (boundPromise = Promise.resolve([]));
          return encodeFormAction(referenceClosure.id, boundPromise);
        }
      },
      $$IS_SIGNATURE_EQUAL: { value: isSignatureEqual },
      bind: { value: bind }
    }));
  }
  var FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice;
  function bind() {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure) return FunctionBind.apply(this, arguments);
    var newFn = referenceClosure.originalBind.apply(this, arguments), args = ArraySlice.call(arguments, 1), boundPromise = null;
    boundPromise = null !== referenceClosure.bound ? Promise.resolve(referenceClosure.bound).then(function(boundArgs) {
      return boundArgs.concat(args);
    }) : Promise.resolve(args);
    knownServerReferences.set(newFn, {
      id: referenceClosure.id,
      originalBind: newFn.bind,
      bound: boundPromise
    });
    Object.defineProperties(newFn, {
      $$FORM_ACTION: { value: this.$$FORM_ACTION },
      $$IS_SIGNATURE_EQUAL: { value: isSignatureEqual },
      bind: { value: bind }
    });
    return newFn;
  }
  function createBoundServerReference(metaData, callServer, encodeFormAction) {
    function action() {
      var args = Array.prototype.slice.call(arguments);
      return bound ? "fulfilled" === bound.status ? callServer(id, bound.value.concat(args)) : Promise.resolve(bound).then(function(boundArgs) {
        return callServer(id, boundArgs.concat(args));
      }) : callServer(id, args);
    }
    var id = metaData.id, bound = metaData.bound;
    registerBoundServerReference(action, id, bound, encodeFormAction);
    return action;
  }
  function createServerReference$1(id, callServer, encodeFormAction) {
    function action() {
      var args = Array.prototype.slice.call(arguments);
      return callServer(id, args);
    }
    registerBoundServerReference(action, id, null, encodeFormAction);
    return action;
  }
  function ReactPromise(status, value, reason) {
    this.status = status;
    this.value = value;
    this.reason = reason;
  }
  ReactPromise.prototype = Object.create(Promise.prototype);
  ReactPromise.prototype.then = function(resolve, reject) {
    switch (this.status) {
      case "resolved_model":
        initializeModelChunk(this);
        break;
      case "resolved_module":
        initializeModuleChunk(this);
    }
    switch (this.status) {
      case "fulfilled":
        "function" === typeof resolve && resolve(this.value);
        break;
      case "pending":
      case "blocked":
        "function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
        "function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
        break;
      case "halted":
        break;
      default:
        "function" === typeof reject && reject(this.reason);
    }
  };
  function readChunk(chunk) {
    switch (chunk.status) {
      case "resolved_model":
        initializeModelChunk(chunk);
        break;
      case "resolved_module":
        initializeModuleChunk(chunk);
    }
    switch (chunk.status) {
      case "fulfilled":
        return chunk.value;
      case "pending":
      case "blocked":
      case "halted":
        throw chunk;
      default:
        throw chunk.reason;
    }
  }
  function wakeChunk(listeners, value, chunk) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      "function" === typeof listener ? listener(value) : fulfillReference(listener, value);
    }
  }
  function rejectChunk(listeners, error) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      "function" === typeof listener ? listener(error) : rejectReference(listener, error);
    }
  }
  function resolveBlockedCycle(resolvedChunk, reference) {
    var referencedChunk = reference.handler.chunk;
    if (null === referencedChunk) return null;
    if (referencedChunk === resolvedChunk) return reference.handler;
    reference = referencedChunk.value;
    if (null !== reference)
      for (referencedChunk = 0; referencedChunk < reference.length; referencedChunk++) {
        var listener = reference[referencedChunk];
        if ("function" !== typeof listener && (listener = resolveBlockedCycle(resolvedChunk, listener), null !== listener))
          return listener;
      }
    return null;
  }
  function wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners) {
    switch (chunk.status) {
      case "fulfilled":
        wakeChunk(resolveListeners, chunk.value);
        break;
      case "blocked":
        for (var i = 0; i < resolveListeners.length; i++) {
          var listener = resolveListeners[i];
          if ("function" !== typeof listener) {
            var cyclicHandler = resolveBlockedCycle(chunk, listener);
            if (null !== cyclicHandler)
              switch (fulfillReference(listener, cyclicHandler.value), resolveListeners.splice(i, 1), i--, null !== rejectListeners && (listener = rejectListeners.indexOf(listener), -1 !== listener && rejectListeners.splice(listener, 1)), chunk.status) {
                case "fulfilled":
                  wakeChunk(resolveListeners, chunk.value);
                  return;
                case "rejected":
                  null !== rejectListeners && rejectChunk(rejectListeners, chunk.reason);
                  return;
              }
          }
        }
      case "pending":
        if (chunk.value)
          for (i = 0; i < resolveListeners.length; i++)
            chunk.value.push(resolveListeners[i]);
        else chunk.value = resolveListeners;
        if (chunk.reason) {
          if (rejectListeners)
            for (resolveListeners = 0; resolveListeners < rejectListeners.length; resolveListeners++)
              chunk.reason.push(rejectListeners[resolveListeners]);
        } else chunk.reason = rejectListeners;
        break;
      case "rejected":
        rejectListeners && rejectChunk(rejectListeners, chunk.reason);
    }
  }
  function triggerErrorOnChunk(response, chunk, error) {
    "pending" !== chunk.status && "blocked" !== chunk.status ? chunk.reason.error(error) : (response = chunk.reason, chunk.status = "rejected", chunk.reason = error, null !== response && rejectChunk(response, error));
  }
  function createResolvedIteratorResultChunk(response, value, done) {
    return new ReactPromise(
      "resolved_model",
      (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}",
      response
    );
  }
  function resolveIteratorResultChunk(response, chunk, value, done) {
    resolveModelChunk(
      response,
      chunk,
      (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}"
    );
  }
  function resolveModelChunk(response, chunk, value) {
    if ("pending" !== chunk.status) chunk.reason.enqueueModel(value);
    else {
      var resolveListeners = chunk.value, rejectListeners = chunk.reason;
      chunk.status = "resolved_model";
      chunk.value = value;
      chunk.reason = response;
      null !== resolveListeners && (initializeModelChunk(chunk), wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners));
    }
  }
  function resolveModuleChunk(response, chunk, value) {
    if ("pending" === chunk.status || "blocked" === chunk.status) {
      response = chunk.value;
      var rejectListeners = chunk.reason;
      chunk.status = "resolved_module";
      chunk.value = value;
      chunk.reason = null;
      null !== response && (initializeModuleChunk(chunk), wakeChunkIfInitialized(chunk, response, rejectListeners));
    }
  }
  var initializingHandler = null;
  function initializeModelChunk(chunk) {
    var prevHandler = initializingHandler;
    initializingHandler = null;
    var resolvedModel = chunk.value, response = chunk.reason;
    chunk.status = "blocked";
    chunk.value = null;
    chunk.reason = null;
    try {
      var value = JSON.parse(resolvedModel, response._fromJSON), resolveListeners = chunk.value;
      if (null !== resolveListeners)
        for (chunk.value = null, chunk.reason = null, resolvedModel = 0; resolvedModel < resolveListeners.length; resolvedModel++) {
          var listener = resolveListeners[resolvedModel];
          "function" === typeof listener ? listener(value) : fulfillReference(listener, value, chunk);
        }
      if (null !== initializingHandler) {
        if (initializingHandler.errored) throw initializingHandler.reason;
        if (0 < initializingHandler.deps) {
          initializingHandler.value = value;
          initializingHandler.chunk = chunk;
          return;
        }
      }
      chunk.status = "fulfilled";
      chunk.value = value;
    } catch (error) {
      chunk.status = "rejected", chunk.reason = error;
    } finally {
      initializingHandler = prevHandler;
    }
  }
  function initializeModuleChunk(chunk) {
    try {
      var value = requireModule2(chunk.value);
      chunk.status = "fulfilled";
      chunk.value = value;
    } catch (error) {
      chunk.status = "rejected", chunk.reason = error;
    }
  }
  function reportGlobalError(weakResponse, error) {
    weakResponse._closed = true;
    weakResponse._closedReason = error;
    weakResponse._chunks.forEach(function(chunk) {
      "pending" === chunk.status ? triggerErrorOnChunk(weakResponse, chunk, error) : "fulfilled" === chunk.status && null !== chunk.reason && chunk.reason.error(error);
    });
  }
  function createLazyChunkWrapper(chunk) {
    return { $$typeof: REACT_LAZY_TYPE, _payload: chunk, _init: readChunk };
  }
  function getChunk(response, id) {
    var chunks = response._chunks, chunk = chunks.get(id);
    chunk || (chunk = response._closed ? new ReactPromise("rejected", null, response._closedReason) : new ReactPromise("pending", null, null), chunks.set(id, chunk));
    return chunk;
  }
  function fulfillReference(reference, value) {
    var response = reference.response, handler2 = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
    try {
      for (var i = 1; i < path.length; i++) {
        for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
          var referencedChunk = value._payload;
          if (referencedChunk === handler2.chunk) value = handler2.value;
          else {
            switch (referencedChunk.status) {
              case "resolved_model":
                initializeModelChunk(referencedChunk);
                break;
              case "resolved_module":
                initializeModuleChunk(referencedChunk);
            }
            switch (referencedChunk.status) {
              case "fulfilled":
                value = referencedChunk.value;
                continue;
              case "blocked":
                var cyclicHandler = resolveBlockedCycle(
                  referencedChunk,
                  reference
                );
                if (null !== cyclicHandler) {
                  value = cyclicHandler.value;
                  continue;
                }
              case "pending":
                path.splice(0, i - 1);
                null === referencedChunk.value ? referencedChunk.value = [reference] : referencedChunk.value.push(reference);
                null === referencedChunk.reason ? referencedChunk.reason = [reference] : referencedChunk.reason.push(reference);
                return;
              case "halted":
                return;
              default:
                rejectReference(reference, referencedChunk.reason);
                return;
            }
          }
        }
        var name = path[i];
        if ("object" === typeof value && null !== value && hasOwnProperty.call(value, name))
          value = value[name];
        else throw Error("Invalid reference.");
      }
      for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
        var referencedChunk$44 = value._payload;
        if (referencedChunk$44 === handler2.chunk) value = handler2.value;
        else {
          switch (referencedChunk$44.status) {
            case "resolved_model":
              initializeModelChunk(referencedChunk$44);
              break;
            case "resolved_module":
              initializeModuleChunk(referencedChunk$44);
          }
          switch (referencedChunk$44.status) {
            case "fulfilled":
              value = referencedChunk$44.value;
              continue;
          }
          break;
        }
      }
      var mappedValue = map(response, value, parentObject, key);
      "__proto__" !== key && (parentObject[key] = mappedValue);
      "" === key && null === handler2.value && (handler2.value = mappedValue);
      if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === typeof handler2.value && null !== handler2.value && handler2.value.$$typeof === REACT_ELEMENT_TYPE) {
        var element = handler2.value;
        switch (key) {
          case "3":
            element.props = mappedValue;
        }
      }
    } catch (error) {
      rejectReference(reference, error);
      return;
    }
    handler2.deps--;
    0 === handler2.deps && (reference = handler2.chunk, null !== reference && "blocked" === reference.status && (value = reference.value, reference.status = "fulfilled", reference.value = handler2.value, reference.reason = handler2.reason, null !== value && wakeChunk(value, handler2.value)));
  }
  function rejectReference(reference, error) {
    var handler2 = reference.handler;
    reference = reference.response;
    handler2.errored || (handler2.errored = true, handler2.value = null, handler2.reason = error, handler2 = handler2.chunk, null !== handler2 && "blocked" === handler2.status && triggerErrorOnChunk(reference, handler2, error));
  }
  function waitForReference(referencedChunk, parentObject, key, response, map, path) {
    if (initializingHandler) {
      var handler2 = initializingHandler;
      handler2.deps++;
    } else
      handler2 = initializingHandler = {
        parent: null,
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: false
      };
    parentObject = {
      response,
      handler: handler2,
      parentObject,
      key,
      map,
      path
    };
    null === referencedChunk.value ? referencedChunk.value = [parentObject] : referencedChunk.value.push(parentObject);
    null === referencedChunk.reason ? referencedChunk.reason = [parentObject] : referencedChunk.reason.push(parentObject);
    return null;
  }
  function loadServerReference(response, metaData, parentObject, key) {
    if (!response._serverReferenceConfig)
      return createBoundServerReference(
        metaData,
        response._callServer,
        response._encodeFormAction
      );
    var serverReference = resolveServerReference(
      response._serverReferenceConfig,
      metaData.id
    ), promise = preloadModule(serverReference);
    if (promise)
      metaData.bound && (promise = Promise.all([promise, metaData.bound]));
    else if (metaData.bound) promise = Promise.resolve(metaData.bound);
    else
      return promise = requireModule2(serverReference), registerBoundServerReference(
        promise,
        metaData.id,
        metaData.bound,
        response._encodeFormAction
      ), promise;
    if (initializingHandler) {
      var handler2 = initializingHandler;
      handler2.deps++;
    } else
      handler2 = initializingHandler = {
        parent: null,
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: false
      };
    promise.then(
      function() {
        var resolvedValue = requireModule2(serverReference);
        if (metaData.bound) {
          var boundArgs = metaData.bound.value.slice(0);
          boundArgs.unshift(null);
          resolvedValue = resolvedValue.bind.apply(resolvedValue, boundArgs);
        }
        registerBoundServerReference(
          resolvedValue,
          metaData.id,
          metaData.bound,
          response._encodeFormAction
        );
        "__proto__" !== key && (parentObject[key] = resolvedValue);
        "" === key && null === handler2.value && (handler2.value = resolvedValue);
        if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === typeof handler2.value && null !== handler2.value && handler2.value.$$typeof === REACT_ELEMENT_TYPE)
          switch (boundArgs = handler2.value, key) {
            case "3":
              boundArgs.props = resolvedValue;
          }
        handler2.deps--;
        0 === handler2.deps && (resolvedValue = handler2.chunk, null !== resolvedValue && "blocked" === resolvedValue.status && (boundArgs = resolvedValue.value, resolvedValue.status = "fulfilled", resolvedValue.value = handler2.value, resolvedValue.reason = null, null !== boundArgs && wakeChunk(boundArgs, handler2.value)));
      },
      function(error) {
        if (!handler2.errored) {
          handler2.errored = true;
          handler2.value = null;
          handler2.reason = error;
          var chunk = handler2.chunk;
          null !== chunk && "blocked" === chunk.status && triggerErrorOnChunk(response, chunk, error);
        }
      }
    );
    return null;
  }
  function getOutlinedModel(response, reference, parentObject, key, map) {
    reference = reference.split(":");
    var id = parseInt(reference[0], 16);
    id = getChunk(response, id);
    switch (id.status) {
      case "resolved_model":
        initializeModelChunk(id);
        break;
      case "resolved_module":
        initializeModuleChunk(id);
    }
    switch (id.status) {
      case "fulfilled":
        id = id.value;
        for (var i = 1; i < reference.length; i++) {
          for (; "object" === typeof id && null !== id && id.$$typeof === REACT_LAZY_TYPE; ) {
            id = id._payload;
            switch (id.status) {
              case "resolved_model":
                initializeModelChunk(id);
                break;
              case "resolved_module":
                initializeModuleChunk(id);
            }
            switch (id.status) {
              case "fulfilled":
                id = id.value;
                break;
              case "blocked":
              case "pending":
                return waitForReference(
                  id,
                  parentObject,
                  key,
                  response,
                  map,
                  reference.slice(i - 1)
                );
              case "halted":
                return initializingHandler ? (response = initializingHandler, response.deps++) : initializingHandler = {
                  parent: null,
                  chunk: null,
                  value: null,
                  reason: null,
                  deps: 1,
                  errored: false
                }, null;
              default:
                return initializingHandler ? (initializingHandler.errored = true, initializingHandler.value = null, initializingHandler.reason = id.reason) : initializingHandler = {
                  parent: null,
                  chunk: null,
                  value: null,
                  reason: id.reason,
                  deps: 0,
                  errored: true
                }, null;
            }
          }
          id = id[reference[i]];
        }
        for (; "object" === typeof id && null !== id && id.$$typeof === REACT_LAZY_TYPE; ) {
          reference = id._payload;
          switch (reference.status) {
            case "resolved_model":
              initializeModelChunk(reference);
              break;
            case "resolved_module":
              initializeModuleChunk(reference);
          }
          switch (reference.status) {
            case "fulfilled":
              id = reference.value;
              continue;
          }
          break;
        }
        return map(response, id, parentObject, key);
      case "pending":
      case "blocked":
        return waitForReference(id, parentObject, key, response, map, reference);
      case "halted":
        return initializingHandler ? (response = initializingHandler, response.deps++) : initializingHandler = {
          parent: null,
          chunk: null,
          value: null,
          reason: null,
          deps: 1,
          errored: false
        }, null;
      default:
        return initializingHandler ? (initializingHandler.errored = true, initializingHandler.value = null, initializingHandler.reason = id.reason) : initializingHandler = {
          parent: null,
          chunk: null,
          value: null,
          reason: id.reason,
          deps: 0,
          errored: true
        }, null;
    }
  }
  function createMap(response, model) {
    return new Map(model);
  }
  function createSet(response, model) {
    return new Set(model);
  }
  function createBlob(response, model) {
    return new Blob(model.slice(1), { type: model[0] });
  }
  function createFormData(response, model) {
    response = new FormData();
    for (var i = 0; i < model.length; i++)
      response.append(model[i][0], model[i][1]);
    return response;
  }
  function extractIterator(response, model) {
    return model[Symbol.iterator]();
  }
  function createModel(response, model) {
    return model;
  }
  function parseModelString(response, parentObject, key, value) {
    if ("$" === value[0]) {
      if ("$" === value)
        return null !== initializingHandler && "0" === key && (initializingHandler = {
          parent: initializingHandler,
          chunk: null,
          value: null,
          reason: null,
          deps: 0,
          errored: false
        }), REACT_ELEMENT_TYPE;
      switch (value[1]) {
        case "$":
          return value.slice(1);
        case "L":
          return parentObject = parseInt(value.slice(2), 16), response = getChunk(response, parentObject), createLazyChunkWrapper(response);
        case "@":
          return parentObject = parseInt(value.slice(2), 16), getChunk(response, parentObject);
        case "S":
          return Symbol.for(value.slice(2));
        case "h":
          return value = value.slice(2), getOutlinedModel(
            response,
            value,
            parentObject,
            key,
            loadServerReference
          );
        case "T":
          parentObject = "$" + value.slice(2);
          response = response._tempRefs;
          if (null == response)
            throw Error(
              "Missing a temporary reference set but the RSC response returned a temporary reference. Pass a temporaryReference option with the set that was used with the reply."
            );
          return response.get(parentObject);
        case "Q":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createMap);
        case "W":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createSet);
        case "B":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createBlob);
        case "K":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createFormData);
        case "Z":
          return resolveErrorProd();
        case "i":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, extractIterator);
        case "I":
          return Infinity;
        case "-":
          return "$-0" === value ? -0 : -Infinity;
        case "N":
          return NaN;
        case "u":
          return;
        case "D":
          return new Date(Date.parse(value.slice(2)));
        case "n":
          return BigInt(value.slice(2));
        default:
          return value = value.slice(1), getOutlinedModel(response, value, parentObject, key, createModel);
      }
    }
    return value;
  }
  function missingCall() {
    throw Error(
      'Trying to call a function from "use server" but the callServer option was not implemented in your router runtime.'
    );
  }
  function ResponseInstance(bundlerConfig, serverReferenceConfig, moduleLoading, callServer, encodeFormAction, nonce, temporaryReferences) {
    var chunks = /* @__PURE__ */ new Map();
    this._bundlerConfig = bundlerConfig;
    this._serverReferenceConfig = serverReferenceConfig;
    this._moduleLoading = moduleLoading;
    this._callServer = void 0 !== callServer ? callServer : missingCall;
    this._encodeFormAction = encodeFormAction;
    this._nonce = nonce;
    this._chunks = chunks;
    this._stringDecoder = new TextDecoder();
    this._fromJSON = null;
    this._closed = false;
    this._closedReason = null;
    this._tempRefs = temporaryReferences;
    this._fromJSON = createFromJSONCallback(this);
  }
  function resolveBuffer(response, id, buffer) {
    response = response._chunks;
    var chunk = response.get(id);
    chunk && "pending" !== chunk.status ? chunk.reason.enqueueValue(buffer) : (buffer = new ReactPromise("fulfilled", buffer, null), response.set(id, buffer));
  }
  function resolveModule(response, id, model) {
    var chunks = response._chunks, chunk = chunks.get(id);
    model = JSON.parse(model, response._fromJSON);
    var clientReference = resolveClientReference(response._bundlerConfig, model);
    prepareDestinationWithChunks(
      response._moduleLoading,
      model[1],
      response._nonce
    );
    if (model = preloadModule(clientReference)) {
      if (chunk) {
        var blockedChunk = chunk;
        blockedChunk.status = "blocked";
      } else
        blockedChunk = new ReactPromise("blocked", null, null), chunks.set(id, blockedChunk);
      model.then(
        function() {
          return resolveModuleChunk(response, blockedChunk, clientReference);
        },
        function(error) {
          return triggerErrorOnChunk(response, blockedChunk, error);
        }
      );
    } else
      chunk ? resolveModuleChunk(response, chunk, clientReference) : (chunk = new ReactPromise("resolved_module", clientReference, null), chunks.set(id, chunk));
  }
  function resolveStream(response, id, stream, controller) {
    response = response._chunks;
    var chunk = response.get(id);
    chunk ? "pending" === chunk.status && (id = chunk.value, chunk.status = "fulfilled", chunk.value = stream, chunk.reason = controller, null !== id && wakeChunk(id, chunk.value)) : (stream = new ReactPromise("fulfilled", stream, controller), response.set(id, stream));
  }
  function startReadableStream(response, id, type) {
    var controller = null, closed = false;
    type = new ReadableStream({
      type,
      start: function(c) {
        controller = c;
      }
    });
    var previousBlockedChunk = null;
    resolveStream(response, id, type, {
      enqueueValue: function(value) {
        null === previousBlockedChunk ? controller.enqueue(value) : previousBlockedChunk.then(function() {
          controller.enqueue(value);
        });
      },
      enqueueModel: function(json) {
        if (null === previousBlockedChunk) {
          var chunk = new ReactPromise("resolved_model", json, response);
          initializeModelChunk(chunk);
          "fulfilled" === chunk.status ? controller.enqueue(chunk.value) : (chunk.then(
            function(v) {
              return controller.enqueue(v);
            },
            function(e) {
              return controller.error(e);
            }
          ), previousBlockedChunk = chunk);
        } else {
          chunk = previousBlockedChunk;
          var chunk$55 = new ReactPromise("pending", null, null);
          chunk$55.then(
            function(v) {
              return controller.enqueue(v);
            },
            function(e) {
              return controller.error(e);
            }
          );
          previousBlockedChunk = chunk$55;
          chunk.then(function() {
            previousBlockedChunk === chunk$55 && (previousBlockedChunk = null);
            resolveModelChunk(response, chunk$55, json);
          });
        }
      },
      close: function() {
        if (!closed)
          if (closed = true, null === previousBlockedChunk) controller.close();
          else {
            var blockedChunk = previousBlockedChunk;
            previousBlockedChunk = null;
            blockedChunk.then(function() {
              return controller.close();
            });
          }
      },
      error: function(error) {
        if (!closed)
          if (closed = true, null === previousBlockedChunk)
            controller.error(error);
          else {
            var blockedChunk = previousBlockedChunk;
            previousBlockedChunk = null;
            blockedChunk.then(function() {
              return controller.error(error);
            });
          }
      }
    });
  }
  function asyncIterator() {
    return this;
  }
  function createIterator(next) {
    next = { next };
    next[ASYNC_ITERATOR] = asyncIterator;
    return next;
  }
  function startAsyncIterable(response, id, iterator) {
    var buffer = [], closed = false, nextWriteIndex = 0, iterable = {};
    iterable[ASYNC_ITERATOR] = function() {
      var nextReadIndex = 0;
      return createIterator(function(arg) {
        if (void 0 !== arg)
          throw Error(
            "Values cannot be passed to next() of AsyncIterables passed to Client Components."
          );
        if (nextReadIndex === buffer.length) {
          if (closed)
            return new ReactPromise(
              "fulfilled",
              { done: true, value: void 0 },
              null
            );
          buffer[nextReadIndex] = new ReactPromise("pending", null, null);
        }
        return buffer[nextReadIndex++];
      });
    };
    resolveStream(
      response,
      id,
      iterator ? iterable[ASYNC_ITERATOR]() : iterable,
      {
        enqueueValue: function(value) {
          if (nextWriteIndex === buffer.length)
            buffer[nextWriteIndex] = new ReactPromise(
              "fulfilled",
              { done: false, value },
              null
            );
          else {
            var chunk = buffer[nextWriteIndex], resolveListeners = chunk.value, rejectListeners = chunk.reason;
            chunk.status = "fulfilled";
            chunk.value = { done: false, value };
            chunk.reason = null;
            null !== resolveListeners && wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners);
          }
          nextWriteIndex++;
        },
        enqueueModel: function(value) {
          nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
            response,
            value,
            false
          ) : resolveIteratorResultChunk(
            response,
            buffer[nextWriteIndex],
            value,
            false
          );
          nextWriteIndex++;
        },
        close: function(value) {
          if (!closed)
            for (closed = true, nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
              response,
              value,
              true
            ) : resolveIteratorResultChunk(
              response,
              buffer[nextWriteIndex],
              value,
              true
            ), nextWriteIndex++; nextWriteIndex < buffer.length; )
              resolveIteratorResultChunk(
                response,
                buffer[nextWriteIndex++],
                '"$undefined"',
                true
              );
        },
        error: function(error) {
          if (!closed)
            for (closed = true, nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = new ReactPromise(
              "pending",
              null,
              null
            )); nextWriteIndex < buffer.length; )
              triggerErrorOnChunk(response, buffer[nextWriteIndex++], error);
        }
      }
    );
  }
  function resolveErrorProd() {
    var error = Error(
      "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error."
    );
    error.stack = "Error: " + error.message;
    return error;
  }
  function mergeBuffer(buffer, lastChunk) {
    for (var l = buffer.length, byteLength = lastChunk.length, i = 0; i < l; i++)
      byteLength += buffer[i].byteLength;
    byteLength = new Uint8Array(byteLength);
    for (var i$56 = i = 0; i$56 < l; i$56++) {
      var chunk = buffer[i$56];
      byteLength.set(chunk, i);
      i += chunk.byteLength;
    }
    byteLength.set(lastChunk, i);
    return byteLength;
  }
  function resolveTypedArray(response, id, buffer, lastChunk, constructor, bytesPerElement) {
    buffer = 0 === buffer.length && 0 === lastChunk.byteOffset % bytesPerElement ? lastChunk : mergeBuffer(buffer, lastChunk);
    constructor = new constructor(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength / bytesPerElement
    );
    resolveBuffer(response, id, constructor);
  }
  function processFullBinaryRow(response, streamState, id, tag, buffer, chunk) {
    switch (tag) {
      case 65:
        resolveBuffer(response, id, mergeBuffer(buffer, chunk).buffer);
        return;
      case 79:
        resolveTypedArray(response, id, buffer, chunk, Int8Array, 1);
        return;
      case 111:
        resolveBuffer(
          response,
          id,
          0 === buffer.length ? chunk : mergeBuffer(buffer, chunk)
        );
        return;
      case 85:
        resolveTypedArray(response, id, buffer, chunk, Uint8ClampedArray, 1);
        return;
      case 83:
        resolveTypedArray(response, id, buffer, chunk, Int16Array, 2);
        return;
      case 115:
        resolveTypedArray(response, id, buffer, chunk, Uint16Array, 2);
        return;
      case 76:
        resolveTypedArray(response, id, buffer, chunk, Int32Array, 4);
        return;
      case 108:
        resolveTypedArray(response, id, buffer, chunk, Uint32Array, 4);
        return;
      case 71:
        resolveTypedArray(response, id, buffer, chunk, Float32Array, 4);
        return;
      case 103:
        resolveTypedArray(response, id, buffer, chunk, Float64Array, 8);
        return;
      case 77:
        resolveTypedArray(response, id, buffer, chunk, BigInt64Array, 8);
        return;
      case 109:
        resolveTypedArray(response, id, buffer, chunk, BigUint64Array, 8);
        return;
      case 86:
        resolveTypedArray(response, id, buffer, chunk, DataView, 1);
        return;
    }
    streamState = response._stringDecoder;
    for (var row = "", i = 0; i < buffer.length; i++)
      row += streamState.decode(buffer[i], decoderOptions);
    buffer = row += streamState.decode(chunk);
    switch (tag) {
      case 73:
        resolveModule(response, id, buffer);
        break;
      case 72:
        id = buffer[0];
        buffer = buffer.slice(1);
        response = JSON.parse(buffer, response._fromJSON);
        buffer = ReactDOMSharedInternals.d;
        switch (id) {
          case "D":
            buffer.D(response);
            break;
          case "C":
            "string" === typeof response ? buffer.C(response) : buffer.C(response[0], response[1]);
            break;
          case "L":
            id = response[0];
            tag = response[1];
            3 === response.length ? buffer.L(id, tag, response[2]) : buffer.L(id, tag);
            break;
          case "m":
            "string" === typeof response ? buffer.m(response) : buffer.m(response[0], response[1]);
            break;
          case "X":
            "string" === typeof response ? buffer.X(response) : buffer.X(response[0], response[1]);
            break;
          case "S":
            "string" === typeof response ? buffer.S(response) : buffer.S(
              response[0],
              0 === response[1] ? void 0 : response[1],
              3 === response.length ? response[2] : void 0
            );
            break;
          case "M":
            "string" === typeof response ? buffer.M(response) : buffer.M(response[0], response[1]);
        }
        break;
      case 69:
        tag = response._chunks;
        chunk = tag.get(id);
        buffer = JSON.parse(buffer);
        streamState = resolveErrorProd();
        streamState.digest = buffer.digest;
        chunk ? triggerErrorOnChunk(response, chunk, streamState) : (response = new ReactPromise("rejected", null, streamState), tag.set(id, response));
        break;
      case 84:
        response = response._chunks;
        (tag = response.get(id)) && "pending" !== tag.status ? tag.reason.enqueueValue(buffer) : (buffer = new ReactPromise("fulfilled", buffer, null), response.set(id, buffer));
        break;
      case 78:
      case 68:
      case 74:
      case 87:
        throw Error(
          "Failed to read a RSC payload created by a development version of React on the server while using a production version on the client. Always use matching versions on the server and the client."
        );
      case 82:
        startReadableStream(response, id, void 0);
        break;
      case 114:
        startReadableStream(response, id, "bytes");
        break;
      case 88:
        startAsyncIterable(response, id, false);
        break;
      case 120:
        startAsyncIterable(response, id, true);
        break;
      case 67:
        (id = response._chunks.get(id)) && "fulfilled" === id.status && id.reason.close("" === buffer ? '"$undefined"' : buffer);
        break;
      default:
        tag = response._chunks, (chunk = tag.get(id)) ? resolveModelChunk(response, chunk, buffer) : (response = new ReactPromise("resolved_model", buffer, response), tag.set(id, response));
    }
  }
  function createFromJSONCallback(response) {
    return function(key, value) {
      if ("__proto__" !== key) {
        if ("string" === typeof value)
          return parseModelString(response, this, key, value);
        if ("object" === typeof value && null !== value) {
          if (value[0] === REACT_ELEMENT_TYPE) {
            if (key = {
              $$typeof: REACT_ELEMENT_TYPE,
              type: value[1],
              key: value[2],
              ref: null,
              props: value[3]
            }, null !== initializingHandler) {
              if (value = initializingHandler, initializingHandler = value.parent, value.errored)
                key = new ReactPromise("rejected", null, value.reason), key = createLazyChunkWrapper(key);
              else if (0 < value.deps) {
                var blockedChunk = new ReactPromise("blocked", null, null);
                value.value = key;
                value.chunk = blockedChunk;
                key = createLazyChunkWrapper(blockedChunk);
              }
            }
          } else key = value;
          return key;
        }
        return value;
      }
    };
  }
  function close(weakResponse) {
    reportGlobalError(weakResponse, Error("Connection closed."));
  }
  function noServerCall() {
    throw Error(
      "Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead."
    );
  }
  function createResponseFromOptions(options) {
    return new ResponseInstance(
      options.serverConsumerManifest.moduleMap,
      options.serverConsumerManifest.serverModuleMap,
      options.serverConsumerManifest.moduleLoading,
      noServerCall,
      options.encodeFormAction,
      "string" === typeof options.nonce ? options.nonce : void 0,
      options && options.temporaryReferences ? options.temporaryReferences : void 0
    );
  }
  function startReadingFromStream(response, stream, onDone) {
    function progress(_ref) {
      var value = _ref.value;
      if (_ref.done) return onDone();
      var i = 0, rowState = streamState._rowState;
      _ref = streamState._rowID;
      for (var rowTag = streamState._rowTag, rowLength = streamState._rowLength, buffer = streamState._buffer, chunkLength = value.length; i < chunkLength; ) {
        var lastIdx = -1;
        switch (rowState) {
          case 0:
            lastIdx = value[i++];
            58 === lastIdx ? rowState = 1 : _ref = _ref << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
            continue;
          case 1:
            rowState = value[i];
            84 === rowState || 65 === rowState || 79 === rowState || 111 === rowState || 85 === rowState || 83 === rowState || 115 === rowState || 76 === rowState || 108 === rowState || 71 === rowState || 103 === rowState || 77 === rowState || 109 === rowState || 86 === rowState ? (rowTag = rowState, rowState = 2, i++) : 64 < rowState && 91 > rowState || 35 === rowState || 114 === rowState || 120 === rowState ? (rowTag = rowState, rowState = 3, i++) : (rowTag = 0, rowState = 3);
            continue;
          case 2:
            lastIdx = value[i++];
            44 === lastIdx ? rowState = 4 : rowLength = rowLength << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
            continue;
          case 3:
            lastIdx = value.indexOf(10, i);
            break;
          case 4:
            lastIdx = i + rowLength, lastIdx > value.length && (lastIdx = -1);
        }
        var offset = value.byteOffset + i;
        if (-1 < lastIdx)
          rowLength = new Uint8Array(value.buffer, offset, lastIdx - i), processFullBinaryRow(
            response,
            streamState,
            _ref,
            rowTag,
            buffer,
            rowLength
          ), i = lastIdx, 3 === rowState && i++, rowLength = _ref = rowTag = rowState = 0, buffer.length = 0;
        else {
          value = new Uint8Array(value.buffer, offset, value.byteLength - i);
          buffer.push(value);
          rowLength -= value.byteLength;
          break;
        }
      }
      streamState._rowState = rowState;
      streamState._rowID = _ref;
      streamState._rowTag = rowTag;
      streamState._rowLength = rowLength;
      return reader.read().then(progress).catch(error);
    }
    function error(e) {
      reportGlobalError(response, e);
    }
    var streamState = {
      _rowState: 0,
      _rowID: 0,
      _rowTag: 0,
      _rowLength: 0,
      _buffer: []
    }, reader = stream.getReader();
    reader.read().then(progress).catch(error);
  }
  reactServerDomWebpackClient_edge_production.createFromFetch = function(promiseForResponse, options) {
    var response = createResponseFromOptions(options);
    promiseForResponse.then(
      function(r) {
        startReadingFromStream(response, r.body, close.bind(null, response));
      },
      function(e) {
        reportGlobalError(response, e);
      }
    );
    return getChunk(response, 0);
  };
  reactServerDomWebpackClient_edge_production.createFromReadableStream = function(stream, options) {
    options = createResponseFromOptions(options);
    startReadingFromStream(options, stream, close.bind(null, options));
    return getChunk(options, 0);
  };
  reactServerDomWebpackClient_edge_production.createServerReference = function(id) {
    return createServerReference$1(id, noServerCall);
  };
  reactServerDomWebpackClient_edge_production.createTemporaryReferenceSet = function() {
    return /* @__PURE__ */ new Map();
  };
  reactServerDomWebpackClient_edge_production.encodeReply = function(value, options) {
    return new Promise(function(resolve, reject) {
      var abort = processReply(
        value,
        "",
        options && options.temporaryReferences ? options.temporaryReferences : void 0,
        resolve,
        reject
      );
      if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(signal.reason);
        else {
          var listener = function() {
            abort(signal.reason);
            signal.removeEventListener("abort", listener);
          };
          signal.addEventListener("abort", listener);
        }
      }
    });
  };
  reactServerDomWebpackClient_edge_production.registerServerReference = function(reference, id, encodeFormAction) {
    registerBoundServerReference(reference, id, null, encodeFormAction);
    return reference;
  };
  return reactServerDomWebpackClient_edge_production;
}
var hasRequiredClient_edge;
function requireClient_edge() {
  if (hasRequiredClient_edge) return client_edge.exports;
  hasRequiredClient_edge = 1;
  {
    client_edge.exports = requireReactServerDomWebpackClient_edge_production();
  }
  return client_edge.exports;
}
requireClient_edge();
function renderToReadableStream$1(data, options, extraOptions) {
  return server_edgeExports.renderToReadableStream(data, createClientManifest({ onClientReference: extraOptions?.onClientReference }), options);
}
function registerClientReference(proxy, id, name) {
  return server_edgeExports.registerClientReference(proxy, id, name);
}
function decodeReply(body, options) {
  return server_edgeExports.decodeReply(body, createServerManifest(), options);
}
const createTemporaryReferenceSet = server_edgeExports.createTemporaryReferenceSet;
const serverReferences = {};
initialize();
function initialize() {
  setRequireModule({ load: async (id) => {
    {
      const import_ = serverReferences[id];
      if (!import_) throw new Error(`server reference not found '${id}'`);
      return import_();
    }
  } });
}
function renderToReadableStream(data, options, extraOptions) {
  return renderToReadableStream$1(data, options, { onClientReference(metadata2) {
    assetsManifest.clientReferenceDeps[metadata2.id] ?? {};
  } });
}
var react_reactServerExports = requireReact_reactServer();
const __vite_rsc_react__ = /* @__PURE__ */ getDefaultExportFromCjs(react_reactServerExports);
const React = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: __vite_rsc_react__
}, [react_reactServerExports]);
let _serverContext = null;
let _getServerContext = () => _serverContext;
let _setServerContext = (ctx) => {
  _serverContext = ctx;
};
function _registerStateAccessors(accessors) {
  _getServerContext = accessors.getServerContext;
  _setServerContext = accessors.setServerContext;
}
function getNavigationContext() {
  return _getServerContext();
}
function setNavigationContext$1(ctx) {
  _setServerContext(ctx);
}
const isServer = typeof window === "undefined";
const _listeners = /* @__PURE__ */ new Set();
function notifyListeners() {
  for (const fn of _listeners)
    fn();
}
let _cachedSearch = !isServer ? window.location.search : "";
new URLSearchParams(_cachedSearch);
!isServer ? window.history.replaceState.bind(window.history) : null;
function restoreScrollPosition(state) {
  if (state && typeof state === "object" && "__vinext_scrollY" in state) {
    const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
    Promise.resolve().then(() => {
      const pending = window.__VINEXT_RSC_PENDING__ ?? null;
      if (pending) {
        pending.then(() => {
          requestAnimationFrame(() => {
            window.scrollTo(x, y);
          });
        });
      } else {
        requestAnimationFrame(() => {
          window.scrollTo(x, y);
        });
      }
    });
  }
}
const HTTP_ERROR_FALLBACK_ERROR_CODE = "NEXT_HTTP_ERROR_FALLBACK";
var RedirectType;
(function(RedirectType2) {
  RedirectType2["push"] = "push";
  RedirectType2["replace"] = "replace";
})(RedirectType || (RedirectType = {}));
function redirect(url, type) {
  const error = new Error(`NEXT_REDIRECT:${url}`);
  error.digest = `NEXT_REDIRECT;${"replace"};${url}`;
  throw error;
}
function notFound() {
  const error = new Error("NEXT_NOT_FOUND");
  error.digest = `${HTTP_ERROR_FALLBACK_ERROR_CODE};404`;
  throw error;
}
if (!isServer) {
  window.addEventListener("popstate", (event) => {
    notifyListeners();
    restoreScrollPosition(event.state);
  });
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.pushState = function patchedPushState(data, unused, url) {
    originalPushState(data, unused, url);
    notifyListeners();
  };
  window.history.replaceState = function patchedReplaceState(data, unused, url) {
    originalReplaceState(data, unused, url);
    notifyListeners();
  };
}
const _ALS_KEY$3 = Symbol.for("vinext.nextHeadersShim.als");
const _FALLBACK_KEY$3 = Symbol.for("vinext.nextHeadersShim.fallback");
const _g$4 = globalThis;
const _als$2 = _g$4[_ALS_KEY$3] ??= new AsyncLocalStorage$1();
const _fallbackState$2 = _g$4[_FALLBACK_KEY$3] ??= {
  headersContext: null,
  dynamicUsageDetected: false,
  pendingSetCookies: [],
  draftModeCookieHeader: null
};
function _enterWith$1(state) {
  const enterWith = _als$2.enterWith;
  if (typeof enterWith === "function") {
    try {
      enterWith.call(_als$2, state);
      return;
    } catch {
    }
  }
  _fallbackState$2.headersContext = state.headersContext;
  _fallbackState$2.dynamicUsageDetected = state.dynamicUsageDetected;
  _fallbackState$2.pendingSetCookies = state.pendingSetCookies;
  _fallbackState$2.draftModeCookieHeader = state.draftModeCookieHeader;
}
function _getState$2() {
  const state = _als$2.getStore();
  return state ?? _fallbackState$2;
}
function markDynamicUsage() {
  _getState$2().dynamicUsageDetected = true;
}
function consumeDynamicUsage() {
  const state = _getState$2();
  const used = state.dynamicUsageDetected;
  state.dynamicUsageDetected = false;
  return used;
}
function setHeadersContext(ctx) {
  if (ctx !== null) {
    _enterWith$1({
      headersContext: ctx,
      dynamicUsageDetected: false,
      pendingSetCookies: [],
      draftModeCookieHeader: null
    });
    return;
  }
  const state = _als$2.getStore();
  if (state) {
    state.headersContext = null;
  } else {
    _fallbackState$2.headersContext = null;
  }
}
function runWithHeadersContext(ctx, fn) {
  const state = {
    headersContext: ctx,
    dynamicUsageDetected: false,
    pendingSetCookies: [],
    draftModeCookieHeader: null
  };
  _enterWith$1(state);
  _fallbackState$2.headersContext = ctx;
  _fallbackState$2.dynamicUsageDetected = false;
  _fallbackState$2.pendingSetCookies = [];
  _fallbackState$2.draftModeCookieHeader = null;
  return fn();
}
function applyMiddlewareRequestHeaders(middlewareResponseHeaders) {
  const state = _getState$2();
  if (!state.headersContext)
    return;
  const ctx = state.headersContext;
  const PREFIX = "x-middleware-request-";
  for (const [key, value] of middlewareResponseHeaders) {
    if (key.startsWith(PREFIX)) {
      const realName = key.slice(PREFIX.length);
      ctx.headers.set(realName, value);
    }
  }
  const newCookieHeader = ctx.headers.get("cookie");
  if (newCookieHeader !== null) {
    ctx.cookies.clear();
    for (const part of newCookieHeader.split(";")) {
      const [k, ...rest] = part.split("=");
      if (k) {
        ctx.cookies.set(k.trim(), rest.join("=").trim());
      }
    }
  }
}
function headersContextFromRequest(request) {
  const cookies2 = /* @__PURE__ */ new Map();
  const cookieHeader = request.headers.get("cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.split("=");
    if (key) {
      cookies2.set(key.trim(), rest.join("=").trim());
    }
  }
  return {
    headers: request.headers,
    cookies: cookies2
  };
}
async function cookies() {
  const state = _getState$2();
  if (!state.headersContext) {
    throw new Error("cookies() can only be called from a Server Component, Route Handler, or Server Action.");
  }
  markDynamicUsage();
  return new RequestCookies$1(state.headersContext.cookies);
}
function getAndClearPendingCookies() {
  const state = _getState$2();
  const cookies2 = state.pendingSetCookies;
  state.pendingSetCookies = [];
  return cookies2;
}
function getDraftModeCookieHeader() {
  const state = _getState$2();
  const header = state.draftModeCookieHeader;
  state.draftModeCookieHeader = null;
  return header;
}
const VALID_COOKIE_NAME_RE$1 = /^[\x21\x23-\x27\x2A\x2B\x2D\x2E\x30-\x39\x41-\x5A\x5E-\x7A\x7C\x7E]+$/;
function validateCookieName$1(name) {
  if (!name || !VALID_COOKIE_NAME_RE$1.test(name)) {
    throw new Error(`Invalid cookie name: ${JSON.stringify(name)}`);
  }
}
function validateCookieAttributeValue$1(value, attributeName) {
  for (let i = 0; i < value.length; i++) {
    const code2 = value.charCodeAt(i);
    if (code2 <= 31 || code2 === 127 || value[i] === ";") {
      throw new Error(`Invalid cookie ${attributeName} value: ${JSON.stringify(value)}`);
    }
  }
}
let RequestCookies$1 = class RequestCookies {
  _cookies;
  constructor(cookies2) {
    this._cookies = cookies2;
  }
  get(name) {
    const value = this._cookies.get(name);
    if (value === void 0)
      return void 0;
    return { name, value };
  }
  getAll() {
    const result = [];
    for (const [name, value] of this._cookies) {
      result.push({ name, value });
    }
    return result;
  }
  has(name) {
    return this._cookies.has(name);
  }
  /**
   * Set a cookie. In Route Handlers and Server Actions, this produces
   * a Set-Cookie header on the response.
   */
  set(nameOrOptions, value, options) {
    let cookieName;
    let cookieValue;
    let opts;
    if (typeof nameOrOptions === "string") {
      cookieName = nameOrOptions;
      cookieValue = value ?? "";
      opts = options;
    } else {
      cookieName = nameOrOptions.name;
      cookieValue = nameOrOptions.value;
      opts = nameOrOptions;
    }
    validateCookieName$1(cookieName);
    this._cookies.set(cookieName, cookieValue);
    const parts = [`${cookieName}=${encodeURIComponent(cookieValue)}`];
    if (opts?.path) {
      validateCookieAttributeValue$1(opts.path, "Path");
      parts.push(`Path=${opts.path}`);
    }
    if (opts?.domain) {
      validateCookieAttributeValue$1(opts.domain, "Domain");
      parts.push(`Domain=${opts.domain}`);
    }
    if (opts?.maxAge !== void 0)
      parts.push(`Max-Age=${opts.maxAge}`);
    if (opts?.expires)
      parts.push(`Expires=${opts.expires.toUTCString()}`);
    if (opts?.httpOnly)
      parts.push("HttpOnly");
    if (opts?.secure)
      parts.push("Secure");
    if (opts?.sameSite)
      parts.push(`SameSite=${opts.sameSite}`);
    _getState$2().pendingSetCookies.push(parts.join("; "));
    return this;
  }
  /**
   * Delete a cookie by setting it with Max-Age=0.
   */
  delete(name) {
    validateCookieName$1(name);
    this._cookies.delete(name);
    _getState$2().pendingSetCookies.push(`${name}=; Path=/; Max-Age=0`);
    return this;
  }
  get size() {
    return this._cookies.size;
  }
  [Symbol.iterator]() {
    const entries = this._cookies.entries();
    const iter = {
      [Symbol.iterator]() {
        return iter;
      },
      next() {
        const { value, done } = entries.next();
        if (done)
          return { value: void 0, done: true };
        const [name, val] = value;
        return { value: [name, { name, value: val }], done: false };
      }
    };
    return iter;
  }
  toString() {
    const parts = [];
    for (const [name, value] of this._cookies) {
      parts.push(`${name}=${value}`);
    }
    return parts.join("; ");
  }
};
class NextRequest extends Request {
  _nextUrl;
  _cookies;
  constructor(input, init2) {
    if (input instanceof Request) {
      const req = input;
      super(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        // @ts-expect-error - duplex is not in RequestInit type but needed for streams
        duplex: req.body ? "half" : void 0,
        ...init2
      });
    } else {
      super(input, init2);
    }
    const url = typeof input === "string" ? new URL(input, "http://localhost") : input instanceof URL ? input : new URL(input.url, "http://localhost");
    this._nextUrl = new NextURL(url);
    this._cookies = new RequestCookies2(this.headers);
  }
  get nextUrl() {
    return this._nextUrl;
  }
  get cookies() {
    return this._cookies;
  }
  /**
   * Client IP address. Prefers Cloudflare's trusted CF-Connecting-IP header
   * over the spoofable X-Forwarded-For. Returns undefined if unavailable.
   */
  get ip() {
    return this.headers.get("cf-connecting-ip") ?? this.headers.get("x-real-ip") ?? this.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? void 0;
  }
  /**
   * Geolocation data. Platform-dependent (e.g., Cloudflare, Vercel).
   * Returns undefined if not available.
   */
  get geo() {
    const country = this.headers.get("cf-ipcountry") ?? this.headers.get("x-vercel-ip-country") ?? void 0;
    if (!country)
      return void 0;
    return {
      country,
      city: this.headers.get("cf-ipcity") ?? this.headers.get("x-vercel-ip-city") ?? void 0,
      region: this.headers.get("cf-region") ?? this.headers.get("x-vercel-ip-country-region") ?? void 0,
      latitude: this.headers.get("cf-iplatitude") ?? this.headers.get("x-vercel-ip-latitude") ?? void 0,
      longitude: this.headers.get("cf-iplongitude") ?? this.headers.get("x-vercel-ip-longitude") ?? void 0
    };
  }
}
class NextResponse extends Response {
  _cookies;
  constructor(body, init2) {
    super(body, init2);
    this._cookies = new ResponseCookies(this.headers);
  }
  get cookies() {
    return this._cookies;
  }
  /**
   * Create a JSON response.
   */
  static json(body, init2) {
    const headers = new Headers(init2?.headers);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    return new NextResponse(JSON.stringify(body), {
      ...init2,
      headers
    });
  }
  /**
   * Create a redirect response.
   */
  static redirect(url, init2) {
    const status = typeof init2 === "number" ? init2 : init2?.status ?? 307;
    const destination = typeof url === "string" ? url : url.toString();
    const headers = new Headers(typeof init2 === "object" ? init2?.headers : void 0);
    headers.set("Location", destination);
    return new NextResponse(null, { status, headers });
  }
  /**
   * Create a rewrite response (middleware pattern).
   * Sets the x-middleware-rewrite header.
   */
  static rewrite(destination, init2) {
    const url = typeof destination === "string" ? destination : destination.toString();
    const headers = new Headers(init2?.headers);
    headers.set("x-middleware-rewrite", url);
    return new NextResponse(null, { ...init2, headers });
  }
  /**
   * Continue to the next handler (middleware pattern).
   * Sets the x-middleware-next header.
   */
  static next(init2) {
    const headers = new Headers(init2?.headers);
    headers.set("x-middleware-next", "1");
    if (init2?.request?.headers) {
      for (const [key, value] of init2.request.headers.entries()) {
        headers.set(`x-middleware-request-${key}`, value);
      }
    }
    return new NextResponse(null, { ...init2, headers });
  }
}
class NextURL {
  _url;
  constructor(input, base) {
    this._url = new URL(input.toString(), base);
  }
  get href() {
    return this._url.href;
  }
  get origin() {
    return this._url.origin;
  }
  get protocol() {
    return this._url.protocol;
  }
  get host() {
    return this._url.host;
  }
  get hostname() {
    return this._url.hostname;
  }
  get port() {
    return this._url.port;
  }
  get pathname() {
    return this._url.pathname;
  }
  get search() {
    return this._url.search;
  }
  get searchParams() {
    return this._url.searchParams;
  }
  get hash() {
    return this._url.hash;
  }
  set pathname(value) {
    this._url.pathname = value;
  }
  set search(value) {
    this._url.search = value;
  }
  set hash(value) {
    this._url.hash = value;
  }
  clone() {
    return new NextURL(this._url.href);
  }
  toString() {
    return this._url.toString();
  }
}
class RequestCookies2 {
  _headers;
  constructor(headers) {
    this._headers = headers;
  }
  _parse() {
    const map = /* @__PURE__ */ new Map();
    const cookie = this._headers.get("cookie") ?? "";
    for (const part of cookie.split(";")) {
      const eq = part.indexOf("=");
      if (eq === -1)
        continue;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      map.set(name, value);
    }
    return map;
  }
  get(name) {
    const value = this._parse().get(name);
    return value !== void 0 ? { name, value } : void 0;
  }
  getAll() {
    return [...this._parse().entries()].map(([name, value]) => ({ name, value }));
  }
  has(name) {
    return this._parse().has(name);
  }
  [Symbol.iterator]() {
    const entries = this.getAll().map((c) => [c.name, c]);
    return entries[Symbol.iterator]();
  }
}
const VALID_COOKIE_NAME_RE = /^[\x21\x23-\x27\x2A\x2B\x2D\x2E\x30-\x39\x41-\x5A\x5E-\x7A\x7C\x7E]+$/;
function validateCookieName(name) {
  if (!name || !VALID_COOKIE_NAME_RE.test(name)) {
    throw new Error(`Invalid cookie name: ${JSON.stringify(name)}`);
  }
}
function validateCookieAttributeValue(value, attributeName) {
  for (let i = 0; i < value.length; i++) {
    const code2 = value.charCodeAt(i);
    if (code2 <= 31 || code2 === 127 || value[i] === ";") {
      throw new Error(`Invalid cookie ${attributeName} value: ${JSON.stringify(value)}`);
    }
  }
}
class ResponseCookies {
  _headers;
  constructor(headers) {
    this._headers = headers;
  }
  set(name, value, options) {
    validateCookieName(name);
    const parts = [`${name}=${encodeURIComponent(value)}`];
    if (options?.path) {
      validateCookieAttributeValue(options.path, "Path");
      parts.push(`Path=${options.path}`);
    }
    if (options?.domain) {
      validateCookieAttributeValue(options.domain, "Domain");
      parts.push(`Domain=${options.domain}`);
    }
    if (options?.maxAge !== void 0)
      parts.push(`Max-Age=${options.maxAge}`);
    if (options?.expires)
      parts.push(`Expires=${options.expires.toUTCString()}`);
    if (options?.httpOnly)
      parts.push("HttpOnly");
    if (options?.secure)
      parts.push("Secure");
    if (options?.sameSite)
      parts.push(`SameSite=${options.sameSite}`);
    this._headers.append("Set-Cookie", parts.join("; "));
    return this;
  }
  get(name) {
    for (const header of this._headers.getSetCookie()) {
      const eq = header.indexOf("=");
      if (eq === -1)
        continue;
      const cookieName = header.slice(0, eq);
      if (cookieName === name) {
        const semi = header.indexOf(";", eq);
        const raw = header.slice(eq + 1, semi === -1 ? void 0 : semi);
        let value;
        try {
          value = decodeURIComponent(raw);
        } catch {
          value = raw;
        }
        return { name, value };
      }
    }
    return void 0;
  }
  getAll() {
    const entries = [];
    for (const header of this._headers.getSetCookie()) {
      const eq = header.indexOf("=");
      if (eq === -1)
        continue;
      const cookieName = header.slice(0, eq);
      const semi = header.indexOf(";", eq);
      const raw = header.slice(eq + 1, semi === -1 ? void 0 : semi);
      let value;
      try {
        value = decodeURIComponent(raw);
      } catch {
        value = raw;
      }
      entries.push({ name: cookieName, value });
    }
    return entries;
  }
  delete(name) {
    this.set(name, "", { maxAge: 0, path: "/" });
    return this;
  }
  [Symbol.iterator]() {
    const entries = [];
    for (const header of this._headers.getSetCookie()) {
      const eq = header.indexOf("=");
      if (eq === -1)
        continue;
      const cookieName = header.slice(0, eq);
      const semi = header.indexOf(";", eq);
      const raw = header.slice(eq + 1, semi === -1 ? void 0 : semi);
      let value;
      try {
        value = decodeURIComponent(raw);
      } catch {
        value = raw;
      }
      entries.push([cookieName, { name: cookieName, value }]);
    }
    return entries[Symbol.iterator]();
  }
}
const ErrorBoundary = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'ErrorBoundary' is called on server");
}, "f29e6e234fea", "ErrorBoundary");
const NotFoundBoundary = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'NotFoundBoundary' is called on server");
}, "f29e6e234fea", "NotFoundBoundary");
const LayoutSegmentProvider = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'LayoutSegmentProvider' is called on server");
}, "0deffcb8ffd7", "LayoutSegmentProvider");
var jsxRuntime_reactServer = { exports: {} };
var reactJsxRuntime_reactServer_production = {};
var hasRequiredReactJsxRuntime_reactServer_production;
function requireReactJsxRuntime_reactServer_production() {
  if (hasRequiredReactJsxRuntime_reactServer_production) return reactJsxRuntime_reactServer_production;
  hasRequiredReactJsxRuntime_reactServer_production = 1;
  var React2 = requireReact_reactServer(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  if (!React2.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE)
    throw Error(
      'The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.'
    );
  function jsxProd(type, config2, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config2.key && (key = "" + config2.key);
    if ("key" in config2) {
      maybeKey = {};
      for (var propName in config2)
        "key" !== propName && (maybeKey[propName] = config2[propName]);
    } else maybeKey = config2;
    config2 = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config2 ? config2 : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_reactServer_production.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_reactServer_production.jsx = jsxProd;
  reactJsxRuntime_reactServer_production.jsxDEV = void 0;
  reactJsxRuntime_reactServer_production.jsxs = jsxProd;
  return reactJsxRuntime_reactServer_production;
}
var hasRequiredJsxRuntime_reactServer;
function requireJsxRuntime_reactServer() {
  if (hasRequiredJsxRuntime_reactServer) return jsxRuntime_reactServer.exports;
  hasRequiredJsxRuntime_reactServer = 1;
  {
    jsxRuntime_reactServer.exports = requireReactJsxRuntime_reactServer_production();
  }
  return jsxRuntime_reactServer.exports;
}
var jsxRuntime_reactServerExports = requireJsxRuntime_reactServer();
async function resolveModuleViewport(mod, params) {
  if (typeof mod.generateViewport === "function") {
    const asyncParams = Object.assign(Promise.resolve(params), params);
    return await mod.generateViewport({ params: asyncParams });
  }
  if (mod.viewport && typeof mod.viewport === "object") {
    return mod.viewport;
  }
  return null;
}
function mergeViewport(viewportList) {
  const merged = {};
  for (const vp of viewportList) {
    Object.assign(merged, vp);
  }
  return merged;
}
function ViewportHead({ viewport }) {
  const elements = [];
  let key = 0;
  const parts = [];
  if (viewport.width !== void 0)
    parts.push(`width=${viewport.width}`);
  if (viewport.height !== void 0)
    parts.push(`height=${viewport.height}`);
  if (viewport.initialScale !== void 0)
    parts.push(`initial-scale=${viewport.initialScale}`);
  if (viewport.minimumScale !== void 0)
    parts.push(`minimum-scale=${viewport.minimumScale}`);
  if (viewport.maximumScale !== void 0)
    parts.push(`maximum-scale=${viewport.maximumScale}`);
  if (viewport.userScalable !== void 0)
    parts.push(`user-scalable=${viewport.userScalable ? "yes" : "no"}`);
  if (parts.length > 0) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "viewport", content: parts.join(", ") }, key++));
  }
  if (viewport.themeColor) {
    if (typeof viewport.themeColor === "string") {
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "theme-color", content: viewport.themeColor }, key++));
    } else if (Array.isArray(viewport.themeColor)) {
      for (const entry of viewport.themeColor) {
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "theme-color", content: entry.color, ...entry.media ? { media: entry.media } : {} }, key++));
      }
    }
  }
  if (viewport.colorScheme) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "color-scheme", content: viewport.colorScheme }, key++));
  }
  return jsxRuntime_reactServerExports.jsx(jsxRuntime_reactServerExports.Fragment, { children: elements });
}
function mergeMetadata(metadataList) {
  if (metadataList.length === 0)
    return {};
  const merged = {};
  let parentTemplate;
  for (let i = 0; i < metadataList.length; i++) {
    const meta = metadataList[i];
    const isPage = i === metadataList.length - 1;
    if (!isPage && meta.title && typeof meta.title === "object" && meta.title.template) {
      parentTemplate = meta.title.template;
    }
    for (const key of Object.keys(meta)) {
      if (key === "title")
        continue;
      merged[key] = meta[key];
    }
    if (meta.title !== void 0) {
      merged.title = meta.title;
    }
  }
  const finalTitle = merged.title;
  if (finalTitle) {
    if (typeof finalTitle === "string") {
      if (parentTemplate) {
        merged.title = parentTemplate.replace("%s", finalTitle);
      }
    } else if (typeof finalTitle === "object") {
      if (finalTitle.absolute) {
        merged.title = finalTitle.absolute;
      } else if (finalTitle.default) {
        merged.title = finalTitle.default;
      } else if (finalTitle.template && !finalTitle.default && !finalTitle.absolute) {
        merged.title = void 0;
      }
    }
  }
  return merged;
}
async function resolveModuleMetadata(mod, params, searchParams) {
  if (typeof mod.generateMetadata === "function") {
    const asyncParams = Object.assign(Promise.resolve(params), params);
    const sp = {};
    const asyncSp = Object.assign(Promise.resolve(sp), sp);
    return await mod.generateMetadata({ params: asyncParams, searchParams: asyncSp });
  }
  if (mod.metadata && typeof mod.metadata === "object") {
    return mod.metadata;
  }
  return null;
}
function MetadataHead({ metadata: metadata2 }) {
  const elements = [];
  let key = 0;
  const base = metadata2.metadataBase;
  function resolveUrl(url) {
    if (!url)
      return void 0;
    if (!base)
      return url;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"))
      return url;
    try {
      return new URL(url, base).toString();
    } catch {
      return url;
    }
  }
  const title = typeof metadata2.title === "string" ? metadata2.title : typeof metadata2.title === "object" ? metadata2.title.absolute || metadata2.title.default : void 0;
  if (title) {
    elements.push(jsxRuntime_reactServerExports.jsx("title", { children: title }, key++));
  }
  if (metadata2.description) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "description", content: metadata2.description }, key++));
  }
  if (metadata2.generator) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "generator", content: metadata2.generator }, key++));
  }
  if (metadata2.applicationName) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "application-name", content: metadata2.applicationName }, key++));
  }
  if (metadata2.referrer) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "referrer", content: metadata2.referrer }, key++));
  }
  if (metadata2.keywords) {
    const kw = Array.isArray(metadata2.keywords) ? metadata2.keywords.join(",") : metadata2.keywords;
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "keywords", content: kw }, key++));
  }
  if (metadata2.authors) {
    const authorList = Array.isArray(metadata2.authors) ? metadata2.authors : [metadata2.authors];
    for (const author of authorList) {
      if (author.name) {
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "author", content: author.name }, key++));
      }
      if (author.url) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "author", href: author.url }, key++));
      }
    }
  }
  if (metadata2.creator) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "creator", content: metadata2.creator }, key++));
  }
  if (metadata2.publisher) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "publisher", content: metadata2.publisher }, key++));
  }
  if (metadata2.formatDetection) {
    const parts = [];
    if (metadata2.formatDetection.telephone === false)
      parts.push("telephone=no");
    if (metadata2.formatDetection.address === false)
      parts.push("address=no");
    if (metadata2.formatDetection.email === false)
      parts.push("email=no");
    if (parts.length > 0) {
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "format-detection", content: parts.join(", ") }, key++));
    }
  }
  if (metadata2.category) {
    elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "category", content: metadata2.category }, key++));
  }
  if (metadata2.robots) {
    if (typeof metadata2.robots === "string") {
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "robots", content: metadata2.robots }, key++));
    } else {
      const { googleBot, ...robotsRest } = metadata2.robots;
      const robotParts = [];
      for (const [k, v] of Object.entries(robotsRest)) {
        if (v === true)
          robotParts.push(k);
        else if (v === false)
          robotParts.push(`no${k}`);
        else if (typeof v === "string" || typeof v === "number")
          robotParts.push(`${k}:${v}`);
      }
      if (robotParts.length > 0) {
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "robots", content: robotParts.join(", ") }, key++));
      }
      if (googleBot) {
        if (typeof googleBot === "string") {
          elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "googlebot", content: googleBot }, key++));
        } else {
          const gbParts = [];
          for (const [k, v] of Object.entries(googleBot)) {
            if (v === true)
              gbParts.push(k);
            else if (v === false)
              gbParts.push(`no${k}`);
            else if (typeof v === "string" || typeof v === "number")
              gbParts.push(`${k}:${v}`);
          }
          if (gbParts.length > 0) {
            elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "googlebot", content: gbParts.join(", ") }, key++));
          }
        }
      }
    }
  }
  if (metadata2.openGraph) {
    const og = metadata2.openGraph;
    if (og.title)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:title", content: og.title }, key++));
    if (og.description)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:description", content: og.description }, key++));
    if (og.url)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:url", content: resolveUrl(og.url) ?? og.url }, key++));
    if (og.siteName)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:site_name", content: og.siteName }, key++));
    if (og.type)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:type", content: og.type }, key++));
    if (og.locale)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:locale", content: og.locale }, key++));
    if (og.publishedTime)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "article:published_time", content: og.publishedTime }, key++));
    if (og.modifiedTime)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "article:modified_time", content: og.modifiedTime }, key++));
    if (og.authors) {
      for (const author of og.authors) {
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "article:author", content: author }, key++));
      }
    }
    if (og.images) {
      const imgList = typeof og.images === "string" ? [{ url: og.images }] : og.images;
      for (const img of imgList) {
        const imgUrl = typeof img === "string" ? img : img.url;
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:image", content: resolveUrl(imgUrl) ?? imgUrl }, key++));
        if (typeof img !== "string") {
          if (img.width)
            elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:image:width", content: String(img.width) }, key++));
          if (img.height)
            elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:image:height", content: String(img.height) }, key++));
          if (img.alt)
            elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:image:alt", content: img.alt }, key++));
        }
      }
    }
    if (og.videos) {
      for (const video of og.videos) {
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:video", content: resolveUrl(video.url) ?? video.url }, key++));
        if (video.width)
          elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:video:width", content: String(video.width) }, key++));
        if (video.height)
          elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:video:height", content: String(video.height) }, key++));
      }
    }
    if (og.audio) {
      for (const audio of og.audio) {
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { property: "og:audio", content: resolveUrl(audio.url) ?? audio.url }, key++));
      }
    }
  }
  if (metadata2.twitter) {
    const tw = metadata2.twitter;
    if (tw.card)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:card", content: tw.card }, key++));
    if (tw.site)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:site", content: tw.site }, key++));
    if (tw.siteId)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:site:id", content: tw.siteId }, key++));
    if (tw.title)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:title", content: tw.title }, key++));
    if (tw.description)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:description", content: tw.description }, key++));
    if (tw.creator)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:creator", content: tw.creator }, key++));
    if (tw.creatorId)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:creator:id", content: tw.creatorId }, key++));
    if (tw.images) {
      const imgList = typeof tw.images === "string" ? [tw.images] : Array.isArray(tw.images) ? tw.images : [];
      for (const img of imgList) {
        const imgUrl = typeof img === "string" ? img : img.url;
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:image", content: resolveUrl(imgUrl) ?? imgUrl }, key++));
        if (typeof img !== "string" && img.alt) {
          elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "twitter:image:alt", content: img.alt }, key++));
        }
      }
    }
  }
  if (metadata2.icons) {
    const { icon, shortcut, apple, other } = metadata2.icons;
    if (shortcut) {
      const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
      for (const s of shortcuts) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "shortcut icon", href: resolveUrl(s) ?? s }, key++));
      }
    }
    if (icon) {
      const icons = typeof icon === "string" ? [{ url: icon }] : icon;
      for (const i of icons) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "icon", href: resolveUrl(i.url) ?? i.url, ...i.sizes ? { sizes: i.sizes } : {}, ...i.type ? { type: i.type } : {}, ...i.media ? { media: i.media } : {} }, key++));
      }
    }
    if (apple) {
      const apples = typeof apple === "string" ? [{ url: apple }] : apple;
      for (const a of apples) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "apple-touch-icon", href: resolveUrl(a.url) ?? a.url, ...a.sizes ? { sizes: a.sizes } : {}, ...a.type ? { type: a.type } : {} }, key++));
      }
    }
    if (other) {
      for (const o of other) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: o.rel, href: resolveUrl(o.url) ?? o.url, ...o.sizes ? { sizes: o.sizes } : {} }, key++));
      }
    }
  }
  if (metadata2.manifest) {
    elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "manifest", href: resolveUrl(metadata2.manifest) ?? metadata2.manifest }, key++));
  }
  if (metadata2.alternates) {
    const alt = metadata2.alternates;
    if (alt.canonical) {
      elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "canonical", href: resolveUrl(alt.canonical) ?? alt.canonical }, key++));
    }
    if (alt.languages) {
      for (const [lang, href] of Object.entries(alt.languages)) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "alternate", hrefLang: lang, href: resolveUrl(href) ?? href }, key++));
      }
    }
    if (alt.media) {
      for (const [media, href] of Object.entries(alt.media)) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "alternate", media, href: resolveUrl(href) ?? href }, key++));
      }
    }
    if (alt.types) {
      for (const [type, href] of Object.entries(alt.types)) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "alternate", type, href: resolveUrl(href) ?? href }, key++));
      }
    }
  }
  if (metadata2.verification) {
    const v = metadata2.verification;
    if (v.google)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "google-site-verification", content: v.google }, key++));
    if (v.yahoo)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "y_key", content: v.yahoo }, key++));
    if (v.yandex)
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "yandex-verification", content: v.yandex }, key++));
    if (v.other) {
      for (const [name, content] of Object.entries(v.other)) {
        const values = Array.isArray(content) ? content : [content];
        for (const val of values) {
          elements.push(jsxRuntime_reactServerExports.jsx("meta", { name, content: val }, key++));
        }
      }
    }
  }
  if (metadata2.appleWebApp) {
    const awa = metadata2.appleWebApp;
    if (awa.capable !== false) {
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "mobile-web-app-capable", content: "yes" }, key++));
    }
    if (awa.title) {
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "apple-mobile-web-app-title", content: awa.title }, key++));
    }
    if (awa.statusBarStyle) {
      elements.push(jsxRuntime_reactServerExports.jsx("meta", { name: "apple-mobile-web-app-status-bar-style", content: awa.statusBarStyle }, key++));
    }
    if (awa.startupImage) {
      const imgs = typeof awa.startupImage === "string" ? [{ url: awa.startupImage }] : awa.startupImage;
      for (const img of imgs) {
        elements.push(jsxRuntime_reactServerExports.jsx("link", { rel: "apple-touch-startup-image", href: resolveUrl(img.url) ?? img.url, ...img.media ? { media: img.media } : {} }, key++));
      }
    }
  }
  if (metadata2.other) {
    for (const [name, content] of Object.entries(metadata2.other)) {
      const values = Array.isArray(content) ? content : [content];
      for (const val of values) {
        elements.push(jsxRuntime_reactServerExports.jsx("meta", { name, content: val }, key++));
      }
    }
  }
  return jsxRuntime_reactServerExports.jsx(jsxRuntime_reactServerExports.Fragment, { children: elements });
}
const SESSION_COOKIE_NAME = "bm_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const PASSWORD_HASH_ITERATIONS = 12e4;
function getAuthJwtSecret() {
  const envSecret = process.env.AUTH_JWT_SECRET;
  if (envSecret && envSecret.trim().length > 0) {
    return envSecret;
  }
  throw new Error("Missing AUTH_JWT_SECRET");
}
const encoder = new TextEncoder();
function toBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa === "function") {
    return btoa(binary);
  }
  return Buffer.from(binary, "binary").toString("base64");
}
function fromBase64(value) {
  const binary = typeof atob === "function" ? atob(value) : Buffer.from(value, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function base64UrlEncodeBytes(bytes) {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function base64UrlDecodeToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return fromBase64(padded);
}
function base64UrlEncodeString(value) {
  return base64UrlEncodeBytes(encoder.encode(value));
}
function base64UrlDecodeToString(value) {
  const bytes = base64UrlDecodeToBytes(value);
  return new TextDecoder().decode(bytes);
}
async function hmacSign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return new Uint8Array(signature);
}
function timingSafeEquals(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
async function signSessionToken(input, secret, ttlSeconds = 60 * 60 * 12) {
  const now = Math.floor(Date.now() / 1e3);
  const claims = {
    ...input,
    iat: now,
    exp: now + ttlSeconds
  };
  const header = base64UrlEncodeString(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncodeString(JSON.stringify(claims));
  const signingInput = `${header}.${payload}`;
  const signature = await hmacSign(signingInput, secret);
  return `${signingInput}.${base64UrlEncodeBytes(signature)}`;
}
async function verifySessionToken(token, secret) {
  const segments = token.split(".");
  if (segments.length !== 3) return null;
  const [header, payload, signature] = segments;
  const signingInput = `${header}.${payload}`;
  const expectedSig = await hmacSign(signingInput, secret);
  const actualSig = base64UrlDecodeToBytes(signature);
  if (!timingSafeEquals(expectedSig, actualSig)) {
    return null;
  }
  let claims;
  try {
    claims = JSON.parse(base64UrlDecodeToString(payload));
  } catch {
    return null;
  }
  if (!claims?.sub || !claims?.username || !claims?.role || !claims?.exp || !claims?.iat) {
    return null;
  }
  const now = Math.floor(Date.now() / 1e3);
  if (claims.exp <= now) {
    return null;
  }
  return claims;
}
async function hashPassword(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations
    },
    keyMaterial,
    256
  );
  return base64UrlEncodeBytes(new Uint8Array(derived));
}
async function verifyPassword(password, credential) {
  const candidate = await hashPassword(password, credential.salt, credential.iterations);
  const a = encoder.encode(candidate);
  const b = encoder.encode(credential.passwordHash);
  return timingSafeEquals(a, b);
}
function generatePasswordSalt(bytes = 16) {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return base64UrlEncodeBytes(values);
}
const DEV_COMPONENT_APPROVAL_PATTERN = /^\/dev\/component-approval/;
function getCookieValueFromHeader$1(cookieHeader, key) {
  if (!cookieHeader) return null;
  const entries = cookieHeader.split(";");
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;
    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) continue;
    return decodeURIComponent(trimmed.slice(separatorIndex + 1));
  }
  return null;
}
async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!DEV_COMPONENT_APPROVAL_PATTERN.test(pathname)) {
    return NextResponse.next();
  }
  const token = getCookieValueFromHeader$1(
    request.headers.get("cookie"),
    SESSION_COOKIE_NAME
  );
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  const claims = await verifySessionToken(token, getAuthJwtSecret());
  if (!claims) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (claims.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }
  return NextResponse.next();
}
const config$1 = {
  matcher: ["/dev/component-approval/:path*"]
};
class MemoryCacheHandler {
  store = /* @__PURE__ */ new Map();
  tagRevalidatedAt = /* @__PURE__ */ new Map();
  async get(key, _ctx) {
    const entry = this.store.get(key);
    if (!entry)
      return null;
    for (const tag of entry.tags) {
      const revalidatedAt = this.tagRevalidatedAt.get(tag);
      if (revalidatedAt && revalidatedAt >= entry.lastModified) {
        this.store.delete(key);
        return null;
      }
    }
    if (entry.revalidateAt !== null && Date.now() > entry.revalidateAt) {
      return {
        lastModified: entry.lastModified,
        value: entry.value,
        cacheState: "stale"
      };
    }
    return {
      lastModified: entry.lastModified,
      value: entry.value
    };
  }
  async set(key, data, ctx) {
    const tags = [];
    if (data && "tags" in data && Array.isArray(data.tags)) {
      tags.push(...data.tags);
    }
    if (ctx && "tags" in ctx && Array.isArray(ctx.tags)) {
      tags.push(...ctx.tags);
    }
    let revalidateAt = null;
    if (ctx) {
      const revalidate = ctx.cacheControl?.revalidate ?? ctx.revalidate;
      if (typeof revalidate === "number" && revalidate > 0) {
        revalidateAt = Date.now() + revalidate * 1e3;
      }
    }
    if (data && "revalidate" in data && typeof data.revalidate === "number") {
      revalidateAt = Date.now() + data.revalidate * 1e3;
    }
    this.store.set(key, {
      value: data,
      tags,
      lastModified: Date.now(),
      revalidateAt
    });
  }
  async revalidateTag(tags, _durations) {
    const tagList = Array.isArray(tags) ? tags : [tags];
    const now = Date.now();
    for (const tag of tagList) {
      this.tagRevalidatedAt.set(tag, now);
    }
  }
  resetRequestCache() {
  }
}
let activeHandler = new MemoryCacheHandler();
function getCacheHandler() {
  return activeHandler;
}
const _ALS_KEY$2 = Symbol.for("vinext.cache.als");
const _FALLBACK_KEY$2 = Symbol.for("vinext.cache.fallback");
const _g$3 = globalThis;
const _cacheAls = _g$3[_ALS_KEY$2] ??= new AsyncLocalStorage$1();
const _cacheFallbackState = _g$3[_FALLBACK_KEY$2] ??= {
  requestScopedCacheLife: null
};
function _cacheEnterWith(state) {
  const enterWith = _cacheAls.enterWith;
  if (typeof enterWith === "function") {
    try {
      enterWith.call(_cacheAls, state);
      return;
    } catch {
    }
  }
  _cacheFallbackState.requestScopedCacheLife = state.requestScopedCacheLife;
}
function _getCacheState() {
  return _cacheAls.getStore() ?? _cacheFallbackState;
}
function _initRequestScopedCacheState() {
  _cacheEnterWith({ requestScopedCacheLife: null });
  _cacheFallbackState.requestScopedCacheLife = null;
}
function _consumeRequestScopedCacheLife() {
  const state = _getCacheState();
  const config2 = state.requestScopedCacheLife;
  state.requestScopedCacheLife = null;
  return config2;
}
function buildFetchCacheKey(input, init2) {
  let url;
  let method = "GET";
  let body;
  if (typeof input === "string") {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    url = input.url;
    method = input.method || "GET";
  }
  if (init2?.method)
    method = init2.method;
  if (init2?.body && typeof init2.body === "string")
    body = init2.body;
  const parts = [`fetch:${method}:${url}`];
  if (body)
    parts.push(body);
  return parts.join("|");
}
const _ORIG_FETCH_KEY = Symbol.for("vinext.fetchCache.originalFetch");
const _gFetch = globalThis;
const originalFetch = _gFetch[_ORIG_FETCH_KEY] ??= globalThis.fetch;
const _ALS_KEY$1 = Symbol.for("vinext.fetchCache.als");
const _FALLBACK_KEY$1 = Symbol.for("vinext.fetchCache.fallback");
const _g$2 = globalThis;
const _als$1 = _g$2[_ALS_KEY$1] ??= new AsyncLocalStorage$1();
const _fallbackState$1 = _g$2[_FALLBACK_KEY$1] ??= {
  currentRequestTags: []
};
function _getState$1() {
  return _als$1.getStore() ?? _fallbackState$1;
}
function createPatchedFetch() {
  return async function patchedFetch(input, init2) {
    const nextOpts = init2?.next;
    const cacheDirective = init2?.cache;
    if (!nextOpts && !cacheDirective) {
      return originalFetch(input, init2);
    }
    if (cacheDirective === "no-store" || nextOpts?.revalidate === false || nextOpts?.revalidate === 0) {
      const cleanInit2 = stripNextFromInit(init2);
      return originalFetch(input, cleanInit2);
    }
    let revalidateSeconds;
    if (cacheDirective === "force-cache") {
      revalidateSeconds = nextOpts?.revalidate && typeof nextOpts.revalidate === "number" ? nextOpts.revalidate : 31536e3;
    } else if (typeof nextOpts?.revalidate === "number" && nextOpts.revalidate > 0) {
      revalidateSeconds = nextOpts.revalidate;
    } else {
      if (nextOpts?.tags && nextOpts.tags.length > 0) {
        revalidateSeconds = 31536e3;
      } else {
        const cleanInit2 = stripNextFromInit(init2);
        return originalFetch(input, cleanInit2);
      }
    }
    const tags = nextOpts?.tags ?? [];
    const cacheKey = buildFetchCacheKey(input, init2);
    const handler2 = getCacheHandler();
    const reqTags = _getState$1().currentRequestTags;
    if (tags.length > 0) {
      for (const tag of tags) {
        if (!reqTags.includes(tag)) {
          reqTags.push(tag);
        }
      }
    }
    try {
      const cached2 = await handler2.get(cacheKey, { kind: "FETCH", tags });
      if (cached2?.value && cached2.value.kind === "FETCH" && cached2.cacheState !== "stale") {
        const cachedData = cached2.value.data;
        return new Response(cachedData.body, {
          status: cachedData.status ?? 200,
          headers: cachedData.headers
        });
      }
      if (cached2?.value && cached2.value.kind === "FETCH" && cached2.cacheState === "stale") {
        const staleData = cached2.value.data;
        const cleanInit2 = stripNextFromInit(init2);
        originalFetch(input, cleanInit2).then(async (freshResp) => {
          const freshBody = await freshResp.text();
          const freshHeaders = {};
          freshResp.headers.forEach((v, k) => {
            freshHeaders[k] = v;
          });
          const freshValue = {
            kind: "FETCH",
            data: {
              headers: freshHeaders,
              body: freshBody,
              url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
              status: freshResp.status
            },
            tags,
            revalidate: revalidateSeconds
          };
          await handler2.set(cacheKey, freshValue, {
            fetchCache: true,
            tags,
            revalidate: revalidateSeconds
          });
        }).catch((err) => {
          console.error("[vinext] fetch cache background revalidation failed:", err);
        });
        return new Response(staleData.body, {
          status: staleData.status ?? 200,
          headers: staleData.headers
        });
      }
    } catch (cacheErr) {
      console.error("[vinext] fetch cache read error:", cacheErr);
    }
    const cleanInit = stripNextFromInit(init2);
    const response = await originalFetch(input, cleanInit);
    if (response.ok) {
      const cloned = response.clone();
      const body = await cloned.text();
      const headers = {};
      cloned.headers.forEach((v, k) => {
        headers[k] = v;
      });
      const cacheValue = {
        kind: "FETCH",
        data: {
          headers,
          body,
          url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
          status: cloned.status
        },
        tags,
        revalidate: revalidateSeconds
      };
      handler2.set(cacheKey, cacheValue, {
        fetchCache: true,
        tags,
        revalidate: revalidateSeconds
      }).catch((err) => {
        console.error("[vinext] fetch cache write error:", err);
      });
    }
    return response;
  };
}
function stripNextFromInit(init2) {
  if (!init2)
    return init2;
  if (!("next" in init2))
    return init2;
  const { next: _next, ...rest } = init2;
  return Object.keys(rest).length > 0 ? rest : void 0;
}
const _PATCH_KEY = Symbol.for("vinext.fetchCache.patchInstalled");
function _ensurePatchInstalled() {
  if (_g$2[_PATCH_KEY])
    return;
  _g$2[_PATCH_KEY] = true;
  globalThis.fetch = createPatchedFetch();
}
async function runWithFetchCache(fn) {
  _ensurePatchInstalled();
  return _als$1.run({ currentRequestTags: [] }, fn);
}
new AsyncLocalStorage$1();
const _PRIVATE_ALS_KEY = Symbol.for("vinext.cacheRuntime.privateAls");
const _PRIVATE_FALLBACK_KEY = Symbol.for("vinext.cacheRuntime.privateFallback");
const _g$1 = globalThis;
const _privateAls = _g$1[_PRIVATE_ALS_KEY] ??= new AsyncLocalStorage$1();
const _privateFallbackState = _g$1[_PRIVATE_FALLBACK_KEY] ??= {
  cache: /* @__PURE__ */ new Map()
};
function _privateEnterWith(state) {
  const enterWith = _privateAls.enterWith;
  if (typeof enterWith === "function") {
    try {
      enterWith.call(_privateAls, state);
      return;
    } catch {
    }
  }
  _privateFallbackState.cache = state.cache;
}
function clearPrivateCache() {
  _privateEnterWith({ cache: /* @__PURE__ */ new Map() });
  _privateFallbackState.cache = /* @__PURE__ */ new Map();
}
const _ALS_KEY = Symbol.for("vinext.navigation.als");
const _FALLBACK_KEY = Symbol.for("vinext.navigation.fallback");
const _g = globalThis;
const _als = _g[_ALS_KEY] ??= new AsyncLocalStorage$1();
const _fallbackState = _g[_FALLBACK_KEY] ??= {
  serverContext: null,
  serverInsertedHTMLCallbacks: []
};
function _enterWith(state) {
  const enterWith = _als.enterWith;
  if (typeof enterWith === "function") {
    try {
      enterWith.call(_als, state);
      return;
    } catch {
    }
  }
  _fallbackState.serverContext = state.serverContext;
  _fallbackState.serverInsertedHTMLCallbacks = state.serverInsertedHTMLCallbacks;
}
function _getState() {
  return _als.getStore() ?? _fallbackState;
}
_registerStateAccessors({
  getServerContext() {
    return _getState().serverContext;
  },
  setServerContext(ctx) {
    if (ctx !== null) {
      const existing = _als.getStore();
      _enterWith({
        serverContext: ctx,
        serverInsertedHTMLCallbacks: existing?.serverInsertedHTMLCallbacks ?? _fallbackState.serverInsertedHTMLCallbacks ?? []
      });
      _fallbackState.serverContext = ctx;
      return;
    }
    const state = _als.getStore();
    if (state) {
      state.serverContext = null;
    }
    _fallbackState.serverContext = null;
  }
});
async function reportRequestError(error, request, context) {
  return;
}
function escapeCSSString(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\a ").replace(/\r/g, "\\d ");
}
function sanitizeCSSVarName(name) {
  if (/^--[a-zA-Z0-9_-]+$/.test(name))
    return name;
  return void 0;
}
function sanitizeFallback(name) {
  const generics = /* @__PURE__ */ new Set([
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-serif",
    "ui-sans-serif",
    "ui-monospace",
    "ui-rounded",
    "emoji",
    "math",
    "fangsong"
  ]);
  const trimmed = name.trim();
  if (generics.has(trimmed))
    return trimmed;
  return `'${escapeCSSString(trimmed)}'`;
}
let classCounter = 0;
const injectedFonts = /* @__PURE__ */ new Set();
function toVarName(family) {
  return "--font-" + family.toLowerCase().replace(/\s+/g, "-");
}
function buildGoogleFontsUrl(family, options) {
  const params = new URLSearchParams();
  let spec = family;
  const weights = options.weight ? Array.isArray(options.weight) ? options.weight : [options.weight] : [];
  const styles = options.style ? Array.isArray(options.style) ? options.style : [options.style] : [];
  if (weights.length > 0 || styles.length > 0) {
    const hasItalic = styles.includes("italic");
    if (weights.length > 0) {
      if (hasItalic) {
        const pairs = [];
        for (const w of weights) {
          pairs.push(`0,${w}`);
          pairs.push(`1,${w}`);
        }
        spec += `:ital,wght@${pairs.join(";")}`;
      } else {
        spec += `:wght@${weights.join(";")}`;
      }
    }
  } else {
    spec += `:wght@100..900`;
  }
  params.set("family", spec);
  params.set("display", options.display ?? "swap");
  return `https://fonts.googleapis.com/css2?${params.toString()}`;
}
function injectFontStylesheet(url) {
  if (injectedFonts.has(url))
    return;
  injectedFonts.add(url);
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
}
const injectedClassRules = /* @__PURE__ */ new Set();
function injectClassNameRule(className, fontFamily) {
  if (injectedClassRules.has(className))
    return;
  injectedClassRules.add(className);
  const css = `.${className} { font-family: ${fontFamily}; }
`;
  if (typeof document === "undefined") {
    ssrFontStyles$1.push(css);
    return;
  }
  const style = document.createElement("style");
  style.textContent = css;
  style.setAttribute("data-vinext-font-class", className);
  document.head.appendChild(style);
}
const injectedVariableRules = /* @__PURE__ */ new Set();
const injectedRootVariables = /* @__PURE__ */ new Set();
function injectVariableClassRule(variableClassName, cssVarName, fontFamily) {
  if (injectedVariableRules.has(variableClassName))
    return;
  injectedVariableRules.add(variableClassName);
  let css = `.${variableClassName} { ${cssVarName}: ${fontFamily}; }
`;
  if (!injectedRootVariables.has(cssVarName)) {
    injectedRootVariables.add(cssVarName);
    css += `:root { ${cssVarName}: ${fontFamily}; }
`;
  }
  if (typeof document === "undefined") {
    ssrFontStyles$1.push(css);
    return;
  }
  const style = document.createElement("style");
  style.textContent = css;
  style.setAttribute("data-vinext-font-variable", variableClassName);
  document.head.appendChild(style);
}
const ssrFontStyles$1 = [];
function getSSRFontStyles$1() {
  return [...ssrFontStyles$1];
}
const ssrFontUrls = [];
function getSSRFontLinks() {
  return [...ssrFontUrls];
}
const ssrFontPreloads$1 = [];
const ssrFontPreloadHrefs = /* @__PURE__ */ new Set();
function getSSRFontPreloads$1() {
  return [...ssrFontPreloads$1];
}
function getFontMimeType(pathOrUrl) {
  if (pathOrUrl.endsWith(".woff2"))
    return "font/woff2";
  if (pathOrUrl.endsWith(".woff"))
    return "font/woff";
  if (pathOrUrl.endsWith(".ttf"))
    return "font/ttf";
  if (pathOrUrl.endsWith(".otf"))
    return "font/opentype";
  return "font/woff2";
}
function extractFontUrlsFromCSS(css) {
  const urls = [];
  const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
  let match;
  while ((match = urlRegex.exec(css)) !== null) {
    const url = match[1];
    if (url && url.startsWith("/")) {
      urls.push(url);
    }
  }
  return urls;
}
function collectFontPreloadsFromCSS(css) {
  if (typeof document !== "undefined")
    return;
  const urls = extractFontUrlsFromCSS(css);
  for (const href of urls) {
    if (!ssrFontPreloadHrefs.has(href)) {
      ssrFontPreloadHrefs.add(href);
      ssrFontPreloads$1.push({ href, type: getFontMimeType(href) });
    }
  }
}
const injectedSelfHosted = /* @__PURE__ */ new Set();
function injectSelfHostedCSS(css) {
  if (injectedSelfHosted.has(css))
    return;
  injectedSelfHosted.add(css);
  collectFontPreloadsFromCSS(css);
  if (typeof document === "undefined") {
    ssrFontStyles$1.push(css);
    return;
  }
  const style = document.createElement("style");
  style.textContent = css;
  style.setAttribute("data-vinext-font-selfhosted", "true");
  document.head.appendChild(style);
}
function createFontLoader(family) {
  return function fontLoader(options = {}) {
    const id = classCounter++;
    const className = `__font_${family.toLowerCase().replace(/\s+/g, "_")}_${id}`;
    const fallback = options.fallback ?? ["sans-serif"];
    const fontFamily = `'${escapeCSSString(family)}', ${fallback.map(sanitizeFallback).join(", ")}`;
    const defaultVarName = toVarName(family);
    const cssVarName = options.variable ? sanitizeCSSVarName(options.variable) ?? defaultVarName : defaultVarName;
    const variableClassName = `__variable_${family.toLowerCase().replace(/\s+/g, "_")}_${id}`;
    if (options._selfHostedCSS) {
      injectSelfHostedCSS(options._selfHostedCSS);
    } else {
      const url = buildGoogleFontsUrl(family, options);
      injectFontStylesheet(url);
      if (typeof document === "undefined") {
        if (!ssrFontUrls.includes(url)) {
          ssrFontUrls.push(url);
        }
      }
    }
    injectClassNameRule(className, fontFamily);
    injectVariableClassRule(variableClassName, cssVarName, fontFamily);
    return {
      className,
      style: { fontFamily },
      variable: variableClassName
    };
  };
}
const googleFonts = new Proxy({}, {
  get(_target, prop) {
    if (prop === "__esModule")
      return true;
    if (prop === "default")
      return googleFonts;
    const family = prop.replace(/([a-z])([A-Z])/g, "$1 $2");
    return createFontLoader(family);
  }
});
const ssrFontStyles = [];
const ssrFontPreloads = [];
function getSSRFontStyles() {
  return [...ssrFontStyles];
}
function getSSRFontPreloads() {
  return [...ssrFontPreloads];
}
const version$1 = "1.34.1";
var lookup = [];
var revLookup = [];
var Arr = Uint8Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function _byteLength(_b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr2 = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i;
  for (i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr2[curByte++] = tmp >> 16 & 255;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  return arr2;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i,
        i + maxChunkLength > len2 ? len2 : i + maxChunkLength
      )
    );
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
    );
  }
  return parts.join("");
}
function parseArgs(args) {
  if (args === void 0) {
    return {};
  }
  if (!isSimpleObject(args)) {
    throw new Error(
      `The arguments to a Convex function must be an object. Received: ${args}`
    );
  }
  return args;
}
function validateDeploymentUrl(deploymentUrl) {
  if (typeof deploymentUrl === "undefined") {
    throw new Error(
      `Client created with undefined deployment address. If you used an environment variable, check that it's set.`
    );
  }
  if (typeof deploymentUrl !== "string") {
    throw new Error(
      `Invalid deployment address: found ${deploymentUrl}".`
    );
  }
  if (!(deploymentUrl.startsWith("http:") || deploymentUrl.startsWith("https:"))) {
    throw new Error(
      `Invalid deployment address: Must start with "https://" or "http://". Found "${deploymentUrl}".`
    );
  }
  try {
    new URL(deploymentUrl);
  } catch {
    throw new Error(
      `Invalid deployment address: "${deploymentUrl}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
    );
  }
  if (deploymentUrl.endsWith(".convex.site")) {
    throw new Error(
      `Invalid deployment address: "${deploymentUrl}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
    );
  }
}
function isSimpleObject(value) {
  const isObject2 = typeof value === "object";
  const prototype = Object.getPrototypeOf(value);
  const isSimple = prototype === null || prototype === Object.prototype || // Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
  // conditions but are still simple objects.
  prototype?.constructor?.name === "Object";
  return isObject2 && isSimple;
}
const LITTLE_ENDIAN = true;
const MIN_INT64 = BigInt("-9223372036854775808");
const MAX_INT64 = BigInt("9223372036854775807");
const ZERO = BigInt("0");
const EIGHT = BigInt("8");
const TWOFIFTYSIX = BigInt("256");
function isSpecial(n) {
  return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
}
function slowBigIntToBase64(value) {
  if (value < ZERO) {
    value -= MIN_INT64 + MIN_INT64;
  }
  let hex = value.toString(16);
  if (hex.length % 2 === 1) hex = "0" + hex;
  const bytes = new Uint8Array(new ArrayBuffer(8));
  let i = 0;
  for (const hexByte of hex.match(/.{2}/g).reverse()) {
    bytes.set([parseInt(hexByte, 16)], i++);
    value >>= EIGHT;
  }
  return fromByteArray(bytes);
}
function slowBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  let value = ZERO;
  let power = ZERO;
  for (const byte of integerBytes) {
    value += BigInt(byte) * TWOFIFTYSIX ** power;
    power++;
  }
  if (value > MAX_INT64) {
    value += MIN_INT64 + MIN_INT64;
  }
  return value;
}
function modernBigIntToBase64(value) {
  if (value < MIN_INT64 || MAX_INT64 < value) {
    throw new Error(
      `BigInt ${value} does not fit into a 64-bit signed integer.`
    );
  }
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setBigInt64(0, value, true);
  return fromByteArray(new Uint8Array(buffer));
}
function modernBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  const intBytesView = new DataView(integerBytes.buffer);
  return intBytesView.getBigInt64(0, true);
}
const bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
const base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
const MAX_IDENTIFIER_LEN = 1024;
function validateObjectField(k) {
  if (k.length > MAX_IDENTIFIER_LEN) {
    throw new Error(
      `Field name ${k} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`
    );
  }
  if (k.startsWith("$")) {
    throw new Error(`Field name ${k} starts with a '$', which is reserved.`);
  }
  for (let i = 0; i < k.length; i += 1) {
    const charCode = k.charCodeAt(i);
    if (charCode < 32 || charCode >= 127) {
      throw new Error(
        `Field name ${k} has invalid character '${k[i]}': Field names can only contain non-control ASCII characters`
      );
    }
  }
}
function jsonToConvex(value) {
  if (value === null) {
    return value;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((value2) => jsonToConvex(value2));
  }
  if (typeof value !== "object") {
    throw new Error(`Unexpected type of ${value}`);
  }
  const entries = Object.entries(value);
  if (entries.length === 1) {
    const key = entries[0][0];
    if (key === "$bytes") {
      if (typeof value.$bytes !== "string") {
        throw new Error(`Malformed $bytes field on ${value}`);
      }
      return toByteArray(value.$bytes).buffer;
    }
    if (key === "$integer") {
      if (typeof value.$integer !== "string") {
        throw new Error(`Malformed $integer field on ${value}`);
      }
      return base64ToBigInt(value.$integer);
    }
    if (key === "$float") {
      if (typeof value.$float !== "string") {
        throw new Error(`Malformed $float field on ${value}`);
      }
      const floatBytes = toByteArray(value.$float);
      if (floatBytes.byteLength !== 8) {
        throw new Error(
          `Received ${floatBytes.byteLength} bytes, expected 8 for $float`
        );
      }
      const floatBytesView = new DataView(floatBytes.buffer);
      const float = floatBytesView.getFloat64(0, LITTLE_ENDIAN);
      if (!isSpecial(float)) {
        throw new Error(`Float ${float} should be encoded as a number`);
      }
      return float;
    }
    if (key === "$set") {
      throw new Error(
        `Received a Set which is no longer supported as a Convex type.`
      );
    }
    if (key === "$map") {
      throw new Error(
        `Received a Map which is no longer supported as a Convex type.`
      );
    }
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    validateObjectField(k);
    out[k] = jsonToConvex(v);
  }
  return out;
}
const MAX_VALUE_FOR_ERROR_LEN = 16384;
function stringifyValueForError(value) {
  const str = JSON.stringify(value, (_key, value2) => {
    if (value2 === void 0) {
      return "undefined";
    }
    if (typeof value2 === "bigint") {
      return `${value2.toString()}n`;
    }
    return value2;
  });
  if (str.length > MAX_VALUE_FOR_ERROR_LEN) {
    const rest = "[...truncated]";
    let truncateAt = MAX_VALUE_FOR_ERROR_LEN - rest.length;
    const codePoint = str.codePointAt(truncateAt - 1);
    if (codePoint !== void 0 && codePoint > 65535) {
      truncateAt -= 1;
    }
    return str.substring(0, truncateAt) + rest;
  }
  return str;
}
function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
  if (value === void 0) {
    const contextText = context && ` (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )})`;
    throw new Error(
      `undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    );
  }
  if (value === null) {
    return value;
  }
  if (typeof value === "bigint") {
    if (value < MIN_INT64 || MAX_INT64 < value) {
      throw new Error(
        `BigInt ${value} does not fit into a 64-bit signed integer.`
      );
    }
    return { $integer: bigIntToBase64(value) };
  }
  if (typeof value === "number") {
    if (isSpecial(value)) {
      const buffer = new ArrayBuffer(8);
      new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
      return { $float: fromByteArray(new Uint8Array(buffer)) };
    } else {
      return value;
    }
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return { $bytes: fromByteArray(new Uint8Array(value)) };
  }
  if (Array.isArray(value)) {
    return value.map(
      (value2, i) => convexToJsonInternal(value2, originalValue, context + `[${i}]`)
    );
  }
  if (value instanceof Set) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Set", [...value], originalValue)
    );
  }
  if (value instanceof Map) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Map", [...value], originalValue)
    );
  }
  if (!isSimpleObject(value)) {
    const theType = value?.constructor?.name;
    const typeName = theType ? `${theType} ` : "";
    throw new Error(
      errorMessageForUnsupportedType(context, typeName, value, originalValue)
    );
  }
  const out = {};
  const entries = Object.entries(value);
  entries.sort(([k1, _v1], [k2, _v2]) => k1 === k2 ? 0 : k1 < k2 ? -1 : 1);
  for (const [k, v] of entries) {
    if (v !== void 0) {
      validateObjectField(k);
      out[k] = convexToJsonInternal(v, originalValue, context + `.${k}`);
    }
  }
  return out;
}
function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
  if (context) {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
  } else {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type.`;
  }
}
function convexToJson(value) {
  return convexToJsonInternal(value, value, "");
}
var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a$1, _b;
const IDENTIFYING_FIELD = Symbol.for("ConvexError");
class ConvexError extends (_b = Error, _a$1 = IDENTIFYING_FIELD, _b) {
  constructor(data) {
    super(typeof data === "string" ? data : stringifyValueForError(data));
    __publicField$2(this, "name", "ConvexError");
    __publicField$2(this, "data");
    __publicField$2(this, _a$1, true);
    this.data = data;
  }
}
const arr = () => Array.from({ length: 4 }, () => 0);
arr();
arr();
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
const INFO_COLOR = "color:rgb(0, 145, 255)";
function prefix_for_source(source) {
  switch (source) {
    case "query":
      return "Q";
    case "mutation":
      return "M";
    case "action":
      return "A";
    case "any":
      return "?";
  }
}
class DefaultLogger {
  constructor(options) {
    __publicField$1(this, "_onLogLineFuncs");
    __publicField$1(this, "_verbose");
    this._onLogLineFuncs = {};
    this._verbose = options.verbose;
  }
  addLogLineListener(func) {
    let id = Math.random().toString(36).substring(2, 15);
    for (let i = 0; i < 10; i++) {
      if (this._onLogLineFuncs[id] === void 0) {
        break;
      }
      id = Math.random().toString(36).substring(2, 15);
    }
    this._onLogLineFuncs[id] = func;
    return () => {
      delete this._onLogLineFuncs[id];
    };
  }
  logVerbose(...args) {
    if (this._verbose) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("debug", `${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
      }
    }
  }
  log(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("info", ...args);
    }
  }
  warn(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("warn", ...args);
    }
  }
  error(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("error", ...args);
    }
  }
}
function instantiateDefaultLogger(options) {
  const logger = new DefaultLogger(options);
  logger.addLogLineListener((level, ...args) => {
    switch (level) {
      case "debug":
        console.debug(...args);
        break;
      case "info":
        console.log(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
      default: {
        console.log(...args);
      }
    }
  });
  return logger;
}
function instantiateNoopLogger(options) {
  return new DefaultLogger(options);
}
function logForFunction(logger, type, source, udfPath, message) {
  const prefix = prefix_for_source(source);
  if (typeof message === "object") {
    message = `ConvexError ${JSON.stringify(message.errorData, null, 2)}`;
  }
  {
    const match = message.match(/^\[.*?\] /);
    if (match === null) {
      logger.error(
        `[CONVEX ${prefix}(${udfPath})] Could not parse console.log`
      );
      return;
    }
    const level = message.slice(1, match[0].length - 2);
    const args = message.slice(match[0].length);
    logger.log(`%c[CONVEX ${prefix}(${udfPath})] [${level}]`, INFO_COLOR, args);
  }
}
const functionName = Symbol.for("functionName");
const toReferencePath = Symbol.for("toReferencePath");
function extractReferencePath(reference) {
  return reference[toReferencePath] ?? null;
}
function isFunctionHandle(s) {
  return s.startsWith("function://");
}
function getFunctionAddress(functionReference) {
  let functionAddress;
  if (typeof functionReference === "string") {
    if (isFunctionHandle(functionReference)) {
      functionAddress = { functionHandle: functionReference };
    } else {
      functionAddress = { name: functionReference };
    }
  } else if (functionReference[functionName]) {
    functionAddress = { name: functionReference[functionName] };
  } else {
    const referencePath = extractReferencePath(functionReference);
    if (!referencePath) {
      throw new Error(`${functionReference} is not a functionReference`);
    }
    functionAddress = { reference: referencePath };
  }
  return functionAddress;
}
function getFunctionName(functionReference) {
  const address = getFunctionAddress(functionReference);
  if (address.name === void 0) {
    if (address.functionHandle !== void 0) {
      throw new Error(
        `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${address.functionHandle}`
      );
    } else if (address.reference !== void 0) {
      throw new Error(
        `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${address.reference}`
      );
    }
    throw new Error(
      `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(address)}`
    );
  }
  if (typeof functionReference === "string") return functionReference;
  const name = functionReference[functionName];
  if (!name) {
    throw new Error(`${functionReference} is not a functionReference`);
  }
  return name;
}
function createApi(pathParts = []) {
  const handler2 = {
    get(_, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createApi(newParts);
      } else if (prop === functionName) {
        if (pathParts.length < 2) {
          const found = ["api", ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``
          );
        }
        const path = pathParts.slice(0, -1).join("/");
        const exportName = pathParts[pathParts.length - 1];
        if (exportName === "default") {
          return path;
        } else {
          return path + ":" + exportName;
        }
      } else if (prop === Symbol.toStringTag) {
        return "FunctionReference";
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler2);
}
const anyApi = createApi();
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const STATUS_CODE_UDF_FAILED = 560;
let specifiedFetch = void 0;
class ConvexHttpClient {
  /**
   * Create a new {@link ConvexHttpClient}.
   *
   * @param address - The url of your Convex deployment, often provided
   * by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
   * @param options - An object of options.
   * - `skipConvexDeploymentUrlCheck` - Skip validating that the Convex deployment URL looks like
   * `https://happy-animal-123.convex.cloud` or localhost. This can be useful if running a self-hosted
   * Convex backend that uses a different URL.
   * - `logger` - A logger or a boolean. If not provided, logs to the console.
   * You can construct your own logger to customize logging to log elsewhere
   * or not log at all, or use `false` as a shorthand for a no-op logger.
   * A logger is an object with 4 methods: log(), warn(), error(), and logVerbose().
   * These methods can receive multiple arguments of any types, like console.log().
   * - `auth` - A JWT containing identity claims accessible in Convex functions.
   * This identity may expire so it may be necessary to call `setAuth()` later,
   * but for short-lived clients it's convenient to specify this value here.
   * - `fetch` - A custom fetch implementation to use for all HTTP requests made by this client.
   */
  constructor(address, options) {
    __publicField(this, "address");
    __publicField(this, "auth");
    __publicField(this, "adminAuth");
    __publicField(this, "encodedTsPromise");
    __publicField(this, "debug");
    __publicField(this, "fetchOptions");
    __publicField(this, "fetch");
    __publicField(this, "logger");
    __publicField(this, "mutationQueue", []);
    __publicField(this, "isProcessingQueue", false);
    if (typeof options === "boolean") {
      throw new Error(
        "skipConvexDeploymentUrlCheck as the second argument is no longer supported. Please pass an options object, `{ skipConvexDeploymentUrlCheck: true }`."
      );
    }
    const opts = options ?? {};
    if (opts.skipConvexDeploymentUrlCheck !== true) {
      validateDeploymentUrl(address);
    }
    this.logger = options?.logger === false ? instantiateNoopLogger({ verbose: false }) : options?.logger !== true && options?.logger ? options.logger : instantiateDefaultLogger({ verbose: false });
    this.address = address;
    this.debug = true;
    this.auth = void 0;
    this.adminAuth = void 0;
    this.fetch = options?.fetch;
    if (options?.auth) {
      this.setAuth(options.auth);
    }
  }
  /**
   * Obtain the {@link ConvexHttpClient}'s URL to its backend.
   * @deprecated Use url, which returns the url without /api at the end.
   *
   * @returns The URL to the Convex backend, including the client's API version.
   */
  backendUrl() {
    return `${this.address}/api`;
  }
  /**
   * Return the address for this client, useful for creating a new client.
   *
   * Not guaranteed to match the address with which this client was constructed:
   * it may be canonicalized.
   */
  get url() {
    return this.address;
  }
  /**
   * Set the authentication token to be used for subsequent queries and mutations.
   *
   * Should be called whenever the token changes (i.e. due to expiration and refresh).
   *
   * @param value - JWT-encoded OpenID Connect identity token.
   */
  setAuth(value) {
    this.clearAuth();
    this.auth = value;
  }
  /**
   * Set admin auth token to allow calling internal queries, mutations, and actions
   * and acting as an identity.
   *
   * @internal
   */
  setAdminAuth(token, actingAsIdentity) {
    this.clearAuth();
    if (actingAsIdentity !== void 0) {
      const bytes = new TextEncoder().encode(JSON.stringify(actingAsIdentity));
      const actingAsIdentityEncoded = btoa(String.fromCodePoint(...bytes));
      this.adminAuth = `${token}:${actingAsIdentityEncoded}`;
    } else {
      this.adminAuth = token;
    }
  }
  /**
   * Clear the current authentication token if set.
   */
  clearAuth() {
    this.auth = void 0;
    this.adminAuth = void 0;
  }
  /**
   * Sets whether the result log lines should be printed on the console or not.
   *
   * @internal
   */
  setDebug(debug) {
    this.debug = debug;
  }
  /**
   * Used to customize the fetch behavior in some runtimes.
   *
   * @internal
   */
  setFetchOptions(fetchOptions) {
    this.fetchOptions = fetchOptions;
  }
  /**
   * This API is experimental: it may change or disappear.
   *
   * Execute a Convex query function at the same timestamp as every other
   * consistent query execution run by this HTTP client.
   *
   * This doesn't make sense for long-lived ConvexHttpClients as Convex
   * backends can read a limited amount into the past: beyond 30 seconds
   * in the past may not be available.
   *
   * Create a new client to use a consistent time.
   *
   * @param name - The name of the query.
   * @param args - The arguments object for the query. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the query's result.
   *
   * @deprecated This API is experimental: it may change or disappear.
   */
  async consistentQuery(query, ...args) {
    const queryArgs = parseArgs(args[0]);
    const timestampPromise = this.getTimestamp();
    return await this.queryInner(query, queryArgs, { timestampPromise });
  }
  async getTimestamp() {
    if (this.encodedTsPromise) {
      return this.encodedTsPromise;
    }
    return this.encodedTsPromise = this.getTimestampInner();
  }
  async getTimestampInner() {
    const localFetch = this.fetch || specifiedFetch || fetch;
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version$1}`
    };
    const response = await localFetch(`${this.address}/api/query_ts`, {
      ...this.fetchOptions,
      method: "POST",
      headers
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const { ts } = await response.json();
    return ts;
  }
  /**
   * Execute a Convex query function.
   *
   * @param name - The name of the query.
   * @param args - The arguments object for the query. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the query's result.
   */
  async query(query, ...args) {
    const queryArgs = parseArgs(args[0]);
    return await this.queryInner(query, queryArgs, {});
  }
  async queryInner(query, queryArgs, options) {
    const name = getFunctionName(query);
    const args = [convexToJson(queryArgs)];
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version$1}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const timestamp = options.timestampPromise ? await options.timestampPromise : void 0;
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args,
      ...timestamp ? { ts: timestamp } : {}
    });
    const endpoint = timestamp ? `${this.address}/api/query_at_ts` : `${this.address}/api/query`;
    const response = await localFetch(endpoint, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "query", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  async mutationInner(mutation, mutationArgs) {
    const name = getFunctionName(mutation);
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args: [convexToJson(mutationArgs)]
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version$1}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/mutation`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "mutation", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  async processMutationQueue() {
    if (this.isProcessingQueue) {
      return;
    }
    this.isProcessingQueue = true;
    while (this.mutationQueue.length > 0) {
      const { mutation, args, resolve, reject } = this.mutationQueue.shift();
      try {
        const result = await this.mutationInner(mutation, args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    this.isProcessingQueue = false;
  }
  enqueueMutation(mutation, args) {
    return new Promise((resolve, reject) => {
      this.mutationQueue.push({ mutation, args, resolve, reject });
      void this.processMutationQueue();
    });
  }
  /**
   * Execute a Convex mutation function. Mutations are queued by default.
   *
   * @param name - The name of the mutation.
   * @param args - The arguments object for the mutation. If this is omitted,
   * the arguments will be `{}`.
   * @param options - An optional object containing
   * @returns A promise of the mutation's result.
   */
  async mutation(mutation, ...args) {
    const [fnArgs, options] = args;
    const mutationArgs = parseArgs(fnArgs);
    const queued = !options?.skipQueue;
    if (queued) {
      return await this.enqueueMutation(mutation, mutationArgs);
    } else {
      return await this.mutationInner(mutation, mutationArgs);
    }
  }
  /**
   * Execute a Convex action function. Actions are not queued.
   *
   * @param name - The name of the action.
   * @param args - The arguments object for the action. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the action's result.
   */
  async action(action, ...args) {
    const actionArgs = parseArgs(args[0]);
    const name = getFunctionName(action);
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args: [convexToJson(actionArgs)]
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version$1}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/action`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "action", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  /**
   * Execute a Convex function of an unknown type. These function calls are not queued.
   *
   * @param name - The name of the function.
   * @param args - The arguments object for the function. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the function's result.
   *
   * @internal
   */
  async function(anyFunction, componentPath, ...args) {
    const functionArgs = parseArgs(args[0]);
    const name = typeof anyFunction === "string" ? anyFunction : getFunctionName(anyFunction);
    const body = JSON.stringify({
      componentPath,
      path: name,
      format: "convex_encoded_json",
      args: convexToJson(functionArgs)
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version$1}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/function`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "any", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
}
function forwardErrorData(errorData, error) {
  error.data = jsonToConvex(errorData);
  return error;
}
function createChildComponents(root, pathParts) {
  const handler2 = {
    get(_, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createChildComponents(root, newParts);
      } else if (prop === toReferencePath) {
        if (pathParts.length < 1) {
          const found = [root, ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`${root}.childComponent.functionName\`. Found: \`${found}\``
          );
        }
        return `_reference/childComponent/` + pathParts.join("/");
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler2);
}
const componentsGeneric = () => createChildComponents("components", []);
const api = anyApi;
const internal = anyApi;
componentsGeneric();
function isProductionRuntime(env) {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}
async function findAdminKeyInConfigRoot(configRoot) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  let directoryEntries;
  try {
    directoryEntries = await fs.readdir(configRoot, { withFileTypes: true });
  } catch {
    return null;
  }
  const configPaths = directoryEntries.filter((entry) => entry.isDirectory()).map((entry) => path.join(configRoot, entry.name, "config.json")).sort((left, right) => left.localeCompare(right));
  for (const configPath of configPaths) {
    try {
      const rawConfig = await fs.readFile(configPath, "utf8");
      const parsedConfig = JSON.parse(rawConfig);
      if (typeof parsedConfig.adminKey === "string" && parsedConfig.adminKey.trim().length > 0) {
        return parsedConfig.adminKey.trim();
      }
    } catch {
      continue;
    }
  }
  return null;
}
async function readLocalConvexAdminKey(cwd, homeDir) {
  const path = await import("node:path");
  const os = await import("node:os");
  const configRoots = [
    path.join(cwd, ".convex", "local"),
    path.join(homeDir ?? os.homedir(), ".convex")
  ];
  for (const configRoot of configRoots) {
    const adminKey = await findAdminKeyInConfigRoot(configRoot);
    if (adminKey) {
      return adminKey;
    }
  }
  return null;
}
async function resolveConvexAdminAuth(options = {}) {
  const env = options.env ?? process.env;
  const deployKey = env.CONVEX_DEPLOY_KEY?.trim();
  if (deployKey) {
    return {
      source: "deploy-key",
      token: deployKey
    };
  }
  if (isProductionRuntime(env)) {
    throw new Error(
      "Missing Convex admin auth. Set CONVEX_DEPLOY_KEY for production server-side internal function calls."
    );
  }
  const localAdminKey = await readLocalConvexAdminKey(
    options.cwd ?? process.cwd(),
    options.homeDir
  );
  if (localAdminKey) {
    return {
      source: "local-admin-key",
      token: localAdminKey
    };
  }
  throw new Error(
    "Missing Convex admin auth. Start `npm run dev:stack` or `npx convex dev --local` locally, or set CONVEX_DEPLOY_KEY for server-side internal function calls."
  );
}
const DEFAULT_LOCAL_CONVEX_HOST = "127.0.0.1";
const DEFAULT_LOCAL_CONVEX_PORT = "3210";
const DEFAULT_LOCAL_CONVEX_URL = `http://${DEFAULT_LOCAL_CONVEX_HOST}:${DEFAULT_LOCAL_CONVEX_PORT}`;
function normalizeUrl(url) {
  return url.trim().replace(/\/+$/, "");
}
function getConfiguredConvexUrl(env) {
  const configuredUrl = env.CONVEX_URL?.trim() || env.NEXT_PUBLIC_CONVEX_URL?.trim();
  return configuredUrl ? normalizeUrl(configuredUrl) : null;
}
function getConvexUrl(env = process.env) {
  return getConfiguredConvexUrl(env) ?? DEFAULT_LOCAL_CONVEX_URL;
}
let convexClient = null;
let internalConvexClient = null;
function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(getConvexUrl());
  }
  return convexClient;
}
async function getInternalConvexClient() {
  if (!internalConvexClient) {
    internalConvexClient = new ConvexHttpClient(getConvexUrl());
  }
  const adminAuth = await resolveConvexAdminAuth();
  internalConvexClient.setAdminAuth(adminAuth.token);
  return internalConvexClient;
}
async function fetchQuery(ref, args) {
  return getConvexClient().query(ref, args);
}
async function fetchInternalQuery(ref, args) {
  const client = await getInternalConvexClient();
  return client.query(ref, args);
}
async function fetchInternalMutation(ref, args) {
  const client = await getInternalConvexClient();
  return client.mutation(ref, args);
}
async function getServerSessionClaims$1() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, getAuthJwtSecret());
}
function getCookieValueFromHeader(cookieHeader, key) {
  if (!cookieHeader) return null;
  const entries = cookieHeader.split(";");
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;
    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) continue;
    return decodeURIComponent(trimmed.slice(separatorIndex + 1));
  }
  return null;
}
async function getRequestSessionClaims(request) {
  const token = getCookieValueFromHeader(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (!token) return null;
  return verifySessionToken(token, getAuthJwtSecret());
}
function buildRequestUnauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
function buildRequestForbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
async function requireRequestSessionClaims(request, unauthorizedMessage = "Unauthorized") {
  const claims = await getRequestSessionClaims(request);
  if (!claims) {
    return buildRequestUnauthorizedResponse(unauthorizedMessage);
  }
  return claims;
}
async function requireStudentRequestClaims(request, unauthorizedMessage = "Unauthorized", forbiddenMessage = "Forbidden") {
  const claimsOrResponse = await requireRequestSessionClaims(request, unauthorizedMessage);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  if (claimsOrResponse.role !== "student") {
    return buildRequestForbiddenResponse(forbiddenMessage);
  }
  return claimsOrResponse;
}
function buildLoginRedirect$1(loginRedirectPath) {
  return `/auth/login?redirect=${loginRedirectPath}`;
}
async function requireServerSessionClaims(loginRedirectPath) {
  const claims = await getServerSessionClaims$1();
  if (!claims) {
    redirect(buildLoginRedirect$1(loginRedirectPath));
  }
  return claims;
}
function requireServerRoles(claims, allowedRoles, unauthorizedRedirectPath) {
  if (!allowedRoles.includes(claims.role)) {
    redirect(unauthorizedRedirectPath);
  }
  return claims;
}
async function requireTeacherSessionClaims(loginRedirectPath, unauthorizedRedirectPath = "/student/dashboard") {
  const claims = await requireServerSessionClaims(loginRedirectPath);
  return requireServerRoles(claims, ["teacher", "admin"], unauthorizedRedirectPath);
}
async function requireDeveloperRequestClaims(request, unauthorizedMessage = "Unauthorized", forbiddenMessage = "Forbidden") {
  const claimsOrResponse = await requireRequestSessionClaims(request, unauthorizedMessage);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  if (claimsOrResponse.role !== "admin") {
    return buildRequestForbiddenResponse(forbiddenMessage);
  }
  return claimsOrResponse;
}
function buildRequestServiceUnavailableResponse(message = "Service unavailable") {
  return NextResponse.json({ error: message }, { status: 503 });
}
async function requireActiveRequestSessionClaims(request, unauthorizedMessage = "Unauthorized") {
  const claimsOrResponse = await requireRequestSessionClaims(request, unauthorizedMessage);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  try {
    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
      username: claimsOrResponse.username
    });
    if (!credential || !credential.isActive) {
      return buildRequestUnauthorizedResponse(unauthorizedMessage);
    }
    return claimsOrResponse;
  } catch {
    return buildRequestServiceUnavailableResponse("Service unavailable. Please try again later.");
  }
}
async function requireStudentSessionClaims(loginRedirectPath) {
  const claims = await requireServerSessionClaims(loginRedirectPath);
  if (claims.role === "student") {
    return claims;
  }
  if (claims.role === "teacher") {
    redirect("/teacher");
  }
  if (claims.role === "admin") {
    redirect("/teacher");
  }
  redirect(buildLoginRedirect$1(loginRedirectPath));
}
function $constructor(name, initializer2, params) {
  function init2(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer2(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a2;
    const inst = params?.Parent ? new Definition() : this;
    init2(inst, def);
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init2 });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}
class $ZodEncodeError extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}
const globalConfig = {};
function config(newConfig) {
  return globalConfig;
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  return {
    get value() {
      {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepString = step.toString();
  let stepDecCount = (stepString.split(".")[1] || "").length;
  if (stepDecCount === 0 && /\d?e-\d?/.test(stepString)) {
    const match = stepString.match(/\d?e-(\d?)/);
    if (match?.[1]) {
      stepDecCount = Number.parseInt(match[1]);
    }
  }
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
const EVALUATING = Symbol("evaluating");
function defineLazy(object2, key, getter) {
  let value = void 0;
  Object.defineProperty(object2, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object2, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = cached(() => {
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  return o;
}
const propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
const NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return clone(a, def);
}
function partial(Class, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a2;
    (_a2 = iss).path ?? (_a2.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const full = { ...iss, path: iss.path ?? [] };
  if (!iss.message) {
    const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
    full.message = message;
  }
  delete full.inst;
  delete full.continue;
  if (!ctx?.reportInput) {
    delete full.input;
  }
  return full;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
const initializer$1 = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
const $ZodError = $constructor("$ZodError", initializer$1);
const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error2) => {
    for (const issue2 of error2.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues });
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues });
      } else if (issue2.path.length === 0) {
        fieldErrors._errors.push(mapper(issue2));
      } else {
        let curr = fieldErrors;
        let i = 0;
        while (i < issue2.path.length) {
          const el = issue2.path[i];
          const terminal = i === issue2.path.length - 1;
          if (!terminal) {
            curr[el] = curr[el] || { _errors: [] };
          } else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(mapper(issue2));
          }
          curr = curr[el];
          i++;
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}
const _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
const safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError);
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
const safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync($ZodRealError);
const _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
const _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
const _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
const _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
const cuid = /^[cC][^\s-]{8,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
const uuid = (version2) => {
  if (!version2)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
  return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^[A-Za-z0-9_-]*$/;
const e164 = /^\+[1-9]\d{6,14}$/;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
const date$2 = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time$1(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime$1(args) {
  const time2 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time2}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const string$1 = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
const integer = /^-?\d+$/;
const number$1 = /^-?\d+(?:\.\d+)?$/;
const boolean$1 = /^(?:true|false)$/i;
const lowercase = /^[^A-Z]*$/;
const uppercase = /^[^a-z]*$/;
const $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a2;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
});
const numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
const $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    var _a2;
    (_a2 = inst2._zod.bag).multipleOf ?? (_a2.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
const $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a2, _b2;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a2 = inst._zod).check ?? (_a2.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b2 = inst._zod).check ?? (_b2.check = () => {
    });
});
const $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});
class Doc {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split("\n").filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [``];
    const lines = [...content.map((x) => `  ${x}`)];
    return new F(...args, lines.join("\n"));
  }
}
const version = {
  major: 4,
  minor: 3,
  patch: 6
};
const $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a2;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks2, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks2) {
        if (ch._zod.def.when) {
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError();
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary2) => {
            return handleCanaryResult(canary2, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return result.then((result2) => runChecks(result2, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse$1(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
const $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_2) {
      }
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
const $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
const $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
const $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === void 0)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
const $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
const $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      const url = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
const $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
const $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
const $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
const $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime$1(def));
  $ZodStringFormat.init(inst, def);
});
const $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date$2);
  $ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time$1(def));
  $ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration$1);
  $ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
const $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
const $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
const $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error();
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error();
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error();
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error();
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
const $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base642 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base642.padEnd(Math.ceil(base642.length / 4) * 4, "=");
  return isValidBase64(padded);
}
const $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
const $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
const $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
const $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
const $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean$1;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
const $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
const $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
const $ZodDate = /* @__PURE__ */ $constructor("$ZodDate", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce) {
      try {
        payload.value = new Date(payload.value);
      } catch (_err) {
      }
    }
    const input = payload.value;
    const isDate = input instanceof Date;
    const isValidDate = isDate && !Number.isNaN(input.getTime());
    if (isValidDate)
      return payload;
    payload.issues.push({
      expected: "date",
      code: "invalid_type",
      input,
      ...isDate ? { received: "Invalid Date" } : {},
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
const $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, isOptionalOut) {
  if (result.issues.length) {
    if (isOptionalOut && !(key in input)) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (result.value === void 0) {
    if (key in input) {
      final.value[key] = void 0;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
const $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject$1 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject$1(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const isOptionalOut = el._zod.optout === "optional";
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalOut)));
      } else {
        handlePropertyResult(r, payload, key, input, isOptionalOut);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
const $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    };
    doc.write(`const input = payload.value;`);
    const ids = /* @__PURE__ */ Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(`const newResult = {};`);
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      const schema = shape[key];
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(key)};`);
      if (isOptionalOut) {
        doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject$1 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval$1 = allowsEval;
  const fastEnabled = jit && allowsEval$1.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject$1(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
const $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return void 0;
  });
  const single = def.options.length === 1;
  const first = def.options[0]._zod.run;
  inst._zod.parse = (payload, ctx) => {
    if (single) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleUnionResults(results2, payload, inst, ctx);
    });
  };
});
const $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left2, right2]) => {
        return handleIntersectionResults(payload, left2, right2);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = /* @__PURE__ */ new Map();
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
const $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values) {
      payload.value = {};
      const recordKeys = /* @__PURE__ */ new Set();
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => {
              if (result2.issues.length) {
                payload.issues.push(...prefixIssues(key, result2.issues));
              }
              payload.value[key] = result2.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[key] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          unrecognized = unrecognized ?? [];
          unrecognized.push(key);
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized
        });
      }
    } else {
      payload.value = {};
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const checkNumericKey = typeof key === "string" && number$1.test(key) && keyResult.issues.length;
        if (checkNumericKey) {
          const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
          if (retryResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (retryResult.issues.length === 0) {
            keyResult = retryResult;
          }
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => {
            if (result2.issues.length) {
              payload.issues.push(...prefixIssues(key, result2.issues));
            }
            payload.value[keyResult.value] = result2.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[keyResult.value] = result.value;
        }
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
const $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
const $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  if (def.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
const $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError();
    }
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (result.issues.length && input === void 0) {
    return { issues: [], value: void 0 };
  }
  return result;
}
const $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, payload.value));
      return handleOptionalResult(result, payload.value);
    }
    if (payload.value === void 0) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleDefaultResult(result2, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
const $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleNonOptionalResult(result2, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
const $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => {
        payload.value = result2.value;
        if (result2.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
    }
    return payload;
  };
});
const $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handlePipeResult(right2, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left2) => handlePipeResult(left2, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
const $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
const $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r2) => handleRefineResult(r2, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
var _a;
class $ZodRegistry {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.set(meta.id, schema);
    }
    return this;
  }
  clear() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
}
function registry() {
  return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function _string(Class, params) {
  return new Class({
    type: "string",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _email(Class, params) {
  return new Class({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class, params) {
  return new Class({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _url(Class, params) {
  return new Class({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _emoji(Class, params) {
  return new Class({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class, params) {
  return new Class({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid(Class, params) {
  return new Class({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class, params) {
  return new Class({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class, params) {
  return new Class({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class, params) {
  return new Class({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class, params) {
  return new Class({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class, params) {
  return new Class({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class, params) {
  return new Class({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class, params) {
  return new Class({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class, params) {
  return new Class({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class, params) {
  return new Class({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class, params) {
  return new Class({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class, params) {
  return new Class({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class, params) {
  return new Class({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class, params) {
  return new Class({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class, params) {
  return new Class({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _number(Class, params) {
  return new Class({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int(Class, params) {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class, params) {
  return new Class({
    type: "boolean",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class) {
  return new Class({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function _never(Class, params) {
  return new Class({
    type: "never",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _date(Class, params) {
  return new Class({
    type: "date",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
  return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
  return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
  return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class, element, params) {
  return new Class({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _refine(Class, fn, _params) {
  const schema = new Class({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn) {
  const ch = /* @__PURE__ */ _check((payload) => {
    payload.addIssue = (issue$1) => {
      if (typeof issue$1 === "string") {
        payload.issues.push(issue(issue$1, payload.value, ch._zod.def));
      } else {
        const _issue = issue$1;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process$1(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a2;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process$1(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta)
    Object.assign(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && result.schema._prefault)
    (_a2 = result.schema).default ?? (_a2.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = /* @__PURE__ */ new Map();
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
      }
      Object.assign(schema2, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema2[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema2[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema2.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema2) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema2[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema2,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") ;
  else ;
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) ;
  else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process$1(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process$1(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
const formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
};
const stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
const numberProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json.type = "integer";
  else
    json.type = "number";
  if (typeof exclusiveMinimum === "number") {
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  }
  if (typeof minimum === "number") {
    json.minimum = minimum;
    if (typeof exclusiveMinimum === "number" && ctx.target !== "draft-04") {
      if (exclusiveMinimum >= minimum)
        delete json.minimum;
      else
        delete json.exclusiveMinimum;
    }
  }
  if (typeof exclusiveMaximum === "number") {
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  }
  if (typeof maximum === "number") {
    json.maximum = maximum;
    if (typeof exclusiveMaximum === "number" && ctx.target !== "draft-04") {
      if (exclusiveMaximum <= maximum)
        delete json.maximum;
      else
        delete json.exclusiveMaximum;
    }
  }
  if (typeof multipleOf === "number")
    json.multipleOf = multipleOf;
};
const booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
const neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
const unknownProcessor = (_schema, _ctx, _json, _params) => {
};
const dateProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Date cannot be represented in JSON Schema");
  }
};
const enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
const literalProcessor = (schema, ctx, json, _params) => {
  const def = schema._zod.def;
  const vals = [];
  for (const val of def.values) {
    if (val === void 0) {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      }
    } else if (typeof val === "bigint") {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        vals.push(Number(val));
      }
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) ;
  else if (vals.length === 1) {
    const val = vals[0];
    json.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json.type = "boolean";
    if (vals.every((v) => v === null))
      json.type = "null";
    json.enum = vals;
  }
};
const customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
const transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
const arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process$1(def.element, ctx, { ...params, path: [...params.path, "items"] });
};
const objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  json.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json.properties[key] = process$1(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === void 0;
    } else {
      return v.optout === void 0;
    }
  }));
  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process$1(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
const unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process$1(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
const intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process$1(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process$1(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
};
const recordProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  const keyType = def.keyType;
  const keyBag = keyType._zod.bag;
  const patterns = keyBag?.patterns;
  if (def.mode === "loose" && patterns && patterns.size > 0) {
    const valueSchema = process$1(def.valueType, ctx, {
      ...params,
      path: [...params.path, "patternProperties", "*"]
    });
    json.patternProperties = {};
    for (const pattern of patterns) {
      json.patternProperties[pattern.source] = valueSchema;
    }
  } else {
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json.propertyNames = process$1(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
    }
    json.additionalProperties = process$1(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
  const keyValues = keyType._zod.values;
  if (keyValues) {
    const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
    if (validKeyValues.length > 0) {
      json.required = validKeyValues;
    }
  }
};
const nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
const defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
const prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
const catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const innerType = ctx.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
  process$1(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
const optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
const ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime(params) {
  return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
}
const ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date$1(params) {
  return /* @__PURE__ */ _isoDate(ZodISODate, params);
}
const ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time(params) {
  return /* @__PURE__ */ _isoTime(ZodISOTime, params);
}
const ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration(params) {
  return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
}
const initializer = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
      // enumerable: false,
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
      // enumerable: false,
    },
    addIssue: {
      value: (issue2) => {
        inst.issues.push(issue2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (issues2) => {
        inst.issues.push(...issues2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
      // enumerable: false,
    }
  });
};
const ZodRealError = $constructor("ZodError", initializer, {
  Parent: Error
});
const parse = /* @__PURE__ */ _parse(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
const encode = /* @__PURE__ */ _encode(ZodRealError);
const decode = /* @__PURE__ */ _decode(ZodRealError);
const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
const ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.check = (...checks) => {
    return inst.clone(mergeDefs(def, {
      checks: [
        ...def.checks ?? [],
        ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
      ]
    }), {
      parent: true
    });
  };
  inst.with = inst.check;
  inst.clone = (def2, params) => clone(inst, def2, params);
  inst.brand = () => inst;
  inst.register = ((reg, meta) => {
    reg.add(inst, meta);
    return inst;
  });
  inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode(inst, data, params);
  inst.decode = (data, params) => decode(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
  inst.refine = (check, params) => inst.check(refine(check, params));
  inst.superRefine = (refinement) => inst.check(superRefine(refinement));
  inst.overwrite = (fn) => inst.check(/* @__PURE__ */ _overwrite(fn));
  inst.optional = () => optional(inst);
  inst.exactOptional = () => exactOptional(inst);
  inst.nullable = () => nullable(inst);
  inst.nullish = () => optional(nullable(inst));
  inst.nonoptional = (params) => nonoptional(inst, params);
  inst.array = () => array(inst);
  inst.or = (arg) => union([inst, arg]);
  inst.and = (arg) => intersection(inst, arg);
  inst.transform = (tx) => pipe(inst, transform$s(tx));
  inst.default = (def2) => _default(inst, def2);
  inst.prefault = (def2) => prefault(inst, def2);
  inst.catch = (params) => _catch(inst, params);
  inst.pipe = (target) => pipe(inst, target);
  inst.readonly = () => readonly(inst);
  inst.describe = (description) => {
    const cl = inst.clone();
    globalRegistry.add(cl, { description });
    return cl;
  };
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  inst.meta = (...args) => {
    if (args.length === 0) {
      return globalRegistry.get(inst);
    }
    const cl = inst.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  };
  inst.isOptional = () => inst.safeParse(void 0).success;
  inst.isNullable = () => inst.safeParse(null).success;
  inst.apply = (fn) => fn(inst);
  return inst;
});
const _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  inst.regex = (...args) => inst.check(/* @__PURE__ */ _regex(...args));
  inst.includes = (...args) => inst.check(/* @__PURE__ */ _includes(...args));
  inst.startsWith = (...args) => inst.check(/* @__PURE__ */ _startsWith(...args));
  inst.endsWith = (...args) => inst.check(/* @__PURE__ */ _endsWith(...args));
  inst.min = (...args) => inst.check(/* @__PURE__ */ _minLength(...args));
  inst.max = (...args) => inst.check(/* @__PURE__ */ _maxLength(...args));
  inst.length = (...args) => inst.check(/* @__PURE__ */ _length(...args));
  inst.nonempty = (...args) => inst.check(/* @__PURE__ */ _minLength(1, ...args));
  inst.lowercase = (params) => inst.check(/* @__PURE__ */ _lowercase(params));
  inst.uppercase = (params) => inst.check(/* @__PURE__ */ _uppercase(params));
  inst.trim = () => inst.check(/* @__PURE__ */ _trim());
  inst.normalize = (...args) => inst.check(/* @__PURE__ */ _normalize(...args));
  inst.toLowerCase = () => inst.check(/* @__PURE__ */ _toLowerCase());
  inst.toUpperCase = () => inst.check(/* @__PURE__ */ _toUpperCase());
  inst.slugify = () => inst.check(/* @__PURE__ */ _slugify());
});
const ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
  inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
  inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
  inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime(params));
  inst.date = (params) => inst.check(date$1(params));
  inst.time = (params) => inst.check(time(params));
  inst.duration = (params) => inst.check(duration(params));
});
function string(params) {
  return /* @__PURE__ */ _string(ZodString, params);
}
const ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
const ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json);
  inst.gt = (value, params) => inst.check(/* @__PURE__ */ _gt(value, params));
  inst.gte = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
  inst.min = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
  inst.lt = (value, params) => inst.check(/* @__PURE__ */ _lt(value, params));
  inst.lte = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
  inst.max = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
  inst.int = (params) => inst.check(int(params));
  inst.safe = (params) => inst.check(int(params));
  inst.positive = (params) => inst.check(/* @__PURE__ */ _gt(0, params));
  inst.nonnegative = (params) => inst.check(/* @__PURE__ */ _gte(0, params));
  inst.negative = (params) => inst.check(/* @__PURE__ */ _lt(0, params));
  inst.nonpositive = (params) => inst.check(/* @__PURE__ */ _lte(0, params));
  inst.multipleOf = (value, params) => inst.check(/* @__PURE__ */ _multipleOf(value, params));
  inst.step = (value, params) => inst.check(/* @__PURE__ */ _multipleOf(value, params));
  inst.finite = () => inst;
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number(params) {
  return /* @__PURE__ */ _number(ZodNumber, params);
}
const ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return /* @__PURE__ */ _int(ZodNumberFormat, params);
}
const ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json);
});
function boolean(params) {
  return /* @__PURE__ */ _boolean(ZodBoolean, params);
}
const ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor();
});
function unknown() {
  return /* @__PURE__ */ _unknown(ZodUnknown);
}
const ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json);
});
function never(params) {
  return /* @__PURE__ */ _never(ZodNever, params);
}
const ZodDate = /* @__PURE__ */ $constructor("ZodDate", (inst, def) => {
  $ZodDate.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => dateProcessor(inst, ctx);
  inst.min = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
  inst.max = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
  const c = inst._zod.bag;
  inst.minDate = c.minimum ? new Date(c.minimum) : null;
  inst.maxDate = c.maximum ? new Date(c.maximum) : null;
});
function date(params) {
  return /* @__PURE__ */ _date(ZodDate, params);
}
const ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  inst.min = (minLength, params) => inst.check(/* @__PURE__ */ _minLength(minLength, params));
  inst.nonempty = (params) => inst.check(/* @__PURE__ */ _minLength(1, params));
  inst.max = (maxLength, params) => inst.check(/* @__PURE__ */ _maxLength(maxLength, params));
  inst.length = (len, params) => inst.check(/* @__PURE__ */ _length(len, params));
  inst.unwrap = () => inst.element;
});
function array(element, params) {
  return /* @__PURE__ */ _array(ZodArray, element, params);
}
const ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  defineLazy(inst, "shape", () => {
    return def.shape;
  });
  inst.keyof = () => _enum(Object.keys(inst._zod.def.shape));
  inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall });
  inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
  inst.strip = () => inst.clone({ ...inst._zod.def, catchall: void 0 });
  inst.extend = (incoming) => {
    return extend(inst, incoming);
  };
  inst.safeExtend = (incoming) => {
    return safeExtend(inst, incoming);
  };
  inst.merge = (other) => merge(inst, other);
  inst.pick = (mask) => pick(inst, mask);
  inst.omit = (mask) => omit(inst, mask);
  inst.partial = (...args) => partial(ZodOptional, inst, args[0]);
  inst.required = (...args) => required(ZodNonOptional, inst, args[0]);
});
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...normalizeParams(params)
  };
  return new ZodObject(def);
}
const ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
const ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
const ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
const ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
const ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...normalizeParams(params)
  });
}
const ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue$1) => {
      if (typeof issue$1 === "string") {
        payload.issues.push(issue(issue$1, payload.value, def));
      } else {
        const _issue = issue$1;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});
function transform$s(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
const ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
const ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
const ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
const ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
const ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
const ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
const ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
const ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
const ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
const ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx);
});
function refine(fn, _params = {}) {
  return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
  return /* @__PURE__ */ _superRefine(fn);
}
const PRACTICE_CONTRACT_VERSION = "practice.v1";
const PRACTICE_MODE_VALUES = [
  "worked_example",
  "guided_practice",
  "independent_practice",
  "assessment",
  "teaching"
];
const PRACTICE_SUBMISSION_STATUS_VALUES = [
  "draft",
  "submitted",
  "graded",
  "returned"
];
const practiceModeSchema = _enum(PRACTICE_MODE_VALUES);
const practiceSubmissionStatusSchema = _enum(PRACTICE_SUBMISSION_STATUS_VALUES);
const jsonRecordSchema = record(string(), unknown());
const practiceTimingConfidenceSchema = _enum(["high", "medium", "low"]);
const practiceTimingSummarySchema = object({
  startedAt: string().min(1),
  submittedAt: string().min(1),
  wallClockMs: number().nonnegative(),
  activeMs: number().nonnegative(),
  idleMs: number().nonnegative(),
  pauseCount: number().int().nonnegative(),
  focusLossCount: number().int().nonnegative(),
  visibilityHiddenCount: number().int().nonnegative(),
  longestIdleMs: number().nonnegative().optional(),
  confidence: practiceTimingConfidenceSchema,
  confidenceReasons: array(string()).optional()
}).refine((data) => data.activeMs <= data.wallClockMs, {
  message: "activeMs cannot exceed wallClockMs",
  path: ["activeMs"]
});
const practiceSubmissionPartSchema = object({
  partId: string().trim().min(1),
  rawAnswer: unknown(),
  normalizedAnswer: string().optional(),
  isCorrect: boolean().optional(),
  score: number().optional(),
  maxScore: number().optional(),
  misconceptionTags: array(string()).optional(),
  hintsUsed: number().int().nonnegative().optional(),
  revealStepsSeen: number().int().nonnegative().optional(),
  changedCount: number().int().nonnegative().optional(),
  firstInteractionAt: string().min(1).optional(),
  answeredAt: string().min(1).optional(),
  wallClockMs: number().nonnegative().optional(),
  activeMs: number().nonnegative().optional()
});
const practiceSubmissionEnvelopeSchema = object({
  contractVersion: literal(PRACTICE_CONTRACT_VERSION),
  activityId: string().trim().min(1),
  mode: practiceModeSchema,
  status: practiceSubmissionStatusSchema,
  attemptNumber: number().int().positive(),
  submittedAt: string().min(1),
  answers: jsonRecordSchema,
  parts: array(practiceSubmissionPartSchema),
  artifact: jsonRecordSchema.optional(),
  interactionHistory: array(unknown()).optional(),
  analytics: jsonRecordSchema.optional(),
  studentFeedback: string().optional(),
  teacherSummary: string().optional(),
  timing: practiceTimingSummarySchema.optional()
});
object({
  contractVersion: literal(PRACTICE_CONTRACT_VERSION).optional(),
  activityId: string().trim().min(1).optional(),
  mode: practiceModeSchema.optional(),
  status: practiceSubmissionStatusSchema.optional(),
  attemptNumber: number().int().positive().optional(),
  submittedAt: union([string().min(1), date()]).optional(),
  answers: jsonRecordSchema.optional(),
  responses: jsonRecordSchema.optional(),
  parts: array(practiceSubmissionPartSchema).optional(),
  artifact: jsonRecordSchema.optional(),
  interactionHistory: array(unknown()).optional(),
  analytics: jsonRecordSchema.optional(),
  metadata: jsonRecordSchema.optional(),
  studentFeedback: string().optional(),
  teacherSummary: string().optional(),
  timing: practiceTimingSummarySchema.optional()
});
async function POST$8(request) {
  const authResult = await requireStudentRequestClaims(request);
  if (authResult instanceof Response) {
    return authResult;
  }
  try {
    const body = await request.json();
    const validation = practiceSubmissionEnvelopeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid submission envelope", details: validation.error.format() },
        { status: 400 }
      );
    }
    const envelope = validation.data;
    if (envelope.contractVersion !== PRACTICE_CONTRACT_VERSION) {
      return NextResponse.json(
        { error: `Invalid contract version: ${envelope.contractVersion}. Expected: ${PRACTICE_CONTRACT_VERSION}` },
        { status: 400 }
      );
    }
    const result = await fetchInternalMutation(internal.activities.submitActivity, {
      userId: authResult.sub,
      activityId: envelope.activityId,
      submissionData: envelope
    });
    return NextResponse.json({
      success: true,
      submissionId: result.id,
      score: result.score,
      maxScore: result.maxScore
    });
  } catch (error) {
    console.error("Error submitting activity:", error);
    return NextResponse.json(
      { error: "Failed to submit activity" },
      { status: 500 }
    );
  }
}
const mod_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$8
}, Symbol.toStringTag, { value: "Module" }));
const RemoveDuplicateServerCss = void 0;
const Resources = /* @__PURE__ */ ((React2, deps, RemoveDuplicateServerCss2, precedence) => {
  return function Resources2() {
    return React2.createElement(React2.Fragment, null, [...deps.css.map((href) => React2.createElement("link", {
      key: "css:" + href,
      rel: "stylesheet",
      ...{ precedence },
      href,
      "data-rsc-css-href": href
    })), RemoveDuplicateServerCss2]);
  };
})(
  __vite_rsc_react__,
  assetsManifest.serverResources["app/layout.tsx"],
  RemoveDuplicateServerCss,
  "vite-rsc/importer-resources"
);
const ThemeProvider = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'ThemeProvider' is called on server");
}, "7f0a5a9a62a4", "ThemeProvider");
const AuthProvider = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'AuthProvider' is called on server");
}, "3cb731667909", "AuthProvider");
const HeaderSimple = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'HeaderSimple' is called on server");
}, "f8d8a72d7013", "HeaderSimple");
const Link = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "c2747888630f", "default");
function Footer() {
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("footer", { role: "contentinfo", className: "bg-slate-dark mt-auto", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "container mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "grid gap-8 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
            "div",
            {
              className: "flex items-center justify-center w-7 h-7 rounded font-mono-num text-sm font-bold text-white shrink-0",
              style: { backgroundColor: "oklch(0.46 0.18 264)" },
              "aria-hidden": "true",
              children: "∫"
            }
          ),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-display font-semibold text-white text-sm leading-tight", children: "Integrated Math 3" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-white/45 font-body leading-relaxed", children: "An interactive textbook for Integrated Math 3." }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-white/30 font-mono-num", children: "© 2025 Daniel Bodanske" })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h4", { className: "text-xs font-mono-num font-medium tracking-widest uppercase text-white/40", children: "Quick Links" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("nav", { className: "flex flex-col space-y-2 text-sm font-body", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { className: "text-white/55 hover:text-white transition-colors", href: "/preface", children: "Preface" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { className: "text-white/55 hover:text-white transition-colors", href: "/curriculum", children: "Curriculum" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h4", { className: "text-xs font-mono-num font-medium tracking-widest uppercase text-white/40", children: "Teacher Resources" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("nav", { className: "flex flex-col space-y-2 text-sm font-body", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { className: "text-white/55 hover:text-white transition-colors", href: "/teacher/dashboard", children: "Teacher Dashboard" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { className: "text-white/55 hover:text-white transition-colors", href: "/teacher/gradebook", children: "Gradebook" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-white/25 font-mono-num", children: "Integrated Math 3 · Interactive Textbook" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        "div",
        {
          className: "h-1 w-8 rounded-full",
          style: { backgroundColor: "oklch(0.46 0.18 264)" },
          "aria-hidden": "true"
        }
      )
    ] })
  ] }) });
}
const dynamic$2 = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "0f4c7adb6f4e", "default");
const ConvexClientProvider = dynamic$2(() => import("./ConvexClientProvider-DU1q6C02.js").then((m) => ({ default: m.ConvexClientProvider })), {
  ssr: false
});
const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
let metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Integrated Math 3",
  description: "An interactive textbook for Integrated Math 3.",
  authors: [{ name: "Daniel Bodanske" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg"
  }
};
function RootLayout({
  children
}) {
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("html", { lang: "en", suppressHydrationWarning: true, children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("body", { className: "antialiased min-h-screen flex flex-col font-sans", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(ConvexClientProvider, { children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
    ThemeProvider,
    {
      attribute: "class",
      defaultTheme: "system",
      enableSystem: true,
      disableTransitionOnChange: true,
      children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(HeaderSimple, {}),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("main", { className: "flex-1", children }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Footer, {})
      ]
    }
  ) }) }) }) });
}
const $$wrap_RootLayout = /* @__PURE__ */ __vite_rsc_wrap_css__(RootLayout, "default");
function __vite_rsc_wrap_css__(value, name) {
  if (typeof value !== "function") return value;
  function __wrapper(props) {
    return __vite_rsc_react__.createElement(
      __vite_rsc_react__.Fragment,
      null,
      __vite_rsc_react__.createElement(Resources),
      __vite_rsc_react__.createElement(value, props)
    );
  }
  Object.defineProperty(__wrapper, "name", { value: name });
  return __wrapper;
}
const mod_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$wrap_RootLayout,
  metadata
}, Symbol.toStringTag, { value: "Module" }));
function validatePasswordForRole(role, password) {
  const trimmedPassword = password.trim();
  if (role === "student") {
    if (trimmedPassword.length < 6) {
      return "New password must be at least 6 characters long.";
    }
    return null;
  }
  if (trimmedPassword.length < 8) {
    return "New password must be at least 8 characters long.";
  }
  if (!/[A-Za-z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword)) {
    return "New password must include at least one letter and one number.";
  }
  return null;
}
const changePasswordBodySchema = object({
  currentPassword: string().min(1, "Current password is required"),
  newPassword: string().min(1, "New password is required"),
  confirmPassword: string().min(1, "Confirm password is required")
});
async function POST$7(request) {
  const claimsOrResponse = await requireActiveRequestSessionClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  const claims = claimsOrResponse;
  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const validation = changePasswordBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 }
    );
  }
  const { currentPassword, newPassword, confirmPassword } = validation.data;
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
  }
  const policyError = validatePasswordForRole(claims.role, newPassword);
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }
  try {
    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
      username: claims.username
    });
    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 403 });
    }
    const isValid = await verifyPassword(currentPassword, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
      passwordHash: credential.passwordHash
    });
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }
    const newSalt = generatePasswordSalt();
    const newHash = await hashPassword(newPassword, newSalt, PASSWORD_HASH_ITERATIONS);
    const result = await fetchInternalMutation(internal.auth.changeOwnPassword, {
      profileId: claims.sub,
      passwordHash: newHash,
      passwordSalt: newSalt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS
    });
    if (result && typeof result === "object" && "ok" in result && !result.ok) {
      const reason = "reason" in result ? result.reason : "unknown";
      console.error("changeOwnPassword mutation failed:", reason);
      return NextResponse.json({ error: "Password change failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Change password route failed", error);
    return NextResponse.json({ error: "Password change failed" }, { status: 500 });
  }
}
const mod_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$7
}, Symbol.toStringTag, { value: "Module" }));
async function POST$6(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const username = body.username?.trim();
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }
  try {
    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, { username });
    if (!credential) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 });
    }
    const isValidPassword = await verifyPassword(password, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
      passwordHash: credential.passwordHash
    });
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 });
    }
    const token = await signSessionToken(
      {
        sub: credential.profileId,
        username: credential.username,
        role: credential.role,
        organizationId: credential.organizationId
      },
      getAuthJwtSecret(),
      SESSION_TTL_SECONDS
    );
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login route failed", error);
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 500 });
  }
}
const mod_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$6
}, Symbol.toStringTag, { value: "Module" }));
async function POST$5() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: /* @__PURE__ */ new Date(0)
  });
  return NextResponse.json({ ok: true });
}
const mod_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$5
}, Symbol.toStringTag, { value: "Module" }));
async function GET$1() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }
  const claims = await verifySessionToken(token, getAuthJwtSecret());
  if (!claims) {
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: /* @__PURE__ */ new Date(0)
    });
    return NextResponse.json({ authenticated: false });
  }
  const profile = await fetchInternalQuery(internal.auth.getAccountSettingsContext, {
    profileId: claims.sub
  });
  if (!profile) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: claims.sub,
      username: claims.username,
      role: claims.role
    },
    profile: {
      id: profile.id,
      organizationId: profile.organizationId,
      organizationName: profile.organizationName,
      username: profile.username,
      role: profile.role,
      displayName: profile.displayName ?? null
    }
  });
}
const mod_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$1
}, Symbol.toStringTag, { value: "Module" }));
const reviewQueueQuerySchema = object({
  componentKind: _enum(["example", "activity", "practice"]).optional(),
  status: _enum(["unreviewed", "approved", "needs_changes", "rejected"]).optional(),
  onlyStale: _enum(["true", "false"]).transform((v) => v === "true").optional()
});
const submitReviewBodySchema = object({
  componentKind: _enum(["example", "activity", "practice"]),
  componentId: string().min(1, "componentId is required"),
  componentKey: string().optional(),
  status: _enum(["approved", "needs_changes", "rejected"]),
  comment: string().optional(),
  issueTags: array(string()).optional(),
  priority: _enum(["low", "medium", "high"]).optional(),
  placement: object({
    lessonId: string().optional(),
    lessonVersionId: string().optional(),
    phaseId: string().optional(),
    phaseNumber: number().optional(),
    sectionId: string().optional()
  }).optional()
});
async function GET(request) {
  const claimsOrResponse = await requireDeveloperRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  const { searchParams } = new URL(request.url);
  const queryValidation = reviewQueueQuerySchema.safeParse({
    componentKind: searchParams.get("componentKind") ?? void 0,
    status: searchParams.get("status") ?? void 0,
    onlyStale: searchParams.get("onlyStale") ?? void 0
  });
  if (!queryValidation.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: queryValidation.error.format() },
      { status: 400 }
    );
  }
  const query = queryValidation.data;
  try {
    const items = await fetchInternalQuery(internal.dev.listReviewQueue, query);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching review queue:", error);
    return NextResponse.json({ error: "Failed to fetch review queue" }, { status: 500 });
  }
}
async function POST$4(request) {
  const claimsOrResponse = await requireDeveloperRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const validation = submitReviewBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 }
    );
  }
  const { componentKind, componentId, componentKey, status, comment, issueTags, priority, placement } = validation.data;
  if ((status === "needs_changes" || status === "rejected") && !comment) {
    return NextResponse.json({ error: "Comment is required for needs_changes or rejected status" }, { status: 400 });
  }
  try {
    const profileId = await resolveProfileId(claimsOrResponse.sub);
    if (!profileId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    const result = await fetchInternalMutation(internal.dev.submitReview, {
      componentKind,
      componentId,
      componentKey,
      status,
      comment,
      issueTags,
      priority,
      placement,
      createdBy: profileId
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
async function resolveProfileId(userId) {
  const profile = await fetchInternalQuery(internal.activities.getProfileByUserId, { userId });
  return profile?.id ?? null;
}
const mod_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST: POST$4
}, Symbol.toStringTag, { value: "Module" }));
const phaseCompleteBodySchema = object({
  lessonId: string().min(1, "lessonId is required"),
  phaseNumber: number({ message: "phaseNumber must be a number" }),
  timeSpent: number({ message: "timeSpent must be a number" }).nonnegative(),
  idempotencyKey: string().min(1, "idempotencyKey is required"),
  linkedStandardId: string().optional()
});
async function POST$3(request) {
  const claimsOrResponse = await requireStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const validation = phaseCompleteBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 }
    );
  }
  const { lessonId, phaseNumber, timeSpent, idempotencyKey, linkedStandardId } = validation.data;
  try {
    const result = await fetchInternalMutation(internal.student.completePhase, {
      userId: claimsOrResponse.sub,
      lessonId,
      phaseNumber,
      timeSpent,
      idempotencyKey,
      ...linkedStandardId ? { linkedStandardId } : {}
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Phase completion failed", error);
    return NextResponse.json({ error: "Phase completion failed" }, { status: 500 });
  }
}
const mod_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$3
}, Symbol.toStringTag, { value: "Module" }));
const skipPhaseBodySchema = object({
  lessonId: string().min(1, "lessonId is required"),
  phaseNumber: number({ message: "phaseNumber must be a number" }),
  idempotencyKey: string().min(1, "idempotencyKey is required")
});
async function POST$2(request) {
  const claimsOrResponse = await requireStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const validation = skipPhaseBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: validation.error.format() },
      { status: 400 }
    );
  }
  const { lessonId, phaseNumber, idempotencyKey } = validation.data;
  try {
    const result = await fetchInternalMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internal.student.skipPhase,
      {
        userId: claimsOrResponse.sub,
        lessonId,
        phaseNumber,
        idempotencyKey
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Phase skip failed", error);
    return NextResponse.json({ error: "Phase skip failed" }, { status: 500 });
  }
}
const mod_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$2
}, Symbol.toStringTag, { value: "Module" }));
const completeSchema = object({
  moduleNumber: number().int().min(1).max(9),
  lessonsTested: array(string().min(1).max(64)).max(20),
  questionCount: number().int().min(1).max(100),
  score: number().int().nonnegative(),
  perLessonBreakdown: array(
    object({
      lessonId: string().min(1).max(64),
      lessonTitle: string().min(1).max(128),
      correct: number().int().nonnegative(),
      total: number().int().nonnegative()
    })
  ).max(20),
  durationSeconds: number().int().nonnegative().max(86400)
}).refine((data) => data.score <= data.questionCount, {
  message: "Score cannot exceed question count",
  path: ["score"]
});
async function POST$1(request) {
  const authResult = await requireStudentRequestClaims(request);
  if (authResult instanceof Response) {
    return authResult;
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const {
    moduleNumber,
    lessonsTested,
    questionCount,
    score,
    perLessonBreakdown,
    durationSeconds
  } = parsed.data;
  try {
    await Promise.all([
      fetchInternalMutation(internal.study.savePracticeTestResult, {
        userId: authResult.sub,
        moduleNumber,
        lessonsTested,
        questionCount,
        score,
        perLessonBreakdown
      }),
      fetchInternalMutation(internal.study.recordStudySession, {
        userId: authResult.sub,
        activityType: "practice_test",
        curriculumScope: {
          type: "module",
          moduleNumber
        },
        results: {
          itemsSeen: questionCount,
          itemsCorrect: score,
          itemsIncorrect: questionCount - score,
          durationSeconds
        }
      })
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving practice test result:", error);
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}
const mod_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$1
}, Symbol.toStringTag, { value: "Module" }));
async function POST(request) {
  const authResult = await requireStudentRequestClaims(request);
  if (authResult instanceof Response) {
    return authResult;
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  if (!body.sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 }
    );
  }
  try {
    const sessionId = await fetchInternalMutation(
      internal.queue.sessions.completeDailySession,
      { studentId: authResult.sub, sessionId: body.sessionId }
    );
    return NextResponse.json({
      success: true,
      sessionId
    });
  } catch (error) {
    console.error("Error completing daily practice session:", error);
    return NextResponse.json(
      { error: "Failed to complete session" },
      { status: 500 }
    );
  }
}
const mod_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: "Module" }));
const FlashcardsPageClient = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'FlashcardsPageClient' is called on server");
}, "a89e99f599ce", "FlashcardsPageClient");
const GLOSSARY = [
  {
    slug: "quadratic-function",
    term: "Quadratic Function",
    definition: "A function of the form f(x) = ax² + bx + c where a ≠ 0, producing a parabolic graph.",
    modules: [1],
    topics: ["quadratic-functions", "forms"],
    synonyms: ["second-degree polynomial"],
    related: ["parabola", "vertex-form", "standard-form"]
  },
  {
    slug: "parabola",
    term: "Parabola",
    definition: "The U-shaped graph of a quadratic function, symmetric about its axis of symmetry.",
    modules: [1],
    topics: ["quadratic-functions", "graphing"],
    synonyms: [],
    related: ["axis-of-symmetry", "vertex", "quadratic-function"]
  },
  {
    slug: "vertex",
    term: "Vertex",
    definition: "The highest or lowest point of a parabola, located at (h, k) in vertex form.",
    modules: [1],
    topics: ["quadratic-functions", "features"],
    synonyms: [],
    related: ["parabola", "axis-of-symmetry", "vertex-form"]
  },
  {
    slug: "axis-of-symmetry",
    term: "Axis of Symmetry",
    definition: "The vertical line x = h that divides a parabola into two mirror images.",
    modules: [1],
    topics: ["quadratic-functions", "features"],
    synonyms: ["line of symmetry"],
    related: ["parabola", "vertex"]
  },
  {
    slug: "vertex-form",
    term: "Vertex Form",
    definition: "Quadratic function written as f(x) = a(x - h)² + k, revealing the vertex (h, k).",
    modules: [1],
    topics: ["quadratic-functions", "forms"],
    synonyms: [],
    related: ["standard-form", "intercept-form", "vertex"]
  },
  {
    slug: "standard-form",
    term: "Standard Form",
    definition: "Quadratic function written as f(x) = ax² + bx + c, revealing coefficients.",
    modules: [1],
    topics: ["quadratic-functions", "forms"],
    synonyms: [],
    related: ["vertex-form", "intercept-form"]
  },
  {
    slug: "intercept-form",
    term: "Intercept Form",
    definition: "Quadratic function written as f(x) = a(x - p)(x - q), revealing x-intercepts p and q.",
    modules: [1],
    topics: ["quadratic-functions", "forms"],
    synonyms: ["factored form"],
    related: ["vertex-form", "standard-form", "zero-product-property"]
  },
  {
    slug: "discriminant",
    term: "Discriminant",
    definition: "The value b² - 4ac in the quadratic formula that determines the number and type of solutions.",
    modules: [1],
    topics: ["quadratic-equations", "solving"],
    synonyms: [],
    related: ["quadratic-formula", "complex-number"]
  },
  {
    slug: "quadratic-formula",
    term: "Quadratic Formula",
    definition: "x = (-b ± √(b² - 4ac)) / 2a, the formula for solving ax² + bx + c = 0.",
    modules: [1],
    topics: ["quadratic-equations", "solving"],
    synonyms: [],
    related: ["discriminant", "completing-the-square"]
  },
  {
    slug: "completing-the-square",
    term: "Completing the Square",
    definition: "A method for solving quadratic equations by rewriting in vertex form.",
    modules: [1],
    topics: ["quadratic-equations", "solving"],
    synonyms: [],
    related: ["vertex-form", "quadratic-formula"]
  },
  {
    slug: "zero-product-property",
    term: "Zero Product Property",
    definition: "If ab = 0, then a = 0 or b = 0. Used to solve factored quadratic equations.",
    modules: [1, 3],
    topics: ["quadratic-equations", "solving"],
    synonyms: [],
    related: ["intercept-form", "factoring"]
  },
  {
    slug: "imaginary-unit",
    term: "Imaginary Unit",
    definition: "The number i where i² = -1, used to define complex numbers.",
    modules: [1],
    topics: ["complex-numbers"],
    synonyms: ["i"],
    related: ["complex-number", "imaginary-number"]
  },
  {
    slug: "complex-number",
    term: "Complex Number",
    definition: "A number of the form a + bi where a and b are real numbers and i² = -1.",
    modules: [1],
    topics: ["complex-numbers"],
    synonyms: [],
    related: ["imaginary-unit", "real-number", "complex-plane"]
  },
  {
    slug: "complex-plane",
    term: "Complex Plane",
    definition: "A coordinate system where the horizontal axis is the real part and vertical is the imaginary part.",
    modules: [1],
    topics: ["complex-numbers"],
    synonyms: [],
    related: ["complex-number", "argand-diagram"]
  },
  {
    slug: "polynomial",
    term: "Polynomial",
    definition: "An algebraic expression consisting of terms with nonnegative integer exponents.",
    modules: [2],
    topics: ["polynomials", "definitions"],
    synonyms: [],
    related: ["degree", "leading-coefficient", "term"]
  },
  {
    slug: "degree",
    term: "Degree",
    definition: "The highest power of the variable in a polynomial.",
    modules: [2],
    topics: ["polynomials", "definitions"],
    synonyms: [],
    related: ["polynomial", "leading-coefficient"]
  },
  {
    slug: "leading-coefficient",
    term: "Leading Coefficient",
    definition: "The coefficient of the term with highest degree in a polynomial.",
    modules: [2],
    topics: ["polynomials", "definitions"],
    synonyms: [],
    related: ["polynomial", "degree", "end-behavior"]
  },
  {
    slug: "end-behavior",
    term: "End Behavior",
    definition: "The direction the graph of a polynomial heads as x approaches ±∞.",
    modules: [2],
    topics: ["polynomial-functions", "graphing"],
    synonyms: [],
    related: ["degree", "leading-coefficient"]
  },
  {
    slug: "turning-point",
    term: "Turning Point",
    definition: "A point where a polynomial changes direction from increasing to decreasing or vice versa.",
    modules: [2],
    topics: ["polynomial-functions", "graphing"],
    synonyms: ["local-extremum"],
    related: ["multiplicity", "degree"]
  },
  {
    slug: "multiplicity",
    term: "Multiplicity",
    definition: "The number of times a factor appears in a factored polynomial, affecting graph behavior at x-intercepts.",
    modules: [2, 3],
    topics: ["polynomial-functions", "roots"],
    synonyms: [],
    related: ["zero-product-property", "root"]
  },
  {
    slug: "synthetic-division",
    term: "Synthetic Division",
    definition: "A shortcut method for dividing polynomials by linear binomials of the form (x - c).",
    modules: [2],
    topics: ["polynomials", "operations"],
    synonyms: [],
    related: ["long-division", "remainder-theorem"]
  },
  {
    slug: "long-division",
    term: "Long Division",
    definition: "A method for dividing polynomials by other polynomials.",
    modules: [2],
    topics: ["polynomials", "operations"],
    synonyms: [],
    related: ["synthetic-division"]
  },
  {
    slug: "binomial-theorem",
    term: "Binomial Theorem",
    definition: "The formula for expanding (a + b)ⁿ using Pascal's Triangle.",
    modules: [2],
    topics: ["polynomials", "operations"],
    synonyms: [],
    related: ["pascals-triangle"]
  },
  {
    slug: "pascals-triangle",
    term: "Pascal's Triangle",
    definition: "A triangular array of binomial coefficients where row n gives coefficients for (a + b)ⁿ⁻¹.",
    modules: [2],
    topics: ["polynomials", "patterns"],
    synonyms: [],
    related: ["binomial-theorem"]
  },
  {
    slug: "remainder-theorem",
    term: "Remainder Theorem",
    definition: "When a polynomial f(x) is divided by (x - c), the remainder equals f(c).",
    modules: [3],
    topics: ["polynomial-equations", "theorems"],
    synonyms: [],
    related: ["factor-theorem", "synthetic-division"]
  },
  {
    slug: "factor-theorem",
    term: "Factor Theorem",
    definition: "(x - c) is a factor of f(x) if and only if f(c) = 0.",
    modules: [3],
    topics: ["polynomial-equations", "theorems"],
    synonyms: [],
    related: ["remainder-theorem", "root"]
  },
  {
    slug: "fundamental-theorem-of-algebra",
    term: "Fundamental Theorem of Algebra",
    definition: "Every polynomial of degree n has exactly n complex roots (counting multiplicity).",
    modules: [3],
    topics: ["polynomial-equations", "theorems"],
    synonyms: [],
    related: ["complex-number", "root"]
  },
  {
    slug: "root",
    term: "Root",
    definition: "A value x = r such that f(r) = 0 for a polynomial f(x).",
    modules: [3],
    topics: ["polynomial-equations", "solutions"],
    synonyms: ["zero"],
    related: ["factor-theorem", "multiplicity"]
  },
  {
    slug: "inverse-function",
    term: "Inverse Function",
    definition: "A function f⁻¹ such that f(f⁻¹(x)) = x and f⁻¹(f(x)) = x for all x in the domain.",
    modules: [4],
    topics: ["inverse-functions", "definitions"],
    synonyms: [],
    related: ["one-to-one", "composition"]
  },
  {
    slug: "one-to-one",
    term: "One-to-One Function",
    definition: "A function where each output corresponds to exactly one input (horizontal line test passes).",
    modules: [4],
    topics: ["inverse-functions", "definitions"],
    synonyms: ["injective"],
    related: ["horizontal-line-test", "inverse-function"]
  },
  {
    slug: "horizontal-line-test",
    term: "Horizontal Line Test",
    definition: "A test to determine if a function is one-to-one by checking if any horizontal line intersects its graph more than once.",
    modules: [4],
    topics: ["inverse-functions", "testing"],
    synonyms: [],
    related: ["one-to-one", "vertical-line-test"]
  },
  {
    slug: "radical",
    term: "Radical",
    definition: "An expression containing a root symbol, such as √x or ∛x.",
    modules: [4],
    topics: ["radicals", "expressions"],
    synonyms: ["root"],
    related: ["square-root", "rational-exponent"]
  },
  {
    slug: "rational-exponent",
    term: "Rational Exponent",
    definition: "An exponent expressed as a fraction, where a^(m/n) = ⁿ√(a^m).",
    modules: [4],
    topics: ["radicals", "exponents"],
    synonyms: [],
    related: ["radical", "exponential-function"]
  },
  {
    slug: "composition-of-functions",
    term: "Composition of Functions",
    definition: "Applying one function to the output of another, written as (f ∘ g)(x) = f(g(x)).",
    modules: [4],
    topics: ["inverse-functions", "operations"],
    synonyms: ["composite function"],
    related: ["inverse-function", "function"]
  },
  {
    slug: "exponential-function",
    term: "Exponential Function",
    definition: "A function of the form f(x) = a·bˣ where b > 0 and b ≠ 1.",
    modules: [5],
    topics: ["exponential-functions", "definitions"],
    synonyms: [],
    related: ["logarithm", "growth", "decay"]
  },
  {
    slug: "logarithm",
    term: "Logarithm",
    definition: "The exponent y such that bʸ = x, written as log_b(x) = y.",
    modules: [5, 6],
    topics: ["logarithms", "definitions"],
    synonyms: ["log"],
    related: ["exponential-function", "common-log", "natural-log"]
  },
  {
    slug: "common-log",
    term: "Common Logarithm",
    definition: "A logarithm with base 10, written as log(x) or log₁₀(x).",
    modules: [5, 6],
    topics: ["logarithms", "types"],
    synonyms: [],
    related: ["logarithm", "natural-log"]
  },
  {
    slug: "natural-logarithm",
    term: "Natural Logarithm",
    definition: "A logarithm with base e, written as ln(x) where e ≈ 2.718.",
    modules: [5, 6],
    topics: ["logarithms", "types"],
    synonyms: ["ln"],
    related: ["logarithm", "common-log"]
  },
  {
    slug: "asymptote",
    term: "Asymptote",
    definition: "A line that a graph approaches but never touches as x or y approaches infinity.",
    modules: [5, 6, 7],
    topics: ["function-behavior", "graphing"],
    synonyms: [],
    related: ["exponential-function", "logarithmic-function", "rational-function"]
  },
  {
    slug: "exponential-growth",
    term: "Exponential Growth",
    definition: "Growth modeled by f(t) = a·b^t where b > 1, increasing without bound.",
    modules: [5],
    topics: ["exponential-functions", "models"],
    synonyms: [],
    related: ["exponential-function", "exponential-decay"]
  },
  {
    slug: "exponential-decay",
    term: "Exponential Decay",
    definition: "Decay modeled by f(t) = a·b^t where 0 < b < 1, decreasing toward a horizontal asymptote.",
    modules: [5],
    topics: ["exponential-functions", "models"],
    synonyms: [],
    related: ["exponential-function", "exponential-growth"]
  },
  {
    slug: "compound-interest",
    term: "Compound Interest",
    definition: "Interest calculated on both the initial principal and accumulated interest.",
    modules: [5],
    topics: ["exponential-functions", "applications"],
    synonyms: [],
    related: ["exponential-function", "exponential-growth"]
  },
  {
    slug: "geometric-sequence",
    term: "Geometric Sequence",
    definition: "A sequence where each term is multiplied by a constant ratio r to get the next term.",
    modules: [5],
    topics: ["sequences", "definitions"],
    synonyms: ["geometric progression"],
    related: ["geometric-series", "common-ratio"]
  },
  {
    slug: "geometric-series",
    term: "Geometric Series",
    definition: "The sum of terms in a geometric sequence.",
    modules: [5],
    topics: ["sequences", "series"],
    synonyms: [],
    related: ["geometric-sequence", "infinite-series"]
  },
  {
    slug: "change-of-base",
    term: "Change of Base",
    definition: "The formula log_b(x) = log_a(x) / log_a(b) for converting between logarithm bases.",
    modules: [6],
    topics: ["logarithms", "properties"],
    synonyms: [],
    related: ["logarithm", "log-properties"]
  },
  {
    slug: "log-properties",
    term: "Logarithm Properties",
    definition: "Rules including: log(MN) = log M + log N, log(M/N) = log M - log N, log(M^k) = k·log M.",
    modules: [6],
    topics: ["logarithms", "properties"],
    synonyms: ["logarithm rules"],
    related: ["logarithm", "change-of-base"]
  },
  {
    slug: "logarithmic-function",
    term: "Logarithmic Function",
    definition: "The inverse function of an exponential function, written f(x) = log_b(x).",
    modules: [6],
    topics: ["logarithmic-functions", "definitions"],
    synonyms: [],
    related: ["logarithm", "exponential-function", "asymptote"]
  },
  {
    slug: "rational-function",
    term: "Rational Function",
    definition: "A function of the form f(x) = P(x) / Q(x) where P and Q are polynomials and Q(x) ≠ 0.",
    modules: [7],
    topics: ["rational-functions", "definitions"],
    synonyms: [],
    related: ["asymptote", "hole", "domain-restriction"]
  },
  {
    slug: "vertical-asymptote",
    term: "Vertical Asymptote",
    definition: "A vertical line x = a where the function approaches ±∞ as x approaches a.",
    modules: [7],
    topics: ["rational-functions", "asymptotes"],
    synonyms: [],
    related: ["rational-function", "horizontal-asymptote"]
  },
  {
    slug: "horizontal-asymptote",
    term: "Horizontal Asymptote",
    definition: "A horizontal line y = b that the graph approaches as x → ±∞.",
    modules: [7],
    topics: ["rational-functions", "asymptotes"],
    synonyms: [],
    related: ["rational-function", "vertical-asymptote"]
  },
  {
    slug: "hole",
    term: "Hole",
    definition: "A point (a, b) removed from the graph of a rational function when a factor cancels.",
    modules: [7],
    topics: ["rational-functions", "features"],
    synonyms: ["point of discontinuity"],
    related: ["rational-function", "domain-restriction"]
  },
  {
    slug: "domain-restriction",
    term: "Domain Restriction",
    definition: "Values excluded from the domain of a function, such as where denominator = 0.",
    modules: [7],
    topics: ["rational-functions", "definitions"],
    synonyms: [],
    related: ["rational-function", "hole"]
  },
  {
    slug: "population",
    term: "Population",
    definition: "The entire set of individuals or objects about which information is sought.",
    modules: [8],
    topics: ["statistics", "definitions"],
    synonyms: [],
    related: ["sample", "census"]
  },
  {
    slug: "sample",
    term: "Sample",
    definition: "A subset of the population selected for study to make inferences about the population.",
    modules: [8],
    topics: ["statistics", "definitions"],
    synonyms: [],
    related: ["population", "sampling-method"]
  },
  {
    slug: "bias",
    term: "Statistical Bias",
    definition: "A systematic tendency to favor certain outcomes or misrepresent the population.",
    modules: [8],
    topics: ["statistics", "data-quality"],
    synonyms: [],
    related: ["population", "sample", "random-sample"]
  },
  {
    slug: "mean",
    term: "Mean",
    definition: "The arithmetic average of a set of values, calculated as sum divided by count.",
    modules: [8],
    topics: ["statistics", "measures-of-center"],
    synonyms: ["average", "arithmetic-mean"],
    related: ["median", "mode", "standard-deviation"]
  },
  {
    slug: "median",
    term: "Median",
    definition: "The middle value in an ordered data set, or the average of the two middle values.",
    modules: [8],
    topics: ["statistics", "measures-of-center"],
    synonyms: [],
    related: ["mean", "mode", "quartile"]
  },
  {
    slug: "mode",
    term: "Mode",
    definition: "The value(s) that appear most frequently in a data set.",
    modules: [8],
    topics: ["statistics", "measures-of-center"],
    synonyms: [],
    related: ["mean", "median"]
  },
  {
    slug: "standard-deviation",
    term: "Standard Deviation",
    definition: "A measure of spread calculated as the square root of the variance.",
    modules: [8],
    topics: ["statistics", "measures-of-spread"],
    synonyms: ["sigma", "σ"],
    related: ["variance", "mean", "normal-distribution"]
  },
  {
    slug: "variance",
    term: "Variance",
    definition: "The average of squared deviations from the mean, measuring data spread.",
    modules: [8],
    topics: ["statistics", "measures-of-spread"],
    synonyms: [],
    related: ["standard-deviation", "mean"]
  },
  {
    slug: "normal-distribution",
    term: "Normal Distribution",
    definition: "A symmetric, bell-shaped probability distribution characterized by mean μ and standard deviation σ.",
    modules: [8],
    topics: ["statistics", "distributions"],
    synonyms: ["gaussian-distribution", "bell-curve"],
    related: ["z-score", "standard-deviation", "mean"]
  },
  {
    slug: "z-score",
    term: "Z-Score",
    definition: "The number of standard deviations a value is from the mean: z = (x - μ) / σ.",
    modules: [8],
    topics: ["statistics", "standardization"],
    synonyms: ["standard-score"],
    related: ["normal-distribution", "standard-deviation"]
  },
  {
    slug: "confidence-interval",
    term: "Confidence Interval",
    definition: "A range of values, derived from sample data, that likely contains the population parameter.",
    modules: [8],
    topics: ["statistics", "inference"],
    synonyms: [],
    related: ["population", "sample", "margin-of-error"]
  },
  {
    slug: "angle",
    term: "Angle",
    definition: "A figure formed by two rays sharing a common endpoint, measured in degrees or radians.",
    modules: [9],
    topics: ["trigonometry", "basics"],
    synonyms: [],
    related: ["degree", "radian"]
  },
  {
    slug: "radian",
    term: "Radian",
    definition: "The angle subtended by an arc equal in length to the radius, where 2π radians = 360°.",
    modules: [9],
    topics: ["trigonometry", "angle-measure"],
    synonyms: [],
    related: ["degree-angle", "unit-circle"]
  },
  {
    slug: "degree-angle",
    term: "Degree",
    definition: "A unit of angle measure where 360° = one full rotation.",
    modules: [9],
    topics: ["trigonometry", "angle-measure"],
    synonyms: [],
    related: ["radian", "angle"]
  },
  {
    slug: "unit-circle",
    term: "Unit Circle",
    definition: "A circle with radius 1 centered at the origin, used to define trigonometric functions.",
    modules: [9],
    topics: ["trigonometry", "foundations"],
    synonyms: [],
    related: ["sine", "cosine", "radian"]
  },
  {
    slug: "sine",
    term: "Sine",
    definition: "For angle θ on the unit circle, sin(θ) = y-coordinate of the intersection point.",
    modules: [9],
    topics: ["trigonometric-functions", "definitions"],
    synonyms: ["sin"],
    related: ["cosine", "tangent", "unit-circle"]
  },
  {
    slug: "cosine",
    term: "Cosine",
    definition: "For angle θ on the unit circle, cos(θ) = x-coordinate of the intersection point.",
    modules: [9],
    topics: ["trigonometric-functions", "definitions"],
    synonyms: ["cos"],
    related: ["sine", "tangent", "unit-circle"]
  },
  {
    slug: "tangent",
    term: "Tangent",
    definition: "For angle θ, tan(θ) = sin(θ) / cos(θ), or the slope of the terminal side on the unit circle.",
    modules: [9],
    topics: ["trigonometric-functions", "definitions"],
    synonyms: ["tan"],
    related: ["sine", "cosine", "slope"]
  },
  {
    slug: "period",
    term: "Period",
    definition: "The horizontal distance for a periodic function to complete one full cycle.",
    modules: [9],
    topics: ["trigonometric-functions", "properties"],
    synonyms: [],
    related: ["amplitude", "periodic-function", "frequency"]
  },
  {
    slug: "amplitude",
    term: "Amplitude",
    definition: "Half the distance between the maximum and minimum values of a periodic function.",
    modules: [9],
    topics: ["trigonometric-functions", "properties"],
    synonyms: [],
    related: ["period", "midline", "sine", "cosine"]
  },
  {
    slug: "midline",
    term: "Midline",
    definition: "The horizontal line equidistant between the maximum and minimum of a periodic function.",
    modules: [9],
    topics: ["trigonometric-functions", "properties"],
    synonyms: ["vertical-shift"],
    related: ["amplitude", "period", "sine", "cosine"]
  },
  {
    slug: "phase-shift",
    term: "Phase Shift",
    definition: "The horizontal displacement of a periodic function from its standard position.",
    modules: [9],
    topics: ["trigonometric-functions", "transformations"],
    synonyms: ["horizontal-shift"],
    related: ["period", "amplitude", "vertical-shift"]
  },
  {
    slug: "periodic-function",
    term: "Periodic Function",
    definition: "A function that repeats its values at regular intervals (its period).",
    modules: [9],
    topics: ["trigonometric-functions", "definitions"],
    synonyms: [],
    related: ["period", "sine", "cosine"]
  },
  {
    slug: "inverse-trigonometric-function",
    term: "Inverse Trigonometric Function",
    definition: "The inverse of a trigonometric function, such as arcsin, arccos, or arctan.",
    modules: [9],
    topics: ["trigonometric-functions", "inverse"],
    synonyms: ["arcsin", "arccos", "arctan"],
    related: ["sine", "cosine", "tangent", "restricted-domain"]
  }
];
function getAllGlossaryModules() {
  const modules = /* @__PURE__ */ new Set();
  GLOSSARY.forEach((term) => term.modules.forEach((m) => modules.add(m)));
  return Array.from(modules).sort((a, b) => a - b);
}
async function FlashcardsPage() {
  const claims = await requireStudentSessionClaims("/auth/login");
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
    FlashcardsPageClient,
    {
      allTerms: GLOSSARY,
      moduleNumbers: getAllGlossaryModules(),
      studentId: claims.sub
    }
  );
}
const mod_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: FlashcardsPage
}, Symbol.toStringTag, { value: "Module" }));
const MatchingPageClient = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'MatchingPageClient' is called on server");
}, "7e409082eb94", "MatchingPageClient");
async function MatchingPage() {
  const claims = await requireStudentSessionClaims("/auth/login");
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
    MatchingPageClient,
    {
      allTerms: GLOSSARY,
      moduleNumbers: getAllGlossaryModules(),
      studentId: claims.sub
    }
  );
}
const mod_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MatchingPage
}, Symbol.toStringTag, { value: "Module" }));
const PracticeTestSelection = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'PracticeTestSelection' is called on server");
}, "0e23a1771044", "PracticeTestSelection");
const dynamic$1 = "force-dynamic";
async function PracticeTestsHubPage() {
  await requireStudentSessionClaims("/auth/login");
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(PracticeTestSelection, {});
}
const mod_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PracticeTestsHubPage,
  dynamic: dynamic$1
}, Symbol.toStringTag, { value: "Module" }));
const ReviewPageClient = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'ReviewPageClient' is called on server");
}, "8bcba45e609e", "ReviewPageClient");
async function ReviewPage() {
  const claims = await requireStudentSessionClaims("/auth/login");
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(ReviewPageClient, { studentId: claims.sub });
}
const mod_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ReviewPage
}, Symbol.toStringTag, { value: "Module" }));
const SpeedRoundPageClient = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'SpeedRoundPageClient' is called on server");
}, "e6f8d052f3bb", "SpeedRoundPageClient");
async function SpeedRoundPage() {
  const claims = await requireStudentSessionClaims("/auth/login");
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
    SpeedRoundPageClient,
    {
      allTerms: GLOSSARY,
      moduleNumbers: getAllGlossaryModules(),
      studentId: claims.sub
    }
  );
}
const mod_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SpeedRoundPage
}, Symbol.toStringTag, { value: "Module" }));
const SrsDashboardPanel = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'SrsDashboardPanel' is called on server");
}, "e8012a776567", "SrsDashboardPanel");
const WeakObjectivesPanel = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'WeakObjectivesPanel' is called on server");
}, "6438574796db", "WeakObjectivesPanel");
const StrugglingStudentsPanel = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'StrugglingStudentsPanel' is called on server");
}, "7f45795c51bd", "StrugglingStudentsPanel");
const MisconceptionPanel = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'MisconceptionPanel' is called on server");
}, "1cd334b83203", "MisconceptionPanel");
async function SrsDashboardPage({ searchParams }) {
  const claims = await requireTeacherSessionClaims("/auth/login");
  const { classId: selectedClassId } = await searchParams;
  const data = await fetchInternalQuery(
    internal.teacher.getTeacherSrsDashboardData,
    { userId: claims.sub, classId: selectedClassId }
  );
  const currentClass = data?.classes.find((c) => c.id === data.currentClassId);
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-6xl mx-auto space-y-8 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground font-mono-num", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { href: "/teacher/dashboard", className: "hover:text-foreground", children: "Teacher Dashboard" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { children: "SRS Dashboard" })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: currentClass?.name ?? "SRS Dashboard" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Spaced Repetition System monitoring and interventions" })
    ] }),
    data && data.classes.length > 0 && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("label", { htmlFor: "class-select", className: "text-sm font-medium text-foreground", children: "Class" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        "select",
        {
          id: "class-select",
          defaultValue: data.currentClassId ?? "",
          onChange: (e) => {
            const url = new URL(window.location.href);
            if (e.target.value) {
              url.searchParams.set("classId", e.target.value);
            } else {
              url.searchParams.delete("classId");
            }
            window.location.href = url.toString();
          },
          className: "rounded-md border border-border px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary",
          children: data.classes.map((cls) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("option", { value: cls.id, children: cls.name }, cls.id))
        }
      )
    ] }),
    data && data.currentClassId ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        SrsDashboardPanel,
        {
          classHealth: data.classHealth,
          overdueLoad: data.overdueLoad,
          streaks: data.streaks
        }
      ),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          WeakObjectivesPanel,
          {
            objectives: data.weakObjectives
          }
        ),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          StrugglingStudentsPanel,
          {
            students: data.strugglingStudents
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        MisconceptionPanel,
        {
          misconceptions: data.misconceptions
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "No classes available." }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Create a class to start using SRS features." })
    ] })
  ] });
}
const mod_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SrsDashboardPage
}, Symbol.toStringTag, { value: "Module" }));
const PracticeTestPageClient = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'PracticeTestPageClient' is called on server");
}, "d92d84e6a7e6", "PracticeTestPageClient");
const MODULE_CONFIGS = /* @__PURE__ */ new Map();
function getModuleConfig(moduleNumber) {
  return MODULE_CONFIGS.get(moduleNumber);
}
const dynamic = "force-dynamic";
async function PracticeTestModulePage({ params }) {
  const { moduleNumber } = await params;
  const moduleNum = parseInt(moduleNumber, 10);
  if (!Number.isInteger(moduleNum) || moduleNum < 1 || moduleNum > 9) {
    notFound();
  }
  await requireStudentSessionClaims("/auth/login");
  const moduleConfig = getModuleConfig(moduleNum);
  if (!moduleConfig) {
    notFound();
  }
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(PracticeTestPageClient, { moduleConfig });
}
const mod_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PracticeTestModulePage,
  dynamic
}, Symbol.toStringTag, { value: "Module" }));
async function AdminDashboardPage() {
  const claims = await requireTeacherSessionClaims("/auth/login");
  const data = await fetchInternalQuery(internal.teacher.getTeacherDashboardData, {
    userId: claims.sub
  });
  const students = data?.students ?? [];
  const orgName = data?.teacher.organizationName ?? "Your Organization";
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-10 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "section-label", children: "Admin" }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        orgName,
        " · ",
        claims.username
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Students", value: students.length },
      {
        label: "Avg Progress",
        value: students.length > 0 ? `${Math.round(students.reduce((s, st) => s + st.progressPercentage, 0) / students.length)}%` : "—"
      },
      { label: "Completed", value: students.filter((s) => s.progressPercentage === 100).length },
      { label: "Active", value: students.filter((s) => s.completedPhases > 0).length }
    ].map((stat) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "card-workbook p-4 space-y-1 text-center", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "font-mono-num text-2xl font-bold text-primary", children: stat.value }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: stat.label })
    ] }, stat.label)) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { href: "/teacher/dashboard", className: "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors", children: "Teacher View" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { href: "/teacher/gradebook", className: "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors", children: "Gradebook" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { href: "/teacher/students", className: "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors", children: "Student Roster" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { href: "/settings", className: "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors", children: "Settings" })
    ] })
  ] });
}
const mod_18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AdminDashboardPage
}, Symbol.toStringTag, { value: "Module" }));
function ConfirmPage() {
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-4 text-center", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Welcome!" }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Your account has been confirmed. You can now sign in to access your courses." }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
      Link,
      {
        href: "/auth/login",
        className: "inline-block rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
        style: { backgroundColor: "oklch(0.46 0.18 264)" },
        children: "Sign In"
      }
    )
  ] });
}
const mod_19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ConfirmPage
}, Symbol.toStringTag, { value: "Module" }));
function AuthLayout({ children }) {
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "flex items-center justify-center min-h-[calc(100vh-10rem)] px-4", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "w-full max-w-md", children }) });
}
const mod_20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AuthLayout
}, Symbol.toStringTag, { value: "Module" }));
const page$2 = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "ce96385281e4", "default");
const mod_21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$2
}, Symbol.toStringTag, { value: "Module" }));
function ForgotPasswordPage() {
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-2 text-center", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Forgot Password?" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Please contact your teacher or administrator to reset your password." })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "rounded-md border border-border bg-card px-4 py-3 text-sm text-card-foreground", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { children: "This platform does not use email-based password recovery. Ask your teacher or school administrator to reset your password for you." }) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
      Link,
      {
        href: "/auth/login",
        className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
        children: "Back to Sign In"
      }
    ) })
  ] });
}
const mod_22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ForgotPasswordPage
}, Symbol.toStringTag, { value: "Module" }));
const page$1 = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "afd2c853620e", "default");
const mod_23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$1
}, Symbol.toStringTag, { value: "Module" }));
const page = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "f11b9697bf8d", "default");
const mod_24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page
}, Symbol.toStringTag, { value: "Module" }));
async function getServerSessionClaims() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, getAuthJwtSecret());
}
function isDevApprovalEnabledForRequest(env = process.env) {
  const nodeEnv = env.NODE_ENV?.trim();
  if (nodeEnv === "production" || nodeEnv === "preview") {
    return false;
  }
  return nodeEnv === "development" || nodeEnv === "test";
}
async function requireDeveloperSessionClaims(loginRedirectPath, unauthorizedRedirectPath = "/") {
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(buildLoginRedirect(loginRedirectPath));
  }
  if (claims.role !== "admin") {
    redirect(unauthorizedRedirectPath);
  }
  return claims;
}
function buildLoginRedirect(loginRedirectPath) {
  return `/auth/login?redirect=${loginRedirectPath}`;
}
const ReviewQueueView = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'ReviewQueueView' is called on server");
}, "e96c03092851", "ReviewQueueView");
async function ComponentApprovalPage() {
  if (!isDevApprovalEnabledForRequest()) {
    return notFound();
  }
  await requireDeveloperSessionClaims("/auth/login", "/");
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-8 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground font-mono", children: "Developer Only" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Component Approval" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(ReviewQueueView, {})
  ] });
}
const mod_25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ComponentApprovalPage
}, Symbol.toStringTag, { value: "Module" }));
function clampPercentage(value) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
function getLessonStatus(lesson) {
  if (lesson.totalPhases > 0 && lesson.completedPhases >= lesson.totalPhases) {
    return "completed";
  }
  if (lesson.completedPhases > 0 || lesson.progressPercentage > 0) {
    return "in_progress";
  }
  return "not_started";
}
function toLessonAction(lesson) {
  const status = getLessonStatus(lesson);
  if (status === "completed") {
    return null;
  }
  return {
    ...lesson,
    status,
    actionLabel: status === "in_progress" ? "Resume Lesson" : "Start Lesson"
  };
}
function getUnitStatus(lessons, completedLessons, nextLesson) {
  if (lessons.length > 0 && completedLessons === lessons.length) {
    return "completed";
  }
  if (nextLesson && nextLesson.status === "in_progress") {
    return "in_progress";
  }
  if (completedLessons > 0) {
    return "in_progress";
  }
  return "not_started";
}
function buildStudentDashboardViewModel(units) {
  let completedPhases = 0;
  let totalPhases = 0;
  let completedLessons = 0;
  let inProgressLessons = 0;
  const allLessonsFlat = [];
  for (const unit of units) {
    for (const lesson of unit.lessons) {
      allLessonsFlat.push(lesson);
    }
  }
  const isLessonUnlocked = (lessonIndex) => {
    if (lessonIndex === 0) return true;
    const previousLesson = allLessonsFlat[lessonIndex - 1];
    return previousLesson.totalPhases > 0 && previousLesson.completedPhases >= previousLesson.totalPhases;
  };
  const unitViews = units.map((unit) => {
    const lessonsWithLock = unit.lessons.map((lesson) => {
      const globalIndex = allLessonsFlat.findIndex((l) => l.id === lesson.id);
      return {
        ...lesson,
        isLocked: !isLessonUnlocked(globalIndex)
      };
    });
    for (const lesson of lessonsWithLock) {
      completedPhases += lesson.completedPhases;
      totalPhases += lesson.totalPhases;
      const status = getLessonStatus(lesson);
      if (status === "completed") completedLessons += 1;
      if (status === "in_progress") inProgressLessons += 1;
    }
    const nextLesson2 = lessonsWithLock.map(toLessonAction).find((lesson) => lesson?.status === "in_progress") ?? lessonsWithLock.map(toLessonAction).find((lesson) => lesson?.status === "not_started") ?? null;
    const unitCompletedLessons = lessonsWithLock.filter((lesson) => getLessonStatus(lesson) === "completed").length;
    const unitCompletedPhases = lessonsWithLock.reduce(
      (sum, lesson) => sum + lesson.completedPhases,
      0
    );
    const unitTotalPhases = lessonsWithLock.reduce(
      (sum, lesson) => sum + lesson.totalPhases,
      0
    );
    const unitProgress = unitTotalPhases === 0 ? 0 : clampPercentage(unitCompletedPhases / unitTotalPhases * 100);
    return {
      ...unit,
      lessons: lessonsWithLock,
      completedLessons: unitCompletedLessons,
      progressPercentage: unitProgress,
      status: getUnitStatus(lessonsWithLock, unitCompletedLessons, nextLesson2),
      nextLesson: nextLesson2
    };
  });
  const nextLesson = unitViews.map((unit) => unit.nextLesson).find((lesson) => lesson?.status === "in_progress") ?? unitViews.map((unit) => unit.nextLesson).find((lesson) => lesson?.status === "not_started") ?? null;
  const allComplete = allLessonsFlat.length > 0 && allLessonsFlat.every(
    (lesson) => lesson.totalPhases > 0 && lesson.completedPhases >= lesson.totalPhases
  );
  let continueUrl = null;
  if (allLessonsFlat.length === 0) {
    continueUrl = null;
  } else if (allComplete) {
    continueUrl = "/student/dashboard?complete=module-1";
  } else {
    const firstIncomplete = allLessonsFlat.find(
      (lesson) => lesson.totalPhases === 0 || lesson.completedPhases < lesson.totalPhases
    );
    if (firstIncomplete) {
      const nextPhase = (firstIncomplete.completedPhases || 0) + 1;
      continueUrl = `/student/lesson/${firstIncomplete.slug}?phase=${nextPhase}`;
    }
  }
  return {
    summary: {
      totalUnits: unitViews.length,
      completedUnits: unitViews.filter((unit) => unit.status === "completed").length,
      totalLessons: unitViews.reduce((sum, unit) => sum + unit.lessons.length, 0),
      completedLessons,
      inProgressLessons,
      progressPercentage: totalPhases === 0 ? 0 : clampPercentage(completedPhases / totalPhases * 100)
    },
    nextLesson,
    units: unitViews,
    continueUrl
  };
}
const ModuleCompleteScreen = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'ModuleCompleteScreen' is called on server");
}, "60e6d0d5f6bd", "ModuleCompleteScreen");
function DailyPracticeCard({
  dueCount,
  streak,
  lastPracticedAt
}) {
  const hasPracticed = lastPracticedAt !== null;
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-border bg-card p-6 space-y-4",
      "data-testid": "daily-practice-card",
      children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground", children: "Daily Practice" }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: dueCount > 0 ? `You have ${dueCount} item${dueCount === 1 ? "" : "s"} to review today.` : "No practice due today. Come back tomorrow!" })
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "text-right flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
              "div",
              {
                className: "font-mono-num text-3xl font-bold text-primary",
                "data-testid": "streak-value",
                children: streak
              }
            ),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "day streak" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: hasPracticed ? `Last practiced ${new Date(lastPracticedAt).toLocaleDateString()}` : "Start your streak today" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
            Link,
            {
              href: "/student/practice",
              className: "inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity flex-shrink-0",
              "data-testid": "practice-link",
              children: dueCount > 0 ? "Start Practice →" : "View Practice →"
            }
          )
        ] })
      ]
    }
  );
}
async function StudentDashboardPage({ searchParams }) {
  const params = await searchParams;
  const showModuleComplete = params.complete === "module-1";
  const claims = await requireStudentSessionClaims("/auth/login");
  const rawUnits = await fetchInternalQuery(
    internal.student.getDashboardData,
    { userId: claims.sub }
  );
  const vm = buildStudentDashboardViewModel(rawUnits ?? []);
  const practiceStats = await fetchInternalQuery(
    internal.srs.dashboard.getPracticeStats,
    { studentId: claims.sub }
  );
  if (showModuleComplete && vm.summary.completedLessons === vm.summary.totalLessons) {
    return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "max-w-4xl mx-auto space-y-10 py-8", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
      ModuleCompleteScreen,
      {
        moduleLabel: "Module 1: Linear Functions",
        lessonsCompleted: vm.summary.completedLessons,
        totalLessons: vm.summary.totalLessons,
        totalTimeMinutes: 0
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-10 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-sm text-muted-foreground font-mono-num", children: [
        "Welcome back, ",
        claims.username
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Dashboard" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Modules", value: vm.summary.totalUnits },
      { label: "Lessons", value: vm.summary.totalLessons },
      { label: "Completed", value: vm.summary.completedLessons },
      { label: "Progress", value: `${vm.summary.progressPercentage}%` }
    ].map((stat) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "card-workbook p-4 space-y-1 text-center", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "font-mono-num text-2xl font-bold text-primary", children: stat.value }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: stat.label })
    ] }, stat.label)) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
      DailyPracticeCard,
      {
        dueCount: practiceStats?.dueCount ?? 0,
        streak: practiceStats?.streak ?? 0,
        lastPracticedAt: practiceStats?.lastPracticedAt ?? null
      }
    ),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
      Link,
      {
        href: "/student/study",
        className: "rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group block",
        children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors", children: "Study Hub" }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Review flashcards and vocabulary with spaced repetition." })
            ] }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "text-2xl", children: "📚" })
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary", children: "Open Study Hub →" }) })
        ]
      }
    ),
    vm.continueUrl && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "section-label", children: "Continue" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground", children: vm.nextLesson?.title ?? "Module 1" }),
      vm.nextLesson?.description && /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: vm.nextLesson.description }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        Link,
        {
          href: vm.continueUrl,
          className: "inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity",
          children: [
            vm.nextLesson?.actionLabel ?? "Start",
            " →"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "space-y-6", children: vm.units.map((unit) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("h2", { className: "font-display text-lg font-semibold text-foreground", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "font-mono-num text-primary mr-2", children: [
            "Unit ",
            unit.unitNumber
          ] }),
          unit.unitTitle
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "font-mono-num text-sm text-muted-foreground", children: [
          unit.completedLessons,
          "/",
          unit.lessons.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        "div",
        {
          className: "h-full rounded-full bg-primary transition-all",
          style: { width: `${unit.progressPercentage}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "space-y-2", children: unit.lessons.map((lesson) => {
        const isLocked = lesson.isLocked;
        return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
          Link,
          {
            href: isLocked ? "#" : `/student/lesson/${lesson.slug}`,
            className: `flex items-center justify-between p-3 rounded-lg border transition-colors ${isLocked ? "border-border bg-muted/20 cursor-not-allowed opacity-60" : "border-border hover:border-primary/40 hover:bg-muted/40"}`,
            "aria-disabled": isLocked,
            onClick: isLocked ? (e) => e.preventDefault() : void 0,
            children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: `flex items-center gap-2 text-sm ${isLocked ? "text-muted-foreground" : "text-foreground group-hover:text-primary"} transition-colors`, children: [
                isLocked && /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }),
                lesson.title
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-3 font-mono-num text-xs text-muted-foreground", children: [
                lesson.estimatedMinutes != null && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { children: [
                  lesson.estimatedMinutes,
                  " min"
                ] }),
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { children: [
                  lesson.completedPhases,
                  "/",
                  lesson.totalPhases
                ] })
              ] })
            ]
          },
          lesson.id
        );
      }) })
    ] }, unit.unitNumber)) })
  ] });
}
const mod_26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: StudentDashboardPage
}, Symbol.toStringTag, { value: "Module" }));
const PracticeSessionProvider = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'PracticeSessionProvider' is called on server");
}, "3b68446fd3e5", "PracticeSessionProvider");
async function StudentPracticePage() {
  const claims = await requireStudentSessionClaims("/auth/login");
  const sessionData = await fetchInternalQuery(
    internal.queue.sessions.getActiveSession,
    { studentId: claims.sub }
  );
  const activeSessionData = sessionData ?? await fetchInternalMutation(
    internal.queue.sessions.startDailySession,
    { studentId: claims.sub }
  );
  if (!activeSessionData) {
    return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-3xl mx-auto py-8 px-4 text-center", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Daily Practice" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Unable to start a practice session. Please try again later." })
    ] });
  }
  const { session, queue } = activeSessionData;
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
    PracticeSessionProvider,
    {
      session,
      queue,
      studentId: claims.sub
    }
  );
}
const mod_27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: StudentPracticePage
}, Symbol.toStringTag, { value: "Module" }));
async function StudyHubPage() {
  const claims = await requireStudentSessionClaims("/auth/login");
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-10 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-sm text-muted-foreground font-mono-num", children: [
        "Welcome, ",
        claims.username
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Study Hub" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        Link,
        {
          href: "/student/study/flashcards",
          className: "rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group",
          children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors", children: "Flashcards" }),
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Review key vocabulary and definitions from any module. Flip cards to reveal definitions and rate your knowledge." })
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-3xl", children: "📇" })
            ] }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary", children: "Start Reviewing →" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        Link,
        {
          href: "/student/study/matching",
          className: "rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group",
          children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors", children: "Matching Game" }),
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Test your knowledge by matching terms with their definitions in a fun click-based memory game." })
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-3xl", children: "🧩" })
            ] }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary", children: "Start Matching →" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        Link,
        {
          href: "/student/study/review",
          className: "rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group",
          children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors", children: "SRS Review" }),
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Review terms scheduled by the spaced repetition system. Terms appear when you're ready to see them again." })
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-3xl", children: "🔄" })
            ] }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary", children: "Start SRS Review →" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        Link,
        {
          href: "/student/study/speed-round",
          className: "rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group",
          children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors", children: "Speed Round" }),
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Race against the clock to match terms with definitions. Build streaks and test your knowledge across all modules." })
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-3xl", children: "⚡" })
            ] }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary", children: "Start Speed Round →" }) })
          ]
        }
      )
    ] })
  ] });
}
const mod_28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: StudyHubPage
}, Symbol.toStringTag, { value: "Module" }));
const CompetencyHeatmapClient = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "0393ff029a08", "default");
async function TeacherCompetencyPage() {
  const claims = await requireTeacherSessionClaims("/auth/login");
  const competencyHeatmap = await fetchInternalQuery(
    internal.teacher.getTeacherCompetencyHeatmapData,
    {
      userId: claims.sub
    }
  );
  if (!competencyHeatmap) redirect("/teacher");
  const heatmapData = competencyHeatmap;
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(CompetencyHeatmapClient, { heatmapData });
}
const mod_29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TeacherCompetencyPage
}, Symbol.toStringTag, { value: "Module" }));
function statusBadgeClass(status) {
  switch (status) {
    case "on-track":
      return "bg-green-100 text-green-800";
    case "behind":
      return "bg-yellow-100 text-yellow-800";
    case "not-started":
      return "bg-muted/30 text-muted-foreground";
  }
}
async function TeacherDashboardPage() {
  const claims = await requireTeacherSessionClaims("/auth/login");
  const data = await fetchInternalQuery(
    internal.teacher.getTeacherDashboardData,
    { userId: claims.sub }
  );
  const students = data?.students ?? [];
  const orgName = data?.teacher.organizationName ?? "Your Organization";
  const avgProgress = students.length > 0 ? Math.round(students.reduce((s, st) => s + st.progressPercentage, 0) / students.length) : 0;
  const activeToday = students.filter((s) => {
    if (!s.lastActive) return false;
    const diff = Date.now() - new Date(s.lastActive).getTime();
    return diff < 864e5;
  }).length;
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-10 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-sm text-muted-foreground font-mono-num", children: orgName }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Teacher Dashboard" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("label", { htmlFor: "module-filter", className: "text-sm font-medium text-foreground", children: "Module" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        "select",
        {
          id: "module-filter",
          className: "rounded-md border border-border px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary",
          defaultValue: "1",
          children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("option", { value: "1", children: "Module 1" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
      { label: "Students", value: students.length },
      { label: "Avg Progress", value: `${avgProgress}%` },
      { label: "Active Today", value: activeToday }
    ].map((stat) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "card-workbook p-4 space-y-1 text-center", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "font-mono-num text-2xl font-bold text-primary", children: stat.value }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: stat.label })
    ] }, stat.label)) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        Link,
        {
          href: "/teacher/gradebook",
          className: "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors",
          children: "Gradebook"
        }
      ),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        Link,
        {
          href: "/teacher/students",
          className: "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors",
          children: "Student Roster"
        }
      ),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        Link,
        {
          href: "/teacher/units",
          className: "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors",
          children: "Units Overview"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "rounded-xl border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("thead", { className: "bg-muted/50 border-b border-border", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Student" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell", children: "Progress" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell", children: "Current Lesson" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Phases" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell", children: "Last Active" })
      ] }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("tbody", { className: "divide-y divide-border", children: students.length === 0 ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-muted-foreground", children: "No students enrolled." }) }) : students.map((student) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("tr", { className: "hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
            Link,
            {
              href: `/teacher/students?id=${student.id}`,
              className: "font-medium text-foreground hover:text-primary transition-colors",
              children: student.displayName ?? student.username
            }
          ),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground", children: student.username })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { className: "px-4 py-3 hidden md:table-cell", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "flex-1 h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
            "div",
            {
              className: "h-full rounded-full bg-primary",
              style: { width: `${student.progressPercentage}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "font-mono-num text-xs text-muted-foreground w-10 text-right", children: [
            student.progressPercentage,
            "%"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { className: "px-4 py-3 hidden lg:table-cell", children: student.currentLesson ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "text-xs text-foreground", children: student.currentLesson }) : /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          "span",
          {
            className: `inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(student.atGlanceStatus)}`,
            children: student.atGlanceStatus
          }
        ) }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("td", { className: "px-4 py-3 text-right font-mono-num text-xs text-muted-foreground", children: [
          student.completedPhases,
          "/",
          student.totalPhases
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { className: "px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell", children: student.lastActive ? new Date(student.lastActive).toLocaleDateString() : "—" })
      ] }, student.id)) })
    ] }) })
  ] });
}
const mod_30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TeacherDashboardPage
}, Symbol.toStringTag, { value: "Module" }));
function cellBgClass(color) {
  switch (color) {
    case "green":
      return "bg-green-100 text-green-800";
    case "yellow":
      return "bg-yellow-100 text-yellow-800";
    case "red":
      return "bg-red-100 text-red-800";
    case "gray":
    default:
      return "bg-muted/30 text-muted-foreground";
  }
}
const GradebookExportButton = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'GradebookExportButton' is called on server");
}, "f2151fed8798", "GradebookExportButton");
const UNIT_COUNT = 9;
async function GradebookPage({ searchParams }) {
  const claims = await requireTeacherSessionClaims("/auth/login");
  const { unit } = await searchParams;
  const unitNumber = Math.max(1, Math.min(UNIT_COUNT, parseInt(unit ?? "1", 10) || 1));
  const data = await fetchInternalQuery(internal.teacher.getTeacherGradebookData, {
    userId: claims.sub,
    unitNumber
  });
  const rows = data?.rows ?? [];
  const lessons = data?.lessons ?? [];
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-6xl mx-auto space-y-8 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "space-y-1", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Gradebook" }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(GradebookExportButton, { rows, lessons })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "flex flex-wrap gap-2", children: Array.from({ length: UNIT_COUNT }, (_, i) => i + 1).map((u) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
      Link,
      {
        href: `/teacher/gradebook?unit=${u}`,
        className: [
          "px-3 py-1.5 rounded-md text-sm font-mono-num font-medium border transition-colors",
          u === unitNumber ? "bg-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:bg-muted/40"
        ].join(" "),
        children: [
          "U",
          u
        ]
      },
      u
    )) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "rounded-xl border border-border overflow-x-auto", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("thead", { className: "bg-muted/50 border-b border-border", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground min-w-32 sticky left-0 bg-muted/50", children: "Student" }),
        lessons.map((lesson) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          "th",
          {
            className: "text-center px-2 py-3 font-medium text-muted-foreground min-w-24",
            title: lesson.lessonTitle,
            children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "block truncate max-w-20 mx-auto", children: lesson.lessonTitle })
          },
          lesson.lessonId
        ))
      ] }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("tbody", { className: "divide-y divide-border", children: rows.length === 0 ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { colSpan: lessons.length + 1, className: "px-4 py-8 text-center text-muted-foreground", children: "No data for this unit." }) }) : rows.map((row) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("tr", { className: "hover:bg-muted/10 transition-colors", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { className: "px-4 py-2 font-medium text-foreground sticky left-0 bg-card", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          Link,
          {
            href: `/teacher/students?id=${row.studentId}`,
            className: "hover:text-primary transition-colors",
            children: row.displayName
          }
        ) }),
        row.cells.map((cell, cellIndex) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          "td",
          {
            className: `text-center px-2 py-2 ${cellBgClass(cell.color)}`,
            children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
              Link,
              {
                href: `/teacher/students?id=${row.studentId}&lesson=${cellIndex}`,
                className: "block hover:opacity-80 transition-opacity",
                title: `${cell.lesson.lessonTitle} - ${cell.completionStatus}`,
                children: cell.masteryLevel !== null ? `${cell.masteryLevel}%` : "—"
              }
            )
          },
          cell.lesson.lessonId
        ))
      ] }, row.studentId)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground pt-2", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-3 h-3 rounded bg-green-100 inline-block" }),
        "Completed"
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-3 h-3 rounded bg-yellow-100 inline-block" }),
        "In Progress"
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-3 h-3 rounded bg-red-100 inline-block" }),
        "Needs Attention"
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-3 h-3 rounded bg-muted/30 inline-block" }),
        "Not Started"
      ] })
    ] })
  ] });
}
const mod_31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: GradebookPage
}, Symbol.toStringTag, { value: "Module" }));
const STATUS_LABELS = {
  "on-track": "On Track",
  "behind": "Behind",
  "not-started": "Not Started"
};
const STATUS_COLORS = {
  "on-track": "bg-green-100 text-green-800",
  "behind": "bg-red-100 text-red-800",
  "not-started": "bg-muted text-muted-foreground"
};
function LessonCard({
  lesson,
  index,
  scrollTarget
}) {
  const isTarget = index === scrollTarget;
  const progressColor = lesson.progressPercentage === 100 ? "bg-green-500" : lesson.progressPercentage > 0 ? "bg-yellow-500" : "bg-muted";
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
    "div",
    {
      id: `lesson-${index}`,
      "data-lesson-index": index,
      className: [
        "card-workbook p-4 space-y-3 border",
        isTarget ? "border-primary/50 ring-2 ring-primary/20" : "border-border"
      ].join(" "),
      children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-medium text-foreground truncate", children: lesson.title }),
            lesson.description && /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-1 mt-0.5", children: lesson.description })
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
            "span",
            {
              className: [
                "shrink-0 px-2 py-0.5 rounded-full text-xs font-medium",
                lesson.progressPercentage === 100 ? "bg-green-100 text-green-800" : lesson.progressPercentage > 0 ? "bg-yellow-100 text-yellow-800" : "bg-muted text-muted-foreground"
              ].join(" "),
              children: [
                lesson.completedPhases,
                "/",
                lesson.totalPhases
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          "div",
          {
            className: `h-full rounded-full transition-all ${progressColor}`,
            style: { width: `${lesson.progressPercentage}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { children: [
            lesson.progressPercentage,
            "% complete"
          ] }),
          lesson.totalPhases > 0 && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "font-mono-num", children: [
            lesson.completedPhases,
            " of ",
            lesson.totalPhases,
            " phases"
          ] })
        ] })
      ]
    }
  );
}
function StudentDetailView({
  detail,
  scrollTarget
}) {
  if (detail.status !== "success" || !detail.student || !detail.snapshot || !detail.units) {
    return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: detail.status === "unauthorized" ? "You are not authorized to view this student." : detail.status === "not_found" ? "Student not found." : "Unable to load student details." });
  }
  const { student, snapshot, units } = detail;
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
      Link,
      {
        href: "/teacher/students",
        className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
        children: "← Back to all students"
      }
    ) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "card-workbook p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "text-2xl font-display font-bold text-foreground", children: student.displayName ?? student.username }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "@",
            student.username
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
          "span",
          {
            className: [
              "px-3 py-1 rounded-full text-sm font-medium",
              STATUS_COLORS[snapshot.atGlanceStatus]
            ].join(" "),
            children: STATUS_LABELS[snapshot.atGlanceStatus]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-2xl font-bold font-mono-num text-primary", children: [
            snapshot.progressPercentage,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Overall Progress" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-2xl font-bold font-mono-num text-foreground", children: [
            snapshot.completedPhases,
            "/",
            snapshot.totalPhases
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Phases Completed" })
        ] }),
        snapshot.currentLesson && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 col-span-2", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-lg font-medium text-foreground truncate", children: snapshot.currentLesson }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Current Lesson" })
        ] })
      ] }),
      snapshot.lastActive && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Last active: ",
        new Date(snapshot.lastActive).toLocaleDateString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "space-y-4", children: units.map((unit) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "text-lg font-semibold text-foreground", children: unit.unitTitle }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Module ",
          unit.unitNumber
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "grid gap-3", children: unit.lessons.map((lesson, index) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        LessonCard,
        {
          lesson,
          index,
          scrollTarget
        },
        lesson.id
      )) })
    ] }, unit.unitNumber)) })
  ] });
}
async function StudentsPage({ searchParams }) {
  const claims = await requireTeacherSessionClaims("/auth/login");
  const { id: selectedId, lesson: lessonParam } = await searchParams;
  const scrollTarget = lessonParam != null ? parseInt(lessonParam, 10) - 1 : -1;
  const dashboardData = await fetchInternalQuery(internal.teacher.getTeacherDashboardData, {
    userId: claims.sub
  });
  const students = dashboardData?.students ?? [];
  let detail = null;
  if (selectedId) {
    detail = await fetchInternalQuery(internal.teacher.getTeacherStudentDetail, {
      userId: claims.sub,
      studentId: selectedId
    });
  }
  const showDetail = detail?.status === "success";
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-8 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: showDetail ? detail.student?.displayName ?? detail.student?.username ?? "Student" : "Students" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground text-sm", children: showDetail ? "Lesson progress detail" : `${students.length} enrolled` })
    ] }),
    showDetail ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(StudentDetailView, { detail, scrollTarget }) : /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "grid gap-3", children: students.length === 0 ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-center text-muted-foreground py-12", children: "No students enrolled." }) : students.map((student) => {
      const isSelected = student.id === selectedId;
      return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        "div",
        {
          className: [
            "card-workbook p-4 space-y-2 transition-all",
            isSelected ? "border-primary/50 bg-primary/5" : ""
          ].join(" "),
          children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
                  Link,
                  {
                    href: `/teacher/students?id=${student.id}`,
                    className: "font-medium text-foreground hover:text-primary transition-colors",
                    children: student.displayName ?? student.username
                  }
                ),
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-xs text-muted-foreground", children: student.username })
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "font-mono-num text-sm font-bold text-primary", children: [
                  student.progressPercentage,
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  student.completedPhases,
                  "/",
                  student.totalPhases,
                  " phases"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
              "div",
              {
                className: "h-full rounded-full bg-primary transition-all",
                style: { width: `${student.progressPercentage}%` }
              }
            ) }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center justify-between", children: [
              student.lastActive && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Last active: ",
                new Date(student.lastActive).toLocaleDateString()
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
                "span",
                {
                  className: [
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    student.atGlanceStatus === "on-track" ? "bg-green-100 text-green-800" : student.atGlanceStatus === "behind" ? "bg-red-100 text-red-800" : "bg-muted text-muted-foreground"
                  ].join(" "),
                  children: STATUS_LABELS[student.atGlanceStatus]
                }
              )
            ] })
          ]
        },
        student.id
      );
    }) })
  ] });
}
const mod_32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: StudentsPage
}, Symbol.toStringTag, { value: "Module" }));
async function TeacherUnitsPage() {
  const claims = await requireTeacherSessionClaims("/auth/login");
  const coverage = await fetchInternalQuery(
    internal.teacher.getStandardsCoverage,
    { unitNumber: 1, userId: claims.sub }
  );
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-8 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Units Overview" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
        Link,
        {
          href: "/teacher/gradebook",
          className: "text-sm font-medium text-primary hover:underline",
          children: "View Gradebook →"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Standards Coverage Map" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "card-workbook p-5 overflow-x-auto", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("tr", { className: "border-b", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Standard" }),
          coverage.lessons.map((lesson) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("th", { className: "text-center py-2 px-2 font-medium text-muted-foreground", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "writing-mode-vertical", style: { writingMode: "vertical-rl", textOrientation: "mixed" }, children: lesson.orderIndex }) }, lesson.id))
        ] }) }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("tbody", { children: coverage.standards.map((standard) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("tr", { className: "border-b last:border-b-0", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("td", { className: "py-2 pr-4", children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "font-medium text-foreground", children: standard.standardCode }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "text-xs text-muted-foreground", children: standard.studentFriendlyDescription ?? standard.standardDescription })
          ] }),
          coverage.lessons.map((lesson) => {
            const lessonCoverage = standard.lessons.find((l) => l.lessonId === lesson.id);
            return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("td", { className: "text-center py-2 px-2", children: lessonCoverage ? lessonCoverage.isPrimary ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-block w-4 h-4 rounded-full bg-green-500", title: "Primary standard" }) : /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-block w-4 h-4 rounded-full bg-yellow-400", title: "Secondary standard" }) : /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-block w-4 h-4 rounded-full bg-muted" }) }, lesson.id);
          })
        ] }, standard.standardId)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-block w-3 h-3 rounded-full bg-green-500" }),
          "Primary standard"
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-block w-3 h-3 rounded-full bg-yellow-400" }),
          "Secondary standard"
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-block w-3 h-3 rounded-full bg-muted" }),
          "Not covered"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Curriculum Units" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "space-y-4", children: coverage.lessons.length === 0 ? /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "No lessons found for Module 1." }) : coverage.lessons.map((lesson) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "card-workbook p-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-mono-num text-sm font-bold flex items-center justify-center", children: lesson.orderIndex }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex-1 space-y-1", children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-display text-lg font-semibold text-card-foreground", children: lesson.title }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
              Link,
              {
                href: `/teacher/lesson/${lesson.slug}`,
                className: "text-xs font-medium text-primary hover:underline",
                children: "Preview Lesson →"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
            Link,
            {
              href: `/teacher/gradebook?unit=1`,
              className: "text-xs font-medium text-primary hover:underline flex-shrink-0",
              children: "View Progress"
            }
          )
        ] }),
        lesson.learningObjectives.length > 0 && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "ml-12", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h4", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Learning Objectives" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("ul", { className: "list-disc list-inside text-sm text-foreground space-y-0.5", children: lesson.learningObjectives.map((obj, idx) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("li", { children: obj }, idx)) })
        ] })
      ] }, lesson.id)) })
    ] })
  ] });
}
const mod_33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TeacherUnitsPage
}, Symbol.toStringTag, { value: "Module" }));
const LessonRenderer = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'LessonRenderer' is called on server");
}, "c71e93ed9475", "LessonRenderer");
const PHASE_DISPLAY_INFO = {
  explore: {
    label: "Explore",
    icon: "compass",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  vocabulary: {
    label: "Vocabulary",
    icon: "book-open",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  learn: {
    label: "Learn",
    icon: "lightbulb",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  key_concept: {
    label: "Key Concept",
    icon: "star",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  worked_example: {
    label: "Example",
    icon: "play-circle",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  guided_practice: {
    label: "Guided Practice",
    icon: "help-circle",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50"
  },
  independent_practice: {
    label: "Practice",
    icon: "pen-tool",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  assessment: {
    label: "Assessment",
    icon: "check-circle-2",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  discourse: {
    label: "Think About It",
    icon: "message-square",
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  },
  reflection: {
    label: "Reflection",
    icon: "clock",
    color: "text-gray-600",
    bgColor: "bg-gray-50"
  }
};
function getPhaseDisplayInfo(phaseType) {
  return PHASE_DISPLAY_INFO[phaseType];
}
async function StudentLessonPage({ params }) {
  const { lessonSlug } = await params;
  const claims = await requireStudentSessionClaims("/auth/login");
  const result = await fetchInternalQuery(
    internal.student.getLessonProgress,
    { userId: claims.sub, lessonIdentifier: lessonSlug }
  );
  if (!result) {
    notFound();
  }
  const phases = result.phases.map((p) => ({
    phaseId: p.phaseId,
    phaseNumber: p.phaseNumber,
    phaseType: p.phaseType,
    title: getPhaseDisplayInfo(p.phaseType).label,
    sections: p.sections,
    status: p.status,
    completed: p.status === "completed"
  }));
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
    LessonRenderer,
    {
      lessonId: lessonSlug,
      lessonTitle: result.lessonTitle,
      moduleLabel: `Unit ${result.unitNumber}`,
      lessonNumber: result.lessonNumber,
      phases,
      mode: "practice"
    }
  );
}
const mod_34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: StudentLessonPage
}, Symbol.toStringTag, { value: "Module" }));
async function TeacherLessonPreviewPage({ params }) {
  const { lessonSlug } = await params;
  const claims = await requireTeacherSessionClaims("/auth/login");
  const result = await fetchInternalQuery(
    internal.teacher.getTeacherLessonPreview,
    { lessonIdentifier: lessonSlug, userId: claims.sub }
  );
  if (!result) {
    notFound();
  }
  const phases = result.phases.map((p) => ({
    phaseId: p.phaseId,
    phaseNumber: p.phaseNumber,
    phaseType: p.phaseType,
    title: p.title || getPhaseDisplayInfo(p.phaseType).label,
    sections: p.sections,
    status: "available",
    completed: false
  }));
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
    LessonRenderer,
    {
      lessonId: lessonSlug,
      lessonTitle: result.lessonTitle,
      moduleLabel: `Unit ${result.unitNumber}`,
      lessonNumber: result.lessonNumber,
      phases,
      mode: "teaching",
      showTeacherPreviewBadge: true
    }
  );
}
const mod_35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TeacherLessonPreviewPage
}, Symbol.toStringTag, { value: "Module" }));
const toKebabCase = (string2) => string2.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string2) => string2.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string2) => {
  const camelCase = toCamelCase(string2);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array2) => {
  return Boolean(className) && className.trim() !== "" && array2.indexOf(className) === index;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const Icon = react_reactServerExports.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => react_reactServerExports.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => react_reactServerExports.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
const createLucideIcon = (iconName, iconNode) => {
  const Component = react_reactServerExports.forwardRef(
    ({ className, ...props }, ref) => react_reactServerExports.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
const __iconNode = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode);
const StudentCompetencyDetailGrid = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'StudentCompetencyDetailGrid' is called on server");
}, "8ec9f9e098fa", "StudentCompetencyDetailGrid");
async function TeacherStudentCompetencyPage({ params }) {
  const { studentId } = await params;
  const claims = await requireTeacherSessionClaims("/auth/login");
  const studentCompetencyDetail = await fetchInternalQuery(
    internal.teacher.getTeacherStudentCompetencyDetail,
    {
      userId: claims.sub,
      studentId
    }
  );
  if (!studentCompetencyDetail) redirect("/teacher/competency");
  const detail = studentCompetencyDetail;
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-6xl mx-auto space-y-8 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("header", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        Link,
        {
          href: "/teacher/competency",
          className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(ChevronLeft, { className: "size-4", "aria-hidden": "true" }),
            "Competency Heatmap"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Student Competency Detail" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("section", { "aria-label": "Student competency detail", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(StudentCompetencyDetailGrid, { detail }) })
  ] });
}
const mod_36 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TeacherStudentCompetencyPage
}, Symbol.toStringTag, { value: "Module" }));
async function CurriculumPage() {
  const units = await fetchQuery(api.public.getCurriculum, {});
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "hero-gradient relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "relative max-w-7xl mx-auto px-6 py-20 lg:py-32", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-3xl space-y-6", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "inline-flex items-center gap-2 font-mono-num text-xs font-medium tracking-widest text-white/70 uppercase", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-8 h-[1px] bg-white/40" }),
          "Course Overview"
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[0.95] text-white", children: "Curriculum" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-lg md:text-xl text-white/70 leading-relaxed", children: [
          units.length,
          " modules across a full-year course covering algebra, functions, statistics, and trigonometry."
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "max-w-7xl mx-auto px-6 py-16 lg:py-24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "grid lg:grid-cols-2 gap-6 lg:gap-8", children: units.map((unit) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "group relative p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "absolute top-6 right-6 font-mono-num text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors", children: String(unit.unitNumber).padStart(2, "0") }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "relative space-y-4", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "font-mono-num text-sm font-semibold text-primary", children: [
            "Module ",
            unit.unitNumber
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-8 h-[1px] bg-border" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-2xl font-semibold text-foreground", children: unit.title }),
        unit.description && /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground leading-relaxed", children: unit.description }),
        unit.lessons.length > 0 && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "font-mono-num text-xs text-muted-foreground uppercase tracking-wider mb-3", children: [
            unit.lessons.length,
            " lesson",
            unit.lessons.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("ul", { className: "space-y-2", children: [
            unit.lessons.slice(0, 4).map((lesson) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("li", { className: "flex items-center gap-3 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "font-mono-num text-xs text-primary/60 w-10", children: [
                unit.unitNumber,
                ".",
                lesson.orderIndex
              ] }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "text-foreground/80 group-hover:text-foreground transition-colors", children: lesson.title })
            ] }, lesson.id)),
            unit.lessons.length > 4 && /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("li", { className: "text-sm text-muted-foreground italic", children: [
              "+",
              unit.lessons.length - 4,
              " more lessons"
            ] })
          ] })
        ] })
      ] })
    ] }, unit.unitNumber)) }) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "border-t border-border", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "max-w-7xl mx-auto px-6 py-16", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-display text-2xl font-semibold text-foreground mb-2", children: "Ready to begin?" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "Sign in to access all lessons, activities, and assessments." })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
        Link,
        {
          href: "/auth/login",
          className: "group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-sm transition-all hover:bg-primary/90 hover:translate-x-1 whitespace-nowrap",
          children: [
            "Sign In",
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("svg", { className: "w-4 h-4 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8l4 4m0 0l-4 4m4-4H3" }) })
          ]
        }
      )
    ] }) }) })
  ] });
}
const mod_37 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CurriculumPage
}, Symbol.toStringTag, { value: "Module" }));
function PrefacePage() {
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "hero-gradient relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "relative max-w-7xl mx-auto px-6 py-20 lg:py-32", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-3xl space-y-6", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "inline-flex items-center gap-2 font-mono-num text-xs font-medium tracking-widest text-white/70 uppercase", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-8 h-[1px] bg-white/40" }),
          "Course Introduction"
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[0.95] text-white", children: "Preface" })
      ] }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "max-w-3xl mx-auto px-6 py-16 lg:py-24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-16", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-lg md:text-xl text-foreground/90 leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { children: "Integrated Math 3" }),
        " is the third course in a three-year integrated mathematics sequence. This course deepens students' understanding of the algebraic and analytical tools introduced in earlier years, connecting them to new topics in statistics, trigonometry, and mathematical modeling."
      ] }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-8 h-[1px] bg-primary" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "font-mono-num text-xs font-medium tracking-widest text-primary uppercase", children: "What You Will Learn" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "Over nine modules and 52 lessons, you will explore the following topics:" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("ul", { className: "grid sm:grid-cols-2 gap-3", children: [
          "Quadratic functions and complex numbers",
          "Polynomials and polynomial equations",
          "Inverse and radical functions",
          "Exponential functions and geometric series",
          "Logarithmic functions",
          "Rational functions and equations",
          "Inferential statistics",
          "Trigonometric functions"
        ].map((item, index) => /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("li", { className: "flex items-start gap-3 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { children: item })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-8 h-[1px] bg-primary" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "font-mono-num text-xs font-medium tracking-widest text-primary uppercase", children: "How This Course Works" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-4 text-muted-foreground leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { children: [
            "Each lesson is structured into six sequential phases: a ",
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Hook" }),
            " to activate prior knowledge, an ",
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Introduction" }),
            " of new concepts, a",
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Guided Practice" }),
            " section worked through together, an",
            " ",
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Independent Practice" }),
            " completed on your own, an",
            " ",
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Assessment" }),
            " to measure understanding, and a",
            " ",
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Closing" }),
            " reflection."
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { children: "All graded work is completed in class. Retakes are permitted with a maximum score of 85%. The goal is mastery, not perfection on the first attempt." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-8 h-[1px] bg-primary" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "font-mono-num text-xs font-medium tracking-widest text-primary uppercase", children: "CAP Reflection" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "At the end of each lesson you will reflect on three qualities: ",
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Courage" }),
          "' — taking on challenges; ",
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Adaptability" }),
          " — adjusting your approach when something isn't working; and ",
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("strong", { className: "text-foreground", children: "Persistence" }),
          " — continuing through difficulty. Mathematics is as much about these habits of mind as it is about the content."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "border-t border-border", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "max-w-3xl mx-auto px-6 py-16", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-display text-xl font-semibold text-foreground mb-2", children: "Explore the course" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "Ready to dive into the curriculum?" })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
          Link,
          {
            href: "/curriculum",
            className: "group inline-flex items-center gap-2 px-6 py-3 border-2 border-border text-foreground font-medium rounded-sm transition-all hover:border-primary hover:text-primary",
            children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("svg", { className: "w-4 h-4 transition-transform group-hover:-translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16l-4-4m0 0l4-4m-4 4h18" }) }),
              "View Curriculum"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
          Link,
          {
            href: "/auth/login",
            className: "group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-sm transition-all hover:bg-primary/90 hover:translate-x-1",
            children: [
              "Sign In",
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("svg", { className: "w-4 h-4 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8l4 4m0 0l-4 4m4-4H3" }) })
            ]
          }
        )
      ] })
    ] }) }) })
  ] });
}
const mod_38 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PrefacePage
}, Symbol.toStringTag, { value: "Module" }));
const ChangePasswordForm = /* @__PURE__ */ registerClientReference(() => {
  throw new Error("Unexpectedly client reference export 'ChangePasswordForm' is called on server");
}, "3fcda75eace0", "ChangePasswordForm");
async function SettingsPage() {
  const claims = await requireServerSessionClaims("/auth/login");
  const dashboardHref = claims.role === "student" ? "/student/dashboard" : "/teacher/dashboard";
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-10 py-8", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground", children: "Settings" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Signed in as ",
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "font-mono-num", children: claims.username })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground", children: "Change Password" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "card-workbook p-6", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(ChangePasswordForm, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "pt-4 border-t border-border", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(Link, { href: dashboardHref, className: "text-sm text-primary hover:underline", children: "← Back to dashboard" }) })
  ] });
}
const mod_39 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SettingsPage
}, Symbol.toStringTag, { value: "Module" }));
function StudentPage() {
  redirect("/student/dashboard");
}
const mod_40 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: StudentPage
}, Symbol.toStringTag, { value: "Module" }));
var nestedKeys = /* @__PURE__ */ new Set(["style"]);
var isNewReact = "use" in React;
var fixedMap = {
  srcset: "srcSet",
  fetchpriority: isNewReact ? "fetchPriority" : "fetchpriority"
};
var camelize = (key) => {
  if (key.startsWith("data-") || key.startsWith("aria-")) {
    return key;
  }
  return fixedMap[key] || key.replace(/-./g, (suffix) => suffix[1].toUpperCase());
};
function camelizeProps(props) {
  return Object.fromEntries(
    Object.entries(props).map(([k, v]) => [
      camelize(k),
      nestedKeys.has(k) && v && typeof v !== "string" ? camelizeProps(v) : v
    ])
  );
}
var getSizes = (width, layout) => {
  if (!width || !layout) {
    return void 0;
  }
  switch (layout) {
    // If screen is wider than the max size, image width is the max size,
    // otherwise it's the width of the screen
    case `constrained`:
      return `(min-width: ${width}px) ${width}px, 100vw`;
    // Image is always the same width, whatever the size of the screen
    case `fixed`:
      return `${width}px`;
    // Image is always the width of the screen
    case `fullWidth`:
      return `100vw`;
    default:
      return void 0;
  }
};
var pixelate = (value) => value || value === 0 ? `${value}px` : void 0;
var getStyle = ({
  width,
  height,
  aspectRatio,
  layout,
  objectFit = "cover",
  background
}) => {
  const styleEntries = [
    ["object-fit", objectFit]
  ];
  if (background?.startsWith("https:") || background?.startsWith("http:") || background?.startsWith("data:") || background?.startsWith("/")) {
    styleEntries.push(["background-image", `url(${background})`]);
    styleEntries.push(["background-size", "cover"]);
    styleEntries.push(["background-repeat", "no-repeat"]);
  } else {
    styleEntries.push(["background", background]);
  }
  if (layout === "fixed") {
    styleEntries.push(["width", pixelate(width)]);
    styleEntries.push(["height", pixelate(height)]);
  }
  if (layout === "constrained") {
    styleEntries.push(["max-width", pixelate(width)]);
    styleEntries.push(["max-height", pixelate(height)]);
    styleEntries.push([
      "aspect-ratio",
      aspectRatio ? `${aspectRatio}` : void 0
    ]);
    styleEntries.push(["width", "100%"]);
  }
  if (layout === "fullWidth") {
    styleEntries.push(["width", "100%"]);
    styleEntries.push([
      "aspect-ratio",
      aspectRatio ? `${aspectRatio}` : void 0
    ]);
    styleEntries.push(["height", pixelate(height)]);
  }
  return Object.fromEntries(
    styleEntries.filter(([, value]) => value)
  );
};
var DEFAULT_RESOLUTIONS = [
  6016,
  // 6K
  5120,
  // 5K
  4480,
  // 4.5K
  3840,
  // 4K
  3200,
  // QHD+
  2560,
  // WQXGA
  2048,
  // QXGA
  1920,
  // 1080p
  1668,
  // Various iPads
  1280,
  // 720p
  1080,
  // iPhone 6-8 Plus
  960,
  // older horizontal phones
  828,
  // iPhone XR/11
  750,
  // iPhone 6-8
  640
  // older and lower-end phones
];
var LOW_RES_WIDTH = 24;
var getBreakpoints = ({
  width,
  layout,
  resolutions = DEFAULT_RESOLUTIONS
}) => {
  if (layout === "fullWidth") {
    return resolutions;
  }
  if (!width) {
    return [];
  }
  const doubleWidth = width * 2;
  if (layout === "fixed") {
    return [width, doubleWidth];
  }
  if (layout === "constrained") {
    return [
      // Always include the image at 1x and 2x the specified width
      width,
      doubleWidth,
      // Filter out any resolutions that are larger than the double-res image
      ...resolutions.filter((w) => w < doubleWidth)
    ];
  }
  return [];
};
var getSrcSetEntries = ({
  src,
  width,
  layout = "constrained",
  height,
  aspectRatio,
  breakpoints,
  format
}) => {
  breakpoints ||= getBreakpoints({ width, layout });
  return breakpoints.sort((a, b) => a - b).map((bp) => {
    let transformedHeight;
    if (height && aspectRatio) {
      transformedHeight = Math.round(bp / aspectRatio);
    }
    return {
      url: src,
      width: bp,
      height: transformedHeight,
      format
    };
  });
};
var getSrcSet = (options) => {
  let { src, transformer, operations } = options;
  if (!transformer) {
    return "";
  }
  return getSrcSetEntries(options).map(({ url: _, ...transform2 }) => {
    const url = transformer(
      src,
      { ...operations, ...transform2 },
      options.options
    );
    return `${url?.toString()} ${transform2.width}w`;
  }).join(",\n");
};
function transformSharedProps({
  width,
  height,
  priority,
  layout = "constrained",
  aspectRatio,
  ...props
}) {
  width = width && Number(width) || void 0;
  height = height && Number(height) || void 0;
  if (priority) {
    props.loading ||= "eager";
    props.fetchpriority ||= "high";
  } else {
    props.loading ||= "lazy";
    props.decoding ||= "async";
  }
  if (props.alt === "") {
    props.role ||= "presentation";
  }
  if (aspectRatio) {
    if (width) {
      if (height) ;
      else {
        height = Math.round(width / aspectRatio);
      }
    } else if (height) {
      width = Math.round(height * aspectRatio);
    } else ;
  } else if (width && height) {
    aspectRatio = width / height;
  } else ;
  return {
    width,
    height,
    aspectRatio,
    layout,
    ...props
  };
}
function transformBaseImageProps(props) {
  let {
    src,
    transformer,
    background,
    layout,
    objectFit,
    breakpoints,
    width,
    height,
    aspectRatio,
    unstyled,
    operations,
    options,
    ...transformedProps
  } = transformSharedProps(props);
  if (transformer && background === "auto") {
    const lowResHeight = aspectRatio ? Math.round(LOW_RES_WIDTH / aspectRatio) : void 0;
    const lowResImage = transformer(
      src,
      {
        width: LOW_RES_WIDTH,
        height: lowResHeight
      },
      options
    );
    if (lowResImage) {
      background = lowResImage.toString();
    }
  }
  const styleProps = {
    width,
    height,
    aspectRatio,
    layout,
    objectFit,
    background
  };
  transformedProps.sizes ||= getSizes(width, layout);
  if (!unstyled) {
    transformedProps.style = {
      ...getStyle(styleProps),
      ...transformedProps.style
    };
  }
  if (transformer) {
    transformedProps.srcset = getSrcSet({
      src,
      width,
      height,
      aspectRatio,
      layout,
      breakpoints,
      transformer,
      operations,
      options
    });
    const transformed = transformer(
      src,
      { ...operations, width, height },
      options
    );
    if (transformed) {
      src = transformed;
    }
    if (layout === "fullWidth" || layout === "constrained") {
      width = void 0;
      height = void 0;
    }
  }
  return {
    ...transformedProps,
    src: src?.toString(),
    width,
    height
  };
}
function normalizeImageType(type) {
  if (!type) {
    return {};
  }
  if (type.startsWith("image/")) {
    return {
      format: type.slice(6),
      mimeType: type
    };
  }
  return {
    format: type,
    mimeType: `image/${type === "jpg" ? "jpeg" : type}`
  };
}
function transformBaseSourceProps({
  media,
  type,
  ...props
}) {
  let {
    src,
    transformer,
    layout,
    breakpoints,
    width,
    height,
    aspectRatio,
    sizes,
    loading,
    decoding,
    operations,
    options,
    ...rest
  } = transformSharedProps(props);
  if (!transformer) {
    return {};
  }
  const { format, mimeType } = normalizeImageType(type);
  sizes ||= getSizes(width, layout);
  const srcset = getSrcSet({
    src,
    width,
    height,
    aspectRatio,
    layout,
    breakpoints,
    transformer,
    format,
    operations,
    options
  });
  const transformed = transformer(
    src,
    { ...operations, width, height },
    options
  );
  if (transformed) {
    src = transformed;
  }
  const returnObject = {
    ...rest,
    sizes,
    srcset
  };
  if (media) {
    returnObject.media = media;
  }
  if (mimeType) {
    returnObject.type = mimeType;
  }
  return returnObject;
}
const domains = {
  "images.ctfassets.net": "contentful",
  "cdn.builder.io": "builder.io",
  "images.prismic.io": "imgix",
  "www.datocms-assets.com": "imgix",
  "cdn.sanity.io": "imgix",
  "images.unsplash.com": "imgix",
  "cdn.shopify.com": "shopify",
  "s7d1.scene7.com": "scene7",
  "ip.keycdn.com": "keycdn",
  "assets.caisy.io": "bunny",
  "images.contentstack.io": "contentstack",
  "ucarecdn.com": "uploadcare",
  "imagedelivery.net": "cloudflare_images",
  "wsrv.nl": "wsrv"
};
const subdomains = {
  "imgix.net": "imgix",
  "wp.com": "wordpress",
  "files.wordpress.com": "wordpress",
  "b-cdn.net": "bunny",
  "storyblok.com": "storyblok",
  "kc-usercontent.com": "kontent.ai",
  "cloudinary.com": "cloudinary",
  "kxcdn.com": "keycdn",
  "imgeng.in": "imageengine",
  "imagekit.io": "imagekit",
  "cloudimg.io": "cloudimage",
  "ucarecdn.com": "uploadcare",
  "supabase.co": "supabase",
  "graphassets.com": "hygraph"
};
const paths = {
  "/cdn-cgi/image/": "cloudflare",
  "/cdn-cgi/imagedelivery/": "cloudflare_images",
  "/_next/image": "nextjs",
  "/_vercel/image": "vercel",
  "/is/image": "scene7",
  "/_ipx/": "ipx",
  "/_image": "astro",
  "/.netlify/images": "netlify",
  "/storage/v1/object/public/": "supabase",
  "/storage/v1/render/image/public/": "supabase",
  "/v1/storage/buckets/": "appwrite"
};
function roundIfNumeric(value) {
  if (!value) {
    return value;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return value;
  }
  return Math.round(num);
}
const toRelativeUrl = (url) => {
  const { pathname, search } = url;
  return `${pathname}${search}`;
};
const toCanonicalUrlString = (url) => {
  return url.hostname === "n" ? toRelativeUrl(url) : url.toString();
};
const toUrl = (url, base) => {
  return typeof url === "string" ? new URL(url, "http://n/") : url;
};
const escapeChar = (text) => text === " " ? "+" : "%" + text.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
const stripLeadingSlash = (str) => str?.startsWith("/") ? str.slice(1) : str;
const stripTrailingSlash = (str) => str?.endsWith("/") ? str.slice(0, -1) : str;
const addTrailingSlash = (str) => str?.endsWith("/") ? str : `${str}/`;
const createFormatter = (kvSeparator, paramSeparator) => {
  const encodedValueJoiner = escapeChar(kvSeparator);
  const encodedOperationJoiner = escapeChar(paramSeparator);
  function escape(value) {
    return encodeURIComponent(value).replaceAll(kvSeparator, encodedValueJoiner).replaceAll(paramSeparator, encodedOperationJoiner);
  }
  function format(key, value) {
    return `${escape(key)}${kvSeparator}${escape(String(value))}`;
  }
  return (operations) => {
    const ops = Array.isArray(operations) ? operations : Object.entries(operations);
    return ops.flatMap(([key, value]) => {
      if (value === void 0 || value === null) {
        return [];
      }
      if (Array.isArray(value)) {
        return value.map((v) => format(key, v));
      }
      return format(key, value);
    }).join(paramSeparator);
  };
};
const createParser = (kvSeparator, paramSeparator) => {
  if (kvSeparator === "=" && paramSeparator === "&") {
    return queryParser;
  }
  return (url) => {
    const urlString = url.toString();
    return Object.fromEntries(urlString.split(paramSeparator).map((pair) => {
      const [key, value] = pair.split(kvSeparator);
      return [decodeURI(key), decodeURI(value)];
    }));
  };
};
function clampDimensions(operations, maxWidth = 4e3, maxHeight = 4e3) {
  let { width, height } = operations;
  width = Number(width) || void 0;
  height = Number(height) || void 0;
  if (width && width > maxWidth) {
    if (height) {
      height = Math.round(height * maxWidth / width);
    }
    width = maxWidth;
  }
  if (height && height > maxHeight) {
    if (width) {
      width = Math.round(width * maxHeight / height);
    }
    height = maxHeight;
  }
  return { width, height };
}
function extractFromURL(url) {
  const parsedUrl = toUrl(url);
  const operations = Object.fromEntries(parsedUrl.searchParams.entries());
  for (const key in ["width", "height", "quality"]) {
    const value = operations[key];
    if (value) {
      const newVal = Number(value);
      if (!isNaN(newVal)) {
        operations[key] = newVal;
      }
    }
  }
  parsedUrl.search = "";
  return {
    operations,
    src: toCanonicalUrlString(parsedUrl)
  };
}
function normaliseOperations({ keyMap = {}, formatMap: formatMap2 = {}, defaults = {} }, operations) {
  if (operations.format && operations.format in formatMap2) {
    operations.format = formatMap2[operations.format];
  }
  if (operations.width) {
    operations.width = roundIfNumeric(operations.width);
  }
  if (operations.height) {
    operations.height = roundIfNumeric(operations.height);
  }
  for (const k in keyMap) {
    if (!Object.prototype.hasOwnProperty.call(keyMap, k)) {
      continue;
    }
    const key = k;
    if (keyMap[key] === false) {
      delete operations[key];
      continue;
    }
    if (keyMap[key] && operations[key]) {
      operations[keyMap[key]] = operations[key];
      delete operations[key];
    }
  }
  for (const k in defaults) {
    if (!Object.prototype.hasOwnProperty.call(defaults, k)) {
      continue;
    }
    const key = k;
    const value = defaults[key];
    if (!operations[key] && value !== void 0) {
      if (keyMap[key] === false) {
        continue;
      }
      const resolvedKey = keyMap[key] ?? key;
      if (resolvedKey in operations) {
        continue;
      }
      operations[resolvedKey] = value;
    }
  }
  return operations;
}
const invertMap = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
function denormaliseOperations({ keyMap = {}, formatMap: formatMap2 = {}, defaults = {} }, operations) {
  const invertedKeyMap = invertMap(keyMap);
  const invertedFormatMap = invertMap(formatMap2);
  const ops = normaliseOperations({
    keyMap: invertedKeyMap,
    formatMap: invertedFormatMap,
    defaults
  }, operations);
  if (ops.width) {
    ops.width = roundIfNumeric(ops.width);
  }
  if (ops.height) {
    ops.height = roundIfNumeric(ops.height);
  }
  const q = Number(ops.quality);
  if (!isNaN(q)) {
    ops.quality = q;
  }
  return ops;
}
const queryParser = (url) => {
  const parsedUrl = toUrl(url);
  return Object.fromEntries(parsedUrl.searchParams.entries());
};
function createOperationsGenerator({ kvSeparator = "=", paramSeparator = "&", ...options } = {}) {
  const formatter = createFormatter(kvSeparator, paramSeparator);
  return (operations) => {
    const normalisedOperations = normaliseOperations(options, operations);
    return formatter(normalisedOperations);
  };
}
function createOperationsParser({ kvSeparator = "=", paramSeparator = "&", defaults: _, ...options } = {}) {
  const parser = createParser(kvSeparator, paramSeparator);
  return (url) => {
    const operations = url ? parser(url) : {};
    return denormaliseOperations(options, operations);
  };
}
function createOperationsHandlers(config2) {
  const operationsGenerator2 = createOperationsGenerator(config2);
  const operationsParser2 = createOperationsParser(config2);
  return { operationsGenerator: operationsGenerator2, operationsParser: operationsParser2 };
}
function paramToBoolean(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  try {
    return Boolean(JSON.parse(value?.toString()));
  } catch {
    return Boolean(value);
  }
}
const removeUndefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== void 0));
function createExtractAndGenerate(extract2, generate2) {
  return ((src, operations, options) => {
    const base = extract2(src, options);
    if (!base) {
      return generate2(src, operations, options);
    }
    return generate2(base.src, {
      ...base.operations,
      ...removeUndefined(operations)
    }, {
      // deno-lint-ignore no-explicit-any
      ...base.options,
      ...options
    });
  });
}
const cdnDomains = new Map(Object.entries(domains));
const cdnSubdomains = Object.entries(subdomains);
const cdnPaths = Object.entries(paths);
function getProviderForUrl(url) {
  return getProviderForUrlByDomain(url) || getProviderForUrlByPath(url);
}
function getProviderForUrlByDomain(url) {
  if (typeof url === "string" && !url.startsWith("https://")) {
    return false;
  }
  const { hostname } = toUrl(url);
  const cdn = cdnDomains.get(hostname);
  if (cdn) {
    return cdn;
  }
  return cdnSubdomains.find(([subdomain]) => hostname.endsWith(subdomain))?.[1] || false;
}
function getProviderForUrlByPath(url) {
  const { pathname } = toUrl(url);
  return cdnPaths.find(([path]) => pathname.startsWith(path))?.[1] || false;
}
const VIEW_URL_SUFFIX = "/view?";
const PREVIEW_URL_SUFFIX = "/preview?";
const { operationsGenerator: operationsGenerator$o, operationsParser: operationsParser$j } = createOperationsHandlers({
  keyMap: {
    format: "output"
  },
  kvSeparator: "=",
  paramSeparator: "&"
});
const generate$q = (src, modifiers) => {
  const url = toUrl(src.toString().replace(VIEW_URL_SUFFIX, PREVIEW_URL_SUFFIX));
  const projectParam = url.searchParams.get("project") ?? "";
  const operations = operationsGenerator$o(modifiers);
  url.search = operations;
  url.searchParams.append("project", projectParam);
  return toCanonicalUrlString(url);
};
const extract$q = (url) => {
  if (getProviderForUrlByPath(url) !== "appwrite") {
    return null;
  }
  const parsedUrl = toUrl(url);
  const operations = operationsParser$j(parsedUrl);
  delete operations.project;
  const projectParam = parsedUrl.searchParams.get("project") ?? "";
  parsedUrl.search = "";
  parsedUrl.searchParams.append("project", projectParam);
  const sourceUrl = parsedUrl.href;
  return {
    src: sourceUrl,
    operations
  };
};
const transform$r = createExtractAndGenerate(extract$q, generate$q);
const DEFAULT_ENDPOINT = "/_image";
const { operationsParser: operationsParser$i, operationsGenerator: operationsGenerator$n } = createOperationsHandlers({
  keyMap: {
    format: "f",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    fit: "cover"
  }
});
const generate$p = (src, modifiers, options) => {
  const url = toUrl(`${stripTrailingSlash(options?.baseUrl ?? "")}${options?.endpoint ?? DEFAULT_ENDPOINT}`);
  const operations = operationsGenerator$n(modifiers);
  url.search = operations;
  url.searchParams.set("href", src.toString());
  return toCanonicalUrlString(url);
};
const extract$p = (url) => {
  const parsedUrl = toUrl(url);
  const src = parsedUrl.searchParams.get("href");
  if (!src) {
    return null;
  }
  parsedUrl.searchParams.delete("href");
  const operations = operationsParser$i(parsedUrl);
  return {
    src,
    operations,
    options: { baseUrl: parsedUrl.origin }
  };
};
const transform$q = (src, operations, options = {}) => {
  const url = toUrl(src);
  if (url.pathname !== (options?.endpoint ?? DEFAULT_ENDPOINT)) {
    return generate$p(src, operations, options);
  }
  const base = extract$p(src);
  if (!base) {
    return generate$p(src, operations, options);
  }
  options.baseUrl ??= base.options.baseUrl;
  return generate$p(base.src, {
    ...base.operations,
    ...operations
  }, options);
};
const operationsGenerator$m = createOperationsGenerator({
  defaults: {
    fit: "cover",
    format: "webp",
    sharp: true
  }
});
const extract$o = extractFromURL;
const generate$o = (src, modifiers) => {
  const operations = operationsGenerator$m(modifiers);
  const url = toUrl(src);
  url.search = operations;
  return toCanonicalUrlString(url);
};
const transform$p = createExtractAndGenerate(extract$o, generate$o);
const operationsGenerator$l = createOperationsGenerator({
  keyMap: {
    format: "output"
  }
});
const extract$n = extractFromURL;
const generate$n = (src, modifiers) => {
  const operations = operationsGenerator$l(modifiers);
  const url = toUrl(src);
  url.search = operations;
  return toCanonicalUrlString(url);
};
const extractAndGenerate$1 = createExtractAndGenerate(extract$n, generate$n);
const transform$o = (src, operations) => {
  const { width, height } = operations;
  if (width && height) {
    operations.aspect_ratio ??= `${Math.round(Number(width))}:${Math.round(Number(height))}`;
  }
  return extractAndGenerate$1(src, operations);
};
const { operationsGenerator: operationsGenerator$k, operationsParser: operationsParser$h } = createOperationsHandlers({
  keyMap: {
    "format": "f"
  },
  defaults: {
    format: "auto",
    fit: "cover"
  },
  formatMap: {
    jpg: "jpeg"
  },
  kvSeparator: "=",
  paramSeparator: ","
});
const generate$m = (src, operations, options) => {
  const modifiers = operationsGenerator$k(operations);
  const url = toUrl(options?.domain ? `https://${options.domain}` : "/");
  url.pathname = `/cdn-cgi/image/${modifiers}/${stripLeadingSlash(src.toString())}`;
  return toCanonicalUrlString(url);
};
const extract$m = (url, options) => {
  if (getProviderForUrlByPath(url) !== "cloudflare") {
    return null;
  }
  const parsedUrl = toUrl(url);
  const [, , , modifiers, ...src] = parsedUrl.pathname.split("/");
  const operations = operationsParser$h(modifiers);
  return {
    src: toCanonicalUrlString(toUrl(src.join("/"))),
    operations,
    options: {
      domain: options?.domain ?? (parsedUrl.hostname === "n" ? void 0 : parsedUrl.hostname)
    }
  };
};
const transform$n = createExtractAndGenerate(extract$m, generate$m);
const cloudflareImagesRegex = /https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/imagedelivery\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
const imagedeliveryRegex = /https?:\/\/(?<host>imagedelivery.net)\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
const { operationsGenerator: operationsGenerator$j, operationsParser: operationsParser$g } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f"
  },
  defaults: {
    fit: "cover"
  },
  kvSeparator: "=",
  paramSeparator: ","
});
function formatUrl(options, transformations) {
  const { host, accountHash, imageId } = options;
  if (!host || !accountHash || !imageId) {
    throw new Error("Missing required Cloudflare Images options");
  }
  const pathSegments = [
    "https:/",
    ...host === "imagedelivery.net" ? [host] : [host, "cdn-cgi", "imagedelivery"],
    accountHash,
    imageId,
    transformations
  ].filter(Boolean);
  return pathSegments.join("/");
}
const generate$l = (_src, operations, options = {}) => {
  const transformations = operationsGenerator$j(operations);
  const url = formatUrl(options, transformations);
  return toCanonicalUrlString(toUrl(url));
};
const extract$l = (url) => {
  const parsedUrl = toUrl(url);
  const matches = [
    ...parsedUrl.toString().matchAll(cloudflareImagesRegex),
    ...parsedUrl.toString().matchAll(imagedeliveryRegex)
  ];
  if (!matches[0]?.groups) {
    return null;
  }
  const { host, accountHash, imageId, transformations } = matches[0].groups;
  const operations = operationsParser$g(transformations || "");
  const options = { host, accountHash, imageId };
  return {
    src: formatUrl(options),
    operations,
    options
  };
};
const transform$m = (src, operations, options = {}) => {
  const extracted = extract$l(src);
  if (!extracted) {
    throw new Error("Invalid Cloudflare Images URL");
  }
  const newOperations = { ...extracted.operations, ...operations };
  return generate$l(extracted.src, newOperations, {
    ...extracted.options,
    ...options
  });
};
const { operationsGenerator: operationsGenerator$i, operationsParser: operationsParser$f } = createOperationsHandlers({
  keyMap: {
    format: "force_format",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    org_if_sml: 1
  }
});
const generate$k = (src, modifiers = {}, { token } = {}) => {
  if (!token) {
    throw new Error("Token is required for Cloudimage URLs" + src);
  }
  let srcString = src.toString();
  srcString = srcString.replace(/^https?:\/\//, "");
  if (srcString.includes("?")) {
    modifiers.ci_url_encoded = 1;
    srcString = encodeURIComponent(srcString);
  }
  const operations = operationsGenerator$i(modifiers);
  const url = new URL(`https://${token}.cloudimg.io/`);
  url.pathname = srcString;
  url.search = operations;
  return url.toString();
};
const extract$k = (src, options = {}) => {
  const url = toUrl(src);
  if (getProviderForUrl(url) !== "cloudimage") {
    return null;
  }
  const operations = operationsParser$f(url);
  let originalSrc = url.pathname;
  if (operations.ci_url_encoded) {
    originalSrc = decodeURIComponent(originalSrc);
    delete operations.ci_url_encoded;
  }
  options.token ??= url.hostname.replace(".cloudimg.io", "");
  return {
    src: `${url.protocol}/${originalSrc}`,
    operations,
    options
  };
};
const transform$l = createExtractAndGenerate(extract$k, generate$k);
const publicRegex = /https?:\/\/(?<host>res\.cloudinary\.com)\/(?<cloudName>[a-zA-Z0-9-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
const privateRegex = /https?:\/\/(?<host>(?<cloudName>[a-zA-Z0-9-]+)-res\.cloudinary\.com|[a-zA-Z0-9.-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
const { operationsGenerator: operationsGenerator$h, operationsParser: operationsParser$e } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f",
    quality: "q"
  },
  defaults: {
    format: "auto",
    c: "lfill"
  },
  kvSeparator: "_",
  paramSeparator: ","
});
function formatCloudinaryUrl({ host, cloudName, assetType, deliveryType, signature, transformations, version: version2, id }) {
  const isPublic = host === "res.cloudinary.com";
  return [
    "https:/",
    host,
    isPublic ? cloudName : void 0,
    assetType,
    deliveryType,
    signature,
    transformations,
    version2,
    id
  ].filter(Boolean).join("/");
}
function parseCloudinaryUrl(url) {
  let matches = url.toString().match(publicRegex);
  if (!matches?.length) {
    matches = url.toString().match(privateRegex);
  }
  if (!matches?.length) {
    return null;
  }
  return matches.groups || {};
}
const transform$k = (src, operations) => {
  const group = parseCloudinaryUrl(src.toString());
  if (!group) {
    return src.toString();
  }
  const existing = operationsParser$e(group.transformations || "");
  group.transformations = operationsGenerator$h({
    ...existing,
    ...operations
  });
  return formatCloudinaryUrl(group);
};
const operationsGenerator$g = createOperationsGenerator({
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    fit: "fill"
  }
});
const generate$j = (src, modifiers) => {
  const operations = operationsGenerator$g(modifiers);
  const url = new URL(src);
  url.search = operations;
  return toCanonicalUrlString(url);
};
const extract$j = extractFromURL;
const extractAndGenerate = createExtractAndGenerate(extract$j, generate$j);
const transform$j = (src, operations) => {
  const { width, height } = clampDimensions(operations, 4e3, 4e3);
  return extractAndGenerate(src, {
    ...operations,
    width,
    height
  });
};
const operationsGenerator$f = createOperationsGenerator({
  defaults: {
    auto: "webp",
    disable: "upscale"
  }
});
const generate$i = (src, operations, { baseURL = "https://images.contentstack.io/" } = {}) => {
  if (operations.width && operations.height) {
    operations.fit ??= "crop";
  }
  const modifiers = operationsGenerator$f(operations);
  const url = toUrl(src);
  if (url.hostname === "n") {
    url.protocol = "https:";
    url.hostname = new URL(baseURL).hostname;
  }
  url.search = modifiers;
  return toCanonicalUrlString(url);
};
const extract$i = (url) => {
  const { src, operations } = extractFromURL(url) ?? {};
  if (!operations || !src) {
    return null;
  }
  const { origin } = toUrl(url);
  return {
    src,
    operations,
    options: {
      baseURL: origin
    }
  };
};
const transform$i = createExtractAndGenerate(extract$i, generate$i);
const operationsGenerator$e = createOperationsGenerator({
  defaults: {
    withoutEnlargement: true,
    fit: "cover"
  }
});
const generate$h = (src, operations) => {
  if (Array.isArray(operations.transforms)) {
    operations.transforms = JSON.stringify(operations.transforms);
  }
  const modifiers = operationsGenerator$e(operations);
  const url = toUrl(src);
  url.search = modifiers;
  return toCanonicalUrlString(url);
};
const extract$h = (url) => {
  const base = extractFromURL(url);
  if (base?.operations?.transforms && typeof base.operations.transforms === "string") {
    try {
      base.operations.transforms = JSON.parse(base.operations.transforms);
    } catch {
      return null;
    }
  }
  return base;
};
const transform$h = createExtractAndGenerate(extract$h, generate$h);
const hygraphRegex = /https:\/\/(?<region>[a-z0-9-]+)\.graphassets\.com\/(?<envId>[a-zA-Z0-9]+)(?:\/(?<transformations>.*?))?\/(?<handle>[a-zA-Z0-9]+)$/;
createOperationsHandlers({
  keyMap: {
    width: "width",
    height: "height",
    format: "format"
  },
  defaults: {
    format: "auto",
    fit: "crop"
  }
});
const extract$g = (url) => {
  const parsedUrl = toUrl(url);
  const matches = parsedUrl.toString().match(hygraphRegex);
  if (!matches?.groups) {
    return null;
  }
  const { region, envId, handle, transformations } = matches.groups;
  const operations = {};
  if (transformations) {
    const parts = transformations.split("/");
    parts.forEach((part) => {
      const [operation, params] = part.split("=");
      if (operation === "resize" && params) {
        params.split(",").forEach((param) => {
          const [key, value] = param.split(":");
          if (key === "width" || key === "height") {
            operations[key] = Number(value);
          } else if (key === "fit") {
            operations.fit = value;
          }
        });
      } else if (operation === "output" && params) {
        params.split(",").forEach((param) => {
          const [key, value] = param.split(":");
          if (key === "format") {
            operations.format = value;
          }
        });
      } else if (operation === "auto_image") {
        operations.format = "auto";
      }
    });
  }
  return {
    src: `https://${region}.graphassets.com/${envId}/${handle}`,
    operations,
    options: {
      region,
      envId,
      handle
    }
  };
};
const generate$g = (src, operations, options = {}) => {
  const extracted = extract$g(src);
  if (!extracted) {
    throw new Error("Invalid Hygraph URL");
  }
  const { region, envId, handle } = {
    ...extracted.options,
    ...options
  };
  const transforms = [];
  if (operations.width || operations.height) {
    const resize = [];
    if (operations.width && operations.height) {
      resize.push("fit:crop");
    } else if (operations.fit) {
      resize.push(`fit:${operations.fit}`);
    }
    if (operations.width)
      resize.push(`width:${operations.width}`);
    if (operations.height)
      resize.push(`height:${operations.height}`);
    if (resize.length)
      transforms.push(`resize=${resize.join(",")}`);
  }
  if (operations.format === "auto" || !operations.format && !extracted.operations.format) {
    transforms.push("auto_image");
  } else if (operations.format) {
    transforms.push(`output=format:${operations.format}`);
  }
  const baseUrl = `https://${region}.graphassets.com/${envId}`;
  const transformPart = transforms.length > 0 ? "/" + transforms.join("/") : "";
  const finalUrl = toUrl(`${baseUrl}${transformPart}/${handle}`);
  return toCanonicalUrlString(finalUrl);
};
const transform$g = createExtractAndGenerate(extract$g, generate$g);
const { operationsGenerator: operationsGenerator$d, operationsParser: operationsParser$d } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f"
  },
  defaults: {
    m: "cropbox"
  },
  kvSeparator: "_",
  paramSeparator: "/"
});
const generate$f = (src, operations) => {
  const modifiers = operationsGenerator$d(operations);
  const url = toUrl(src);
  url.searchParams.set("imgeng", modifiers);
  return toCanonicalUrlString(url);
};
const extract$f = (url) => {
  const parsedUrl = toUrl(url);
  const imgeng = parsedUrl.searchParams.get("imgeng");
  if (!imgeng) {
    return null;
  }
  const operations = operationsParser$d(imgeng);
  parsedUrl.searchParams.delete("imgeng");
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$f = createExtractAndGenerate(extract$f, generate$f);
const { operationsGenerator: operationsGenerator$c, operationsParser: operationsParser$c } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f",
    quality: "q"
  },
  defaults: {
    c: "maintain_ratio",
    fo: "auto"
  },
  kvSeparator: "-",
  paramSeparator: ","
});
const generate$e = (src, operations) => {
  const modifiers = operationsGenerator$c(operations);
  const url = toUrl(src);
  url.searchParams.set("tr", modifiers);
  return toCanonicalUrlString(url);
};
const extract$e = (url) => {
  const parsedUrl = toUrl(url);
  let trPart = null;
  let path = parsedUrl.pathname;
  if (parsedUrl.searchParams.has("tr")) {
    trPart = parsedUrl.searchParams.get("tr");
    parsedUrl.searchParams.delete("tr");
  } else {
    const pathParts = parsedUrl.pathname.split("/");
    const trIndex = pathParts.findIndex((part) => part.startsWith("tr:"));
    if (trIndex !== -1) {
      trPart = pathParts[trIndex].slice(3);
      path = pathParts.slice(0, trIndex).concat(pathParts.slice(trIndex + 1)).join("/");
    }
  }
  if (!trPart) {
    return null;
  }
  parsedUrl.pathname = path;
  const operations = operationsParser$c(trPart);
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$e = createExtractAndGenerate(extract$e, generate$e);
const { operationsGenerator: operationsGenerator$b, operationsParser: operationsParser$b } = createOperationsHandlers({
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    fit: "min",
    auto: "format"
  }
});
const extract$d = (url) => {
  const src = toUrl(url);
  const operations = operationsParser$b(url);
  src.search = "";
  return { src: toCanonicalUrlString(src), operations };
};
const generate$d = (src, operations) => {
  const modifiers = operationsGenerator$b(operations);
  const url = toUrl(src);
  url.search = modifiers;
  if (url.searchParams.has("fm") && url.searchParams.get("auto") === "format") {
    url.searchParams.delete("auto");
  }
  return toCanonicalUrlString(url);
};
const transform$d = createExtractAndGenerate(extract$d, generate$d);
const { operationsGenerator: operationsGenerator$a, operationsParser: operationsParser$a } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    quality: "q",
    format: "f"
  },
  defaults: {
    f: "auto"
  },
  kvSeparator: "_",
  paramSeparator: ","
});
const generate$c = (src, operations, options) => {
  if (operations.width && operations.height) {
    operations.s = `${operations.width}x${operations.height}`;
    delete operations.width;
    delete operations.height;
  }
  const modifiers = operationsGenerator$a(operations);
  const baseURL = options?.baseURL ?? "/_ipx";
  const url = toUrl(baseURL);
  url.pathname = `${stripTrailingSlash(url.pathname)}/${modifiers}/${stripLeadingSlash(src.toString())}`;
  return toCanonicalUrlString(url);
};
const extract$c = (url) => {
  const parsedUrl = toUrl(url);
  const [, baseUrlPart, modifiers, ...srcParts] = parsedUrl.pathname.split("/");
  if (!modifiers || !srcParts.length) {
    return null;
  }
  const operations = operationsParser$a(modifiers);
  if (operations.s) {
    const [width, height] = operations.s.split("x").map(Number);
    operations.width = width;
    operations.height = height;
    delete operations.s;
  }
  return {
    src: "/" + srcParts.join("/"),
    operations,
    options: {
      baseURL: `${parsedUrl.origin}/${baseUrlPart}`
    }
  };
};
const transform$c = (src, operations, options) => {
  const url = toUrl(src);
  const baseURL = options?.baseURL;
  if (baseURL && url.toString().startsWith(baseURL) || url.pathname.startsWith("/_ipx")) {
    const extracted = extract$c(src);
    if (extracted) {
      return generate$c(extracted.src, { ...extracted.operations, ...operations }, { baseURL: extracted.options.baseURL });
    }
  }
  return generate$c(src, operations, { baseURL });
};
const BOOLEAN_PARAMS = [
  "enlarge",
  "flip",
  "flop",
  "negate",
  "normalize",
  "grayscale",
  "removealpha",
  "olrepeat",
  "progressive",
  "adaptive",
  "lossless",
  "nearlossless",
  "metadata"
];
const { operationsGenerator: operationsGenerator$9, operationsParser: operationsParser$9 } = createOperationsHandlers({
  defaults: {
    fit: "cover"
  },
  formatMap: {
    jpg: "jpeg"
  }
});
const generate$b = (src, operations) => {
  const url = toUrl(src);
  for (const key of BOOLEAN_PARAMS) {
    if (operations[key] !== void 0) {
      operations[key] = operations[key] ? 1 : 0;
    }
  }
  url.search = operationsGenerator$9(operations);
  return toCanonicalUrlString(url);
};
const extract$b = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$9(parsedUrl);
  for (const key of BOOLEAN_PARAMS) {
    if (operations[key] !== void 0) {
      operations[key] = paramToBoolean(operations[key]);
    }
  }
  parsedUrl.search = "";
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$b = createExtractAndGenerate(extract$b, generate$b);
const { operationsGenerator: operationsGenerator$8, operationsParser: operationsParser$8 } = createOperationsHandlers({
  formatMap: {
    jpg: "jpeg"
  },
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  }
});
const generate$a = (src, operations) => {
  const url = toUrl(src);
  if (operations.lossless !== void 0) {
    operations.lossless = operations.lossless ? 1 : 0;
  }
  if (operations.width && operations.height) {
    operations.fit = "crop";
  }
  url.search = operationsGenerator$8(operations);
  return toCanonicalUrlString(url);
};
const extract$a = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$8(parsedUrl);
  if (operations.lossless !== void 0) {
    operations.lossless = paramToBoolean(operations.lossless);
  }
  parsedUrl.search = "";
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$a = createExtractAndGenerate(extract$a, generate$a);
const { operationsGenerator: operationsGenerator$7, operationsParser: operationsParser$7 } = createOperationsHandlers({
  defaults: {
    fit: "cover"
  },
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  }
});
const generate$9 = (src, operations, options = {}) => {
  const url = toUrl(`${options.baseUrl || ""}/.netlify/images`);
  url.search = operationsGenerator$7(operations);
  url.searchParams.set("url", src.toString());
  return toCanonicalUrlString(url);
};
const extract$9 = (url) => {
  if (getProviderForUrlByPath(url) !== "netlify") {
    return null;
  }
  const parsedUrl = toUrl(url);
  const operations = operationsParser$7(parsedUrl);
  delete operations.url;
  const sourceUrl = parsedUrl.searchParams.get("url") || "";
  parsedUrl.search = "";
  return {
    src: sourceUrl,
    operations,
    options: {
      baseUrl: parsedUrl.hostname === "n" ? void 0 : parsedUrl.origin
    }
  };
};
const transform$9 = createExtractAndGenerate(extract$9, generate$9);
const { operationsGenerator: operationsGenerator$6, operationsParser: operationsParser$6 } = createOperationsHandlers({
  keyMap: {
    width: "w",
    quality: "q",
    height: false,
    format: false
  },
  defaults: {
    q: 75
  }
});
const generate$8 = (src, operations, options = {}) => {
  const url = toUrl(`${options.baseUrl || ""}/${options.prefix || "_vercel"}/image`);
  url.search = operationsGenerator$6(operations);
  url.searchParams.append("url", src.toString());
  return toCanonicalUrlString(url);
};
const extract$8 = (url, options = {}) => {
  if (!["vercel", "nextjs"].includes(getProviderForUrlByPath(url) || "")) {
    return null;
  }
  const parsedUrl = toUrl(url);
  const sourceUrl = parsedUrl.searchParams.get("url") || "";
  parsedUrl.searchParams.delete("url");
  const operations = operationsParser$6(parsedUrl);
  parsedUrl.search = "";
  return {
    src: sourceUrl,
    operations,
    options: {
      baseUrl: options.baseUrl ?? parsedUrl.origin
    }
  };
};
const transform$8 = createExtractAndGenerate(extract$8, generate$8);
const generate$7 = (src, operations, options = {}) => generate$8(src, operations, { ...options, prefix: "_next" });
const extract$7 = (url, options) => extract$8(url, options);
const transform$7 = createExtractAndGenerate(extract$7, generate$7);
const { operationsGenerator: operationsGenerator$5, operationsParser: operationsParser$5 } = createOperationsHandlers({
  keyMap: {
    width: "wid",
    height: "hei",
    quality: "qlt",
    format: "fmt"
  },
  defaults: {
    fit: "crop,0"
  }
});
const BASE = "https://s7d1.scene7.com/is/image/";
const generate$6 = (src, operations) => {
  const url = new URL(src, BASE);
  url.search = operationsGenerator$5(operations);
  return toCanonicalUrlString(url);
};
const extract$6 = (url) => {
  if (getProviderForUrl(url) !== "scene7") {
    return null;
  }
  const parsedUrl = new URL(url, BASE);
  const operations = operationsParser$5(parsedUrl);
  parsedUrl.search = "";
  return {
    src: parsedUrl.toString(),
    operations
  };
};
const transform$6 = createExtractAndGenerate(extract$6, generate$6);
const shopifyRegex = /(.+?)(?:_(?:(pico|icon|thumb|small|compact|medium|large|grande|original|master)|(\d*)x(\d*)))?(?:_crop_([a-z]+))?(\.[a-zA-Z]+)(\.png|\.jpg|\.webp|\.avif)?$/;
const { operationsGenerator: operationsGenerator$4, operationsParser: operationsParser$4 } = createOperationsHandlers({
  keyMap: {
    format: false
  }
});
const generate$5 = (src, operations) => {
  const url = toUrl(src);
  const basePath = url.pathname.replace(shopifyRegex, "$1$6");
  url.pathname = basePath;
  url.search = operationsGenerator$4(operations);
  return toCanonicalUrlString(url);
};
const extract$5 = (url) => {
  const parsedUrl = toUrl(url);
  const match = shopifyRegex.exec(parsedUrl.pathname);
  const operations = operationsParser$4(parsedUrl);
  if (match) {
    const [, , , width, height, crop] = match;
    if (width && height && !operations.width && !operations.height) {
      operations.width = parseInt(width, 10);
      operations.height = parseInt(height, 10);
    }
    if (crop) {
      operations.crop ??= crop;
    }
  }
  const basePath = parsedUrl.pathname.replace(shopifyRegex, "$1$6");
  parsedUrl.pathname = basePath;
  for (const key of ["width", "height", "crop", "pad_color", "format"]) {
    parsedUrl.searchParams.delete(key);
  }
  return {
    src: parsedUrl.toString(),
    operations
  };
};
const transform$5 = createExtractAndGenerate(extract$5, generate$5);
const storyBlokAssets = /(?<id>\/f\/\d+\/\d+x\d+\/\w+\/[^\/]+)\/?(?<modifiers>m\/?(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?)?$/;
const storyBlokImg2 = /^(?<modifiers>\/(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?\/?)?(?<id>\/f\/.+)$/;
const filterSplitterRegex = /:(?![^(]*\))/;
const splitFilters = (filters) => {
  if (!filters) {
    return {};
  }
  return Object.fromEntries(filters.split(filterSplitterRegex).map((filter) => {
    if (!filter)
      return [];
    const [key, value] = filter.split("(");
    return [key, value.replace(")", "")];
  }));
};
const generateFilters = (filters) => {
  if (!filters) {
    return void 0;
  }
  const filterItems = Object.entries(filters).map(([key, value]) => `${key}(${value ?? ""})`);
  if (filterItems.length === 0) {
    return void 0;
  }
  return `filters:${filterItems.join(":")}`;
};
const extract$4 = (url) => {
  const parsedUrl = toUrl(url);
  const regex = parsedUrl.hostname === "img2.storyblok.com" ? storyBlokImg2 : storyBlokAssets;
  const matches = regex.exec(parsedUrl.pathname);
  if (!matches || !matches.groups) {
    return null;
  }
  const { id, crop, width, height, filters, flipx, flipy } = matches.groups;
  const { format, ...filterMap } = splitFilters(filters ?? "");
  if (parsedUrl.hostname === "img2.storyblok.com") {
    parsedUrl.hostname = "a.storyblok.com";
  }
  const operations = Object.fromEntries([
    ["width", Number(width) || void 0],
    ["height", Number(height) || void 0],
    ["format", format],
    ["crop", crop],
    ["filters", filterMap],
    ["flipx", flipx],
    ["flipy", flipy]
  ].filter(([_, value]) => value !== void 0));
  return {
    src: `${parsedUrl.origin}${id}`,
    operations
  };
};
const generate$4 = (src, operations) => {
  const url = toUrl(src);
  const { width = 0, height = 0, format, crop, filters = {}, flipx = "", flipy = "" } = operations;
  const size = `${flipx}${width}x${flipy}${height}`;
  if (format) {
    filters.format = format;
  }
  const parts = [
    url.pathname,
    "m",
    crop,
    size,
    generateFilters(filters)
  ].filter(Boolean);
  url.pathname = parts.join("/");
  return toCanonicalUrlString(url);
};
const transform$4 = createExtractAndGenerate(extract$4, generate$4);
const STORAGE_URL_PREFIX = "/storage/v1/object/public/";
const RENDER_URL_PREFIX = "/storage/v1/render/image/public/";
const isRenderUrl = (url) => url.pathname.startsWith(RENDER_URL_PREFIX);
const { operationsGenerator: operationsGenerator$3, operationsParser: operationsParser$3 } = createOperationsHandlers({});
const generate$3 = (src, operations) => {
  const url = toUrl(src);
  const basePath = url.pathname.replace(RENDER_URL_PREFIX, STORAGE_URL_PREFIX);
  url.pathname = basePath;
  if (operations.format && operations.format !== "origin") {
    delete operations.format;
  }
  url.search = operationsGenerator$3(operations);
  return toCanonicalUrlString(url).replace(STORAGE_URL_PREFIX, RENDER_URL_PREFIX);
};
const extract$3 = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$3(parsedUrl);
  const isRender = isRenderUrl(parsedUrl);
  const imagePath = parsedUrl.pathname.replace(RENDER_URL_PREFIX, "").replace(STORAGE_URL_PREFIX, "");
  if (!isRender) {
    return {
      src: toCanonicalUrlString(parsedUrl),
      operations
    };
  }
  return {
    src: `${parsedUrl.origin}${STORAGE_URL_PREFIX}${imagePath}`,
    operations
  };
};
const transform$3 = createExtractAndGenerate(extract$3, generate$3);
const uploadcareRegex = /^https?:\/\/(?<host>[^\/]+)\/(?<uuid>[^\/]+)(?:\/(?<filename>[^\/]+)?)?/;
const { operationsGenerator: operationsGenerator$2, operationsParser: operationsParser$2 } = createOperationsHandlers({
  keyMap: {
    width: false,
    height: false
  },
  defaults: {
    format: "auto"
  },
  kvSeparator: "/",
  paramSeparator: "/-/"
});
const extract$2 = (url) => {
  const parsedUrl = toUrl(url);
  const match = uploadcareRegex.exec(parsedUrl.toString());
  if (!match || !match.groups) {
    return null;
  }
  const { host, uuid: uuid2 } = match.groups;
  const [, ...operationsString] = parsedUrl.pathname.split("/-/");
  const operations = operationsParser$2(operationsString.join("/-/") || "");
  if (operations.resize) {
    const [width, height] = operations.resize.split("x");
    if (width)
      operations.width = parseInt(width);
    if (height)
      operations.height = parseInt(height);
    delete operations.resize;
  }
  return {
    src: `https://${host}/${uuid2}/`,
    operations,
    options: { host }
  };
};
const generate$2 = (src, operations, options = {}) => {
  const url = toUrl(src);
  const host = options.host || url.hostname;
  const match = uploadcareRegex.exec(url.toString());
  if (match?.groups) {
    url.pathname = `/${match.groups.uuid}/`;
  }
  operations.resize = operations.resize || `${operations.width ?? ""}x${operations.height ?? ""}`;
  delete operations.width;
  delete operations.height;
  const modifiers = addTrailingSlash(operationsGenerator$2(operations));
  url.hostname = host;
  url.pathname = stripTrailingSlash(url.pathname) + (modifiers ? `/-/${modifiers}` : "") + (match?.groups?.filename ?? "");
  return toCanonicalUrlString(url);
};
const transform$2 = createExtractAndGenerate(extract$2, generate$2);
const { operationsGenerator: operationsGenerator$1, operationsParser: operationsParser$1 } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h"
  },
  defaults: {
    crop: "1"
  }
});
const generate$1 = (src, operations) => {
  const url = toUrl(src);
  const { crop } = operations;
  if (typeof crop !== "undefined" && crop !== "0") {
    operations.crop = crop ? "1" : "0";
  }
  url.search = operationsGenerator$1(operations);
  return toCanonicalUrlString(url);
};
const extract$1 = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$1(parsedUrl);
  if (operations.crop !== void 0) {
    operations.crop = operations.crop === "1";
  }
  parsedUrl.search = "";
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$1 = createExtractAndGenerate(extract$1, generate$1);
const { operationsGenerator, operationsParser } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "output",
    quality: "q"
  },
  defaults: {
    fit: "cover"
  }
});
const extract = (url) => {
  const urlObj = toUrl(url);
  const srcParam = urlObj.searchParams.get("url");
  if (!srcParam) {
    return null;
  }
  let src = srcParam;
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    src = "https://" + src;
  }
  urlObj.searchParams.delete("url");
  const operations = operationsParser(urlObj);
  return {
    src,
    operations
  };
};
const generate = (src, operations) => {
  const url = new URL("https://wsrv.nl/");
  const srcUrl = typeof src === "string" ? src : src.toString();
  const cleanSrc = srcUrl.replace(/^https?:\/\//, "");
  url.searchParams.set("url", cleanSrc);
  const params = operationsGenerator(operations);
  const searchParams = new URLSearchParams(params);
  for (const [key, value] of searchParams) {
    if (key !== "url") {
      url.searchParams.set(key, value);
    }
  }
  return toCanonicalUrlString(url);
};
const transform = createExtractAndGenerate(extract, generate);
const transformerMap = {
  appwrite: transform$r,
  astro: transform$q,
  "builder.io": transform$p,
  bunny: transform$o,
  cloudflare: transform$n,
  cloudflare_images: transform$m,
  cloudimage: transform$l,
  cloudinary: transform$k,
  contentful: transform$j,
  contentstack: transform$i,
  directus: transform$h,
  hygraph: transform$g,
  imageengine: transform$f,
  imagekit: transform$e,
  imgix: transform$d,
  ipx: transform$c,
  keycdn: transform$b,
  "kontent.ai": transform$a,
  netlify: transform$9,
  nextjs: transform$7,
  scene7: transform$6,
  shopify: transform$5,
  storyblok: transform$4,
  supabase: transform$3,
  uploadcare: transform$2,
  vercel: transform$8,
  wordpress: transform$1,
  wsrv: transform
};
function getTransformerForCdn(cdn) {
  if (!cdn) {
    return void 0;
  }
  return transformerMap[cdn];
}
function transformProps({
  cdn,
  fallback,
  operations = {},
  options,
  ...props
}) {
  cdn ??= getProviderForUrl(props.src) || fallback;
  if (!cdn) {
    return props;
  }
  const transformer = getTransformerForCdn(cdn);
  if (!transformer) {
    return props;
  }
  return transformBaseImageProps({
    ...props,
    operations: operations?.[cdn],
    options: options?.[cdn],
    transformer
  });
}
function transformSourceProps({
  cdn,
  fallback,
  operations,
  options,
  ...props
}) {
  cdn ??= getProviderForUrl(props.src) || fallback;
  if (!cdn) {
    return props;
  }
  const transformer = getTransformerForCdn(cdn);
  if (!transformer) {
    return props;
  }
  return transformBaseSourceProps({
    ...props,
    operations: operations?.[cdn],
    options: options?.[cdn],
    transformer
  });
}
var Image$1 = react_reactServerExports.forwardRef(
  function Image2(props, ref) {
    const camelizedProps = camelizeProps(
      transformProps(props)
    );
    return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("img", { ...camelizedProps, ref });
  }
);
react_reactServerExports.forwardRef(
  function Source2(props, ref) {
    const camelizedProps = camelizeProps(
      transformSourceProps(
        props
      )
    );
    return /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("source", { ...camelizedProps, ref });
  }
);
function globToRegex(pattern, separator) {
  let regexStr = "^";
  const doubleStar = separator === "." ? ".+" : ".*";
  const singleStar = separator === "." ? "[^.]+" : "[^/]+";
  const parts = pattern.split("**");
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      regexStr += doubleStar;
    }
    const subParts = parts[i].split("*");
    for (let j = 0; j < subParts.length; j++) {
      if (j > 0) {
        regexStr += singleStar;
      }
      regexStr += subParts[j].replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  regexStr += "$";
  return new RegExp(regexStr);
}
function matchRemotePattern(pattern, url) {
  if (pattern.protocol !== void 0) {
    if (pattern.protocol.replace(/:$/, "") !== url.protocol.replace(/:$/, "")) {
      return false;
    }
  }
  if (pattern.port !== void 0) {
    if (pattern.port !== url.port) {
      return false;
    }
  }
  if (!globToRegex(pattern.hostname, ".").test(url.hostname)) {
    return false;
  }
  if (pattern.search !== void 0) {
    if (pattern.search !== url.search) {
      return false;
    }
  }
  const pathnamePattern = pattern.pathname ?? "**";
  if (!globToRegex(pathnamePattern, "/").test(url.pathname)) {
    return false;
  }
  return true;
}
function hasRemoteMatch(domains2, remotePatterns, url) {
  return domains2.some((domain) => url.hostname === domain) || remotePatterns.some((p) => matchRemotePattern(p, url));
}
const __imageRemotePatterns = (() => {
  try {
    return JSON.parse("[]");
  } catch {
    return [];
  }
})();
const __imageDomains = (() => {
  try {
    return JSON.parse("[]");
  } catch {
    return [];
  }
})();
const __hasImageConfig = __imageRemotePatterns.length > 0 || __imageDomains.length > 0;
function validateRemoteUrl(src) {
  if (!__hasImageConfig) {
    return { allowed: true };
  }
  let url;
  try {
    url = new URL(src, "http://n");
  } catch {
    return { allowed: false, reason: `Invalid URL: ${src}` };
  }
  if (hasRemoteMatch(__imageDomains, __imageRemotePatterns, url)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Image URL "${src}" is not configured in images.remotePatterns or images.domains in next.config.js. See: https://nextjs.org/docs/messages/next-image-unconfigured-host`
  };
}
function sanitizeBlurDataURL(url) {
  if (!url.startsWith("data:image/"))
    return void 0;
  if (/[)(}{\\'"\n\r]/.test(url))
    return void 0;
  return url;
}
function isRemoteUrl(src) {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//");
}
const RESPONSIVE_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
function imageOptimizationUrl(src, width, quality = 75) {
  return `/_vinext/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
function generateSrcSet(src, originalWidth, quality = 75) {
  const widths = RESPONSIVE_WIDTHS.filter((w) => w <= originalWidth * 2);
  if (widths.length === 0)
    return `${imageOptimizationUrl(src, originalWidth, quality)} ${originalWidth}w`;
  return widths.map((w) => `${imageOptimizationUrl(src, w, quality)} ${w}w`).join(", ");
}
const Image = react_reactServerExports.forwardRef(function Image22({ src: srcProp, alt, width, height, fill, priority, quality, placeholder, blurDataURL, loader, sizes, className, style, unoptimized: _unoptimized, overrideSrc: _overrideSrc, loading, ...rest }, ref) {
  const src = typeof srcProp === "string" ? srcProp : srcProp.src;
  const imgWidth = width ?? (typeof srcProp === "object" ? srcProp.width : void 0);
  const imgHeight = height ?? (typeof srcProp === "object" ? srcProp.height : void 0);
  const imgBlurDataURL = blurDataURL ?? (typeof srcProp === "object" ? srcProp.blurDataURL : void 0);
  if (loader) {
    const resolvedSrc = loader({ src, width: imgWidth ?? 0, quality: quality ?? 75 });
    return jsxRuntime_reactServerExports.jsx("img", { ref, src: resolvedSrc, alt, width: fill ? void 0 : imgWidth, height: fill ? void 0 : imgHeight, loading: priority ? "eager" : loading ?? "lazy", decoding: "async", sizes, className, style: fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style } : style, ...rest });
  }
  if (isRemoteUrl(src)) {
    const validation = validateRemoteUrl(src);
    if (!validation.allowed) {
      {
        console.error(`[next/image] ${validation.reason}`);
        return null;
      }
    }
    const sanitizedBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
    const bg = placeholder === "blur" && sanitizedBlur ? `url(${sanitizedBlur})` : void 0;
    if (fill) {
      return jsxRuntime_reactServerExports.jsx(Image$1, { src, alt, layout: "fullWidth", priority, sizes, className, background: bg });
    }
    if (imgWidth && imgHeight) {
      return jsxRuntime_reactServerExports.jsx(Image$1, { src, alt, width: imgWidth, height: imgHeight, layout: "constrained", priority, sizes, className, background: bg });
    }
  }
  const imgQuality = quality ?? 75;
  const skipOptimization = _unoptimized === true;
  const srcSet = imgWidth && !fill && !skipOptimization ? generateSrcSet(src, imgWidth, imgQuality) : imgWidth && !fill ? RESPONSIVE_WIDTHS.filter((w) => w <= imgWidth * 2).map((w) => `${src} ${w}w`).join(", ") || `${src} ${imgWidth}w` : void 0;
  const optimizedSrc = skipOptimization ? src : imgWidth ? imageOptimizationUrl(src, imgWidth, imgQuality) : imageOptimizationUrl(src, RESPONSIVE_WIDTHS[0], imgQuality);
  const sanitizedLocalBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
  const blurStyle = placeholder === "blur" && sanitizedLocalBlur ? {
    backgroundImage: `url(${sanitizedLocalBlur})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center"
  } : void 0;
  return jsxRuntime_reactServerExports.jsx("img", { ref, src: optimizedSrc, alt, width: fill ? void 0 : imgWidth, height: fill ? void 0 : imgHeight, loading: priority ? "eager" : loading ?? "lazy", fetchPriority: priority ? "high" : void 0, decoding: "async", srcSet, sizes: sizes ?? (fill ? "100vw" : void 0), className, "data-nimg": fill ? "fill" : "1", style: fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...blurStyle, ...style } : { ...blurStyle, ...style }, ...rest });
});
function LandingPage() {
  return /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "hero-gradient relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "relative max-w-7xl mx-auto px-6 py-20 lg:py-32", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-12 lg:gap-20 items-center", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-4 animate-fade-up", children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("span", { className: "inline-flex items-center gap-2 font-mono-num text-xs font-medium tracking-widest text-white/70 uppercase", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-8 h-[1px] bg-white/40" }),
              "Integrated Math 3 Honors"
            ] }),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h1", { className: "text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.95] text-white", children: "IM3" }),
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-2xl md:text-3xl font-display font-semibold text-white/90", children: "Integrated Mathematics 3" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-lg md:text-xl text-white/70 leading-relaxed max-w-lg animate-fade-up-1", children: "Master algebra, functions, modeling, and statistical reasoning through interactive lessons and real-world activities." }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex flex-wrap gap-4 animate-fade-up-2", children: [
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
              Link,
              {
                href: "/auth/login",
                className: "group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-sm transition-all hover:bg-primary/90 hover:translate-x-1",
                children: [
                  "Sign In",
                  /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("svg", { className: "w-4 h-4 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8l4 4m0 0l-4 4m4-4H3" }) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
              Link,
              {
                href: "/curriculum",
                className: "group inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-medium rounded-sm transition-all hover:bg-white/10",
                children: "View Curriculum"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "relative animate-fade-up-1", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl blur-3xl" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "relative bg-white rounded-2xl shadow-2xl overflow-hidden", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx(
            Image,
            {
              src: "/im3-hero.png",
              alt: "Integrated Math 3",
              width: 600,
              height: 600,
              className: "w-full h-auto"
            }
          ) }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "max-w-7xl mx-auto px-6 py-20", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "group p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-up-3", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "font-mono-num text-7xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors", children: "9" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-2 h-2 bg-primary rounded-full mt-2" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-display text-2xl font-semibold text-foreground mb-2", children: "Modules" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "From quadratic functions to trigonometry" })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "group p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-up-4", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "font-mono-num text-7xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors", children: "52" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-2 h-2 bg-primary rounded-full mt-2" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-display text-2xl font-semibold text-foreground mb-2", children: "Lessons" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "Interactive lessons with practice activities" })
      ] }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "group p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-up-5", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "font-mono-num text-7xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors", children: "100+" }),
          /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "w-2 h-2 bg-primary rounded-full mt-2" })
        ] }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h3", { className: "font-display text-2xl font-semibold text-foreground mb-2", children: "Worked Examples" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-muted-foreground", children: "Step-by-step examples to build understanding" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "max-w-4xl mx-auto px-6 pb-20", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "relative p-10 md:p-14 bg-gradient-to-br from-secondary/60 to-secondary/40 rounded-lg border border-border animate-fade-up-6", children: [
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("div", { className: "absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" }),
      /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("span", { className: "inline-block font-mono-num text-xs font-medium tracking-widest text-secondary-foreground uppercase mb-4", children: "Course Scope" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("h2", { className: "font-display text-3xl md:text-4xl font-semibold text-foreground mb-4", children: "Standards-Aligned" }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("p", { className: "text-lg text-muted-foreground leading-relaxed mb-6", children: "Covers quadratic functions, polynomials, inverses and radicals, exponentials, logarithms, rational functions, inferential statistics, and trigonometry." }),
        /* @__PURE__ */ jsxRuntime_reactServerExports.jsxs(
          Link,
          {
            href: "/preface",
            className: "inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all",
            children: [
              "Read the course preface",
              /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntime_reactServerExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8l4 4m0 0l-4 4m4-4H3" }) })
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
const mod_41 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LandingPage
}, Symbol.toStringTag, { value: "Module" }));
function _getSSRFontStyles() {
  return [...getSSRFontStyles$1(), ...getSSRFontStyles()];
}
function _getSSRFontPreloads() {
  return [...getSSRFontPreloads$1(), ...getSSRFontPreloads()];
}
function setNavigationContext(ctx) {
  setNavigationContext$1(ctx);
}
function rscOnError(error) {
  if (error && typeof error === "object" && "digest" in error) {
    return String(error.digest);
  }
  return void 0;
}
const routes = [
  {
    pattern: "/api/activities/submit",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_0,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/auth/change-password",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_2,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/auth/login",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_3,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/auth/logout",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_4,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/auth/session",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_5,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/dev/review-queue",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_6,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/phases/complete",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_7,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/phases/skip",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_8,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/practice-tests/complete",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_9,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/api/practice/complete",
    isDynamic: false,
    params: [],
    page: null,
    routeHandler: mod_10,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/study/flashcards",
    isDynamic: false,
    params: [],
    page: mod_11,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/study/matching",
    isDynamic: false,
    params: [],
    page: mod_12,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/study/practice-tests",
    isDynamic: false,
    params: [],
    page: mod_13,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/study/review",
    isDynamic: false,
    params: [],
    page: mod_14,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/study/speed-round",
    isDynamic: false,
    params: [],
    page: mod_15,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/dashboard/srs",
    isDynamic: false,
    params: [],
    page: mod_16,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/study/practice-tests/:moduleNumber",
    isDynamic: true,
    params: ["moduleNumber"],
    page: mod_17,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/admin/dashboard",
    isDynamic: false,
    params: [],
    page: mod_18,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/auth/confirm",
    isDynamic: false,
    params: [],
    page: mod_19,
    routeHandler: null,
    layouts: [mod_1, mod_20],
    layoutSegmentDepths: [0, 1],
    templates: [],
    errors: [null, null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null, null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/auth/error",
    isDynamic: false,
    params: [],
    page: mod_21,
    routeHandler: null,
    layouts: [mod_1, mod_20],
    layoutSegmentDepths: [0, 1],
    templates: [],
    errors: [null, null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null, null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/auth/forgot-password",
    isDynamic: false,
    params: [],
    page: mod_22,
    routeHandler: null,
    layouts: [mod_1, mod_20],
    layoutSegmentDepths: [0, 1],
    templates: [],
    errors: [null, null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null, null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/auth/login",
    isDynamic: false,
    params: [],
    page: mod_23,
    routeHandler: null,
    layouts: [mod_1, mod_20],
    layoutSegmentDepths: [0, 1],
    templates: [],
    errors: [null, null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null, null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/auth/update-password",
    isDynamic: false,
    params: [],
    page: mod_24,
    routeHandler: null,
    layouts: [mod_1, mod_20],
    layoutSegmentDepths: [0, 1],
    templates: [],
    errors: [null, null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null, null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/dev/component-approval",
    isDynamic: false,
    params: [],
    page: mod_25,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/dashboard",
    isDynamic: false,
    params: [],
    page: mod_26,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/practice",
    isDynamic: false,
    params: [],
    page: mod_27,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/study",
    isDynamic: false,
    params: [],
    page: mod_28,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/competency",
    isDynamic: false,
    params: [],
    page: mod_29,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/dashboard",
    isDynamic: false,
    params: [],
    page: mod_30,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/gradebook",
    isDynamic: false,
    params: [],
    page: mod_31,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/students",
    isDynamic: false,
    params: [],
    page: mod_32,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/units",
    isDynamic: false,
    params: [],
    page: mod_33,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student/lesson/:lessonSlug",
    isDynamic: true,
    params: ["lessonSlug"],
    page: mod_34,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/lesson/:lessonSlug",
    isDynamic: true,
    params: ["lessonSlug"],
    page: mod_35,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/teacher/students/:studentId/competency",
    isDynamic: true,
    params: ["studentId"],
    page: mod_36,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/curriculum",
    isDynamic: false,
    params: [],
    page: mod_37,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/preface",
    isDynamic: false,
    params: [],
    page: mod_38,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/settings",
    isDynamic: false,
    params: [],
    page: mod_39,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/student",
    isDynamic: false,
    params: [],
    page: mod_40,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  },
  {
    pattern: "/",
    isDynamic: false,
    params: [],
    page: mod_41,
    routeHandler: null,
    layouts: [mod_1],
    layoutSegmentDepths: [0],
    templates: [],
    errors: [null],
    slots: {},
    loading: null,
    error: null,
    notFound: null,
    notFounds: [null],
    forbidden: null,
    unauthorized: null
  }
];
const metadataRoutes = [];
const rootNotFoundModule = null;
const rootForbiddenModule = null;
const rootUnauthorizedModule = null;
const rootLayouts = [mod_1];
async function renderHTTPAccessFallbackPage(route, statusCode, isRscRequest, request, opts) {
  let BoundaryComponent = opts?.boundaryComponent ?? null;
  if (!BoundaryComponent) {
    let boundaryModule;
    if (statusCode === 403) {
      boundaryModule = route?.forbidden ?? rootForbiddenModule;
    } else if (statusCode === 401) {
      boundaryModule = route?.unauthorized ?? rootUnauthorizedModule;
    } else {
      boundaryModule = route?.notFound ?? rootNotFoundModule;
    }
    BoundaryComponent = boundaryModule?.default ?? null;
  }
  const layouts = opts?.layouts ?? route?.layouts ?? rootLayouts;
  if (!BoundaryComponent) return null;
  const metadataList = [];
  const viewportList = [];
  for (const layoutMod of layouts) {
    if (layoutMod) {
      const meta = await resolveModuleMetadata(layoutMod);
      if (meta) metadataList.push(meta);
      const vp = await resolveModuleViewport(layoutMod);
      if (vp) viewportList.push(vp);
    }
  }
  const resolvedMetadata = metadataList.length > 0 ? mergeMetadata(metadataList) : null;
  const resolvedViewport = viewportList.length > 0 ? mergeViewport(viewportList) : null;
  const charsetMeta = react_reactServerExports.createElement("meta", { charSet: "utf-8" });
  const noindexMeta = react_reactServerExports.createElement("meta", { name: "robots", content: "noindex" });
  const headElements = [charsetMeta, noindexMeta];
  if (resolvedMetadata) headElements.push(react_reactServerExports.createElement(MetadataHead, { metadata: resolvedMetadata }));
  const effectiveViewport = resolvedViewport ?? { width: "device-width", initialScale: 1 };
  headElements.push(react_reactServerExports.createElement(ViewportHead, { viewport: effectiveViewport }));
  let element = react_reactServerExports.createElement(react_reactServerExports.Fragment, null, ...headElements, react_reactServerExports.createElement(BoundaryComponent));
  if (isRscRequest) {
    const layoutDepths = route?.layoutSegmentDepths;
    for (let i = layouts.length - 1; i >= 0; i--) {
      const LayoutComponent = layouts[i]?.default;
      if (LayoutComponent) {
        element = react_reactServerExports.createElement(LayoutComponent, { children: element });
        const layoutDepth = layoutDepths ? layoutDepths[i] : 0;
        element = react_reactServerExports.createElement(LayoutSegmentProvider, { depth: layoutDepth }, element);
      }
    }
    const rscStream2 = renderToReadableStream(element, { onError: rscOnError });
    setHeadersContext(null);
    setNavigationContext(null);
    return new Response(rscStream2, {
      status: statusCode,
      headers: { "Content-Type": "text/x-component; charset=utf-8" }
    });
  }
  for (let i = layouts.length - 1; i >= 0; i--) {
    const LayoutComponent = layouts[i]?.default;
    if (LayoutComponent) {
      element = react_reactServerExports.createElement(LayoutComponent, { children: element });
    }
  }
  const rscStream = renderToReadableStream(element, { onError: rscOnError });
  const fontData = {
    links: getSSRFontLinks(),
    styles: _getSSRFontStyles(),
    preloads: _getSSRFontPreloads()
  };
  const ssrEntry = await import("../ssr/index.js");
  const htmlStream = await ssrEntry.handleSsr(rscStream, getNavigationContext(), fontData);
  setHeadersContext(null);
  setNavigationContext(null);
  const _respHeaders = { "Content-Type": "text/html; charset=utf-8" };
  const _linkParts = (fontData.preloads || []).map(function(p) {
    return "<" + p.href + ">; rel=preload; as=font; type=" + p.type + "; crossorigin";
  });
  if (_linkParts.length > 0) _respHeaders["Link"] = _linkParts.join(", ");
  return new Response(htmlStream, {
    status: statusCode,
    headers: _respHeaders
  });
}
async function renderNotFoundPage(route, isRscRequest, request) {
  return renderHTTPAccessFallbackPage(route, 404, isRscRequest);
}
async function renderErrorBoundaryPage(route, error, isRscRequest, request) {
  let ErrorComponent = route?.error?.default ?? null;
  if (!ErrorComponent && route?.errors) {
    for (let i = route.errors.length - 1; i >= 0; i--) {
      if (route.errors[i]?.default) {
        ErrorComponent = route.errors[i].default;
        break;
      }
    }
  }
  ErrorComponent = ErrorComponent;
  if (!ErrorComponent) return null;
  const errorObj = error instanceof Error ? error : new Error(String(error));
  let element = react_reactServerExports.createElement(ErrorComponent, {
    error: errorObj
  });
  const layouts = route?.layouts ?? rootLayouts;
  if (isRscRequest) {
    const layoutDepths = route?.layoutSegmentDepths;
    for (let i = layouts.length - 1; i >= 0; i--) {
      const LayoutComponent = layouts[i]?.default;
      if (LayoutComponent) {
        element = react_reactServerExports.createElement(LayoutComponent, { children: element });
        const layoutDepth = layoutDepths ? layoutDepths[i] : 0;
        element = react_reactServerExports.createElement(LayoutSegmentProvider, { depth: layoutDepth }, element);
      }
    }
    const rscStream2 = renderToReadableStream(element, { onError: rscOnError });
    setHeadersContext(null);
    setNavigationContext(null);
    return new Response(rscStream2, {
      status: 200,
      headers: { "Content-Type": "text/x-component; charset=utf-8" }
    });
  }
  for (let i = layouts.length - 1; i >= 0; i--) {
    const LayoutComponent = layouts[i]?.default;
    if (LayoutComponent) {
      element = react_reactServerExports.createElement(LayoutComponent, { children: element });
    }
  }
  const rscStream = renderToReadableStream(element, { onError: rscOnError });
  const fontData = {
    links: getSSRFontLinks(),
    styles: _getSSRFontStyles(),
    preloads: _getSSRFontPreloads()
  };
  const ssrEntry = await import("../ssr/index.js");
  const htmlStream = await ssrEntry.handleSsr(rscStream, getNavigationContext(), fontData);
  setHeadersContext(null);
  setNavigationContext(null);
  const _errHeaders = { "Content-Type": "text/html; charset=utf-8" };
  const _errLinkParts = (fontData.preloads || []).map(function(p) {
    return "<" + p.href + ">; rel=preload; as=font; type=" + p.type + "; crossorigin";
  });
  if (_errLinkParts.length > 0) _errHeaders["Link"] = _errLinkParts.join(", ");
  return new Response(htmlStream, {
    status: 200,
    headers: _errHeaders
  });
}
function matchRoute(url, routes2) {
  const pathname = url.split("?")[0];
  let normalizedUrl = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  try {
    normalizedUrl = decodeURIComponent(normalizedUrl);
  } catch {
  }
  for (const route of routes2) {
    const params = matchPattern(normalizedUrl, route.pattern);
    if (params !== null) return { route, params };
  }
  return null;
}
function matchPattern(url, pattern) {
  const urlParts = url.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  const params = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    if (pp.endsWith("+")) {
      const paramName = pp.slice(1, -1);
      const remaining = urlParts.slice(i);
      if (remaining.length === 0) return null;
      params[paramName] = remaining;
      return params;
    }
    if (pp.endsWith("*")) {
      const paramName = pp.slice(1, -1);
      params[paramName] = urlParts.slice(i);
      return params;
    }
    if (pp.startsWith(":")) {
      if (i >= urlParts.length) return null;
      params[pp.slice(1)] = urlParts[i];
      continue;
    }
    if (i >= urlParts.length || urlParts[i] !== pp) return null;
  }
  if (urlParts.length !== patternParts.length) return null;
  return params;
}
const interceptLookup = [];
for (let ri = 0; ri < routes.length; ri++) {
  const r = routes[ri];
  if (!r.slots) continue;
  for (const [slotName, slotMod] of Object.entries(r.slots)) {
    if (!slotMod.intercepts) continue;
    for (const intercept of slotMod.intercepts) {
      interceptLookup.push({
        sourceRouteIndex: ri,
        slotName,
        targetPattern: intercept.targetPattern,
        page: intercept.page,
        params: intercept.params
      });
    }
  }
}
function findIntercept(pathname) {
  for (const entry of interceptLookup) {
    const params = matchPattern(pathname, entry.targetPattern);
    if (params !== null) {
      return { ...entry, matchedParams: params };
    }
  }
  return null;
}
async function buildPageElement(route, params, opts, searchParams) {
  const PageComponent = route.page?.default;
  if (!PageComponent) {
    return react_reactServerExports.createElement("div", null, "Page has no default export");
  }
  const metadataList = [];
  const viewportList = [];
  for (const layoutMod of route.layouts) {
    if (layoutMod) {
      const meta = await resolveModuleMetadata(layoutMod, params);
      if (meta) metadataList.push(meta);
      const vp = await resolveModuleViewport(layoutMod, params);
      if (vp) viewportList.push(vp);
    }
  }
  if (route.page) {
    const pageMeta = await resolveModuleMetadata(route.page, params);
    if (pageMeta) metadataList.push(pageMeta);
    const pageVp = await resolveModuleViewport(route.page, params);
    if (pageVp) viewportList.push(pageVp);
  }
  const resolvedMetadata = metadataList.length > 0 ? mergeMetadata(metadataList) : null;
  const resolvedViewport = viewportList.length > 0 ? mergeViewport(viewportList) : null;
  const asyncParams = Object.assign(Promise.resolve(params), params);
  const pageProps = { params: asyncParams };
  if (searchParams) {
    const spObj = {};
    let hasSearchParams = false;
    if (searchParams.forEach) searchParams.forEach(function(v, k) {
      hasSearchParams = true;
      if (k in spObj) {
        spObj[k] = Array.isArray(spObj[k]) ? spObj[k].concat(v) : [spObj[k], v];
      } else {
        spObj[k] = v;
      }
    });
    if (hasSearchParams) markDynamicUsage();
    pageProps.searchParams = Object.assign(Promise.resolve(spObj), spObj);
  }
  let element = react_reactServerExports.createElement(PageComponent, pageProps);
  {
    const headElements = [];
    headElements.push(react_reactServerExports.createElement("meta", { charSet: "utf-8" }));
    if (resolvedMetadata) headElements.push(react_reactServerExports.createElement(MetadataHead, { metadata: resolvedMetadata }));
    const effectiveViewport = resolvedViewport ?? { width: "device-width", initialScale: 1 };
    headElements.push(react_reactServerExports.createElement(ViewportHead, { viewport: effectiveViewport }));
    element = react_reactServerExports.createElement(react_reactServerExports.Fragment, null, ...headElements, element);
  }
  if (route.loading?.default) {
    element = react_reactServerExports.createElement(
      react_reactServerExports.Suspense,
      { fallback: react_reactServerExports.createElement(route.loading.default) },
      element
    );
  }
  {
    const lastLayoutError = route.errors ? route.errors[route.errors.length - 1] : null;
    if (route.error?.default && route.error !== lastLayoutError) {
      element = react_reactServerExports.createElement(ErrorBoundary, {
        fallback: route.error.default,
        children: element
      });
    }
  }
  {
    const NotFoundComponent = route.notFound?.default ?? null;
    if (NotFoundComponent) {
      element = react_reactServerExports.createElement(NotFoundBoundary, {
        fallback: react_reactServerExports.createElement(NotFoundComponent),
        children: element
      });
    }
  }
  if (route.templates) {
    for (let i = route.templates.length - 1; i >= 0; i--) {
      const TemplateComponent = route.templates[i]?.default;
      if (TemplateComponent) {
        element = react_reactServerExports.createElement(TemplateComponent, { children: element, params });
      }
    }
  }
  for (let i = route.layouts.length - 1; i >= 0; i--) {
    if (route.errors && route.errors[i]?.default) {
      element = react_reactServerExports.createElement(ErrorBoundary, {
        fallback: route.errors[i].default,
        children: element
      });
    }
    const LayoutComponent = route.layouts[i]?.default;
    if (LayoutComponent) {
      {
        const LayoutNotFound = route.notFounds?.[i]?.default;
        if (LayoutNotFound) {
          element = react_reactServerExports.createElement(NotFoundBoundary, {
            fallback: react_reactServerExports.createElement(LayoutNotFound),
            children: element
          });
        }
      }
      const layoutProps = { children: element, params: Object.assign(Promise.resolve(params), params) };
      if (route.slots) {
        for (const [slotName, slotMod] of Object.entries(route.slots)) {
          const targetIdx = slotMod.layoutIndex >= 0 ? slotMod.layoutIndex : route.layouts.length - 1;
          if (i !== targetIdx) continue;
          let SlotPage = null;
          let slotParams = params;
          if (opts && opts.interceptSlot === slotName && opts.interceptPage) {
            SlotPage = opts.interceptPage.default;
            slotParams = opts.interceptParams || params;
          } else {
            SlotPage = slotMod.page?.default || slotMod.default?.default;
          }
          if (SlotPage) {
            let slotElement = react_reactServerExports.createElement(SlotPage, { params: Object.assign(Promise.resolve(slotParams), slotParams) });
            const SlotLayout = slotMod.layout?.default;
            if (SlotLayout) {
              slotElement = react_reactServerExports.createElement(SlotLayout, {
                children: slotElement,
                params: Object.assign(Promise.resolve(slotParams), slotParams)
              });
            }
            if (slotMod.loading?.default) {
              slotElement = react_reactServerExports.createElement(
                react_reactServerExports.Suspense,
                { fallback: react_reactServerExports.createElement(slotMod.loading.default) },
                slotElement
              );
            }
            if (slotMod.error?.default) {
              slotElement = react_reactServerExports.createElement(ErrorBoundary, {
                fallback: slotMod.error.default,
                children: slotElement
              });
            }
            layoutProps[slotName] = slotElement;
          }
        }
      }
      element = react_reactServerExports.createElement(LayoutComponent, layoutProps);
      const layoutDepth = route.layoutSegmentDepths ? route.layoutSegmentDepths[i] : 0;
      element = react_reactServerExports.createElement(LayoutSegmentProvider, { depth: layoutDepth }, element);
    }
  }
  return element;
}
function matchMiddlewarePath(pathname, matcher) {
  if (!matcher) return true;
  const patterns = typeof matcher === "string" ? [matcher] : Array.isArray(matcher) ? matcher.map((m) => typeof m === "string" ? m : m.source) : [];
  return patterns.some((pattern) => {
    const reStr = "^" + pattern.replace(/\./g, "\\.").replace(/:(\w+)\*/g, "(?:.*)").replace(/:(\w+)\+/g, "(?:.+)").replace(/:(\w+)/g, "([^/]+)") + "$";
    const re = __safeRegExp(reStr);
    return re ? re.test(pathname) : false;
  });
}
const __basePath = "";
const __configRedirects = [];
const __configRewrites = { "beforeFiles": [], "afterFiles": [], "fallback": [] };
const __configHeaders = [];
const __allowedOrigins = [];
function __isOriginAllowed(origin, allowed) {
  for (const pattern of allowed) {
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1);
      if (origin === pattern.slice(2) || origin.endsWith(suffix)) return true;
    } else if (origin === pattern) {
      return true;
    }
  }
  return false;
}
function __validateCsrfOrigin(request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader || originHeader === "null") return null;
  let originHost;
  try {
    originHost = new URL(originHeader).host.toLowerCase();
  } catch {
    return new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain" } });
  }
  const hostHeader = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(",")[0].trim().toLowerCase();
  if (!hostHeader) return null;
  if (originHost === hostHeader) return null;
  if (__allowedOrigins.length > 0 && __isOriginAllowed(originHost, __allowedOrigins)) return null;
  console.warn(
    `[vinext] CSRF origin mismatch: origin "${originHost}" does not match host "${hostHeader}". Blocking server action request.`
  );
  return new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain" } });
}
function __isSafeRegex(pattern) {
  const quantifierAtDepth = [];
  let depth = 0;
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "[") {
      i++;
      while (i < pattern.length && pattern[i] !== "]") {
        if (pattern[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (ch === "(") {
      depth++;
      if (quantifierAtDepth.length <= depth) quantifierAtDepth.push(false);
      else quantifierAtDepth[depth] = false;
      i++;
      continue;
    }
    if (ch === ")") {
      const hadQ = depth > 0 && quantifierAtDepth[depth];
      if (depth > 0) depth--;
      const next = pattern[i + 1];
      if (next === "+" || next === "*" || next === "{") {
        if (hadQ) return false;
        if (depth >= 0 && depth < quantifierAtDepth.length) quantifierAtDepth[depth] = true;
      }
      i++;
      continue;
    }
    if (ch === "+" || ch === "*") {
      if (depth > 0) quantifierAtDepth[depth] = true;
      i++;
      continue;
    }
    if (ch === "?") {
      const prev = i > 0 ? pattern[i - 1] : "";
      if (prev !== "+" && prev !== "*" && prev !== "?" && prev !== "}") {
        if (depth > 0) quantifierAtDepth[depth] = true;
      }
      i++;
      continue;
    }
    if (ch === "{") {
      let j = i + 1;
      while (j < pattern.length && /[\d,]/.test(pattern[j])) j++;
      if (j < pattern.length && pattern[j] === "}" && j > i + 1) {
        if (depth > 0) quantifierAtDepth[depth] = true;
        i = j + 1;
        continue;
      }
    }
    i++;
  }
  return true;
}
function __safeRegExp(pattern, flags) {
  if (!__isSafeRegex(pattern)) {
    console.warn("[vinext] Ignoring potentially unsafe regex pattern (ReDoS risk): " + pattern);
    return null;
  }
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}
function __matchConfigPattern(pathname, pattern) {
  if (pattern.includes("(") || pattern.includes("\\") || /:\w+[*+][^/]/.test(pattern)) {
    try {
      const paramNames = [];
      const regexStr = pattern.replace(/\./g, "\\.").replace(/:([a-zA-Z_]\w*)\*(?:\(([^)]+)\))?/g, (_, name, c) => {
        paramNames.push(name);
        return c ? "(" + c + ")" : "(.*)";
      }).replace(/:([a-zA-Z_]\w*)\+(?:\(([^)]+)\))?/g, (_, name, c) => {
        paramNames.push(name);
        return c ? "(" + c + ")" : "(.+)";
      }).replace(/:([a-zA-Z_]\w*)\(([^)]+)\)/g, (_, name, c) => {
        paramNames.push(name);
        return "(" + c + ")";
      }).replace(/:([a-zA-Z_]\w*)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      });
      const re = __safeRegExp("^" + regexStr + "$");
      if (!re) return null;
      const match = re.exec(pathname);
      if (!match) return null;
      const params2 = /* @__PURE__ */ Object.create(null);
      for (let i = 0; i < paramNames.length; i++) params2[paramNames[i]] = match[i + 1] || "";
      return params2;
    } catch {
    }
  }
  const catchAllMatch = pattern.match(/:([a-zA-Z_]\w*)(\*|\+)$/);
  if (catchAllMatch) {
    const prefix = pattern.slice(0, pattern.lastIndexOf(":"));
    const paramName = catchAllMatch[1];
    const isPlus = catchAllMatch[2] === "+";
    if (!pathname.startsWith(prefix.replace(/\/$/, ""))) return null;
    const rest = pathname.slice(prefix.replace(/\/$/, "").length);
    if (isPlus && (!rest || rest === "/")) return null;
    let restValue = rest.startsWith("/") ? rest.slice(1) : rest;
    try {
      restValue = decodeURIComponent(restValue);
    } catch {
    }
    return { [paramName]: restValue };
  }
  const parts = pattern.split("/");
  const pathParts = pathname.split("/");
  if (parts.length !== pathParts.length) return null;
  const params = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(":")) params[parts[i].slice(1)] = pathParts[i];
    else if (parts[i] !== pathParts[i]) return null;
  }
  return params;
}
function __parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  const cookies2 = {};
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key) cookies2[key] = value;
  }
  return cookies2;
}
function __checkSingleCondition(condition, ctx) {
  switch (condition.type) {
    case "header": {
      const v = ctx.headers.get(condition.key);
      if (v === null) return false;
      if (condition.value !== void 0) {
        const re = __safeRegExp(condition.value);
        return re ? re.test(v) : v === condition.value;
      }
      return true;
    }
    case "cookie": {
      const v = ctx.cookies[condition.key];
      if (v === void 0) return false;
      if (condition.value !== void 0) {
        const re = __safeRegExp(condition.value);
        return re ? re.test(v) : v === condition.value;
      }
      return true;
    }
    case "query": {
      const v = ctx.query.get(condition.key);
      if (v === null) return false;
      if (condition.value !== void 0) {
        const re = __safeRegExp(condition.value);
        return re ? re.test(v) : v === condition.value;
      }
      return true;
    }
    case "host": {
      if (condition.value !== void 0) {
        const re = __safeRegExp(condition.value);
        return re ? re.test(ctx.host) : ctx.host === condition.value;
      }
      return ctx.host === condition.key;
    }
    default:
      return false;
  }
}
function __checkHasConditions(has, missing, ctx) {
  if (has) {
    for (const c of has) {
      if (!__checkSingleCondition(c, ctx)) return false;
    }
  }
  if (missing) {
    for (const c of missing) {
      if (__checkSingleCondition(c, ctx)) return false;
    }
  }
  return true;
}
function __buildRequestContext(request) {
  const url = new URL(request.url);
  return {
    headers: request.headers,
    cookies: __parseCookies(request.headers.get("cookie")),
    query: url.searchParams,
    host: request.headers.get("host") || url.host
  };
}
function __applyConfigRedirects(pathname, ctx) {
  for (const rule of __configRedirects) {
    const params = __matchConfigPattern(pathname, rule.source);
    if (params) {
      if (ctx && (rule.has || rule.missing)) {
        if (!__checkHasConditions(rule.has, rule.missing, ctx)) continue;
      }
      let dest = rule.destination;
      for (const [key, value] of Object.entries(params)) {
        dest = dest.replace(":" + key + "*", value);
        dest = dest.replace(":" + key + "+", value);
        dest = dest.replace(":" + key, value);
      }
      return { destination: dest, permanent: rule.permanent };
    }
  }
  return null;
}
function __applyConfigRewrites(pathname, rules, ctx) {
  for (const rule of rules) {
    const params = __matchConfigPattern(pathname, rule.source);
    if (params) {
      if (ctx && (rule.has || rule.missing)) {
        if (!__checkHasConditions(rule.has, rule.missing, ctx)) continue;
      }
      let dest = rule.destination;
      for (const [key, value] of Object.entries(params)) {
        dest = dest.replace(":" + key + "*", value);
        dest = dest.replace(":" + key + "+", value);
        dest = dest.replace(":" + key, value);
      }
      return dest;
    }
  }
  return null;
}
function __isExternalUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}
const __hopByHopHeaders = /* @__PURE__ */ new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"]);
async function __proxyExternalRequest(request, externalUrl) {
  const originalUrl = new URL(request.url);
  const targetUrl = new URL(externalUrl);
  for (const [key, value] of originalUrl.searchParams) {
    if (!targetUrl.searchParams.has(key)) targetUrl.searchParams.set(key, value);
  }
  const headers = new Headers(request.headers);
  headers.set("host", targetUrl.host);
  headers.delete("connection");
  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const init2 = { method, headers, redirect: "manual" };
  if (hasBody && request.body) {
    init2.body = request.body;
    init2.duplex = "half";
  }
  let upstream;
  try {
    upstream = await fetch(targetUrl.href, init2);
  } catch (e) {
    console.error("[vinext] External rewrite proxy error:", e);
    return new Response("Bad Gateway", { status: 502 });
  }
  const respHeaders = new Headers();
  upstream.headers.forEach(function(value, key) {
    if (!__hopByHopHeaders.has(key.toLowerCase())) respHeaders.append(key, value);
  });
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: respHeaders });
}
function __applyConfigHeaders(pathname) {
  const result = [];
  for (const rule of __configHeaders) {
    const groups = [];
    const withPlaceholders = rule.source.replace(/\(([^)]+)\)/g, (_, inner) => {
      groups.push(inner);
      return "___GROUP_" + (groups.length - 1) + "___";
    });
    const escaped = withPlaceholders.replace(/\./g, "\\.").replace(/\+/g, "\\+").replace(/\?/g, "\\?").replace(/\*/g, ".*").replace(/:[a-zA-Z_]\w*/g, "[^/]+").replace(/___GROUP_(\d+)___/g, (_, idx) => "(" + groups[Number(idx)] + ")");
    const sourceRegex = __safeRegExp("^" + escaped + "$");
    if (sourceRegex && sourceRegex.test(pathname)) result.push(...rule.headers);
  }
  return result;
}
async function handler(request) {
  const headersCtx = headersContextFromRequest(request);
  return runWithHeadersContext(headersCtx, async () => {
    _initRequestScopedCacheState();
    clearPrivateCache();
    return runWithFetchCache(async () => {
      const response = await _handleRequest(request);
      if (__configHeaders.length && response && response.headers && !(response.status >= 300 && response.status < 400)) {
        const url = new URL(request.url);
        let pathname = url.pathname;
        const extraHeaders = __applyConfigHeaders(pathname);
        for (const h of extraHeaders) {
          response.headers.set(h.key, h.value);
        }
      }
      return response;
    });
  });
}
async function _handleRequest(request) {
  const url = new URL(request.url);
  let pathname = url.pathname;
  if (pathname.startsWith("//")) {
    return new Response("404 Not Found", { status: 404 });
  }
  if (pathname !== "/" && !pathname.startsWith("/api")) {
    const hasTrailing = pathname.endsWith("/");
    if (hasTrailing) {
      return Response.redirect(new URL(__basePath + pathname.replace(/\/+$/, "") + url.search, request.url), 308);
    }
  }
  const __reqCtx = __buildRequestContext(request);
  if (__configRedirects.length) {
    const __redir = __applyConfigRedirects(pathname, __reqCtx);
    if (__redir) {
      const __redirDest = __redir.destination;
      return new Response(null, {
        status: __redir.permanent ? 308 : 307,
        headers: { Location: __redirDest }
      });
    }
  }
  if (__configRewrites.beforeFiles && __configRewrites.beforeFiles.length) {
    const __rewritten = __applyConfigRewrites(pathname, __configRewrites.beforeFiles, __reqCtx);
    if (__rewritten) {
      if (__isExternalUrl(__rewritten)) {
        setHeadersContext(null);
        setNavigationContext(null);
        return __proxyExternalRequest(request, __rewritten);
      }
      pathname = __rewritten;
    }
  }
  const isRscRequest = pathname.endsWith(".rsc") || request.headers.get("accept")?.includes("text/x-component");
  let cleanPathname = pathname.replace(/\.rsc$/, "");
  let _middlewareResponseHeaders = null;
  let _middlewareRewriteStatus = null;
  const middlewareFn = middleware;
  const middlewareMatcher = config$1?.matcher;
  if (typeof middlewareFn === "function" && matchMiddlewarePath(cleanPathname, middlewareMatcher)) {
    try {
      const nextRequest = request instanceof NextRequest ? request : new NextRequest(request);
      const mwResponse = await middlewareFn(nextRequest);
      if (mwResponse) {
        if (mwResponse.headers.get("x-middleware-next") === "1") {
          _middlewareResponseHeaders = new Headers();
          for (const [key, value] of mwResponse.headers) {
            if (key !== "x-middleware-next" && key !== "x-middleware-rewrite") {
              _middlewareResponseHeaders.set(key, value);
            }
          }
        } else {
          if (mwResponse.status >= 300 && mwResponse.status < 400) {
            return mwResponse;
          }
          const rewriteUrl = mwResponse.headers.get("x-middleware-rewrite");
          if (rewriteUrl) {
            const rewriteParsed = new URL(rewriteUrl, request.url);
            cleanPathname = rewriteParsed.pathname;
            if (mwResponse.status !== 200) {
              _middlewareRewriteStatus = mwResponse.status;
            }
            _middlewareResponseHeaders = new Headers();
            for (const [key, value] of mwResponse.headers) {
              if (key !== "x-middleware-next" && key !== "x-middleware-rewrite") {
                _middlewareResponseHeaders.set(key, value);
              }
            }
          } else {
            return mwResponse;
          }
        }
      }
    } catch (err) {
      console.error("[vinext] Middleware error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
  if (_middlewareResponseHeaders) {
    applyMiddlewareRequestHeaders(_middlewareResponseHeaders);
    for (const key of [..._middlewareResponseHeaders.keys()]) {
      if (key.startsWith("x-middleware-request-")) {
        _middlewareResponseHeaders.delete(key);
      }
    }
  }
  if (cleanPathname === "/_vinext/image") {
    const __imgUrl = url.searchParams.get("url");
    if (!__imgUrl || !__imgUrl.startsWith("/") || __imgUrl.startsWith("//")) {
      return new Response(!__imgUrl ? "Missing url parameter" : "Only relative URLs allowed", { status: 400 });
    }
    return Response.redirect(new URL(__imgUrl, request.url).href, 302);
  }
  for (const metaRoute of metadataRoutes) {
    if (cleanPathname === metaRoute.servedUrl) {
      if (metaRoute.isDynamic) {
        const metaFn = metaRoute.module.default;
        if (typeof metaFn === "function") {
          const result = await metaFn();
          let body;
          if (result instanceof Response) return result;
          if (metaRoute.type === "sitemap") body = sitemapToXml(result);
          else if (metaRoute.type === "robots") body = robotsToText(result);
          else if (metaRoute.type === "manifest") body = manifestToJson(result);
          else body = JSON.stringify(result);
          return new Response(body, {
            headers: { "Content-Type": metaRoute.contentType }
          });
        }
      } else {
        try {
          const binary = atob(metaRoute.fileDataBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          return new Response(bytes, {
            headers: {
              "Content-Type": metaRoute.contentType,
              "Cache-Control": "public, max-age=0, must-revalidate"
            }
          });
        } catch {
          return new Response("Not Found", { status: 404 });
        }
      }
    }
  }
  setNavigationContext({
    pathname: cleanPathname,
    searchParams: url.searchParams,
    params: {}
  });
  const actionId = request.headers.get("x-rsc-action");
  if (request.method === "POST" && actionId) {
    const csrfResponse = __validateCsrfOrigin(request);
    if (csrfResponse) return csrfResponse;
    try {
      const contentType = request.headers.get("content-type") || "";
      const body = contentType.startsWith("multipart/form-data") ? await request.formData() : await request.text();
      const temporaryReferences = createTemporaryReferenceSet();
      const args = await decodeReply(body, { temporaryReferences });
      const action = await loadServerAction(actionId);
      let returnValue;
      let actionRedirect = null;
      try {
        const data = await action.apply(null, args);
        returnValue = { ok: true, data };
      } catch (e) {
        if (e && typeof e === "object" && "digest" in e) {
          const digest = String(e.digest);
          if (digest.startsWith("NEXT_REDIRECT;")) {
            const parts = digest.split(";");
            actionRedirect = {
              url: parts[2],
              type: parts[1] || "replace",
              // "push" or "replace"
              status: parts[3] ? parseInt(parts[3], 10) : 307
            };
            returnValue = { ok: true, data: void 0 };
          } else if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) {
            returnValue = { ok: false, data: e };
          } else {
            returnValue = { ok: false, data: e };
          }
        } else {
          returnValue = { ok: false, data: e };
        }
      }
      if (actionRedirect) {
        const actionPendingCookies2 = getAndClearPendingCookies();
        const actionDraftCookie2 = getDraftModeCookieHeader();
        setHeadersContext(null);
        setNavigationContext(null);
        const redirectHeaders = new Headers({
          "Content-Type": "text/x-component; charset=utf-8",
          "x-action-redirect": actionRedirect.url,
          "x-action-redirect-type": actionRedirect.type,
          "x-action-redirect-status": String(actionRedirect.status)
        });
        for (const cookie of actionPendingCookies2) {
          redirectHeaders.append("Set-Cookie", cookie);
        }
        if (actionDraftCookie2) redirectHeaders.append("Set-Cookie", actionDraftCookie2);
        return new Response("", { status: 200, headers: redirectHeaders });
      }
      const match2 = matchRoute(cleanPathname, routes);
      let element2;
      if (match2) {
        const { route: actionRoute, params: actionParams } = match2;
        setNavigationContext({
          pathname: cleanPathname,
          searchParams: url.searchParams,
          params: actionParams
        });
        element2 = buildPageElement(actionRoute, actionParams, void 0, url.searchParams);
      } else {
        element2 = react_reactServerExports.createElement("div", null, "Page not found");
      }
      const rscStream2 = renderToReadableStream(
        { root: element2, returnValue },
        { temporaryReferences, onError: rscOnError }
      );
      const actionPendingCookies = getAndClearPendingCookies();
      const actionDraftCookie = getDraftModeCookieHeader();
      setHeadersContext(null);
      setNavigationContext(null);
      const actionHeaders = { "Content-Type": "text/x-component; charset=utf-8" };
      const actionResponse = new Response(rscStream2, { headers: actionHeaders });
      if (actionPendingCookies.length > 0 || actionDraftCookie) {
        for (const cookie of actionPendingCookies) {
          actionResponse.headers.append("Set-Cookie", cookie);
        }
        if (actionDraftCookie) actionResponse.headers.append("Set-Cookie", actionDraftCookie);
      }
      return actionResponse;
    } catch (err) {
      getAndClearPendingCookies();
      console.error("[vinext] Server action error:", err);
      reportRequestError(
        err instanceof Error ? err : new Error(String(err)),
        { method: request.method, headers: Object.fromEntries(request.headers.entries()) }
      ).catch(() => {
      });
      setHeadersContext(null);
      setNavigationContext(null);
      return new Response(
        "Internal Server Error",
        { status: 500 }
      );
    }
  }
  if (__configRewrites.afterFiles && __configRewrites.afterFiles.length) {
    const __afterRewritten = __applyConfigRewrites(cleanPathname, __configRewrites.afterFiles, __reqCtx);
    if (__afterRewritten) {
      if (__isExternalUrl(__afterRewritten)) {
        setHeadersContext(null);
        setNavigationContext(null);
        return __proxyExternalRequest(request, __afterRewritten);
      }
      cleanPathname = __afterRewritten;
    }
  }
  let match = matchRoute(cleanPathname, routes);
  if (!match && __configRewrites.fallback && __configRewrites.fallback.length) {
    const __fallbackRewritten = __applyConfigRewrites(cleanPathname, __configRewrites.fallback, __reqCtx);
    if (__fallbackRewritten) {
      if (__isExternalUrl(__fallbackRewritten)) {
        setHeadersContext(null);
        setNavigationContext(null);
        return __proxyExternalRequest(request, __fallbackRewritten);
      }
      cleanPathname = __fallbackRewritten;
      match = matchRoute(cleanPathname, routes);
    }
  }
  if (!match) {
    const notFoundResponse = await renderNotFoundPage(null, isRscRequest);
    if (notFoundResponse) return notFoundResponse;
    setHeadersContext(null);
    setNavigationContext(null);
    return new Response("Not Found", { status: 404 });
  }
  const { route, params } = match;
  setNavigationContext({
    pathname: cleanPathname,
    searchParams: url.searchParams,
    params
  });
  if (route.routeHandler) {
    const handler2 = route.routeHandler;
    const method = request.method.toUpperCase();
    const HTTP_METHODS = ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
    const exportedMethods = HTTP_METHODS.filter((m) => typeof handler2[m] === "function");
    if (exportedMethods.includes("GET") && !exportedMethods.includes("HEAD")) {
      exportedMethods.push("HEAD");
    }
    const hasDefault = typeof handler2["default"] === "function";
    if (method === "OPTIONS" && typeof handler2["OPTIONS"] !== "function") {
      const allowMethods = hasDefault ? HTTP_METHODS : exportedMethods;
      if (!allowMethods.includes("OPTIONS")) allowMethods.push("OPTIONS");
      setHeadersContext(null);
      setNavigationContext(null);
      return new Response(null, {
        status: 204,
        headers: { "Allow": allowMethods.join(", ") }
      });
    }
    let handlerFn = handler2[method] || handler2["default"];
    let isAutoHead = false;
    if (method === "HEAD" && typeof handler2["HEAD"] !== "function" && typeof handler2["GET"] === "function") {
      handlerFn = handler2["GET"];
      isAutoHead = true;
    }
    if (typeof handlerFn === "function") {
      try {
        const response = await handlerFn(request, { params });
        const pendingCookies = getAndClearPendingCookies();
        const draftCookie2 = getDraftModeCookieHeader();
        setHeadersContext(null);
        setNavigationContext(null);
        if (pendingCookies.length > 0 || draftCookie2) {
          const newHeaders = new Headers(response.headers);
          for (const cookie of pendingCookies) {
            newHeaders.append("Set-Cookie", cookie);
          }
          if (draftCookie2) newHeaders.append("Set-Cookie", draftCookie2);
          if (isAutoHead) {
            return new Response(null, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders
            });
          }
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
        }
        if (isAutoHead) {
          return new Response(null, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
        return response;
      } catch (err) {
        getAndClearPendingCookies();
        if (err && typeof err === "object" && "digest" in err) {
          const digest = String(err.digest);
          if (digest.startsWith("NEXT_REDIRECT;")) {
            const parts = digest.split(";");
            const redirectUrl = parts[2];
            const statusCode = parts[3] ? parseInt(parts[3], 10) : 307;
            setHeadersContext(null);
            setNavigationContext(null);
            return new Response(null, {
              status: statusCode,
              headers: { Location: new URL(redirectUrl, request.url).toString() }
            });
          }
          if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) {
            const statusCode = digest === "NEXT_NOT_FOUND" ? 404 : parseInt(digest.split(";")[1], 10);
            setHeadersContext(null);
            setNavigationContext(null);
            return new Response(null, { status: statusCode });
          }
        }
        setHeadersContext(null);
        setNavigationContext(null);
        console.error("[vinext] Route handler error:", err);
        reportRequestError(
          err instanceof Error ? err : new Error(String(err)),
          { method: request.method, headers: Object.fromEntries(request.headers.entries()) },
          { routePath: route.pattern }
        ).catch(() => {
        });
        return new Response(null, { status: 500 });
      }
    }
    setHeadersContext(null);
    setNavigationContext(null);
    return new Response(null, {
      status: 405,
      headers: { Allow: exportedMethods.join(", ") }
    });
  }
  const PageComponent = route.page?.default;
  if (!PageComponent) {
    setHeadersContext(null);
    setNavigationContext(null);
    return new Response("Page has no default export", { status: 500 });
  }
  let revalidateSeconds = typeof route.page?.revalidate === "number" ? route.page.revalidate : null;
  const dynamicConfig = route.page?.dynamic;
  const dynamicParamsConfig = route.page?.dynamicParams;
  const isForceStatic = dynamicConfig === "force-static";
  const isDynamicError = dynamicConfig === "error";
  if (isForceStatic) {
    setHeadersContext({ headers: new Headers(), cookies: /* @__PURE__ */ new Map() });
    setNavigationContext({
      pathname: cleanPathname,
      searchParams: new URLSearchParams(),
      params
    });
  }
  if (isDynamicError) {
    const errorMsg = 'Page with `dynamic = "error"` used a dynamic API. This page was expected to be fully static, but headers(), cookies(), or searchParams was accessed. Remove the dynamic API usage or change the dynamic config to "auto" or "force-dynamic".';
    const throwingHeaders = new Proxy(new Headers(), {
      get(target, prop) {
        if (typeof prop === "string" && prop !== "then") throw new Error(errorMsg);
        return Reflect.get(target, prop);
      }
    });
    const throwingCookies = new Proxy(/* @__PURE__ */ new Map(), {
      get(target, prop) {
        if (typeof prop === "string" && prop !== "then") throw new Error(errorMsg);
        return Reflect.get(target, prop);
      }
    });
    setHeadersContext({ headers: throwingHeaders, cookies: throwingCookies });
    setNavigationContext({
      pathname: cleanPathname,
      searchParams: new URLSearchParams(),
      params
    });
  }
  if (dynamicParamsConfig === false && route.isDynamic && typeof route.page?.generateStaticParams === "function") {
    try {
      const staticParams = await route.page.generateStaticParams({ params });
      if (Array.isArray(staticParams)) {
        const paramKeys = Object.keys(params);
        const isAllowed = staticParams.some(
          (sp) => paramKeys.every((key) => {
            const val = params[key];
            const staticVal = sp[key];
            if (staticVal === void 0) return true;
            if (Array.isArray(val)) return JSON.stringify(val) === JSON.stringify(staticVal);
            return String(val) === String(staticVal);
          })
        );
        if (!isAllowed) {
          setHeadersContext(null);
          setNavigationContext(null);
          return new Response("Not Found", { status: 404 });
        }
      }
    } catch (err) {
      console.error("[vinext] generateStaticParams error:", err);
    }
  }
  const isForceDynamic = dynamicConfig === "force-dynamic";
  let interceptOpts = void 0;
  if (isRscRequest) {
    const intercept = findIntercept(cleanPathname);
    if (intercept) {
      const sourceRoute = routes[intercept.sourceRouteIndex];
      if (sourceRoute && sourceRoute !== route) {
        const sourceMatch = matchRoute(sourceRoute.pattern, routes);
        const sourceParams = sourceMatch ? sourceMatch.params : {};
        setNavigationContext({
          pathname: cleanPathname,
          searchParams: url.searchParams,
          params: intercept.matchedParams
        });
        const interceptElement = await buildPageElement(sourceRoute, sourceParams, {
          interceptSlot: intercept.slotName,
          interceptPage: intercept.page,
          interceptParams: intercept.matchedParams
        }, url.searchParams);
        const interceptStream = renderToReadableStream(interceptElement, { onError: rscOnError });
        setHeadersContext(null);
        setNavigationContext(null);
        return new Response(interceptStream, {
          headers: { "Content-Type": "text/x-component; charset=utf-8" }
        });
      }
      interceptOpts = {
        interceptSlot: intercept.slotName,
        interceptPage: intercept.page,
        interceptParams: intercept.matchedParams
      };
    }
  }
  let element;
  try {
    element = await buildPageElement(route, params, interceptOpts, url.searchParams);
  } catch (buildErr) {
    if (buildErr && typeof buildErr === "object" && "digest" in buildErr) {
      const digest = String(buildErr.digest);
      if (digest.startsWith("NEXT_REDIRECT;")) {
        const parts = digest.split(";");
        const redirectUrl = parts[2];
        const statusCode = parts[3] ? parseInt(parts[3], 10) : 307;
        setHeadersContext(null);
        setNavigationContext(null);
        return Response.redirect(new URL(redirectUrl, request.url), statusCode);
      }
      if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) {
        const statusCode = digest === "NEXT_NOT_FOUND" ? 404 : parseInt(digest.split(";")[1], 10);
        const fallbackResp = await renderHTTPAccessFallbackPage(route, statusCode, isRscRequest);
        if (fallbackResp) return fallbackResp;
        setHeadersContext(null);
        setNavigationContext(null);
        const statusText = statusCode === 403 ? "Forbidden" : statusCode === 401 ? "Unauthorized" : "Not Found";
        return new Response(statusText, { status: statusCode });
      }
    }
    const errorBoundaryResp = await renderErrorBoundaryPage(route, buildErr, isRscRequest);
    if (errorBoundaryResp) return errorBoundaryResp;
    throw buildErr;
  }
  async function handleRenderError(err) {
    if (err && typeof err === "object" && "digest" in err) {
      const digest = String(err.digest);
      if (digest.startsWith("NEXT_REDIRECT;")) {
        const parts = digest.split(";");
        const redirectUrl = parts[2];
        const statusCode = parts[3] ? parseInt(parts[3], 10) : 307;
        setHeadersContext(null);
        setNavigationContext(null);
        return Response.redirect(new URL(redirectUrl, request.url), statusCode);
      }
      if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) {
        const statusCode = digest === "NEXT_NOT_FOUND" ? 404 : parseInt(digest.split(";")[1], 10);
        const fallbackResp = await renderHTTPAccessFallbackPage(route, statusCode, isRscRequest);
        if (fallbackResp) return fallbackResp;
        setHeadersContext(null);
        setNavigationContext(null);
        const statusText = statusCode === 403 ? "Forbidden" : statusCode === 401 ? "Unauthorized" : "Not Found";
        return new Response(statusText, { status: statusCode });
      }
    }
    return null;
  }
  if (route.layouts && route.layouts.length > 0) {
    const asyncParams = Object.assign(Promise.resolve(params), params);
    for (let li = route.layouts.length - 1; li >= 0; li--) {
      const LayoutComp = route.layouts[li]?.default;
      if (!LayoutComp) continue;
      try {
        const lr = LayoutComp({ params: asyncParams, children: null });
        if (lr && typeof lr === "object" && typeof lr.then === "function") await lr;
      } catch (layoutErr) {
        if (layoutErr && typeof layoutErr === "object" && "digest" in layoutErr) {
          const digest = String(layoutErr.digest);
          if (digest.startsWith("NEXT_REDIRECT;")) {
            const parts = digest.split(";");
            const redirectUrl = parts[2];
            const statusCode = parts[3] ? parseInt(parts[3], 10) : 307;
            setHeadersContext(null);
            setNavigationContext(null);
            return Response.redirect(new URL(redirectUrl, request.url), statusCode);
          }
          if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) {
            const statusCode = digest === "NEXT_NOT_FOUND" ? 404 : parseInt(digest.split(";")[1], 10);
            let parentNotFound = null;
            if (route.notFounds) {
              for (let pi = li - 1; pi >= 0; pi--) {
                if (route.notFounds[pi]?.default) {
                  parentNotFound = route.notFounds[pi].default;
                  break;
                }
              }
            }
            if (!parentNotFound) parentNotFound = null;
            const parentLayouts = route.layouts.slice(0, li);
            const fallbackResp = await renderHTTPAccessFallbackPage(
              route,
              statusCode,
              isRscRequest,
              request,
              { boundaryComponent: parentNotFound, layouts: parentLayouts }
            );
            if (fallbackResp) return fallbackResp;
            setHeadersContext(null);
            setNavigationContext(null);
            const statusText = statusCode === 403 ? "Forbidden" : statusCode === 401 ? "Unauthorized" : "Not Found";
            return new Response(statusText, { status: statusCode });
          }
        }
      }
    }
  }
  const _hasLoadingBoundary = !!(route.loading && route.loading.default);
  const _origConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Invalid hook call")) return;
    _origConsoleError.apply(console, args);
  };
  try {
    const testResult = PageComponent({ params });
    if (testResult && typeof testResult === "object" && typeof testResult.then === "function") {
      if (!_hasLoadingBoundary) {
        await testResult;
      } else {
        testResult.catch(() => {
        });
      }
    }
  } catch (preRenderErr) {
    const specialResponse = await handleRenderError(preRenderErr);
    if (specialResponse) return specialResponse;
  } finally {
    console.error = _origConsoleError;
  }
  const rscStream = renderToReadableStream(element, { onError: rscOnError });
  if (isRscRequest) {
    const responseHeaders = { "Content-Type": "text/x-component; charset=utf-8" };
    if (params && Object.keys(params).length > 0) {
      responseHeaders["X-Vinext-Params"] = JSON.stringify(params);
    }
    if (isForceDynamic) {
      responseHeaders["Cache-Control"] = "no-store, must-revalidate";
    } else if ((isForceStatic || isDynamicError) && !revalidateSeconds) {
      responseHeaders["Cache-Control"] = "s-maxage=31536000, stale-while-revalidate";
      responseHeaders["X-Vinext-Cache"] = "STATIC";
    } else if (revalidateSeconds) {
      responseHeaders["Cache-Control"] = "s-maxage=" + revalidateSeconds + ", stale-while-revalidate";
    }
    if (_middlewareResponseHeaders) {
      for (const [key, value] of _middlewareResponseHeaders) {
        responseHeaders[key] = value;
      }
    }
    return new Response(rscStream, { status: _middlewareRewriteStatus || 200, headers: responseHeaders });
  }
  const fontData = {
    links: getSSRFontLinks(),
    styles: _getSSRFontStyles(),
    preloads: _getSSRFontPreloads()
  };
  const fontPreloads = fontData.preloads || [];
  const fontLinkHeaderParts = [];
  for (const preload of fontPreloads) {
    fontLinkHeaderParts.push("<" + preload.href + ">; rel=preload; as=font; type=" + preload.type + "; crossorigin");
  }
  const fontLinkHeader = fontLinkHeaderParts.length > 0 ? fontLinkHeaderParts.join(", ") : "";
  let htmlStream;
  try {
    const ssrEntry = await import("../ssr/index.js");
    htmlStream = await ssrEntry.handleSsr(rscStream, getNavigationContext(), fontData);
  } catch (ssrErr) {
    const specialResponse = await handleRenderError(ssrErr);
    if (specialResponse) return specialResponse;
    const errorBoundaryResp = await renderErrorBoundaryPage(route, ssrErr, isRscRequest);
    if (errorBoundaryResp) return errorBoundaryResp;
    throw ssrErr;
  }
  const draftCookie = getDraftModeCookieHeader();
  setHeadersContext(null);
  setNavigationContext(null);
  function attachMiddlewareContext(response) {
    if (draftCookie) {
      response.headers.append("Set-Cookie", draftCookie);
    }
    if (fontLinkHeader) {
      response.headers.set("Link", fontLinkHeader);
    }
    if (_middlewareResponseHeaders) {
      for (const [key, value] of _middlewareResponseHeaders) {
        response.headers.set(key, value);
      }
    }
    if (_middlewareRewriteStatus) {
      return new Response(response.body, {
        status: _middlewareRewriteStatus,
        headers: response.headers
      });
    }
    return response;
  }
  const dynamicUsedDuringRender = consumeDynamicUsage();
  const requestCacheLife = _consumeRequestScopedCacheLife();
  if (requestCacheLife && requestCacheLife.revalidate !== void 0 && revalidateSeconds === null) {
    revalidateSeconds = requestCacheLife.revalidate;
  }
  if (isForceDynamic) {
    return attachMiddlewareContext(new Response(htmlStream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate"
      }
    }));
  }
  if ((isForceStatic || isDynamicError) && (revalidateSeconds === null || revalidateSeconds === 0)) {
    return attachMiddlewareContext(new Response(htmlStream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "s-maxage=31536000, stale-while-revalidate",
        "X-Vinext-Cache": "STATIC"
      }
    }));
  }
  if (dynamicUsedDuringRender) {
    return attachMiddlewareContext(new Response(htmlStream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate"
      }
    }));
  }
  if (revalidateSeconds !== null && revalidateSeconds > 0) {
    return attachMiddlewareContext(new Response(htmlStream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "s-maxage=" + revalidateSeconds + ", stale-while-revalidate"
      }
    }));
  }
  return attachMiddlewareContext(new Response(htmlStream, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  }));
}
const appRouterEntry = {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("//")) {
      return new Response("404 Not Found", { status: 404 });
    }
    const result = await handler(request);
    if (result instanceof Response) {
      return result;
    }
    if (result === null || result === void 0) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(String(result), { status: 200 });
  }
};
const workerEntry = appRouterEntry ?? {};
export {
  registerClientReference as r,
  workerEntry as w
};

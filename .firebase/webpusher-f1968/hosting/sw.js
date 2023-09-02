/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const lt = function(t) {
  const e = [];
  let n = 0;
  for (let r = 0; r < t.length; r++) {
    let s = t.charCodeAt(r);
    s < 128 ? e[n++] = s : s < 2048 ? (e[n++] = s >> 6 | 192, e[n++] = s & 63 | 128) : (s & 64512) === 55296 && r + 1 < t.length && (t.charCodeAt(r + 1) & 64512) === 56320 ? (s = 65536 + ((s & 1023) << 10) + (t.charCodeAt(++r) & 1023), e[n++] = s >> 18 | 240, e[n++] = s >> 12 & 63 | 128, e[n++] = s >> 6 & 63 | 128, e[n++] = s & 63 | 128) : (e[n++] = s >> 12 | 224, e[n++] = s >> 6 & 63 | 128, e[n++] = s & 63 | 128);
  }
  return e;
}, tn = function(t) {
  const e = [];
  let n = 0, r = 0;
  for (; n < t.length; ) {
    const s = t[n++];
    if (s < 128)
      e[r++] = String.fromCharCode(s);
    else if (s > 191 && s < 224) {
      const o = t[n++];
      e[r++] = String.fromCharCode((s & 31) << 6 | o & 63);
    } else if (s > 239 && s < 365) {
      const o = t[n++], a = t[n++], i = t[n++], c = ((s & 7) << 18 | (o & 63) << 12 | (a & 63) << 6 | i & 63) - 65536;
      e[r++] = String.fromCharCode(55296 + (c >> 10)), e[r++] = String.fromCharCode(56320 + (c & 1023));
    } else {
      const o = t[n++], a = t[n++];
      e[r++] = String.fromCharCode((s & 15) << 12 | (o & 63) << 6 | a & 63);
    }
  }
  return e.join("");
}, ht = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob == "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(t, e) {
    if (!Array.isArray(t))
      throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const n = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
    for (let s = 0; s < t.length; s += 3) {
      const o = t[s], a = s + 1 < t.length, i = a ? t[s + 1] : 0, c = s + 2 < t.length, l = c ? t[s + 2] : 0, h = o >> 2, g = (o & 3) << 4 | i >> 4;
      let m = (i & 15) << 2 | l >> 6, R = l & 63;
      c || (R = 64, a || (m = 64)), r.push(n[h], n[g], n[m], n[R]);
    }
    return r.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(t, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? btoa(t) : this.encodeByteArray(lt(t), e);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(t, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? atob(t) : tn(this.decodeStringToByteArray(t, e));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(t, e) {
    this.init_();
    const n = e ? this.charToByteMapWebSafe_ : this.charToByteMap_, r = [];
    for (let s = 0; s < t.length; ) {
      const o = n[t.charAt(s++)], i = s < t.length ? n[t.charAt(s)] : 0;
      ++s;
      const l = s < t.length ? n[t.charAt(s)] : 64;
      ++s;
      const g = s < t.length ? n[t.charAt(s)] : 64;
      if (++s, o == null || i == null || l == null || g == null)
        throw new nn();
      const m = o << 2 | i >> 4;
      if (r.push(m), l !== 64) {
        const R = i << 4 & 240 | l >> 2;
        if (r.push(R), g !== 64) {
          const en = l << 6 & 192 | g;
          r.push(en);
        }
      }
    }
    return r;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let t = 0; t < this.ENCODED_VALS.length; t++)
        this.byteToCharMap_[t] = this.ENCODED_VALS.charAt(t), this.charToByteMap_[this.byteToCharMap_[t]] = t, this.byteToCharMapWebSafe_[t] = this.ENCODED_VALS_WEBSAFE.charAt(t), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]] = t, t >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)] = t, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)] = t);
    }
  }
};
class nn extends Error {
  constructor() {
    super(...arguments), this.name = "DecodeBase64StringError";
  }
}
const rn = function(t) {
  const e = lt(t);
  return ht.encodeByteArray(e, !0);
}, dt = function(t) {
  return rn(t).replace(/\./g, "");
}, sn = function(t) {
  try {
    return ht.decodeString(t, !0);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function on() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("Unable to locate global object.");
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const an = () => on().__FIREBASE_DEFAULTS__, cn = () => {
  if (typeof process > "u" || typeof process.env > "u")
    return;
  const t = process.env.__FIREBASE_DEFAULTS__;
  if (t)
    return JSON.parse(t);
}, un = () => {
  if (typeof document > "u")
    return;
  let t;
  try {
    t = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch {
    return;
  }
  const e = t && sn(t[1]);
  return e && JSON.parse(e);
}, ln = () => {
  try {
    return an() || cn() || un();
  } catch (t) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);
    return;
  }
}, ft = () => {
  var t;
  return (t = ln()) === null || t === void 0 ? void 0 : t.config;
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let hn = class {
  constructor() {
    this.reject = () => {
    }, this.resolve = () => {
    }, this.promise = new Promise((e, n) => {
      this.resolve = e, this.reject = n;
    });
  }
  /**
   * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(e) {
    return (n, r) => {
      n ? this.reject(n) : this.resolve(r), typeof e == "function" && (this.promise.catch(() => {
      }), e.length === 1 ? e(n) : e(n, r));
    };
  }
};
function pt() {
  try {
    return typeof indexedDB == "object";
  } catch {
    return !1;
  }
}
function gt() {
  return new Promise((t, e) => {
    try {
      let n = !0;
      const r = "validate-browser-context-for-indexeddb-analytics-module", s = self.indexedDB.open(r);
      s.onsuccess = () => {
        s.result.close(), n || self.indexedDB.deleteDatabase(r), t(!0);
      }, s.onupgradeneeded = () => {
        n = !1;
      }, s.onerror = () => {
        var o;
        e(((o = s.error) === null || o === void 0 ? void 0 : o.message) || "");
      };
    } catch (n) {
      e(n);
    }
  });
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const dn = "FirebaseError";
class P extends Error {
  constructor(e, n, r) {
    super(n), this.code = e, this.customData = r, this.name = dn, Object.setPrototypeOf(this, P.prototype), Error.captureStackTrace && Error.captureStackTrace(this, z.prototype.create);
  }
}
class z {
  constructor(e, n, r) {
    this.service = e, this.serviceName = n, this.errors = r;
  }
  create(e, ...n) {
    const r = n[0] || {}, s = `${this.service}/${e}`, o = this.errors[e], a = o ? fn(o, r) : "Error", i = `${this.serviceName}: ${a} (${s}).`;
    return new P(s, i, r);
  }
}
function fn(t, e) {
  return t.replace(pn, (n, r) => {
    const s = e[r];
    return s != null ? String(s) : `<${r}?>`;
  });
}
const pn = /\{\$([^}]+)}/g;
function me(t, e) {
  if (t === e)
    return !0;
  const n = Object.keys(t), r = Object.keys(e);
  for (const s of n) {
    if (!r.includes(s))
      return !1;
    const o = t[s], a = e[s];
    if (Ke(o) && Ke(a)) {
      if (!me(o, a))
        return !1;
    } else if (o !== a)
      return !1;
  }
  for (const s of r)
    if (!n.includes(s))
      return !1;
  return !0;
}
function Ke(t) {
  return t !== null && typeof t == "object";
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function mt(t) {
  return t && t._delegate ? t._delegate : t;
}
class A {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(e, n, r) {
    this.name = e, this.instanceFactory = n, this.type = r, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
  }
  setInstantiationMode(e) {
    return this.instantiationMode = e, this;
  }
  setMultipleInstances(e) {
    return this.multipleInstances = e, this;
  }
  setServiceProps(e) {
    return this.serviceProps = e, this;
  }
  setInstanceCreatedCallback(e) {
    return this.onInstanceCreated = e, this;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const D = "[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gn {
  constructor(e, n) {
    this.name = e, this.container = n, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide mulitple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(e) {
    const n = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(n)) {
      const r = new hn();
      if (this.instancesDeferred.set(n, r), this.isInitialized(n) || this.shouldAutoInitialize())
        try {
          const s = this.getOrInitializeService({
            instanceIdentifier: n
          });
          s && r.resolve(s);
        } catch {
        }
    }
    return this.instancesDeferred.get(n).promise;
  }
  getImmediate(e) {
    var n;
    const r = this.normalizeInstanceIdentifier(e == null ? void 0 : e.identifier), s = (n = e == null ? void 0 : e.optional) !== null && n !== void 0 ? n : !1;
    if (this.isInitialized(r) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({
          instanceIdentifier: r
        });
      } catch (o) {
        if (s)
          return null;
        throw o;
      }
    else {
      if (s)
        return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component)
      throw Error(`Component for ${this.name} has already been provided`);
    if (this.component = e, !!this.shouldAutoInitialize()) {
      if (wn(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: D });
        } catch {
        }
      for (const [n, r] of this.instancesDeferred.entries()) {
        const s = this.normalizeInstanceIdentifier(n);
        try {
          const o = this.getOrInitializeService({
            instanceIdentifier: s
          });
          r.resolve(o);
        } catch {
        }
      }
    }
  }
  clearInstance(e = D) {
    this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((n) => "INTERNAL" in n).map((n) => n.INTERNAL.delete()),
      ...e.filter((n) => "_delete" in n).map((n) => n._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = D) {
    return this.instances.has(e);
  }
  getOptions(e = D) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: n = {} } = e, r = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(r))
      throw Error(`${this.name}(${r}) has already been initialized`);
    if (!this.isComponentSet())
      throw Error(`Component ${this.name} has not been registered yet`);
    const s = this.getOrInitializeService({
      instanceIdentifier: r,
      options: n
    });
    for (const [o, a] of this.instancesDeferred.entries()) {
      const i = this.normalizeInstanceIdentifier(o);
      r === i && a.resolve(s);
    }
    return s;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(e, n) {
    var r;
    const s = this.normalizeInstanceIdentifier(n), o = (r = this.onInitCallbacks.get(s)) !== null && r !== void 0 ? r : /* @__PURE__ */ new Set();
    o.add(e), this.onInitCallbacks.set(s, o);
    const a = this.instances.get(s);
    return a && e(a, s), () => {
      o.delete(e);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(e, n) {
    const r = this.onInitCallbacks.get(n);
    if (r)
      for (const s of r)
        try {
          s(e, n);
        } catch {
        }
  }
  getOrInitializeService({ instanceIdentifier: e, options: n = {} }) {
    let r = this.instances.get(e);
    if (!r && this.component && (r = this.component.instanceFactory(this.container, {
      instanceIdentifier: mn(e),
      options: n
    }), this.instances.set(e, r), this.instancesOptions.set(e, n), this.invokeOnInitCallbacks(r, e), this.component.onInstanceCreated))
      try {
        this.component.onInstanceCreated(this.container, e, r);
      } catch {
      }
    return r || null;
  }
  normalizeInstanceIdentifier(e = D) {
    return this.component ? this.component.multipleInstances ? e : D : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function mn(t) {
  return t === D ? void 0 : t;
}
function wn(t) {
  return t.instantiationMode === "EAGER";
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class bn {
  constructor(e) {
    this.name = e, this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(e) {
    const n = this.getProvider(e.name);
    if (n.isComponentSet())
      throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
    n.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(e) {
    if (this.providers.has(e))
      return this.providers.get(e);
    const n = new gn(e, this);
    return this.providers.set(e, n), n;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var d;
(function(t) {
  t[t.DEBUG = 0] = "DEBUG", t[t.VERBOSE = 1] = "VERBOSE", t[t.INFO = 2] = "INFO", t[t.WARN = 3] = "WARN", t[t.ERROR = 4] = "ERROR", t[t.SILENT = 5] = "SILENT";
})(d || (d = {}));
const yn = {
  debug: d.DEBUG,
  verbose: d.VERBOSE,
  info: d.INFO,
  warn: d.WARN,
  error: d.ERROR,
  silent: d.SILENT
}, _n = d.INFO, En = {
  [d.DEBUG]: "log",
  [d.VERBOSE]: "log",
  [d.INFO]: "info",
  [d.WARN]: "warn",
  [d.ERROR]: "error"
}, In = (t, e, ...n) => {
  if (e < t.logLevel)
    return;
  const r = (/* @__PURE__ */ new Date()).toISOString(), s = En[e];
  if (s)
    console[s](`[${r}]  ${t.name}:`, ...n);
  else
    throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);
};
class Cn {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(e) {
    this.name = e, this._logLevel = _n, this._logHandler = In, this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in d))
      throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(e) {
    this._logLevel = typeof e == "string" ? yn[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != "function")
      throw new TypeError("Value assigned to `logHandler` must be a function");
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...e) {
    this._userLogHandler && this._userLogHandler(this, d.DEBUG, ...e), this._logHandler(this, d.DEBUG, ...e);
  }
  log(...e) {
    this._userLogHandler && this._userLogHandler(this, d.VERBOSE, ...e), this._logHandler(this, d.VERBOSE, ...e);
  }
  info(...e) {
    this._userLogHandler && this._userLogHandler(this, d.INFO, ...e), this._logHandler(this, d.INFO, ...e);
  }
  warn(...e) {
    this._userLogHandler && this._userLogHandler(this, d.WARN, ...e), this._logHandler(this, d.WARN, ...e);
  }
  error(...e) {
    this._userLogHandler && this._userLogHandler(this, d.ERROR, ...e), this._logHandler(this, d.ERROR, ...e);
  }
}
const vn = (t, e) => e.some((n) => t instanceof n);
let He, Ve;
function Tn() {
  return He || (He = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function Sn() {
  return Ve || (Ve = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const wt = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap();
function Rn(t) {
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("success", o), t.removeEventListener("error", a);
    }, o = () => {
      n(v(t.result)), s();
    }, a = () => {
      r(t.error), s();
    };
    t.addEventListener("success", o), t.addEventListener("error", a);
  });
  return e.then((n) => {
    n instanceof IDBCursor && wt.set(n, t);
  }).catch(() => {
  }), De.set(e, t), e;
}
function Dn(t) {
  if (we.has(t))
    return;
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("complete", o), t.removeEventListener("error", a), t.removeEventListener("abort", a);
    }, o = () => {
      n(), s();
    }, a = () => {
      r(t.error || new DOMException("AbortError", "AbortError")), s();
    };
    t.addEventListener("complete", o), t.addEventListener("error", a), t.addEventListener("abort", a);
  });
  we.set(t, e);
}
let be = {
  get(t, e, n) {
    if (t instanceof IDBTransaction) {
      if (e === "done")
        return we.get(t);
      if (e === "objectStoreNames")
        return t.objectStoreNames || bt.get(t);
      if (e === "store")
        return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
    }
    return v(t[e]);
  },
  set(t, e, n) {
    return t[e] = n, !0;
  },
  has(t, e) {
    return t instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in t;
  }
};
function kn(t) {
  be = t(be);
}
function An(t) {
  return t === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...n) {
    const r = t.call(Z(this), e, ...n);
    return bt.set(r, e.sort ? e.sort() : [e]), v(r);
  } : Sn().includes(t) ? function(...e) {
    return t.apply(Z(this), e), v(wt.get(this));
  } : function(...e) {
    return v(t.apply(Z(this), e));
  };
}
function $n(t) {
  return typeof t == "function" ? An(t) : (t instanceof IDBTransaction && Dn(t), vn(t, Tn()) ? new Proxy(t, be) : t);
}
function v(t) {
  if (t instanceof IDBRequest)
    return Rn(t);
  if (X.has(t))
    return X.get(t);
  const e = $n(t);
  return e !== t && (X.set(t, e), De.set(e, t)), e;
}
const Z = (t) => De.get(t);
function Nn(t, e, { blocked: n, upgrade: r, blocking: s, terminated: o } = {}) {
  const a = indexedDB.open(t, e), i = v(a);
  return r && a.addEventListener("upgradeneeded", (c) => {
    r(v(a.result), c.oldVersion, c.newVersion, v(a.transaction), c);
  }), n && a.addEventListener("blocked", (c) => n(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    c.oldVersion,
    c.newVersion,
    c
  )), i.then((c) => {
    o && c.addEventListener("close", () => o()), s && c.addEventListener("versionchange", (l) => s(l.oldVersion, l.newVersion, l));
  }).catch(() => {
  }), i;
}
const On = ["get", "getKey", "getAll", "getAllKeys", "count"], Mn = ["put", "add", "delete", "clear"], ee = /* @__PURE__ */ new Map();
function We(t, e) {
  if (!(t instanceof IDBDatabase && !(e in t) && typeof e == "string"))
    return;
  if (ee.get(e))
    return ee.get(e);
  const n = e.replace(/FromIndex$/, ""), r = e !== n, s = Mn.includes(n);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(s || On.includes(n))
  )
    return;
  const o = async function(a, ...i) {
    const c = this.transaction(a, s ? "readwrite" : "readonly");
    let l = c.store;
    return r && (l = l.index(i.shift())), (await Promise.all([
      l[n](...i),
      s && c.done
    ]))[0];
  };
  return ee.set(e, o), o;
}
kn((t) => ({
  ...t,
  get: (e, n, r) => We(e, n) || t.get(e, n, r),
  has: (e, n) => !!We(e, n) || t.has(e, n)
}));
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ln {
  constructor(e) {
    this.container = e;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    return this.container.getProviders().map((n) => {
      if (Bn(n)) {
        const r = n.getImmediate();
        return `${r.library}/${r.version}`;
      } else
        return null;
    }).filter((n) => n).join(" ");
  }
}
function Bn(t) {
  const e = t.getComponent();
  return (e == null ? void 0 : e.type) === "VERSION";
}
const ye = "@firebase/app", qe = "0.9.18";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const $ = new Cn("@firebase/app"), Pn = "@firebase/app-compat", xn = "@firebase/analytics-compat", Un = "@firebase/analytics", jn = "@firebase/app-check-compat", Fn = "@firebase/app-check", Kn = "@firebase/auth", Hn = "@firebase/auth-compat", Vn = "@firebase/database", Wn = "@firebase/database-compat", qn = "@firebase/functions", Gn = "@firebase/functions-compat", zn = "@firebase/installations", Jn = "@firebase/installations-compat", Yn = "@firebase/messaging", Qn = "@firebase/messaging-compat", Xn = "@firebase/performance", Zn = "@firebase/performance-compat", er = "@firebase/remote-config", tr = "@firebase/remote-config-compat", nr = "@firebase/storage", rr = "@firebase/storage-compat", sr = "@firebase/firestore", or = "@firebase/firestore-compat", ar = "firebase";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _e = "[DEFAULT]", ir = {
  [ye]: "fire-core",
  [Pn]: "fire-core-compat",
  [Un]: "fire-analytics",
  [xn]: "fire-analytics-compat",
  [Fn]: "fire-app-check",
  [jn]: "fire-app-check-compat",
  [Kn]: "fire-auth",
  [Hn]: "fire-auth-compat",
  [Vn]: "fire-rtdb",
  [Wn]: "fire-rtdb-compat",
  [qn]: "fire-fn",
  [Gn]: "fire-fn-compat",
  [zn]: "fire-iid",
  [Jn]: "fire-iid-compat",
  [Yn]: "fire-fcm",
  [Qn]: "fire-fcm-compat",
  [Xn]: "fire-perf",
  [Zn]: "fire-perf-compat",
  [er]: "fire-rc",
  [tr]: "fire-rc-compat",
  [nr]: "fire-gcs",
  [rr]: "fire-gcs-compat",
  [sr]: "fire-fst",
  [or]: "fire-fst-compat",
  "fire-js": "fire-js",
  [ar]: "fire-js-all"
};
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const H = /* @__PURE__ */ new Map(), Ee = /* @__PURE__ */ new Map();
function cr(t, e) {
  try {
    t.container.addComponent(e);
  } catch (n) {
    $.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`, n);
  }
}
function B(t) {
  const e = t.name;
  if (Ee.has(e))
    return $.debug(`There were multiple attempts to register component ${e}.`), !1;
  Ee.set(e, t);
  for (const n of H.values())
    cr(n, t);
  return !0;
}
function ke(t, e) {
  const n = t.container.getProvider("heartbeat").getImmediate({ optional: !0 });
  return n && n.triggerHeartbeat(), t.container.getProvider(e);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ur = {
  "no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
  "bad-app-name": "Illegal App name: '{$appName}",
  "duplicate-app": "Firebase App named '{$appName}' already exists with different options or config",
  "app-deleted": "Firebase App named '{$appName}' already deleted",
  "no-options": "Need to provide options, when not being deployed to hosting via source.",
  "invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  "invalid-log-argument": "First argument to `onLog` must be null or a function.",
  "idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}."
}, T = new z("app", "Firebase", ur);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class lr {
  constructor(e, n, r) {
    this._isDeleted = !1, this._options = Object.assign({}, e), this._config = Object.assign({}, n), this._name = n.name, this._automaticDataCollectionEnabled = n.automaticDataCollectionEnabled, this._container = r, this.container.addComponent(new A(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    return this.checkDestroyed(), this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(e) {
    this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
  }
  get name() {
    return this.checkDestroyed(), this._name;
  }
  get options() {
    return this.checkDestroyed(), this._options;
  }
  get config() {
    return this.checkDestroyed(), this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted)
      throw T.create("app-deleted", { appName: this._name });
  }
}
function yt(t, e = {}) {
  let n = t;
  typeof e != "object" && (e = { name: e });
  const r = Object.assign({ name: _e, automaticDataCollectionEnabled: !1 }, e), s = r.name;
  if (typeof s != "string" || !s)
    throw T.create("bad-app-name", {
      appName: String(s)
    });
  if (n || (n = ft()), !n)
    throw T.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  const o = H.get(s);
  if (o) {
    if (me(n, o.options) && me(r, o.config))
      return o;
    throw T.create("duplicate-app", { appName: s });
  }
  const a = new bn(s);
  for (const c of Ee.values())
    a.addComponent(c);
  const i = new lr(n, r, a);
  return H.set(s, i), i;
}
function hr(t = _e) {
  const e = H.get(t);
  if (!e && t === _e && ft())
    return yt();
  if (!e)
    throw T.create("no-app", { appName: t });
  return e;
}
function L(t, e, n) {
  var r;
  let s = (r = ir[t]) !== null && r !== void 0 ? r : t;
  n && (s += `-${n}`);
  const o = s.match(/\s|\//), a = e.match(/\s|\//);
  if (o || a) {
    const i = [
      `Unable to register library "${s}" with version "${e}":`
    ];
    o && i.push(`library name "${s}" contains illegal characters (whitespace or "/")`), o && a && i.push("and"), a && i.push(`version name "${e}" contains illegal characters (whitespace or "/")`), $.warn(i.join(" "));
    return;
  }
  B(new A(
    `${s}-version`,
    () => ({ library: s, version: e }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const dr = "firebase-heartbeat-database", fr = 1, F = "firebase-heartbeat-store";
let te = null;
function _t() {
  return te || (te = Nn(dr, fr, {
    upgrade: (t, e) => {
      switch (e) {
        case 0:
          t.createObjectStore(F);
      }
    }
  }).catch((t) => {
    throw T.create("idb-open", {
      originalErrorMessage: t.message
    });
  })), te;
}
async function pr(t) {
  try {
    return await (await _t()).transaction(F).objectStore(F).get(Et(t));
  } catch (e) {
    if (e instanceof P)
      $.warn(e.message);
    else {
      const n = T.create("idb-get", {
        originalErrorMessage: e == null ? void 0 : e.message
      });
      $.warn(n.message);
    }
  }
}
async function Ge(t, e) {
  try {
    const r = (await _t()).transaction(F, "readwrite");
    await r.objectStore(F).put(e, Et(t)), await r.done;
  } catch (n) {
    if (n instanceof P)
      $.warn(n.message);
    else {
      const r = T.create("idb-set", {
        originalErrorMessage: n == null ? void 0 : n.message
      });
      $.warn(r.message);
    }
  }
}
function Et(t) {
  return `${t.name}!${t.options.appId}`;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const gr = 1024, mr = 30 * 24 * 60 * 60 * 1e3;
class wr {
  constructor(e) {
    this.container = e, this._heartbeatsCache = null;
    const n = this.container.getProvider("app").getImmediate();
    this._storage = new yr(n), this._heartbeatsCachePromise = this._storage.read().then((r) => (this._heartbeatsCache = r, r));
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    const n = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), r = ze();
    if (this._heartbeatsCache === null && (this._heartbeatsCache = await this._heartbeatsCachePromise), !(this._heartbeatsCache.lastSentHeartbeatDate === r || this._heartbeatsCache.heartbeats.some((s) => s.date === r)))
      return this._heartbeatsCache.heartbeats.push({ date: r, agent: n }), this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter((s) => {
        const o = new Date(s.date).valueOf();
        return Date.now() - o <= mr;
      }), this._storage.overwrite(this._heartbeatsCache);
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, this._heartbeatsCache === null || this._heartbeatsCache.heartbeats.length === 0)
      return "";
    const e = ze(), { heartbeatsToSend: n, unsentEntries: r } = br(this._heartbeatsCache.heartbeats), s = dt(JSON.stringify({ version: 2, heartbeats: n }));
    return this._heartbeatsCache.lastSentHeartbeatDate = e, r.length > 0 ? (this._heartbeatsCache.heartbeats = r, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), s;
  }
}
function ze() {
  return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function br(t, e = gr) {
  const n = [];
  let r = t.slice();
  for (const s of t) {
    const o = n.find((a) => a.agent === s.agent);
    if (o) {
      if (o.dates.push(s.date), Je(n) > e) {
        o.dates.pop();
        break;
      }
    } else if (n.push({
      agent: s.agent,
      dates: [s.date]
    }), Je(n) > e) {
      n.pop();
      break;
    }
    r = r.slice(1);
  }
  return {
    heartbeatsToSend: n,
    unsentEntries: r
  };
}
class yr {
  constructor(e) {
    this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    return pt() ? gt().then(() => !0).catch(() => !1) : !1;
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    return await this._canUseIndexedDBPromise ? await pr(this.app) || { heartbeats: [] } : { heartbeats: [] };
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(e) {
    var n;
    if (await this._canUseIndexedDBPromise) {
      const s = await this.read();
      return Ge(this.app, {
        lastSentHeartbeatDate: (n = e.lastSentHeartbeatDate) !== null && n !== void 0 ? n : s.lastSentHeartbeatDate,
        heartbeats: e.heartbeats
      });
    } else
      return;
  }
  // add heartbeats
  async add(e) {
    var n;
    if (await this._canUseIndexedDBPromise) {
      const s = await this.read();
      return Ge(this.app, {
        lastSentHeartbeatDate: (n = e.lastSentHeartbeatDate) !== null && n !== void 0 ? n : s.lastSentHeartbeatDate,
        heartbeats: [
          ...s.heartbeats,
          ...e.heartbeats
        ]
      });
    } else
      return;
  }
}
function Je(t) {
  return dt(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: t })
  ).length;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _r(t) {
  B(new A(
    "platform-logger",
    (e) => new Ln(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), B(new A(
    "heartbeat",
    (e) => new wr(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), L(ye, qe, t), L(ye, qe, "esm2017"), L("fire-js", "");
}
_r("");
var Er = "firebase", Ir = "10.3.1";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
L(Er, Ir, "app");
const Cr = (t, e) => e.some((n) => t instanceof n);
let Ye, Qe;
function vr() {
  return Ye || (Ye = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function Tr() {
  return Qe || (Qe = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const It = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new WeakMap(), Ct = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap(), Ae = /* @__PURE__ */ new WeakMap();
function Sr(t) {
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("success", o), t.removeEventListener("error", a);
    }, o = () => {
      n(S(t.result)), s();
    }, a = () => {
      r(t.error), s();
    };
    t.addEventListener("success", o), t.addEventListener("error", a);
  });
  return e.then((n) => {
    n instanceof IDBCursor && It.set(n, t);
  }).catch(() => {
  }), Ae.set(e, t), e;
}
function Rr(t) {
  if (Ie.has(t))
    return;
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("complete", o), t.removeEventListener("error", a), t.removeEventListener("abort", a);
    }, o = () => {
      n(), s();
    }, a = () => {
      r(t.error || new DOMException("AbortError", "AbortError")), s();
    };
    t.addEventListener("complete", o), t.addEventListener("error", a), t.addEventListener("abort", a);
  });
  Ie.set(t, e);
}
let Ce = {
  get(t, e, n) {
    if (t instanceof IDBTransaction) {
      if (e === "done")
        return Ie.get(t);
      if (e === "objectStoreNames")
        return t.objectStoreNames || Ct.get(t);
      if (e === "store")
        return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
    }
    return S(t[e]);
  },
  set(t, e, n) {
    return t[e] = n, !0;
  },
  has(t, e) {
    return t instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in t;
  }
};
function Dr(t) {
  Ce = t(Ce);
}
function kr(t) {
  return t === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...n) {
    const r = t.call(re(this), e, ...n);
    return Ct.set(r, e.sort ? e.sort() : [e]), S(r);
  } : Tr().includes(t) ? function(...e) {
    return t.apply(re(this), e), S(It.get(this));
  } : function(...e) {
    return S(t.apply(re(this), e));
  };
}
function Ar(t) {
  return typeof t == "function" ? kr(t) : (t instanceof IDBTransaction && Rr(t), Cr(t, vr()) ? new Proxy(t, Ce) : t);
}
function S(t) {
  if (t instanceof IDBRequest)
    return Sr(t);
  if (ne.has(t))
    return ne.get(t);
  const e = Ar(t);
  return e !== t && (ne.set(t, e), Ae.set(e, t)), e;
}
const re = (t) => Ae.get(t);
function $r(t, e, { blocked: n, upgrade: r, blocking: s, terminated: o } = {}) {
  const a = indexedDB.open(t, e), i = S(a);
  return r && a.addEventListener("upgradeneeded", (c) => {
    r(S(a.result), c.oldVersion, c.newVersion, S(a.transaction));
  }), n && a.addEventListener("blocked", () => n()), i.then((c) => {
    o && c.addEventListener("close", () => o()), s && c.addEventListener("versionchange", () => s());
  }).catch(() => {
  }), i;
}
const Nr = ["get", "getKey", "getAll", "getAllKeys", "count"], Or = ["put", "add", "delete", "clear"], se = /* @__PURE__ */ new Map();
function Xe(t, e) {
  if (!(t instanceof IDBDatabase && !(e in t) && typeof e == "string"))
    return;
  if (se.get(e))
    return se.get(e);
  const n = e.replace(/FromIndex$/, ""), r = e !== n, s = Or.includes(n);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(s || Nr.includes(n))
  )
    return;
  const o = async function(a, ...i) {
    const c = this.transaction(a, s ? "readwrite" : "readonly");
    let l = c.store;
    return r && (l = l.index(i.shift())), (await Promise.all([
      l[n](...i),
      s && c.done
    ]))[0];
  };
  return se.set(e, o), o;
}
Dr((t) => ({
  ...t,
  get: (e, n, r) => Xe(e, n) || t.get(e, n, r),
  has: (e, n) => !!Xe(e, n) || t.has(e, n)
}));
const vt = "@firebase/installations", $e = "0.6.4";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Tt = 1e4, St = `w:${$e}`, Rt = "FIS_v2", Mr = "https://firebaseinstallations.googleapis.com/v1", Lr = 60 * 60 * 1e3, Br = "installations", Pr = "Installations";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const xr = {
  "missing-app-config-values": 'Missing App configuration value: "{$valueName}"',
  "not-registered": "Firebase Installation is not registered.",
  "installation-not-found": "Firebase Installation not found.",
  "request-failed": '{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',
  "app-offline": "Could not process request. Application offline.",
  "delete-pending-registration": "Can't delete installation while there is a pending registration request."
}, N = new z(Br, Pr, xr);
function Dt(t) {
  return t instanceof P && t.code.includes(
    "request-failed"
    /* ErrorCode.REQUEST_FAILED */
  );
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function kt({ projectId: t }) {
  return `${Mr}/projects/${t}/installations`;
}
function At(t) {
  return {
    token: t.token,
    requestStatus: 2,
    expiresIn: jr(t.expiresIn),
    creationTime: Date.now()
  };
}
async function $t(t, e) {
  const r = (await e.json()).error;
  return N.create("request-failed", {
    requestName: t,
    serverCode: r.code,
    serverMessage: r.message,
    serverStatus: r.status
  });
}
function Nt({ apiKey: t }) {
  return new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-goog-api-key": t
  });
}
function Ur(t, { refreshToken: e }) {
  const n = Nt(t);
  return n.append("Authorization", Fr(e)), n;
}
async function Ot(t) {
  const e = await t();
  return e.status >= 500 && e.status < 600 ? t() : e;
}
function jr(t) {
  return Number(t.replace("s", "000"));
}
function Fr(t) {
  return `${Rt} ${t}`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Kr({ appConfig: t, heartbeatServiceProvider: e }, { fid: n }) {
  const r = kt(t), s = Nt(t), o = e.getImmediate({
    optional: !0
  });
  if (o) {
    const l = await o.getHeartbeatsHeader();
    l && s.append("x-firebase-client", l);
  }
  const a = {
    fid: n,
    authVersion: Rt,
    appId: t.appId,
    sdkVersion: St
  }, i = {
    method: "POST",
    headers: s,
    body: JSON.stringify(a)
  }, c = await Ot(() => fetch(r, i));
  if (c.ok) {
    const l = await c.json();
    return {
      fid: l.fid || n,
      registrationStatus: 2,
      refreshToken: l.refreshToken,
      authToken: At(l.authToken)
    };
  } else
    throw await $t("Create Installation", c);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Mt(t) {
  return new Promise((e) => {
    setTimeout(e, t);
  });
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Hr(t) {
  return btoa(String.fromCharCode(...t)).replace(/\+/g, "-").replace(/\//g, "_");
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Vr = /^[cdef][\w-]{21}$/, ve = "";
function Wr() {
  try {
    const t = new Uint8Array(17);
    (self.crypto || self.msCrypto).getRandomValues(t), t[0] = 112 + t[0] % 16;
    const n = qr(t);
    return Vr.test(n) ? n : ve;
  } catch {
    return ve;
  }
}
function qr(t) {
  return Hr(t).substr(0, 22);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function J(t) {
  return `${t.appName}!${t.appId}`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Lt = /* @__PURE__ */ new Map();
function Bt(t, e) {
  const n = J(t);
  Pt(n, e), Gr(n, e);
}
function Pt(t, e) {
  const n = Lt.get(t);
  if (n)
    for (const r of n)
      r(e);
}
function Gr(t, e) {
  const n = zr();
  n && n.postMessage({ key: t, fid: e }), Jr();
}
let k = null;
function zr() {
  return !k && "BroadcastChannel" in self && (k = new BroadcastChannel("[Firebase] FID Change"), k.onmessage = (t) => {
    Pt(t.data.key, t.data.fid);
  }), k;
}
function Jr() {
  Lt.size === 0 && k && (k.close(), k = null);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Yr = "firebase-installations-database", Qr = 1, O = "firebase-installations-store";
let oe = null;
function Ne() {
  return oe || (oe = $r(Yr, Qr, {
    upgrade: (t, e) => {
      switch (e) {
        case 0:
          t.createObjectStore(O);
      }
    }
  })), oe;
}
async function V(t, e) {
  const n = J(t), s = (await Ne()).transaction(O, "readwrite"), o = s.objectStore(O), a = await o.get(n);
  return await o.put(e, n), await s.done, (!a || a.fid !== e.fid) && Bt(t, e.fid), e;
}
async function xt(t) {
  const e = J(t), r = (await Ne()).transaction(O, "readwrite");
  await r.objectStore(O).delete(e), await r.done;
}
async function Y(t, e) {
  const n = J(t), s = (await Ne()).transaction(O, "readwrite"), o = s.objectStore(O), a = await o.get(n), i = e(a);
  return i === void 0 ? await o.delete(n) : await o.put(i, n), await s.done, i && (!a || a.fid !== i.fid) && Bt(t, i.fid), i;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Oe(t) {
  let e;
  const n = await Y(t.appConfig, (r) => {
    const s = Xr(r), o = Zr(t, s);
    return e = o.registrationPromise, o.installationEntry;
  });
  return n.fid === ve ? { installationEntry: await e } : {
    installationEntry: n,
    registrationPromise: e
  };
}
function Xr(t) {
  const e = t || {
    fid: Wr(),
    registrationStatus: 0
    /* RequestStatus.NOT_STARTED */
  };
  return Ut(e);
}
function Zr(t, e) {
  if (e.registrationStatus === 0) {
    if (!navigator.onLine) {
      const s = Promise.reject(N.create(
        "app-offline"
        /* ErrorCode.APP_OFFLINE */
      ));
      return {
        installationEntry: e,
        registrationPromise: s
      };
    }
    const n = {
      fid: e.fid,
      registrationStatus: 1,
      registrationTime: Date.now()
    }, r = es(t, n);
    return { installationEntry: n, registrationPromise: r };
  } else
    return e.registrationStatus === 1 ? {
      installationEntry: e,
      registrationPromise: ts(t)
    } : { installationEntry: e };
}
async function es(t, e) {
  try {
    const n = await Kr(t, e);
    return V(t.appConfig, n);
  } catch (n) {
    throw Dt(n) && n.customData.serverCode === 409 ? await xt(t.appConfig) : await V(t.appConfig, {
      fid: e.fid,
      registrationStatus: 0
      /* RequestStatus.NOT_STARTED */
    }), n;
  }
}
async function ts(t) {
  let e = await Ze(t.appConfig);
  for (; e.registrationStatus === 1; )
    await Mt(100), e = await Ze(t.appConfig);
  if (e.registrationStatus === 0) {
    const { installationEntry: n, registrationPromise: r } = await Oe(t);
    return r || n;
  }
  return e;
}
function Ze(t) {
  return Y(t, (e) => {
    if (!e)
      throw N.create(
        "installation-not-found"
        /* ErrorCode.INSTALLATION_NOT_FOUND */
      );
    return Ut(e);
  });
}
function Ut(t) {
  return ns(t) ? {
    fid: t.fid,
    registrationStatus: 0
    /* RequestStatus.NOT_STARTED */
  } : t;
}
function ns(t) {
  return t.registrationStatus === 1 && t.registrationTime + Tt < Date.now();
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function rs({ appConfig: t, heartbeatServiceProvider: e }, n) {
  const r = ss(t, n), s = Ur(t, n), o = e.getImmediate({
    optional: !0
  });
  if (o) {
    const l = await o.getHeartbeatsHeader();
    l && s.append("x-firebase-client", l);
  }
  const a = {
    installation: {
      sdkVersion: St,
      appId: t.appId
    }
  }, i = {
    method: "POST",
    headers: s,
    body: JSON.stringify(a)
  }, c = await Ot(() => fetch(r, i));
  if (c.ok) {
    const l = await c.json();
    return At(l);
  } else
    throw await $t("Generate Auth Token", c);
}
function ss(t, { fid: e }) {
  return `${kt(t)}/${e}/authTokens:generate`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Me(t, e = !1) {
  let n;
  const r = await Y(t.appConfig, (o) => {
    if (!jt(o))
      throw N.create(
        "not-registered"
        /* ErrorCode.NOT_REGISTERED */
      );
    const a = o.authToken;
    if (!e && is(a))
      return o;
    if (a.requestStatus === 1)
      return n = os(t, e), o;
    {
      if (!navigator.onLine)
        throw N.create(
          "app-offline"
          /* ErrorCode.APP_OFFLINE */
        );
      const i = us(o);
      return n = as(t, i), i;
    }
  });
  return n ? await n : r.authToken;
}
async function os(t, e) {
  let n = await et(t.appConfig);
  for (; n.authToken.requestStatus === 1; )
    await Mt(100), n = await et(t.appConfig);
  const r = n.authToken;
  return r.requestStatus === 0 ? Me(t, e) : r;
}
function et(t) {
  return Y(t, (e) => {
    if (!jt(e))
      throw N.create(
        "not-registered"
        /* ErrorCode.NOT_REGISTERED */
      );
    const n = e.authToken;
    return ls(n) ? Object.assign(Object.assign({}, e), { authToken: {
      requestStatus: 0
      /* RequestStatus.NOT_STARTED */
    } }) : e;
  });
}
async function as(t, e) {
  try {
    const n = await rs(t, e), r = Object.assign(Object.assign({}, e), { authToken: n });
    return await V(t.appConfig, r), n;
  } catch (n) {
    if (Dt(n) && (n.customData.serverCode === 401 || n.customData.serverCode === 404))
      await xt(t.appConfig);
    else {
      const r = Object.assign(Object.assign({}, e), { authToken: {
        requestStatus: 0
        /* RequestStatus.NOT_STARTED */
      } });
      await V(t.appConfig, r);
    }
    throw n;
  }
}
function jt(t) {
  return t !== void 0 && t.registrationStatus === 2;
}
function is(t) {
  return t.requestStatus === 2 && !cs(t);
}
function cs(t) {
  const e = Date.now();
  return e < t.creationTime || t.creationTime + t.expiresIn < e + Lr;
}
function us(t) {
  const e = {
    requestStatus: 1,
    requestTime: Date.now()
  };
  return Object.assign(Object.assign({}, t), { authToken: e });
}
function ls(t) {
  return t.requestStatus === 1 && t.requestTime + Tt < Date.now();
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function hs(t) {
  const e = t, { installationEntry: n, registrationPromise: r } = await Oe(e);
  return r ? r.catch(console.error) : Me(e).catch(console.error), n.fid;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function ds(t, e = !1) {
  const n = t;
  return await fs(n), (await Me(n, e)).token;
}
async function fs(t) {
  const { registrationPromise: e } = await Oe(t);
  e && await e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ps(t) {
  if (!t || !t.options)
    throw ae("App Configuration");
  if (!t.name)
    throw ae("App Name");
  const e = [
    "projectId",
    "apiKey",
    "appId"
  ];
  for (const n of e)
    if (!t.options[n])
      throw ae(n);
  return {
    appName: t.name,
    projectId: t.options.projectId,
    apiKey: t.options.apiKey,
    appId: t.options.appId
  };
}
function ae(t) {
  return N.create("missing-app-config-values", {
    valueName: t
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ft = "installations", gs = "installations-internal", ms = (t) => {
  const e = t.getProvider("app").getImmediate(), n = ps(e), r = ke(e, "heartbeat");
  return {
    app: e,
    appConfig: n,
    heartbeatServiceProvider: r,
    _delete: () => Promise.resolve()
  };
}, ws = (t) => {
  const e = t.getProvider("app").getImmediate(), n = ke(e, Ft).getImmediate();
  return {
    getId: () => hs(n),
    getToken: (s) => ds(n, s)
  };
};
function bs() {
  B(new A(
    Ft,
    ms,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  )), B(new A(
    gs,
    ws,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
}
bs();
L(vt, $e);
L(vt, $e, "esm2017");
const ys = (t, e) => e.some((n) => t instanceof n);
let tt, nt;
function _s() {
  return tt || (tt = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function Es() {
  return nt || (nt = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const Kt = /* @__PURE__ */ new WeakMap(), Te = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakMap(), Le = /* @__PURE__ */ new WeakMap();
function Is(t) {
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("success", o), t.removeEventListener("error", a);
    }, o = () => {
      n(I(t.result)), s();
    }, a = () => {
      r(t.error), s();
    };
    t.addEventListener("success", o), t.addEventListener("error", a);
  });
  return e.then((n) => {
    n instanceof IDBCursor && Kt.set(n, t);
  }).catch(() => {
  }), Le.set(e, t), e;
}
function Cs(t) {
  if (Te.has(t))
    return;
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("complete", o), t.removeEventListener("error", a), t.removeEventListener("abort", a);
    }, o = () => {
      n(), s();
    }, a = () => {
      r(t.error || new DOMException("AbortError", "AbortError")), s();
    };
    t.addEventListener("complete", o), t.addEventListener("error", a), t.addEventListener("abort", a);
  });
  Te.set(t, e);
}
let Se = {
  get(t, e, n) {
    if (t instanceof IDBTransaction) {
      if (e === "done")
        return Te.get(t);
      if (e === "objectStoreNames")
        return t.objectStoreNames || Ht.get(t);
      if (e === "store")
        return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
    }
    return I(t[e]);
  },
  set(t, e, n) {
    return t[e] = n, !0;
  },
  has(t, e) {
    return t instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in t;
  }
};
function vs(t) {
  Se = t(Se);
}
function Ts(t) {
  return t === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...n) {
    const r = t.call(ce(this), e, ...n);
    return Ht.set(r, e.sort ? e.sort() : [e]), I(r);
  } : Es().includes(t) ? function(...e) {
    return t.apply(ce(this), e), I(Kt.get(this));
  } : function(...e) {
    return I(t.apply(ce(this), e));
  };
}
function Ss(t) {
  return typeof t == "function" ? Ts(t) : (t instanceof IDBTransaction && Cs(t), ys(t, _s()) ? new Proxy(t, Se) : t);
}
function I(t) {
  if (t instanceof IDBRequest)
    return Is(t);
  if (ie.has(t))
    return ie.get(t);
  const e = Ss(t);
  return e !== t && (ie.set(t, e), Le.set(e, t)), e;
}
const ce = (t) => Le.get(t);
function Vt(t, e, { blocked: n, upgrade: r, blocking: s, terminated: o } = {}) {
  const a = indexedDB.open(t, e), i = I(a);
  return r && a.addEventListener("upgradeneeded", (c) => {
    r(I(a.result), c.oldVersion, c.newVersion, I(a.transaction));
  }), n && a.addEventListener("blocked", () => n()), i.then((c) => {
    o && c.addEventListener("close", () => o()), s && c.addEventListener("versionchange", () => s());
  }).catch(() => {
  }), i;
}
function ue(t, { blocked: e } = {}) {
  const n = indexedDB.deleteDatabase(t);
  return e && n.addEventListener("blocked", () => e()), I(n).then(() => {
  });
}
const Rs = ["get", "getKey", "getAll", "getAllKeys", "count"], Ds = ["put", "add", "delete", "clear"], le = /* @__PURE__ */ new Map();
function rt(t, e) {
  if (!(t instanceof IDBDatabase && !(e in t) && typeof e == "string"))
    return;
  if (le.get(e))
    return le.get(e);
  const n = e.replace(/FromIndex$/, ""), r = e !== n, s = Ds.includes(n);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(s || Rs.includes(n))
  )
    return;
  const o = async function(a, ...i) {
    const c = this.transaction(a, s ? "readwrite" : "readonly");
    let l = c.store;
    return r && (l = l.index(i.shift())), (await Promise.all([
      l[n](...i),
      s && c.done
    ]))[0];
  };
  return le.set(e, o), o;
}
vs((t) => ({
  ...t,
  get: (e, n, r) => rt(e, n) || t.get(e, n, r),
  has: (e, n) => !!rt(e, n) || t.has(e, n)
}));
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Wt = "BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4", ks = "https://fcmregistrations.googleapis.com/v1", qt = "FCM_MSG", As = "google.c.a.c_id", $s = 3, Ns = 1;
var W;
(function(t) {
  t[t.DATA_MESSAGE = 1] = "DATA_MESSAGE", t[t.DISPLAY_NOTIFICATION = 3] = "DISPLAY_NOTIFICATION";
})(W || (W = {}));
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
var q;
(function(t) {
  t.PUSH_RECEIVED = "push-received", t.NOTIFICATION_CLICKED = "notification-clicked";
})(q || (q = {}));
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function y(t) {
  const e = new Uint8Array(t);
  return btoa(String.fromCharCode(...e)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function Os(t) {
  const e = "=".repeat((4 - t.length % 4) % 4), n = (t + e).replace(/\-/g, "+").replace(/_/g, "/"), r = atob(n), s = new Uint8Array(r.length);
  for (let o = 0; o < r.length; ++o)
    s[o] = r.charCodeAt(o);
  return s;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const he = "fcm_token_details_db", Ms = 5, st = "fcm_token_object_Store";
async function Ls(t) {
  if ("databases" in indexedDB && !(await indexedDB.databases()).map((o) => o.name).includes(he))
    return null;
  let e = null;
  return (await Vt(he, Ms, {
    upgrade: async (r, s, o, a) => {
      var i;
      if (s < 2 || !r.objectStoreNames.contains(st))
        return;
      const c = a.objectStore(st), l = await c.index("fcmSenderId").get(t);
      if (await c.clear(), !!l) {
        if (s === 2) {
          const h = l;
          if (!h.auth || !h.p256dh || !h.endpoint)
            return;
          e = {
            token: h.fcmToken,
            createTime: (i = h.createTime) !== null && i !== void 0 ? i : Date.now(),
            subscriptionOptions: {
              auth: h.auth,
              p256dh: h.p256dh,
              endpoint: h.endpoint,
              swScope: h.swScope,
              vapidKey: typeof h.vapidKey == "string" ? h.vapidKey : y(h.vapidKey)
            }
          };
        } else if (s === 3) {
          const h = l;
          e = {
            token: h.fcmToken,
            createTime: h.createTime,
            subscriptionOptions: {
              auth: y(h.auth),
              p256dh: y(h.p256dh),
              endpoint: h.endpoint,
              swScope: h.swScope,
              vapidKey: y(h.vapidKey)
            }
          };
        } else if (s === 4) {
          const h = l;
          e = {
            token: h.fcmToken,
            createTime: h.createTime,
            subscriptionOptions: {
              auth: y(h.auth),
              p256dh: y(h.p256dh),
              endpoint: h.endpoint,
              swScope: h.swScope,
              vapidKey: y(h.vapidKey)
            }
          };
        }
      }
    }
  })).close(), await ue(he), await ue("fcm_vapid_details_db"), await ue("undefined"), Bs(e) ? e : null;
}
function Bs(t) {
  if (!t || !t.subscriptionOptions)
    return !1;
  const { subscriptionOptions: e } = t;
  return typeof t.createTime == "number" && t.createTime > 0 && typeof t.token == "string" && t.token.length > 0 && typeof e.auth == "string" && e.auth.length > 0 && typeof e.p256dh == "string" && e.p256dh.length > 0 && typeof e.endpoint == "string" && e.endpoint.length > 0 && typeof e.swScope == "string" && e.swScope.length > 0 && typeof e.vapidKey == "string" && e.vapidKey.length > 0;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ps = "firebase-messaging-database", xs = 1, M = "firebase-messaging-store";
let de = null;
function Be() {
  return de || (de = Vt(Ps, xs, {
    upgrade: (t, e) => {
      switch (e) {
        case 0:
          t.createObjectStore(M);
      }
    }
  })), de;
}
async function Pe(t) {
  const e = Ue(t), r = await (await Be()).transaction(M).objectStore(M).get(e);
  if (r)
    return r;
  {
    const s = await Ls(t.appConfig.senderId);
    if (s)
      return await xe(t, s), s;
  }
}
async function xe(t, e) {
  const n = Ue(t), s = (await Be()).transaction(M, "readwrite");
  return await s.objectStore(M).put(e, n), await s.done, e;
}
async function Us(t) {
  const e = Ue(t), r = (await Be()).transaction(M, "readwrite");
  await r.objectStore(M).delete(e), await r.done;
}
function Ue({ appConfig: t }) {
  return t.appId;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const js = {
  "missing-app-config-values": 'Missing App configuration value: "{$valueName}"',
  "only-available-in-window": "This method is available in a Window context.",
  "only-available-in-sw": "This method is available in a service worker context.",
  "permission-default": "The notification permission was not granted and dismissed instead.",
  "permission-blocked": "The notification permission was not granted and blocked instead.",
  "unsupported-browser": "This browser doesn't support the API's required to use the Firebase SDK.",
  "indexed-db-unsupported": "This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)",
  "failed-service-worker-registration": "We are unable to register the default service worker. {$browserErrorMessage}",
  "token-subscribe-failed": "A problem occurred while subscribing the user to FCM: {$errorInfo}",
  "token-subscribe-no-token": "FCM returned no token when subscribing the user to push.",
  "token-unsubscribe-failed": "A problem occurred while unsubscribing the user from FCM: {$errorInfo}",
  "token-update-failed": "A problem occurred while updating the user from FCM: {$errorInfo}",
  "token-update-no-token": "FCM returned no token when updating the user to push.",
  "use-sw-after-get-token": "The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.",
  "invalid-sw-registration": "The input to useServiceWorker() must be a ServiceWorkerRegistration.",
  "invalid-bg-handler": "The input to setBackgroundMessageHandler() must be a function.",
  "invalid-vapid-key": "The public VAPID key must be a string.",
  "use-vapid-key-after-get-token": "The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."
}, b = new z("messaging", "Messaging", js);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Fs(t, e) {
  const n = await Fe(t), r = zt(e), s = {
    method: "POST",
    headers: n,
    body: JSON.stringify(r)
  };
  let o;
  try {
    o = await (await fetch(je(t.appConfig), s)).json();
  } catch (a) {
    throw b.create("token-subscribe-failed", {
      errorInfo: a == null ? void 0 : a.toString()
    });
  }
  if (o.error) {
    const a = o.error.message;
    throw b.create("token-subscribe-failed", {
      errorInfo: a
    });
  }
  if (!o.token)
    throw b.create(
      "token-subscribe-no-token"
      /* ErrorCode.TOKEN_SUBSCRIBE_NO_TOKEN */
    );
  return o.token;
}
async function Ks(t, e) {
  const n = await Fe(t), r = zt(e.subscriptionOptions), s = {
    method: "PATCH",
    headers: n,
    body: JSON.stringify(r)
  };
  let o;
  try {
    o = await (await fetch(`${je(t.appConfig)}/${e.token}`, s)).json();
  } catch (a) {
    throw b.create("token-update-failed", {
      errorInfo: a == null ? void 0 : a.toString()
    });
  }
  if (o.error) {
    const a = o.error.message;
    throw b.create("token-update-failed", {
      errorInfo: a
    });
  }
  if (!o.token)
    throw b.create(
      "token-update-no-token"
      /* ErrorCode.TOKEN_UPDATE_NO_TOKEN */
    );
  return o.token;
}
async function Gt(t, e) {
  const r = {
    method: "DELETE",
    headers: await Fe(t)
  };
  try {
    const o = await (await fetch(`${je(t.appConfig)}/${e}`, r)).json();
    if (o.error) {
      const a = o.error.message;
      throw b.create("token-unsubscribe-failed", {
        errorInfo: a
      });
    }
  } catch (s) {
    throw b.create("token-unsubscribe-failed", {
      errorInfo: s == null ? void 0 : s.toString()
    });
  }
}
function je({ projectId: t }) {
  return `${ks}/projects/${t}/registrations`;
}
async function Fe({ appConfig: t, installations: e }) {
  const n = await e.getToken();
  return new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-goog-api-key": t.apiKey,
    "x-goog-firebase-installations-auth": `FIS ${n}`
  });
}
function zt({ p256dh: t, auth: e, endpoint: n, vapidKey: r }) {
  const s = {
    web: {
      endpoint: n,
      auth: e,
      p256dh: t
    }
  };
  return r !== Wt && (s.web.applicationPubKey = r), s;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Hs = 7 * 24 * 60 * 60 * 1e3;
async function Vs(t) {
  const e = await qs(t.swRegistration, t.vapidKey), n = {
    vapidKey: t.vapidKey,
    swScope: t.swRegistration.scope,
    endpoint: e.endpoint,
    auth: y(e.getKey("auth")),
    p256dh: y(e.getKey("p256dh"))
  }, r = await Pe(t.firebaseDependencies);
  if (r) {
    if (Gs(r.subscriptionOptions, n))
      return Date.now() >= r.createTime + Hs ? Ws(t, {
        token: r.token,
        createTime: Date.now(),
        subscriptionOptions: n
      }) : r.token;
    try {
      await Gt(t.firebaseDependencies, r.token);
    } catch (s) {
      console.warn(s);
    }
    return ot(t.firebaseDependencies, n);
  } else
    return ot(t.firebaseDependencies, n);
}
async function Re(t) {
  const e = await Pe(t.firebaseDependencies);
  e && (await Gt(t.firebaseDependencies, e.token), await Us(t.firebaseDependencies));
  const n = await t.swRegistration.pushManager.getSubscription();
  return n ? n.unsubscribe() : !0;
}
async function Ws(t, e) {
  try {
    const n = await Ks(t.firebaseDependencies, e), r = Object.assign(Object.assign({}, e), { token: n, createTime: Date.now() });
    return await xe(t.firebaseDependencies, r), n;
  } catch (n) {
    throw await Re(t), n;
  }
}
async function ot(t, e) {
  const r = {
    token: await Fs(t, e),
    createTime: Date.now(),
    subscriptionOptions: e
  };
  return await xe(t, r), r.token;
}
async function qs(t, e) {
  const n = await t.pushManager.getSubscription();
  return n || t.pushManager.subscribe({
    userVisibleOnly: !0,
    // Chrome <= 75 doesn't support base64-encoded VAPID key. For backward compatibility, VAPID key
    // submitted to pushManager#subscribe must be of type Uint8Array.
    applicationServerKey: Os(e)
  });
}
function Gs(t, e) {
  const n = e.vapidKey === t.vapidKey, r = e.endpoint === t.endpoint, s = e.auth === t.auth, o = e.p256dh === t.p256dh;
  return n && r && s && o;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function zs(t) {
  const e = {
    from: t.from,
    // eslint-disable-next-line camelcase
    collapseKey: t.collapse_key,
    // eslint-disable-next-line camelcase
    messageId: t.fcmMessageId
  };
  return Js(e, t), Ys(e, t), Qs(e, t), e;
}
function Js(t, e) {
  if (!e.notification)
    return;
  t.notification = {};
  const n = e.notification.title;
  n && (t.notification.title = n);
  const r = e.notification.body;
  r && (t.notification.body = r);
  const s = e.notification.image;
  s && (t.notification.image = s);
  const o = e.notification.icon;
  o && (t.notification.icon = o);
}
function Ys(t, e) {
  e.data && (t.data = e.data);
}
function Qs(t, e) {
  var n, r, s, o, a;
  if (!e.fcmOptions && !(!((n = e.notification) === null || n === void 0) && n.click_action))
    return;
  t.fcmOptions = {};
  const i = (s = (r = e.fcmOptions) === null || r === void 0 ? void 0 : r.link) !== null && s !== void 0 ? s : (o = e.notification) === null || o === void 0 ? void 0 : o.click_action;
  i && (t.fcmOptions.link = i);
  const c = (a = e.fcmOptions) === null || a === void 0 ? void 0 : a.analytics_label;
  c && (t.fcmOptions.analyticsLabel = c);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Xs(t) {
  return typeof t == "object" && !!t && As in t;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Zs(t) {
  return new Promise((e) => {
    setTimeout(e, t);
  });
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Jt("hts/frbslgigp.ogepscmv/ieo/eaylg", "tp:/ieaeogn-agolai.o/1frlglgc/o");
Jt("AzSCbw63g1R0nCw85jG8", "Iaya3yLKwmgvh7cF0q4");
async function eo(t, e) {
  const n = to(e, await t.firebaseDependencies.installations.getId());
  no(t, n);
}
function to(t, e) {
  var n, r;
  const s = {};
  return t.from && (s.project_number = t.from), t.fcmMessageId && (s.message_id = t.fcmMessageId), s.instance_id = e, t.notification ? s.message_type = W.DISPLAY_NOTIFICATION.toString() : s.message_type = W.DATA_MESSAGE.toString(), s.sdk_platform = $s.toString(), s.package_name = self.origin.replace(/(^\w+:|^)\/\//, ""), t.collapse_key && (s.collapse_key = t.collapse_key), s.event = Ns.toString(), !((n = t.fcmOptions) === null || n === void 0) && n.analytics_label && (s.analytics_label = (r = t.fcmOptions) === null || r === void 0 ? void 0 : r.analytics_label), s;
}
function no(t, e) {
  const n = {};
  n.event_time_ms = Math.floor(Date.now()).toString(), n.source_extension_json_proto3 = JSON.stringify(e), t.logEvents.push(n);
}
function Jt(t, e) {
  const n = [];
  for (let r = 0; r < t.length; r++)
    n.push(t.charAt(r)), r < e.length && n.push(e.charAt(r));
  return n.join("");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function ro(t, e) {
  var n, r;
  const { newSubscription: s } = t;
  if (!s) {
    await Re(e);
    return;
  }
  const o = await Pe(e.firebaseDependencies);
  await Re(e), e.vapidKey = (r = (n = o == null ? void 0 : o.subscriptionOptions) === null || n === void 0 ? void 0 : n.vapidKey) !== null && r !== void 0 ? r : Wt, await Vs(e);
}
async function so(t, e) {
  const n = io(t);
  if (!n)
    return;
  e.deliveryMetricsExportedToBigQueryEnabled && await eo(e, n);
  const r = await Yt();
  if (uo(r))
    return lo(r, n);
  if (n.notification && await ho(ao(n)), !!e && e.onBackgroundMessageHandler) {
    const s = zs(n);
    typeof e.onBackgroundMessageHandler == "function" ? await e.onBackgroundMessageHandler(s) : e.onBackgroundMessageHandler.next(s);
  }
}
async function oo(t) {
  var e, n;
  const r = (n = (e = t.notification) === null || e === void 0 ? void 0 : e.data) === null || n === void 0 ? void 0 : n[qt];
  if (r) {
    if (t.action)
      return;
  } else
    return;
  t.stopImmediatePropagation(), t.notification.close();
  const s = fo(r);
  if (!s)
    return;
  const o = new URL(s, self.location.href), a = new URL(self.location.origin);
  if (o.host !== a.host)
    return;
  let i = await co(o);
  if (i ? i = await i.focus() : (i = await self.clients.openWindow(s), await Zs(3e3)), !!i)
    return r.messageType = q.NOTIFICATION_CLICKED, r.isFirebaseMessaging = !0, i.postMessage(r);
}
function ao(t) {
  const e = Object.assign({}, t.notification);
  return e.data = {
    [qt]: t
  }, e;
}
function io({ data: t }) {
  if (!t)
    return null;
  try {
    return t.json();
  } catch {
    return null;
  }
}
async function co(t) {
  const e = await Yt();
  for (const n of e) {
    const r = new URL(n.url, self.location.href);
    if (t.host === r.host)
      return n;
  }
  return null;
}
function uo(t) {
  return t.some((e) => e.visibilityState === "visible" && // Ignore chrome-extension clients as that matches the background pages of extensions, which
  // are always considered visible for some reason.
  !e.url.startsWith("chrome-extension://"));
}
function lo(t, e) {
  e.isFirebaseMessaging = !0, e.messageType = q.PUSH_RECEIVED;
  for (const n of t)
    n.postMessage(e);
}
function Yt() {
  return self.clients.matchAll({
    type: "window",
    includeUncontrolled: !0
    // TS doesn't know that "type: 'window'" means it'll return WindowClient[]
  });
}
function ho(t) {
  var e;
  const { actions: n } = t, { maxActions: r } = Notification;
  return n && r && n.length > r && console.warn(`This browser only supports ${r} actions. The remaining actions will not be displayed.`), self.registration.showNotification(
    /* title= */
    (e = t.title) !== null && e !== void 0 ? e : "",
    t
  );
}
function fo(t) {
  var e, n, r;
  const s = (n = (e = t.fcmOptions) === null || e === void 0 ? void 0 : e.link) !== null && n !== void 0 ? n : (r = t.notification) === null || r === void 0 ? void 0 : r.click_action;
  return s || (Xs(t.data) ? self.location.origin : null);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function po(t) {
  if (!t || !t.options)
    throw fe("App Configuration Object");
  if (!t.name)
    throw fe("App Name");
  const e = [
    "projectId",
    "apiKey",
    "appId",
    "messagingSenderId"
  ], { options: n } = t;
  for (const r of e)
    if (!n[r])
      throw fe(r);
  return {
    appName: t.name,
    projectId: n.projectId,
    apiKey: n.apiKey,
    appId: n.appId,
    senderId: n.messagingSenderId
  };
}
function fe(t) {
  return b.create("missing-app-config-values", {
    valueName: t
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class go {
  constructor(e, n, r) {
    this.deliveryMetricsExportedToBigQueryEnabled = !1, this.onBackgroundMessageHandler = null, this.onMessageHandler = null, this.logEvents = [], this.isLogServiceStarted = !1;
    const s = po(e);
    this.firebaseDependencies = {
      app: e,
      appConfig: s,
      installations: n,
      analyticsProvider: r
    };
  }
  _delete() {
    return Promise.resolve();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const mo = (t) => {
  const e = new go(t.getProvider("app").getImmediate(), t.getProvider("installations-internal").getImmediate(), t.getProvider("analytics-internal"));
  return self.addEventListener("push", (n) => {
    n.waitUntil(so(n, e));
  }), self.addEventListener("pushsubscriptionchange", (n) => {
    n.waitUntil(ro(n, e));
  }), self.addEventListener("notificationclick", (n) => {
    n.waitUntil(oo(n));
  }), e;
};
function wo() {
  B(new A(
    "messaging-sw",
    mo,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function bo() {
  return pt() && await gt() && "PushManager" in self && "Notification" in self && ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification") && PushSubscription.prototype.hasOwnProperty("getKey");
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function yo(t, e) {
  if (self.document !== void 0)
    throw b.create(
      "only-available-in-sw"
      /* ErrorCode.AVAILABLE_IN_SW */
    );
  return t.onBackgroundMessageHandler = e, () => {
    t.onBackgroundMessageHandler = null;
  };
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _o(t = hr()) {
  return bo().then((e) => {
    if (!e)
      throw b.create(
        "unsupported-browser"
        /* ErrorCode.UNSUPPORTED_BROWSER */
      );
  }, (e) => {
    throw b.create(
      "indexed-db-unsupported"
      /* ErrorCode.INDEXED_DB_UNSUPPORTED */
    );
  }), ke(mt(t), "messaging-sw").getImmediate();
}
function Eo(t, e) {
  return t = mt(t), yo(t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
wo();
try {
  self["workbox:core:7.0.0"] && _();
} catch {
}
const Io = {
  "invalid-value": ({ paramName: t, validValueDescription: e, value: n }) => {
    if (!t || !e)
      throw new Error("Unexpected input to 'invalid-value' error.");
    return `The '${t}' parameter was given a value with an unexpected value. ${e} Received a value of ${JSON.stringify(n)}.`;
  },
  "not-an-array": ({ moduleName: t, className: e, funcName: n, paramName: r }) => {
    if (!t || !e || !n || !r)
      throw new Error("Unexpected input to 'not-an-array' error.");
    return `The parameter '${r}' passed into '${t}.${e}.${n}()' must be an array.`;
  },
  "incorrect-type": ({ expectedType: t, paramName: e, moduleName: n, className: r, funcName: s }) => {
    if (!t || !e || !n || !s)
      throw new Error("Unexpected input to 'incorrect-type' error.");
    const o = r ? `${r}.` : "";
    return `The parameter '${e}' passed into '${n}.${o}${s}()' must be of type ${t}.`;
  },
  "incorrect-class": ({ expectedClassName: t, paramName: e, moduleName: n, className: r, funcName: s, isReturnValueProblem: o }) => {
    if (!t || !n || !s)
      throw new Error("Unexpected input to 'incorrect-class' error.");
    const a = r ? `${r}.` : "";
    return o ? `The return value from '${n}.${a}${s}()' must be an instance of class ${t}.` : `The parameter '${e}' passed into '${n}.${a}${s}()' must be an instance of class ${t}.`;
  },
  "missing-a-method": ({ expectedMethod: t, paramName: e, moduleName: n, className: r, funcName: s }) => {
    if (!t || !e || !n || !r || !s)
      throw new Error("Unexpected input to 'missing-a-method' error.");
    return `${n}.${r}.${s}() expected the '${e}' parameter to expose a '${t}' method.`;
  },
  "add-to-cache-list-unexpected-type": ({ entry: t }) => `An unexpected entry was passed to 'workbox-precaching.PrecacheController.addToCacheList()' The entry '${JSON.stringify(t)}' isn't supported. You must supply an array of strings with one or more characters, objects with a url property or Request objects.`,
  "add-to-cache-list-conflicting-entries": ({ firstEntry: t, secondEntry: e }) => {
    if (!t || !e)
      throw new Error("Unexpected input to 'add-to-cache-list-duplicate-entries' error.");
    return `Two of the entries passed to 'workbox-precaching.PrecacheController.addToCacheList()' had the URL ${t} but different revision details. Workbox is unable to cache and version the asset correctly. Please remove one of the entries.`;
  },
  "plugin-error-request-will-fetch": ({ thrownErrorMessage: t }) => {
    if (!t)
      throw new Error("Unexpected input to 'plugin-error-request-will-fetch', error.");
    return `An error was thrown by a plugins 'requestWillFetch()' method. The thrown error message was: '${t}'.`;
  },
  "invalid-cache-name": ({ cacheNameId: t, value: e }) => {
    if (!t)
      throw new Error("Expected a 'cacheNameId' for error 'invalid-cache-name'");
    return `You must provide a name containing at least one character for setCacheDetails({${t}: '...'}). Received a value of '${JSON.stringify(e)}'`;
  },
  "unregister-route-but-not-found-with-method": ({ method: t }) => {
    if (!t)
      throw new Error("Unexpected input to 'unregister-route-but-not-found-with-method' error.");
    return `The route you're trying to unregister was not  previously registered for the method type '${t}'.`;
  },
  "unregister-route-route-not-registered": () => "The route you're trying to unregister was not previously registered.",
  "queue-replay-failed": ({ name: t }) => `Replaying the background sync queue '${t}' failed.`,
  "duplicate-queue-name": ({ name: t }) => `The Queue name '${t}' is already being used. All instances of backgroundSync.Queue must be given unique names.`,
  "expired-test-without-max-age": ({ methodName: t, paramName: e }) => `The '${t}()' method can only be used when the '${e}' is used in the constructor.`,
  "unsupported-route-type": ({ moduleName: t, className: e, funcName: n, paramName: r }) => `The supplied '${r}' parameter was an unsupported type. Please check the docs for ${t}.${e}.${n} for valid input types.`,
  "not-array-of-class": ({ value: t, expectedClass: e, moduleName: n, className: r, funcName: s, paramName: o }) => `The supplied '${o}' parameter must be an array of '${e}' objects. Received '${JSON.stringify(t)},'. Please check the call to ${n}.${r}.${s}() to fix the issue.`,
  "max-entries-or-age-required": ({ moduleName: t, className: e, funcName: n }) => `You must define either config.maxEntries or config.maxAgeSecondsin ${t}.${e}.${n}`,
  "statuses-or-headers-required": ({ moduleName: t, className: e, funcName: n }) => `You must define either config.statuses or config.headersin ${t}.${e}.${n}`,
  "invalid-string": ({ moduleName: t, funcName: e, paramName: n }) => {
    if (!n || !t || !e)
      throw new Error("Unexpected input to 'invalid-string' error.");
    return `When using strings, the '${n}' parameter must start with 'http' (for cross-origin matches) or '/' (for same-origin matches). Please see the docs for ${t}.${e}() for more info.`;
  },
  "channel-name-required": () => "You must provide a channelName to construct a BroadcastCacheUpdate instance.",
  "invalid-responses-are-same-args": () => "The arguments passed into responsesAreSame() appear to be invalid. Please ensure valid Responses are used.",
  "expire-custom-caches-only": () => "You must provide a 'cacheName' property when using the expiration plugin with a runtime caching strategy.",
  "unit-must-be-bytes": ({ normalizedRangeHeader: t }) => {
    if (!t)
      throw new Error("Unexpected input to 'unit-must-be-bytes' error.");
    return `The 'unit' portion of the Range header must be set to 'bytes'. The Range header provided was "${t}"`;
  },
  "single-range-only": ({ normalizedRangeHeader: t }) => {
    if (!t)
      throw new Error("Unexpected input to 'single-range-only' error.");
    return `Multiple ranges are not supported. Please use a  single start value, and optional end value. The Range header provided was "${t}"`;
  },
  "invalid-range-values": ({ normalizedRangeHeader: t }) => {
    if (!t)
      throw new Error("Unexpected input to 'invalid-range-values' error.");
    return `The Range header is missing both start and end values. At least one of those values is needed. The Range header provided was "${t}"`;
  },
  "no-range-header": () => "No Range header was found in the Request provided.",
  "range-not-satisfiable": ({ size: t, start: e, end: n }) => `The start (${e}) and end (${n}) values in the Range are not satisfiable by the cached response, which is ${t} bytes.`,
  "attempt-to-cache-non-get-request": ({ url: t, method: e }) => `Unable to cache '${t}' because it is a '${e}' request and only 'GET' requests can be cached.`,
  "cache-put-with-no-response": ({ url: t }) => `There was an attempt to cache '${t}' but the response was not defined.`,
  "no-response": ({ url: t, error: e }) => {
    let n = `The strategy could not generate a response for '${t}'.`;
    return e && (n += ` The underlying error is ${e}.`), n;
  },
  "bad-precaching-response": ({ url: t, status: e }) => `The precaching request for '${t}' failed` + (e ? ` with an HTTP status of ${e}.` : "."),
  "non-precached-url": ({ url: t }) => `createHandlerBoundToURL('${t}') was called, but that URL is not precached. Please pass in a URL that is precached instead.`,
  "add-to-cache-list-conflicting-integrities": ({ url: t }) => `Two of the entries passed to 'workbox-precaching.PrecacheController.addToCacheList()' had the URL ${t} with different integrity values. Please remove one of them.`,
  "missing-precache-entry": ({ cacheName: t, url: e }) => `Unable to find a precached response in ${t} for ${e}.`,
  "cross-origin-copy-response": ({ origin: t }) => `workbox-core.copyResponse() can only be used with same-origin responses. It was passed a response with origin ${t}.`,
  "opaque-streams-source": ({ type: t }) => {
    const e = `One of the workbox-streams sources resulted in an '${t}' response.`;
    return t === "opaqueredirect" ? `${e} Please do not use a navigation request that results in a redirect as a source.` : `${e} Please ensure your sources are CORS-enabled.`;
  }
}, Co = (t, e = {}) => {
  const n = Io[t];
  if (!n)
    throw new Error(`Unable to find message for code '${t}'.`);
  return n(e);
}, vo = Co;
class f extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(e, n) {
    const r = vo(e, n);
    super(r), this.name = e, this.details = n;
  }
}
const To = (t, e) => {
  if (!Array.isArray(t))
    throw new f("not-an-array", e);
}, So = (t, e, n) => {
  if (typeof t[e] !== "function")
    throw n.expectedMethod = e, new f("missing-a-method", n);
}, Ro = (t, e, n) => {
  if (typeof t !== e)
    throw n.expectedType = e, new f("incorrect-type", n);
}, Do = (t, e, n) => {
  if (!(t instanceof e))
    throw n.expectedClassName = e.name, new f("incorrect-class", n);
}, ko = (t, e, n) => {
  if (!e.includes(t))
    throw n.validValueDescription = `Valid values are ${JSON.stringify(e)}.`, new f("invalid-value", n);
}, Ao = (t, e, n) => {
  const r = new f("not-array-of-class", n);
  if (!Array.isArray(t))
    throw r;
  for (const s of t)
    if (!(s instanceof e))
      throw r;
}, w = {
  hasMethod: So,
  isArray: To,
  isInstance: Do,
  isOneOf: ko,
  isType: Ro,
  isArrayOfClass: Ao
}, E = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, pe = (t) => [E.prefix, t, E.suffix].filter((e) => e && e.length > 0).join("-"), $o = (t) => {
  for (const e of Object.keys(E))
    t(e);
}, Q = {
  updateDetails: (t) => {
    $o((e) => {
      typeof t[e] == "string" && (E[e] = t[e]);
    });
  },
  getGoogleAnalyticsName: (t) => t || pe(E.googleAnalytics),
  getPrecacheName: (t) => t || pe(E.precache),
  getPrefix: () => E.prefix,
  getRuntimeName: (t) => t || pe(E.runtime),
  getSuffix: () => E.suffix
}, u = (() => {
  "__WB_DISABLE_DEV_LOGS" in globalThis || (self.__WB_DISABLE_DEV_LOGS = !1);
  let t = !1;
  const e = {
    debug: "#7f8c8d",
    log: "#2ecc71",
    warn: "#f39c12",
    error: "#c0392b",
    groupCollapsed: "#3498db",
    groupEnd: null
    // No colored prefix on groupEnd
  }, n = function(o, a) {
    if (self.__WB_DISABLE_DEV_LOGS)
      return;
    if (o === "groupCollapsed" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      console[o](...a);
      return;
    }
    const i = [
      `background: ${e[o]}`,
      "border-radius: 0.5em",
      "color: white",
      "font-weight: bold",
      "padding: 2px 0.5em"
    ], c = t ? [] : ["%cworkbox", i.join(";")];
    console[o](...c, ...a), o === "groupCollapsed" && (t = !0), o === "groupEnd" && (t = !1);
  }, r = {}, s = Object.keys(e);
  for (const o of s) {
    const a = o;
    r[a] = (...i) => {
      n(a, i);
    };
  }
  return r;
})();
function at(t, e) {
  const n = e();
  return t.waitUntil(n), n;
}
try {
  self["workbox:precaching:7.0.0"] && _();
} catch {
}
const No = "__WB_REVISION__";
function Oo(t) {
  if (!t)
    throw new f("add-to-cache-list-unexpected-type", { entry: t });
  if (typeof t == "string") {
    const o = new URL(t, location.href);
    return {
      cacheKey: o.href,
      url: o.href
    };
  }
  const { revision: e, url: n } = t;
  if (!n)
    throw new f("add-to-cache-list-unexpected-type", { entry: t });
  if (!e) {
    const o = new URL(n, location.href);
    return {
      cacheKey: o.href,
      url: o.href
    };
  }
  const r = new URL(n, location.href), s = new URL(n, location.href);
  return r.searchParams.set(No, e), {
    cacheKey: r.href,
    url: s.href
  };
}
class Mo {
  constructor() {
    this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({ request: e, state: n }) => {
      n && (n.originalRequest = e);
    }, this.cachedResponseWillBeUsed = async ({ event: e, state: n, cachedResponse: r }) => {
      if (e.type === "install" && n && n.originalRequest && n.originalRequest instanceof Request) {
        const s = n.originalRequest.url;
        r ? this.notUpdatedURLs.push(s) : this.updatedURLs.push(s);
      }
      return r;
    };
  }
}
class Lo {
  constructor({ precacheController: e }) {
    this.cacheKeyWillBeUsed = async ({ request: n, params: r }) => {
      const s = (r == null ? void 0 : r.cacheKey) || this._precacheController.getCacheKeyForURL(n.url);
      return s ? new Request(s, { headers: n.headers }) : n;
    }, this._precacheController = e;
  }
}
const Bo = (t, e) => {
  u.groupCollapsed(t);
  for (const n of e)
    u.log(n);
  u.groupEnd();
};
function Po(t) {
  const e = t.length;
  e > 0 && (u.groupCollapsed(`During precaching cleanup, ${e} cached request${e === 1 ? " was" : "s were"} deleted.`), Bo("Deleted Cache Requests", t), u.groupEnd());
}
function it(t, e) {
  if (e.length !== 0) {
    u.groupCollapsed(t);
    for (const n of e)
      u.log(n);
    u.groupEnd();
  }
}
function xo(t, e) {
  const n = t.length, r = e.length;
  if (n || r) {
    let s = `Precaching ${n} file${n === 1 ? "" : "s"}.`;
    r > 0 && (s += ` ${r} file${r === 1 ? " is" : "s are"} already cached.`), u.groupCollapsed(s), it("View newly precached URLs.", t), it("View previously precached URLs.", e), u.groupEnd();
  }
}
let x;
function Uo() {
  if (x === void 0) {
    const t = new Response("");
    if ("body" in t)
      try {
        new Response(t.body), x = !0;
      } catch {
        x = !1;
      }
    x = !1;
  }
  return x;
}
async function jo(t, e) {
  let n = null;
  if (t.url && (n = new URL(t.url).origin), n !== self.location.origin)
    throw new f("cross-origin-copy-response", { origin: n });
  const r = t.clone(), s = {
    headers: new Headers(r.headers),
    status: r.status,
    statusText: r.statusText
  }, o = e ? e(s) : s, a = Uo() ? r.body : await r.blob();
  return new Response(a, o);
}
const p = (t) => new URL(String(t), location.href).href.replace(new RegExp(`^${location.origin}`), "");
function ct(t, e) {
  const n = new URL(t);
  for (const r of e)
    n.searchParams.delete(r);
  return n.href;
}
async function Fo(t, e, n, r) {
  const s = ct(e.url, n);
  if (e.url === s)
    return t.match(e, r);
  const o = Object.assign(Object.assign({}, r), { ignoreSearch: !0 }), a = await t.keys(e, o);
  for (const i of a) {
    const c = ct(i.url, n);
    if (s === c)
      return t.match(i, r);
  }
}
class Ko {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((e, n) => {
      this.resolve = e, this.reject = n;
    });
  }
}
const ut = /* @__PURE__ */ new Set();
async function Ho() {
  u.log(`About to run ${ut.size} callbacks to clean up caches.`);
  for (const t of ut)
    await t(), u.log(t, "is complete.");
  u.log("Finished running callbacks.");
}
function Vo(t) {
  return new Promise((e) => setTimeout(e, t));
}
try {
  self["workbox:strategies:7.0.0"] && _();
} catch {
}
function K(t) {
  return typeof t == "string" ? new Request(t) : t;
}
class Wo {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(e, n) {
    this._cacheKeys = {}, w.isInstance(n.event, ExtendableEvent, {
      moduleName: "workbox-strategies",
      className: "StrategyHandler",
      funcName: "constructor",
      paramName: "options.event"
    }), Object.assign(this, n), this.event = n.event, this._strategy = e, this._handlerDeferred = new Ko(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const r of this._plugins)
      this._pluginStateMap.set(r, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(e) {
    const { event: n } = this;
    let r = K(e);
    if (r.mode === "navigate" && n instanceof FetchEvent && n.preloadResponse) {
      const a = await n.preloadResponse;
      if (a)
        return u.log(`Using a preloaded navigation response for '${p(r.url)}'`), a;
    }
    const s = this.hasCallback("fetchDidFail") ? r.clone() : null;
    try {
      for (const a of this.iterateCallbacks("requestWillFetch"))
        r = await a({ request: r.clone(), event: n });
    } catch (a) {
      if (a instanceof Error)
        throw new f("plugin-error-request-will-fetch", {
          thrownErrorMessage: a.message
        });
    }
    const o = r.clone();
    try {
      let a;
      a = await fetch(r, r.mode === "navigate" ? void 0 : this._strategy.fetchOptions), u.debug(`Network request for '${p(r.url)}' returned a response with status '${a.status}'.`);
      for (const i of this.iterateCallbacks("fetchDidSucceed"))
        a = await i({
          event: n,
          request: o,
          response: a
        });
      return a;
    } catch (a) {
      throw u.log(`Network request for '${p(r.url)}' threw an error.`, a), s && await this.runCallbacks("fetchDidFail", {
        error: a,
        event: n,
        originalRequest: s.clone(),
        request: o.clone()
      }), a;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(e) {
    const n = await this.fetch(e), r = n.clone();
    return this.waitUntil(this.cachePut(e, r)), n;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cachedResponseWillByUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(e) {
    const n = K(e);
    let r;
    const { cacheName: s, matchOptions: o } = this._strategy, a = await this.getCacheKey(n, "read"), i = Object.assign(Object.assign({}, o), { cacheName: s });
    r = await caches.match(a, i), r ? u.debug(`Found a cached response in '${s}'.`) : u.debug(`No cached response found in '${s}'.`);
    for (const c of this.iterateCallbacks("cachedResponseWillBeUsed"))
      r = await c({
        cacheName: s,
        matchOptions: o,
        cachedResponse: r,
        request: a,
        event: this.event
      }) || void 0;
    return r;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(e, n) {
    const r = K(e);
    await Vo(0);
    const s = await this.getCacheKey(r, "write");
    {
      if (s.method && s.method !== "GET")
        throw new f("attempt-to-cache-non-get-request", {
          url: p(s.url),
          method: s.method
        });
      const g = n.headers.get("Vary");
      g && u.debug(`The response for ${p(s.url)} has a 'Vary: ${g}' header. Consider setting the {ignoreVary: true} option on your strategy to ensure cache matching and deletion works as expected.`);
    }
    if (!n)
      throw u.error(`Cannot cache non-existent response for '${p(s.url)}'.`), new f("cache-put-with-no-response", {
        url: p(s.url)
      });
    const o = await this._ensureResponseSafeToCache(n);
    if (!o)
      return u.debug(`Response '${p(s.url)}' will not be cached.`, o), !1;
    const { cacheName: a, matchOptions: i } = this._strategy, c = await self.caches.open(a), l = this.hasCallback("cacheDidUpdate"), h = l ? await Fo(
      // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
      // feature. Consider into ways to only add this behavior if using
      // precaching.
      c,
      s.clone(),
      ["__WB_REVISION__"],
      i
    ) : null;
    u.debug(`Updating the '${a}' cache with a new Response for ${p(s.url)}.`);
    try {
      await c.put(s, l ? o.clone() : o);
    } catch (g) {
      if (g instanceof Error)
        throw g.name === "QuotaExceededError" && await Ho(), g;
    }
    for (const g of this.iterateCallbacks("cacheDidUpdate"))
      await g({
        cacheName: a,
        oldResponse: h,
        newResponse: o.clone(),
        request: s,
        event: this.event
      });
    return !0;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(e, n) {
    const r = `${e.url} | ${n}`;
    if (!this._cacheKeys[r]) {
      let s = e;
      for (const o of this.iterateCallbacks("cacheKeyWillBeUsed"))
        s = K(await o({
          mode: n,
          request: s,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params
          // eslint-disable-line
        }));
      this._cacheKeys[r] = s;
    }
    return this._cacheKeys[r];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(e) {
    for (const n of this._strategy.plugins)
      if (e in n)
        return !0;
    return !1;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(e, n) {
    for (const r of this.iterateCallbacks(e))
      await r(n);
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(e) {
    for (const n of this._strategy.plugins)
      if (typeof n[e] == "function") {
        const r = this._pluginStateMap.get(n);
        yield (o) => {
          const a = Object.assign(Object.assign({}, o), { state: r });
          return n[e](a);
        };
      }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread my be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    let e;
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(e) {
    let n = e, r = !1;
    for (const s of this.iterateCallbacks("cacheWillUpdate"))
      if (n = await s({
        request: this.request,
        response: n,
        event: this.event
      }) || void 0, r = !0, !n)
        break;
    return r || (n && n.status !== 200 && (n = void 0), n && n.status !== 200 && (n.status === 0 ? u.warn(`The response for '${this.request.url}' is an opaque response. The caching strategy that you're using will not cache opaque responses by default.`) : u.debug(`The response for '${this.request.url}' returned a status code of '${e.status}' and won't be cached as a result.`))), n;
  }
}
class qo {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor(e = {}) {
    this.cacheName = Q.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(e) {
    const [n] = this.handleAll(e);
    return n;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const n = e.event, r = typeof e.request == "string" ? new Request(e.request) : e.request, s = "params" in e ? e.params : void 0, o = new Wo(this, { event: n, request: r, params: s }), a = this._getResponse(o, r, n), i = this._awaitComplete(a, o, r, n);
    return [a, i];
  }
  async _getResponse(e, n, r) {
    await e.runCallbacks("handlerWillStart", { event: r, request: n });
    let s;
    try {
      if (s = await this._handle(n, e), !s || s.type === "error")
        throw new f("no-response", { url: n.url });
    } catch (o) {
      if (o instanceof Error) {
        for (const a of e.iterateCallbacks("handlerDidError"))
          if (s = await a({ error: o, event: r, request: n }), s)
            break;
      }
      if (s)
        u.log(`While responding to '${p(n.url)}', an ${o instanceof Error ? o.toString() : ""} error occurred. Using a fallback response provided by a handlerDidError plugin.`);
      else
        throw o;
    }
    for (const o of e.iterateCallbacks("handlerWillRespond"))
      s = await o({ event: r, request: n, response: s });
    return s;
  }
  async _awaitComplete(e, n, r, s) {
    let o, a;
    try {
      o = await e;
    } catch {
    }
    try {
      await n.runCallbacks("handlerDidRespond", {
        event: s,
        request: r,
        response: o
      }), await n.doneWaiting();
    } catch (i) {
      i instanceof Error && (a = i);
    }
    if (await n.runCallbacks("handlerDidComplete", {
      event: s,
      request: r,
      response: o,
      error: a
    }), n.destroy(), a)
      throw a;
  }
}
class C extends qo {
  /**
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
   * of all fetch() requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor(e = {}) {
    e.cacheName = Q.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(C.copyRedirectedCacheableResponsesPlugin);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, n) {
    const r = await n.cacheMatch(e);
    return r || (n.event && n.event.type === "install" ? await this._handleInstall(e, n) : await this._handleFetch(e, n));
  }
  async _handleFetch(e, n) {
    let r;
    const s = n.params || {};
    if (this._fallbackToNetwork) {
      u.warn(`The precached response for ${p(e.url)} in ${this.cacheName} was not found. Falling back to the network.`);
      const o = s.integrity, a = e.integrity, i = !a || a === o;
      r = await n.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? a || o : void 0
      })), o && i && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await n.cachePut(e, r.clone()) && u.log(`A response for ${p(e.url)} was used to "repair" the precache.`));
    } else
      throw new f("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    {
      const o = s.cacheKey || await n.getCacheKey(e, "read");
      u.groupCollapsed("Precaching is responding to: " + p(e.url)), u.log(`Serving the precached url: ${p(o instanceof Request ? o.url : o)}`), u.groupCollapsed("View request details here."), u.log(e), u.groupEnd(), u.groupCollapsed("View response details here."), u.log(r), u.groupEnd(), u.groupEnd();
    }
    return r;
  }
  async _handleInstall(e, n) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const r = await n.fetch(e);
    if (!await n.cachePut(e, r.clone()))
      throw new f("bad-precaching-response", {
        url: e.url,
        status: r.status
      });
    return r;
  }
  /**
   * This method is complex, as there a number of things to account for:
   *
   * The `plugins` array can be set at construction, and/or it might be added to
   * to at any time before the strategy is used.
   *
   * At the time the strategy is used (i.e. during an `install` event), there
   * needs to be at least one plugin that implements `cacheWillUpdate` in the
   * array, other than `copyRedirectedCacheableResponsesPlugin`.
   *
   * - If this method is called and there are no suitable `cacheWillUpdate`
   * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
   *
   * - If this method is called and there is exactly one `cacheWillUpdate`, then
   * we don't have to do anything (this might be a previously added
   * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
   *
   * - If this method is called and there is more than one `cacheWillUpdate`,
   * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
   * we need to remove it. (This situation is unlikely, but it could happen if
   * the strategy is used multiple times, the first without a `cacheWillUpdate`,
   * and then later on after manually adding a custom `cacheWillUpdate`.)
   *
   * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
   *
   * @private
   */
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, n = 0;
    for (const [r, s] of this.plugins.entries())
      s !== C.copyRedirectedCacheableResponsesPlugin && (s === C.defaultPrecacheCacheabilityPlugin && (e = r), s.cacheWillUpdate && n++);
    n === 0 ? this.plugins.push(C.defaultPrecacheCacheabilityPlugin) : n > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
C.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate({ response: t }) {
    return !t || t.status >= 400 ? null : t;
  }
};
C.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate({ response: t }) {
    return t.redirected ? await jo(t) : t;
  }
};
class Go {
  /**
   * Create a new PrecacheController.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] The cache to use for precaching.
   * @param {string} [options.plugins] Plugins to use when precaching as well
   * as responding to fetch events for precached assets.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor({ cacheName: e, plugins: n = [], fallbackToNetwork: r = !0 } = {}) {
    this._urlsToCacheKeys = /* @__PURE__ */ new Map(), this._urlsToCacheModes = /* @__PURE__ */ new Map(), this._cacheKeysToIntegrities = /* @__PURE__ */ new Map(), this._strategy = new C({
      cacheName: Q.getPrecacheName(e),
      plugins: [
        ...n,
        new Lo({ precacheController: this })
      ],
      fallbackToNetwork: r
    }), this.install = this.install.bind(this), this.activate = this.activate.bind(this);
  }
  /**
   * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
   * used to cache assets and respond to fetch events.
   */
  get strategy() {
    return this._strategy;
  }
  /**
   * Adds items to the precache list, removing any duplicates and
   * stores the files in the
   * {@link workbox-core.cacheNames|"precache cache"} when the service
   * worker installs.
   *
   * This method can be called multiple times.
   *
   * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
   */
  precache(e) {
    this.addToCacheList(e), this._installAndActiveListenersAdded || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this._installAndActiveListenersAdded = !0);
  }
  /**
   * This method will add items to the precache list, removing duplicates
   * and ensuring the information is valid.
   *
   * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
   *     Array of entries to precache.
   */
  addToCacheList(e) {
    w.isArray(e, {
      moduleName: "workbox-precaching",
      className: "PrecacheController",
      funcName: "addToCacheList",
      paramName: "entries"
    });
    const n = [];
    for (const r of e) {
      typeof r == "string" ? n.push(r) : r && r.revision === void 0 && n.push(r.url);
      const { cacheKey: s, url: o } = Oo(r), a = typeof r != "string" && r.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(o) && this._urlsToCacheKeys.get(o) !== s)
        throw new f("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(o),
          secondEntry: s
        });
      if (typeof r != "string" && r.integrity) {
        if (this._cacheKeysToIntegrities.has(s) && this._cacheKeysToIntegrities.get(s) !== r.integrity)
          throw new f("add-to-cache-list-conflicting-integrities", {
            url: o
          });
        this._cacheKeysToIntegrities.set(s, r.integrity);
      }
      if (this._urlsToCacheKeys.set(o, s), this._urlsToCacheModes.set(o, a), n.length > 0) {
        const i = `Workbox is precaching URLs without revision info: ${n.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
        u.warn(i);
      }
    }
  }
  /**
   * Precaches new and updated assets. Call this method from the service worker
   * install event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.InstallResult>}
   */
  install(e) {
    return at(e, async () => {
      const n = new Mo();
      this.strategy.plugins.push(n);
      for (const [o, a] of this._urlsToCacheKeys) {
        const i = this._cacheKeysToIntegrities.get(a), c = this._urlsToCacheModes.get(o), l = new Request(o, {
          integrity: i,
          cache: c,
          credentials: "same-origin"
        });
        await Promise.all(this.strategy.handleAll({
          params: { cacheKey: a },
          request: l,
          event: e
        }));
      }
      const { updatedURLs: r, notUpdatedURLs: s } = n;
      return xo(r, s), { updatedURLs: r, notUpdatedURLs: s };
    });
  }
  /**
   * Deletes assets that are no longer present in the current precache manifest.
   * Call this method from the service worker activate event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.CleanupResult>}
   */
  activate(e) {
    return at(e, async () => {
      const n = await self.caches.open(this.strategy.cacheName), r = await n.keys(), s = new Set(this._urlsToCacheKeys.values()), o = [];
      for (const a of r)
        s.has(a.url) || (await n.delete(a), o.push(a.url));
      return Po(o), { deletedURLs: o };
    });
  }
  /**
   * Returns a mapping of a precached URL to the corresponding cache key, taking
   * into account the revision information for the URL.
   *
   * @return {Map<string, string>} A URL to cache key mapping.
   */
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  /**
   * Returns a list of all the URLs that have been precached by the current
   * service worker.
   *
   * @return {Array<string>} The precached URLs.
   */
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  /**
   * Returns the cache key used for storing a given URL. If that URL is
   * unversioned, like `/index.html', then the cache key will be the original
   * URL with a search parameter appended to it.
   *
   * @param {string} url A URL whose cache key you want to look up.
   * @return {string} The versioned URL that corresponds to a cache key
   * for the original URL, or undefined if that URL isn't precached.
   */
  getCacheKeyForURL(e) {
    const n = new URL(e, location.href);
    return this._urlsToCacheKeys.get(n.href);
  }
  /**
   * @param {string} url A cache key whose SRI you want to look up.
   * @return {string} The subresource integrity associated with the cache key,
   * or undefined if it's not set.
   */
  getIntegrityForCacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  /**
   * This acts as a drop-in replacement for
   * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
   * with the following differences:
   *
   * - It knows what the name of the precache is, and only checks in that cache.
   * - It allows you to pass in an "original" URL without versioning parameters,
   * and it will automatically look up the correct cache key for the currently
   * active revision of that URL.
   *
   * E.g., `matchPrecache('index.html')` will find the correct precached
   * response for the currently active service worker, even if the actual cache
   * key is `'/index.html?__WB_REVISION__=1234abcd'`.
   *
   * @param {string|Request} request The key (without revisioning parameters)
   * to look up in the precache.
   * @return {Promise<Response|undefined>}
   */
  async matchPrecache(e) {
    const n = e instanceof Request ? e.url : e, r = this.getCacheKeyForURL(n);
    if (r)
      return (await self.caches.open(this.strategy.cacheName)).match(r);
  }
  /**
   * Returns a function that looks up `url` in the precache (taking into
   * account revision information), and returns the corresponding `Response`.
   *
   * @param {string} url The precached URL which will be used to lookup the
   * `Response`.
   * @return {workbox-routing~handlerCallback}
   */
  createHandlerBoundToURL(e) {
    const n = this.getCacheKeyForURL(e);
    if (!n)
      throw new f("non-precached-url", { url: e });
    return (r) => (r.request = new Request(e), r.params = Object.assign({ cacheKey: n }, r.params), this.strategy.handle(r));
  }
}
let ge;
const Qt = () => (ge || (ge = new Go()), ge);
try {
  self["workbox:routing:7.0.0"] && _();
} catch {
}
const Xt = "GET", zo = [
  "DELETE",
  "GET",
  "HEAD",
  "PATCH",
  "POST",
  "PUT"
], G = (t) => t && typeof t == "object" ? (w.hasMethod(t, "handle", {
  moduleName: "workbox-routing",
  className: "Route",
  funcName: "constructor",
  paramName: "handler"
}), t) : (w.isType(t, "function", {
  moduleName: "workbox-routing",
  className: "Route",
  funcName: "constructor",
  paramName: "handler"
}), { handle: t });
class j {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, n, r = Xt) {
    w.isType(e, "function", {
      moduleName: "workbox-routing",
      className: "Route",
      funcName: "constructor",
      paramName: "match"
    }), r && w.isOneOf(r, zo, { paramName: "method" }), this.handler = G(n), this.match = e, this.method = r;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(e) {
    this.catchHandler = G(e);
  }
}
class Jo extends j {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, n, r) {
    w.isInstance(e, RegExp, {
      moduleName: "workbox-routing",
      className: "RegExpRoute",
      funcName: "constructor",
      paramName: "pattern"
    });
    const s = ({ url: o }) => {
      const a = e.exec(o.href);
      if (a) {
        if (o.origin !== location.origin && a.index !== 0) {
          u.debug(`The regular expression '${e.toString()}' only partially matched against the cross-origin URL '${o.toString()}'. RegExpRoute's will only handle cross-origin requests if they match the entire URL.`);
          return;
        }
        return a.slice(1);
      }
    };
    super(s, n, r);
  }
}
class Yo {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: n } = e, r = this.handleRequest({ request: n, event: e });
      r && e.respondWith(r);
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: n } = e.data;
        u.debug("Caching URLs from the window", n.urlsToCache);
        const r = Promise.all(n.urlsToCache.map((s) => {
          typeof s == "string" && (s = [s]);
          const o = new Request(...s);
          return this.handleRequest({ request: o, event: e });
        }));
        e.waitUntil(r), e.ports && e.ports[0] && r.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest({ request: e, event: n }) {
    w.isInstance(e, Request, {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "handleRequest",
      paramName: "options.request"
    });
    const r = new URL(e.url, location.href);
    if (!r.protocol.startsWith("http")) {
      u.debug("Workbox Router only supports URLs that start with 'http'.");
      return;
    }
    const s = r.origin === location.origin, { params: o, route: a } = this.findMatchingRoute({
      event: n,
      request: e,
      sameOrigin: s,
      url: r
    });
    let i = a && a.handler;
    const c = [];
    i && (c.push(["Found a route to handle this request:", a]), o && c.push([
      "Passing the following params to the route's handler:",
      o
    ]));
    const l = e.method;
    if (!i && this._defaultHandlerMap.has(l) && (c.push(`Failed to find a matching route. Falling back to the default handler for ${l}.`), i = this._defaultHandlerMap.get(l)), !i) {
      u.debug(`No route found for: ${p(r)}`);
      return;
    }
    u.groupCollapsed(`Router is responding to: ${p(r)}`), c.forEach((m) => {
      Array.isArray(m) ? u.log(...m) : u.log(m);
    }), u.groupEnd();
    let h;
    try {
      h = i.handle({ url: r, request: e, event: n, params: o });
    } catch (m) {
      h = Promise.reject(m);
    }
    const g = a && a.catchHandler;
    return h instanceof Promise && (this._catchHandler || g) && (h = h.catch(async (m) => {
      if (g) {
        u.groupCollapsed(`Error thrown when responding to:  ${p(r)}. Falling back to route's Catch Handler.`), u.error("Error thrown by:", a), u.error(m), u.groupEnd();
        try {
          return await g.handle({ url: r, request: e, event: n, params: o });
        } catch (R) {
          R instanceof Error && (m = R);
        }
      }
      if (this._catchHandler)
        return u.groupCollapsed(`Error thrown when responding to:  ${p(r)}. Falling back to global Catch Handler.`), u.error("Error thrown by:", a), u.error(m), u.groupEnd(), this._catchHandler.handle({ url: r, request: e, event: n });
      throw m;
    })), h;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute({ url: e, sameOrigin: n, request: r, event: s }) {
    const o = this._routes.get(r.method) || [];
    for (const a of o) {
      let i;
      const c = a.match({ url: e, sameOrigin: n, request: r, event: s });
      if (c)
        return c instanceof Promise && u.warn(`While routing ${p(e)}, an async matchCallback function was used. Please convert the following route to use a synchronous matchCallback function:`, a), i = c, (Array.isArray(i) && i.length === 0 || c.constructor === Object && // eslint-disable-line
        Object.keys(c).length === 0 || typeof c == "boolean") && (i = void 0), { route: a, params: i };
    }
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(e, n = Xt) {
    this._defaultHandlerMap.set(n, G(e));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(e) {
    this._catchHandler = G(e);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(e) {
    w.isType(e, "object", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route"
    }), w.hasMethod(e, "match", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route"
    }), w.isType(e.handler, "object", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route"
    }), w.hasMethod(e.handler, "handle", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route.handler"
    }), w.isType(e.method, "string", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route.method"
    }), this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new f("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const n = this._routes.get(e.method).indexOf(e);
    if (n > -1)
      this._routes.get(e.method).splice(n, 1);
    else
      throw new f("unregister-route-route-not-registered");
  }
}
let U;
const Qo = () => (U || (U = new Yo(), U.addFetchListener(), U.addCacheListener()), U);
function Xo(t, e, n) {
  let r;
  if (typeof t == "string") {
    const o = new URL(t, location.href);
    {
      if (!(t.startsWith("/") || t.startsWith("http")))
        throw new f("invalid-string", {
          moduleName: "workbox-routing",
          funcName: "registerRoute",
          paramName: "capture"
        });
      const i = t.startsWith("http") ? o.pathname : t, c = "[*:?+]";
      new RegExp(`${c}`).exec(i) && u.debug(`The '$capture' parameter contains an Express-style wildcard character (${c}). Strings are now always interpreted as exact matches; use a RegExp for partial or wildcard matches.`);
    }
    const a = ({ url: i }) => (i.pathname === o.pathname && i.origin !== o.origin && u.debug(`${t} only partially matches the cross-origin URL ${i.toString()}. This route will only handle cross-origin requests if they match the entire URL.`), i.href === o.href);
    r = new j(a, e, n);
  } else if (t instanceof RegExp)
    r = new Jo(t, e, n);
  else if (typeof t == "function")
    r = new j(t, e, n);
  else if (t instanceof j)
    r = t;
  else
    throw new f("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return Qo().registerRoute(r), r;
}
function Zo(t, e = []) {
  for (const n of [...t.searchParams.keys()])
    e.some((r) => r.test(n)) && t.searchParams.delete(n);
  return t;
}
function* ea(t, { ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/], directoryIndex: n = "index.html", cleanURLs: r = !0, urlManipulation: s } = {}) {
  const o = new URL(t, location.href);
  o.hash = "", yield o.href;
  const a = Zo(o, e);
  if (yield a.href, n && a.pathname.endsWith("/")) {
    const i = new URL(a.href);
    i.pathname += n, yield i.href;
  }
  if (r) {
    const i = new URL(a.href);
    i.pathname += ".html", yield i.href;
  }
  if (s) {
    const i = s({ url: o });
    for (const c of i)
      yield c.href;
  }
}
class ta extends j {
  /**
   * @param {PrecacheController} precacheController A `PrecacheController`
   * instance used to both match requests and respond to fetch events.
   * @param {Object} [options] Options to control how requests are matched
   * against the list of precached URLs.
   * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
   * check cache entries for a URLs ending with '/' to see if there is a hit when
   * appending the `directoryIndex` value.
   * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
   * array of regex's to remove search params when looking for a cache match.
   * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
   * check the cache for the URL with a `.html` added to the end of the end.
   * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
   * This is a function that should take a URL and return an array of
   * alternative URLs that should be checked for precache matches.
   */
  constructor(e, n) {
    const r = ({ request: s }) => {
      const o = e.getURLsToCacheKeys();
      for (const a of ea(s.url, n)) {
        const i = o.get(a);
        if (i) {
          const c = e.getIntegrityForCacheKey(i);
          return { cacheKey: i, integrity: c };
        }
      }
      u.debug("Precaching did not find a match for " + p(s.url));
    };
    super(r, e.strategy);
  }
}
function na(t) {
  const e = Qt(), n = new ta(e, t);
  Xo(n);
}
const ra = "-precache-", sa = async (t, e = ra) => {
  const r = (await self.caches.keys()).filter((s) => s.includes(e) && s.includes(self.registration.scope) && s !== t);
  return await Promise.all(r.map((s) => self.caches.delete(s))), r;
};
function oa() {
  self.addEventListener("activate", (t) => {
    const e = Q.getPrecacheName();
    t.waitUntil(sa(e).then((n) => {
      n.length > 0 && u.log("The following out-of-date precaches were cleaned up automatically:", n);
    }));
  });
}
function aa(t) {
  Qt().precache(t);
}
function ia(t, e) {
  aa(t), na(e);
}
oa();
ia([{"revision":null,"url":"assets/index-1248d30d.js"},{"revision":null,"url":"assets/index-d526a0c5.css"},{"revision":"afc8364ad6ad9cb784b90fbccfdbbcee","url":"firebase-messaging-sw.js"},{"revision":"1b4295d7a710b61f879b3f0081aa08b5","url":"index.html"},{"revision":"1872c500de691dce40960bb85481de07","url":"registerSW.js"},{"revision":"0b5fb74bd8e2ee6e7ea3dc86e59367db","url":"manifest.webmanifest"}]);
console.log("sw.js INIT");
const ca = {
  apiKey: "AIzaSyApVG8v4iP5apI_ojXmB2eDIel-gdStiss",
  authDomain: "webpusher-f1968.firebaseapp.com",
  projectId: "webpusher-f1968",
  storageBucket: "webpusher-f1968.appspot.com",
  messagingSenderId: "1084991595562",
  appId: "1:1084991595562:web:745e1108ec4376f09dcf53"
}, ua = yt(ca), Zt = _o(ua);
console.log("messaging", Zt);
Eo(Zt, (t) => {
  var s, o;
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    t
  );
  const e = "sw" + ((s = t.notification) == null ? void 0 : s.title), n = "sw" + ((o = t.notification) == null ? void 0 : o.body), r = {
    title: e,
    body: n
  };
  self.registration.showNotification(e, r);
});

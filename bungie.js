import {API_KEY, CLIENT_ID} from './apikey.js';


export class Bungie {
  constructor() {
    this.auth = {expires: 0, refresh_expires: 0};
    let bungienet = new BungieNet(this);
    this.net = bungienet.build('');
    this.defs = {};
  }

  store(key, data) {
    if (data === null)
      localStorage.removeItem(key);
    else
      localStorage.setItem(key, JSON.stringify(data));
  }

  get(key) {
    let data = localStorage.getItem(key);
    if (data)
      return JSON.parse(data);
  }

  async fetch(path, params, method='GET') {
    let headers = {
        'X-API-Key': API_KEY,
    };
    if (this.auth.expires > Date.now())
      headers['Authorization'] = 'Bearer ' + this.auth.access_token;
    let init = {method, headers};
    if (params) {
      let paramobj = new URLSearchParams();
      for (let [k, v] of Object.entries(params))
        paramobj.append(k, v);
      if (method == 'GET')
        path = `${path}?${paramobj.toString()}`;
      else {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        init['body'] = paramobj.toString();
      }
    }
    path = 'https://www.bungie.net/' + path;
    console.log('fetch(%o, %o)', path, init);
    let req = await fetch(path, init);
    return req.json();
  }

  async login() {
    let search = new URLSearchParams(location.search);
    if (search.get('code') && this.get('auth_nonce') &&
        (search.get('state') == this.get('auth_nonce'))) {
      this.store('auth_nonce', null);
      history.replaceState(null, null, '.');
      return this.handleCredentials(await this.net.platform.app.OAuth.token.POST(
          {client_id: CLIENT_ID, grant_type: 'authorization_code', code: search.get('code')}));
    }
    let auth = this.get('auth');
    if (auth)
      this.auth = auth;
    let now = Date.now();
    if (this.auth.expires > now)
      return;
    if (this.auth.refresh_expires > now)
      return this.handleCredentials(await this.net.platform.app.OAuth.token.POST(
          {client_id: CLIENT_ID, grant_type: 'refresh_token', refresh_token: this.auth.refresh_token}));
    let nonce = String(Math.random()).substr(2, 20);
    this.store('auth_nonce', nonce);
    location.replace(`https://www.bungie.net/en/OAuth/Authorize?client_id=${CLIENT_ID}&response_type=code&state=${nonce}`);
    return Promise.reject();
  }

  handleCredentials(data) {
    let now = Date.now();
    data.expires = now + data.expires_in * 1000 - 1000;
    data.refresh_expires = now + data.refresh_expires_in * 1000 - 1000;
    this.auth = data;
    this.store('auth', this.auth);
  }

  async getDef(defType, hash) {
    if (!this.defs[defType]) {
      if (!this.manifest)
        this.manifest = await this.net.platform.destiny2.manifest();
      let path = this.manifest.Response.jsonWorldComponentContentPaths.en[`Destiny${defType}Definition`];
      this.defs[defType] = await fetch(`https://www.bungie.net${path}`, {credentials: 'omit'}).then(data => data.json());
    }
    return this.defs[defType][hash];
  }

  async getCurrentUser() {
    let usermod = await import('./user.js');
    let userdata = await this.net.platform.user.GetMembershipsForCurrentUser();
    return new usermod.User(this, userdata.Response);
  }
}


class BungieNet {
  constructor(bungie) {
    this.bungie = bungie;
  }

  build(path) {
    let cache = function() {};
    cache.path = path;
    cache.cache = {};
    return new Proxy(cache, this);
  }

  get(target, name) {
    if (!target.cache[name]) {
      if (/^[A-Z]+$/.test(name))
        target.cache[name] = params => this.bungie.fetch(target.path, params, name);
      else
        target.cache[name] = this.build(`${target.path}${name}/`);
    }
    return target.cache[name];
  }

  apply(target, thisArg, args) {
    return this.get(target, 'GET').apply(thisArg, args);
  }
}

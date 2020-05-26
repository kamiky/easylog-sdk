'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('regenerator-runtime/runtime');
var axios = _interopDefault(require('axios'));
var detectBrowser = require('detect-browser');
var Cookies = _interopDefault(require('js-cookie'));

const utils = {
  generateRandom: (length) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result
  },

  generateHexaCode: (length) => {
    const chars = '0123456789ABCDEF';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result
  },

  generateNumberCode: (length) => {
    const chars = '0123456789';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result
  },

  getDevice: () => {
    const browser = detectBrowser.detect();
    return {
      browser: browser.name,
      browser_version: browser.version,
      OS: browser.os,
      currentUrl: window.location.href || document.URL,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    }
  },
};

// import 'core-js'

/*
 ** FOR DEVELOPMENT ONLY
 ** https://medium.com/@the1mills/how-to-test-your-npm-module-without-publishing-it-every-5-minutes-1c4cb4b369be
 ** cd easylog-sdk
 ** npm link
 ** cd web
 ** npm link easylog-sdk
 */

class EasyLogLib {
	constructor(config) {
		this.config = config || {};
		// this.api = `http://localhost:5151/v1`
		this.queue = [];
		this.processing = 0;
		this.api = 'https://alexis-baranger.com/easylog/v1';
		// this.api = `https://api.easylog.io/send`
	}
	init(access_token) {
		this.config.access_token = access_token;
	}

	post(params) {
		if (this.processing) {
			this.queue.push(params);
		} else {
			this.processQueue(params);
		}
	}

	async processQueue(params) {
		this.processing++;
		try {
			const result = await axios.post(this.api + '/send', params);
		} catch (err) {
			console.error(err);
		}
		this.processing--;
		if (this.queue.length > 0) {
			this.processQueue(this.queue.shift());
		}
	}

	async send(level, event_name, properties) {
		const distinct_id = this.config.distinct_id;
		const access_token = this.config.access_token;
		const datetime = new Date();
		this.post({ distinct_id, level, event_name, access_token, properties, datetime, device: utils.getDevice() });
	}

	async identify(properties) {
		try {
			const old_distinct_id = this.config.distinct_id;
			if (properties.id) {
				this.config.distinct_id = properties.id;
				Cookies.set('_el', properties.id);
			}
			const access_token = this.config.access_token;
			const result = await axios.post(this.api + '/identify', {
				distinct_id: old_distinct_id,
				access_token,
				device: utils.getDevice(),
				...properties,
			});
		} catch (err) {
			console.error(err);
		}
	}

	info(event_name, properties) {
		return this.send('info', event_name, properties)
	}
	warn(event_name, properties) {
		return this.send('warn', event_name, properties)
	}
	debug(event_name, properties) {
		return this.send('debug', event_name, properties)
	}
	error(event_name, properties) {
		return this.send('error', event_name, properties)
	}
}

class EasyLogWrapper {
	constructor(config) {
		const cookies = Cookies.get();
		let distinct_id = cookies && cookies['_el'];
		if (!distinct_id) {
			distinct_id = utils.generateRandom(30);
			Cookies.set('_el', distinct_id);
		}
		this.config = config || {};
		this.config.distinct_id = distinct_id;

		this.instance = new EasyLogLib(this.config);
	}

	create(access_token) {
		return new EasyLogLib({ access_token, distinct_id: this.config.distinct_id })
	}

	init(access_token) {
		this.instance.init(access_token);
	}

	identify(properties) {
		this.instance.identify(properties);
	}

	info(event_name, properties) {
		this.instance.info(event_name, properties);
	}

	warn(event_name, properties) {
		this.instance.warn(event_name, properties);
	}

	debug(event_name, properties) {
		this.instance.debug(event_name, properties);
	}

	error(event_name, properties) {
		this.instance.error(event_name, properties);
	}
}

var index = new EasyLogWrapper({ is_default: true });

module.exports = index;

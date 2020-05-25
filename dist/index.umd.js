(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios')) :
    typeof define === 'function' && define.amd ? define(['axios'], factory) :
    (global = global || self, global.easylog = factory(global.axios));
}(this, (function (axios) { 'use strict';

    axios = axios && Object.prototype.hasOwnProperty.call(axios, 'default') ? axios['default'] : axios;

    var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    var BrowserInfo = /** @class */ (function () {
        function BrowserInfo(name, version, os) {
            this.name = name;
            this.version = version;
            this.os = os;
            this.type = 'browser';
        }
        return BrowserInfo;
    }());
    var NodeInfo = /** @class */ (function () {
        function NodeInfo(version) {
            this.version = version;
            this.type = 'node';
            this.name = 'node';
            this.os = process.platform;
        }
        return NodeInfo;
    }());
    var SearchBotDeviceInfo = /** @class */ (function () {
        function SearchBotDeviceInfo(name, version, os, bot) {
            this.name = name;
            this.version = version;
            this.os = os;
            this.bot = bot;
            this.type = 'bot-device';
        }
        return SearchBotDeviceInfo;
    }());
    var BotInfo = /** @class */ (function () {
        function BotInfo() {
            this.type = 'bot';
            this.bot = true; // NOTE: deprecated test name instead
            this.name = 'bot';
            this.version = null;
            this.os = null;
        }
        return BotInfo;
    }());
    // tslint:disable-next-line:max-line-length
    var SEARCHBOX_UA_REGEX = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/;
    var SEARCHBOT_OS_REGEX = /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/;
    var REQUIRED_VERSION_PARTS = 3;
    var userAgentRules = [
        ['aol', /AOLShield\/([0-9\._]+)/],
        ['edge', /Edge\/([0-9\._]+)/],
        ['edge-ios', /EdgiOS\/([0-9\._]+)/],
        ['yandexbrowser', /YaBrowser\/([0-9\._]+)/],
        ['vivaldi', /Vivaldi\/([0-9\.]+)/],
        ['kakaotalk', /KAKAOTALK\s([0-9\.]+)/],
        ['samsung', /SamsungBrowser\/([0-9\.]+)/],
        ['silk', /\bSilk\/([0-9._-]+)\b/],
        ['miui', /MiuiBrowser\/([0-9\.]+)$/],
        ['beaker', /BeakerBrowser\/([0-9\.]+)/],
        ['edge-chromium', /Edg\/([0-9\.]+)/],
        [
            'chromium-webview',
            /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/,
        ],
        ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
        ['phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/],
        ['crios', /CriOS\/([0-9\.]+)(:?\s|$)/],
        ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
        ['fxios', /FxiOS\/([0-9\.]+)/],
        ['opera-mini', /Opera Mini.*Version\/([0-9\.]+)/],
        ['opera', /Opera\/([0-9\.]+)(?:\s|$)/],
        ['opera', /OPR\/([0-9\.]+)(:?\s|$)/],
        ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
        ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
        ['ie', /MSIE\s(7\.0)/],
        ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
        ['android', /Android\s([0-9\.]+)/],
        ['ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
        ['safari', /Version\/([0-9\._]+).*Safari/],
        ['facebook', /FBAV\/([0-9\.]+)/],
        ['instagram', /Instagram\s([0-9\.]+)/],
        ['ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/],
        ['ios-webview', /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
        ['searchbot', SEARCHBOX_UA_REGEX],
    ];
    var operatingSystemRules = [
        ['iOS', /iP(hone|od|ad)/],
        ['Android OS', /Android/],
        ['BlackBerry OS', /BlackBerry|BB10/],
        ['Windows Mobile', /IEMobile/],
        ['Amazon OS', /Kindle/],
        ['Windows 3.11', /Win16/],
        ['Windows 95', /(Windows 95)|(Win95)|(Windows_95)/],
        ['Windows 98', /(Windows 98)|(Win98)/],
        ['Windows 2000', /(Windows NT 5.0)|(Windows 2000)/],
        ['Windows XP', /(Windows NT 5.1)|(Windows XP)/],
        ['Windows Server 2003', /(Windows NT 5.2)/],
        ['Windows Vista', /(Windows NT 6.0)/],
        ['Windows 7', /(Windows NT 6.1)/],
        ['Windows 8', /(Windows NT 6.2)/],
        ['Windows 8.1', /(Windows NT 6.3)/],
        ['Windows 10', /(Windows NT 10.0)/],
        ['Windows ME', /Windows ME/],
        ['Open BSD', /OpenBSD/],
        ['Sun OS', /SunOS/],
        ['Chrome OS', /CrOS/],
        ['Linux', /(Linux)|(X11)/],
        ['Mac OS', /(Mac_PowerPC)|(Macintosh)/],
        ['QNX', /QNX/],
        ['BeOS', /BeOS/],
        ['OS/2', /OS\/2/],
    ];
    function detect(userAgent) {
        if (!!userAgent) {
            return parseUserAgent(userAgent);
        }
        if (typeof navigator !== 'undefined') {
            return parseUserAgent(navigator.userAgent);
        }
        return getNodeVersion();
    }
    function matchUserAgent(ua) {
        // opted for using reduce here rather than Array#first with a regex.test call
        // this is primarily because using the reduce we only perform the regex
        // execution once rather than once for the test and for the exec again below
        // probably something that needs to be benchmarked though
        return (ua !== '' &&
            userAgentRules.reduce(function (matched, _a) {
                var browser = _a[0], regex = _a[1];
                if (matched) {
                    return matched;
                }
                var uaMatch = regex.exec(ua);
                return !!uaMatch && [browser, uaMatch];
            }, false));
    }
    function parseUserAgent(ua) {
        var matchedRule = matchUserAgent(ua);
        if (!matchedRule) {
            return null;
        }
        var name = matchedRule[0], match = matchedRule[1];
        if (name === 'searchbot') {
            return new BotInfo();
        }
        var versionParts = match[1] && match[1].split(/[._]/).slice(0, 3);
        if (versionParts) {
            if (versionParts.length < REQUIRED_VERSION_PARTS) {
                versionParts = __spreadArrays(versionParts, createVersionParts(REQUIRED_VERSION_PARTS - versionParts.length));
            }
        }
        else {
            versionParts = [];
        }
        var version = versionParts.join('.');
        var os = detectOS(ua);
        var searchBotMatch = SEARCHBOT_OS_REGEX.exec(ua);
        if (searchBotMatch && searchBotMatch[1]) {
            return new SearchBotDeviceInfo(name, version, os, searchBotMatch[1]);
        }
        return new BrowserInfo(name, versionParts.join('.'), os);
    }
    function detectOS(ua) {
        for (var ii = 0, count = operatingSystemRules.length; ii < count; ii++) {
            var _a = operatingSystemRules[ii], os = _a[0], regex = _a[1];
            var match = regex.exec(ua);
            if (match) {
                return os;
            }
        }
        return null;
    }
    function getNodeVersion() {
        var isNode = typeof process !== 'undefined' && process.version;
        return isNode ? new NodeInfo(process.version.slice(1)) : null;
    }
    function createVersionParts(count) {
        var output = [];
        for (var ii = 0; ii < count; ii++) {
            output.push('0');
        }
        return output;
    }

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
        const browser = detect();
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

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var js_cookie = createCommonjsModule(function (module, exports) {
    (function (factory) {
    	var registeredInModuleLoader;
    	{
    		module.exports = factory();
    		registeredInModuleLoader = true;
    	}
    	if (!registeredInModuleLoader) {
    		var OldCookies = window.Cookies;
    		var api = window.Cookies = factory();
    		api.noConflict = function () {
    			window.Cookies = OldCookies;
    			return api;
    		};
    	}
    }(function () {
    	function extend () {
    		var i = 0;
    		var result = {};
    		for (; i < arguments.length; i++) {
    			var attributes = arguments[ i ];
    			for (var key in attributes) {
    				result[key] = attributes[key];
    			}
    		}
    		return result;
    	}

    	function decode (s) {
    		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
    	}

    	function init (converter) {
    		function api() {}

    		function set (key, value, attributes) {
    			if (typeof document === 'undefined') {
    				return;
    			}

    			attributes = extend({
    				path: '/'
    			}, api.defaults, attributes);

    			if (typeof attributes.expires === 'number') {
    				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
    			}

    			// We're using "expires" because "max-age" is not supported by IE
    			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

    			try {
    				var result = JSON.stringify(value);
    				if (/^[\{\[]/.test(result)) {
    					value = result;
    				}
    			} catch (e) {}

    			value = converter.write ?
    				converter.write(value, key) :
    				encodeURIComponent(String(value))
    					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

    			key = encodeURIComponent(String(key))
    				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
    				.replace(/[\(\)]/g, escape);

    			var stringifiedAttributes = '';
    			for (var attributeName in attributes) {
    				if (!attributes[attributeName]) {
    					continue;
    				}
    				stringifiedAttributes += '; ' + attributeName;
    				if (attributes[attributeName] === true) {
    					continue;
    				}

    				// Considers RFC 6265 section 5.2:
    				// ...
    				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
    				//     character:
    				// Consume the characters of the unparsed-attributes up to,
    				// not including, the first %x3B (";") character.
    				// ...
    				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
    			}

    			return (document.cookie = key + '=' + value + stringifiedAttributes);
    		}

    		function get (key, json) {
    			if (typeof document === 'undefined') {
    				return;
    			}

    			var jar = {};
    			// To prevent the for loop in the first place assign an empty array
    			// in case there are no cookies at all.
    			var cookies = document.cookie ? document.cookie.split('; ') : [];
    			var i = 0;

    			for (; i < cookies.length; i++) {
    				var parts = cookies[i].split('=');
    				var cookie = parts.slice(1).join('=');

    				if (!json && cookie.charAt(0) === '"') {
    					cookie = cookie.slice(1, -1);
    				}

    				try {
    					var name = decode(parts[0]);
    					cookie = (converter.read || converter)(cookie, name) ||
    						decode(cookie);

    					if (json) {
    						try {
    							cookie = JSON.parse(cookie);
    						} catch (e) {}
    					}

    					jar[name] = cookie;

    					if (key === name) {
    						break;
    					}
    				} catch (e) {}
    			}

    			return key ? jar[key] : jar;
    		}

    		api.set = set;
    		api.get = function (key) {
    			return get(key, false /* read as raw */);
    		};
    		api.getJSON = function (key) {
    			return get(key, true /* read as json */);
    		};
    		api.remove = function (key, attributes) {
    			set(key, '', extend(attributes, {
    				expires: -1
    			}));
    		};

    		api.defaults = {};

    		api.withConverter = init;

    		return api;
    	}

    	return init(function () {});
    }));
    });

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
    		this.api = 'http://alexis-baranger.com/easylog/';
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
    				js_cookie.set('_el', properties.id);
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
    		const cookies = js_cookie.get();
    		let distinct_id = cookies['_el'];
    		if (!distinct_id) {
    			distinct_id = utils.generateRandom(30);
    			js_cookie.set('_el', distinct_id);
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

    return index;

})));

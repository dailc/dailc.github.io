/**
 * @description ajax工具
 * @author dailc
 * @time 2015-12-23 
 * 功能:
 * 参考mui的ajax源码，单独剥离
 * http://dev.dcloud.net.cn/mui
 */
(function($FrameObj, undefined) {
	/**
	 * 空函数
	 */
	$FrameObj.noop = function() {};
	/**
	 *  slice(array)
	 */
	$FrameObj.slice = [].slice;
	/**
	 *  filter(array)
	 */
	$FrameObj.filter = [].filter;
	/**
	 * 是否是数组
	 */
	$FrameObj.isArray = Array.isArray ||
		function(object) {
			return object instanceof Array;
		};
	/**
	 *  isWindow(需考虑obj为undefined的情况)
	 */
	$FrameObj.isWindow = function(obj) {
		return obj != null && obj === obj.window;
	};
	/**
	 * @description 判断类型
	 * @param {Object} obj
	 */
	$FrameObj.type = function(obj) {
		return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || "object";
	};
	/**
	 *  isObject
	 */
	$FrameObj.isObject = function(obj) {
		return $FrameObj.type(obj) === "object";
	};
	/**
	 *  isPlainObject 排除window的
	 */
	$FrameObj.isPlainObject = function(obj) {
		return $FrameObj.isObject(obj) && !$FrameObj.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
	};
	/**
	 * mui isEmptyObject
	 * @param {Object} o
	 */
	$FrameObj.isEmptyObject = function(o) {
		for (var p in o) {
			if (p !== undefined) {
				return false;
			}
		}
		return true;
	};
	/**
	 * mui isFunction
	 */
	$FrameObj.isFunction = function(value) {
		return $FrameObj.type(value) === "function";
	};
	$FrameObj.now = Date.now || function() {
		return +new Date();
	};
	if (window.JSON) {
		$FrameObj.parseJSON = JSON.parse;
	}
	/**
	 * each
	 * @param {type} elements
	 * @param {type} callback
	 * @returns {_L8.obj}
	 */
	$FrameObj.each = function(elements, callback, hasOwnProperty) {
		if (!elements) {
			return this;
		}
		if (typeof elements.length === 'number') {
			[].every.call(elements, function(el, idx) {
				return callback.call(el, idx, el) !== false;
			});
		} else {
			for (var key in elements) {
				if (hasOwnProperty) {
					if (elements.hasOwnProperty(key)) {
						if (callback.call(elements[key], key, elements[key]) === false) return elements;
					}
				} else {
					if (callback.call(elements[key], key, elements[key]) === false) return elements;
				}
			}
		}
		return this;
	};
	var class2type = {};
	$FrameObj.each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'], function(i, name) {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});
	/**
	 * extend(simple)
	 * @param {type} target
	 * @param {type} source
	 * @param {type} deep
	 * @returns {unresolved}
	 */
	$FrameObj.extend = function() { //from jquery2
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		if (typeof target === "boolean") {
			deep = target;

			target = arguments[i] || {};
			i++;
		}

		if (typeof target !== "object" && !$FrameObj.isFunction(target)) {
			target = {};
		}

		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {
			if ((options = arguments[i]) != null) {
				for (name in options) {
					src = target[name];
					copy = options[name];

					if (target === copy) {
						continue;
					}

					if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $FrameObj.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && $FrameObj.isArray(src) ? src : [];

						} else {
							clone = src && $FrameObj.isPlainObject(src) ? src : {};
						}

						target[name] = $FrameObj.extend(deep, clone, copy);

					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		return target;
	};

	/**
	 * @description 普通 ajax操作相关
	 * **ajax**  
	 */
	(function() {
		var jsonType = 'application/json';
		var htmlType = 'text/html';
		var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
		var scriptTypeRE = /^(?:text|application)\/javascript/i;
		var xmlTypeRE = /^(?:text|application)\/xml/i;
		var blankRE = /^\s*$/;
		/**
		 * 默认的ajax设置
		 */
		$FrameObj.ajaxSettings = {
			type: 'GET',
			beforeSend: $FrameObj.noop,
			success: $FrameObj.noop,
			error: $FrameObj.noop,
			complete: $FrameObj.noop,
			context: null,
			xhr: function(protocol) {
				var XMLHttpReq = null;
				try {
					XMLHttpReq = new ActiveXObject("Msxml2.XMLHTTP")
				} catch (E) {
					try {
						XMLHttpReq = new ActiveXObject("Microsoft.XMLHTTP")
					} catch (E) {
						XMLHttpReq = new window.XMLHttpRequest()
					}
				}
				return XMLHttpReq;
			},
			accepts: {
				script: 'text/javascript, application/javascript, application/x-javascript',
				json: jsonType,
				xml: 'application/xml, text/xml',
				html: htmlType,
				text: 'text/plain'
			},
			timeout: 0,
			processData: true,
			cache: true
		};

		var ajaxBeforeSend = function(xhr, settings) {
			var context = settings.context
				//
			if (settings.beforeSend.call(context, xhr, settings) === false) {
				return false;
			}
		};
		var ajaxSuccess = function(data, xhr, settings) {
			settings.success.call(settings.context, data, 'success', xhr);
			ajaxComplete('success', xhr, settings);
		};
		// type: "timeout", "error", "abort", "parsererror"
		var ajaxError = function(error, type, xhr, settings) {
			settings.error.call(settings.context, xhr, type, error);
			ajaxComplete(type, xhr, settings);
		};
		// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
		var ajaxComplete = function(status, xhr, settings) {
			settings.complete.call(settings.context, xhr, status);
		};
		var serialize = function(params, obj, traditional, scope) {
			var type, array = $FrameObj.isArray(obj),
				hash = $FrameObj.isPlainObject(obj);
			$FrameObj.each(obj, function(key, value) {
				type = $FrameObj.type(value);
				if (scope) {
					key = traditional ? scope :
						scope + '[' + (hash || type === 'object' || type === 'array' ? key : '') + ']';
				}
				// handle data in serializeArray() format
				if (!scope && array) {
					params.add(value.name, value.value);
				}
				// recurse into nested objects
				else if (type === "array" || (!traditional && type === "object")) {
					serialize(params, value, traditional, key);
				} else {
					params.add(key, value);
				}
			});
		};
		var serializeData = function(options) {
			if (options.processData && options.data && typeof options.data !== "string") {
				options.data = $FrameObj.param(options.data, options.traditional);
			}
			if (options.data && (!options.type || options.type.toUpperCase() === 'GET')) {
				options.url = appendQuery(options.url, options.data);
				options.data = undefined;
			}
		};
		var appendQuery = function(url, query) {
			if (query === '') {
				return url;
			}
			return (url + '&' + query).replace(/[&?]{1,2}/, '?');
		};
		var mimeToDataType = function(mime) {
			if (mime) {
				mime = mime.split(';', 2)[0];
			}
			return mime && (mime === htmlType ? 'html' :
				mime === jsonType ? 'json' :
				scriptTypeRE.test(mime) ? 'script' :
				xmlTypeRE.test(mime) && 'xml') || 'text';
		};
		var parseArguments = function(url, data, success, dataType) {
			if ($FrameObj.isFunction(data)) {
				dataType = success, success = data, data = undefined;
			}
			if (!$FrameObj.isFunction(success)) {
				dataType = success, success = undefined;
			}
			return {
				url: url,
				data: data,
				success: success,
				dataType: dataType
			};
		};
		$FrameObj.param = function(obj, traditional) {
			var params = [];
			params.add = function(k, v) {
				this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
			};
			serialize(params, obj, traditional);
			return params.join('&').replace(/%20/g, '+');
		};
		/**
		 * @description ajax请求
		 */
		$FrameObj.ajax = function(url, options) {
			//支持将url放入options中
			if (typeof url === "object") {
				options = url;
				url = undefined;
			}
			//获取options
			var settings = options || {};
			settings.url = url || settings.url;
			//采取默认的参数
			for (var key in $FrameObj.ajaxSettings) {
				if (settings[key] === undefined) {
					settings[key] = $FrameObj.ajaxSettings[key];
				}
			}
			serializeData(settings);
			var dataType = settings.dataType;

			if (settings.cache === false || ((!options || options.cache !== true) && ('script' === dataType))) {
				settings.url = appendQuery(settings.url, '_=' + $FrameObj.now());
			}
			var mime = settings.accepts[dataType];
			var headers = {};
			var setHeader = function(name, value) {
				headers[name.toLowerCase()] = [name, value];
			};
			var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
			var xhr = settings.xhr(settings);
			if (!xhr) {
				return;
			}
			var nativeSetHeader = xhr.setRequestHeader;
			var abortTimeout;
			//这个头部标识代表为异步请求,需要接口添加支持
			//setHeader('X-Requested-With', 'XMLHttpRequest');
			setHeader('Accept', mime || '*/*');
			if (!!(mime = settings.mimeType || mime)) {
				if (mime.indexOf(',') > -1) {
					mime = mime.split(',', 2)[0];
				}
				xhr.overrideMimeType && xhr.overrideMimeType(mime);
			}
			if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET')) {
				setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
			}
			if (settings.headers) {
				for (var name in settings.headers)
					setHeader(name, settings.headers[name]);
			}
			xhr.setRequestHeader = setHeader;
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					xhr.onreadystatechange = $FrameObj.noop;
					clearTimeout(abortTimeout);
					var result, error = false;
					if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:')) {
						dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
						result = xhr.responseText;
						try {
							// http://perfectionkills.com/global-eval-what-are-the-options/
							if (dataType.toLowerCase() === 'script') {
								(1, eval)(result);
							} else if (dataType.toLowerCase() === 'xml') {
								result = xhr.responseXML;
							} else if (dataType.toLowerCase() === 'json') {
								result = blankRE.test(result) ? null : $FrameObj.parseJSON(result);
							}
						} catch (e) {
							error = e;
						}

						if (error) {
							ajaxError(error, 'parsererror', xhr, settings);
						} else {
							ajaxSuccess(result, xhr, settings);
						}
					} else {
						ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
					}
				}
			};

			if (ajaxBeforeSend(xhr, settings) === false) {
				xhr.abort();
				ajaxError(null, 'abort', xhr, settings);
				return xhr;
			}

			if (settings.xhrFields) {
				for (var name in settings.xhrFields) {
					xhr[name] = settings.xhrFields[name];
				}
			}

			var async = 'async' in settings ? settings.async : true;

			xhr.open(settings.type.toUpperCase(), settings.url, async, settings.username, settings.password);

			for (var name in headers) {
				//console.log('设置头部:' + headers[name]);
				nativeSetHeader.apply(xhr, headers[name]);
			}
			if (settings.timeout > 0) {
				abortTimeout = setTimeout(function() {
					xhr.onreadystatechange = $FrameObj.noop;
					xhr.abort();
					ajaxError(null, 'timeout', xhr, settings);
				}, settings.timeout);
			}
			xhr.send(settings.data ? settings.data : null);
			return xhr;
		};
	})();


})(window.appAjax = {});
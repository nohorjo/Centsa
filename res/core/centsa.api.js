/**
 * 
 */
var centsa = (function() {
	var apiUrl = (function() {
		var url;
		return {
			get : function() {
				if (!url)
					throw "Key not set!";
				return url;
			},
			set : function(key) {
				if (key)
					url = "/api/" + key;
			}
		};
	})();

	// make simple async http request
	function ajax(payload) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open(payload.method, payload.url,
				payload.async != undefined ? payload.async : true);
		xmlHttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (payload.complete) {
					payload.complete(this);
				}
				if (this.status >= 200 && this.status <= 300) {
					if (payload.success) {
						payload.success(this);
					}
				} else {
					if (payload.error) {
						payload.error(this);
					}
				}
			}
		}
		xmlHttp.send(payload.data);
	}

	return {
		setUniqueKey : function(ukey) {
			apiUrl.set(ukey);
		},
		settings : {
			get : function(key) {
				var val = null;
				ajax({
					url : apiUrl.get() + "/settings?key=" + key,
					method : "GET",
					async : false,
					success : function(resp) {
						val = resp.responseText;
					},
					error : function(resp) {
						alert(resp);
					}
				});
				return val;
			},
			set : function(key, value, success, error) {
				ajax({
					url : apiUrl.get() + "/settings",
					method : "POST",
					data : JSON.stringify({
						key : key,
						value : value
					}),
					success : success,
					error : error
				});
			}
		}
	}
})();

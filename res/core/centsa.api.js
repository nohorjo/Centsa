/**
 * 
 */
var centsa = (function() {
	var apiUrl = null;

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
			apiUrl = "/api/" + ukey;
		},
		settings : {
			set : function(key, value, success, error) {
				ajax({
					url : apiUrl + "/settings",
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

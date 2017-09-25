/**
 * 
 */

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

var centsa = new (function() {
	var key = null;
	return {
		setUniqueKey : function(ukey) 
			key = ukey;
		},
		settings : {
			set : function(key, value, success, error) {
				ajax({
					url : "/api/" + key + "/settings",
					method : "POST",
					success : success,
					error : error
				});
			}
		}
	}
})();

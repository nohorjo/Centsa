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
		},
		transactions : {
			get : function(id, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/transactions?id=" + id,
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/transactions?page=" + page
							+ "&pageSize=" + pageSize + "&order="
							+ (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			remove : function(id, success, error) {
				ajax({
					url : apiUrl.get() + "/transactions?id=" + id,
					method : "DELETE",
					success : success,
					error : error
				});
			},
			insert : function(t, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/transactions",
					method : "POST",
					async : false,
					data : JSON.stringify(t),
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			}
		},
		accounts : {
			get : function(id, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/accounts?id=" + id,
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/accounts?page=" + page
							+ "&pageSize=" + pageSize + "&order="
							+ (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			remove : function(id, success, error) {
				ajax({
					url : apiUrl.get() + "/accounts?id=" + id,
					method : "DELETE",
					success : success,
					error : error
				});
			},
			insert : function(a, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/accounts",
					method : "POST",
					async : false,
					data : JSON.stringify(a),
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			}
		},
		types : {
			get : function(id, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/types?id=" + id,
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/types?page=" + page + "&pageSize="
							+ pageSize + "&order=" + (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			remove : function(id, success, error) {
				ajax({
					url : apiUrl.get() + "/types?id=" + id,
					method : "DELETE",
					success : success,
					error : error
				});
			},
			insert : function(t, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/types",
					method : "POST",
					async : false,
					data : JSON.stringify(t),
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			}
		},
		expenses : {
			get : function(id, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/expenses?id=" + id,
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/expenses?page=" + page
							+ "&pageSize=" + pageSize + "&order="
							+ (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			},
			remove : function(id, success, error) {
				ajax({
					url : apiUrl.get() + "/expenses?id=" + id,
					method : "DELETE",
					success : success,
					error : error
				});
			},
			insert : function(e, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/expenses",
					method : "POST",
					async : false,
					data : JSON.stringify(e),
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error
				});
				return rtn;
			}
		}
	}
})();

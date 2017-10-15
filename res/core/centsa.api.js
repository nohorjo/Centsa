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
		if (payload.headers) {
			for ( var header in payload.headers) {
				xmlHttp.setRequestHeader(header, payload.headers[header]);
			}
		}
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

	var throwError = function(resp) {
		throw resp.status;
	};

	return {
		setUniqueKey : function(ukey) {
			apiUrl.set(ukey);
		},
		settings : {
			get : function(key, error) {
				var val = null;
				ajax({
					url : apiUrl.get() + "/settings?key=" + key,
					method : "GET",
					async : false,
					success : function(resp) {
						val = resp.responseText;
					},
					error : error || throwError
				});
				return val;
			},
			set : function(key, value, success, error) {
				ajax({
					url : apiUrl.get() + "/settings/" + key,
					method : "POST",
					data : value,
					success : success,
					error : error || throwError
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
					error : error || throwError
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/transactions/all?page=" + page
							+ "&pageSize=" + pageSize + "&order="
							+ (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			remove : function(id, error) {
				var rtn = false;
				ajax({
					url : apiUrl.get() + "/transactions?id=" + id,
					method : "DELETE",
					async : false,
					success : function() {
						rtn = true;
					},
					error : error || throwError
				});
				return rtn;
			},
			insert : function(t, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/transactions",
					method : "POST",
					async : false,
					data : JSON.stringify(t),
					headers : {
						"Content-Type" : "application/json"
					},
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			countPages : function(pageSize, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/transactions/countPages?pageSize="
							+ pageSize,
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			getUniqueComments : function(error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/transactions/comments",
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
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
					error : error || throwError
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/accounts/all?page=" + page
							+ "&pageSize=" + pageSize + "&order="
							+ (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			remove : function(id, error) {
				var rtn = false;
				ajax({
					url : apiUrl.get() + "/accounts?id=" + id,
					method : "DELETE",
					async : false,
					success : function() {
						rtn = true;
					},
					error : error || throwError
				});
				return rtn;
			},
			insert : function(a, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/accounts",
					method : "POST",
					async : false,
					data : JSON.stringify(a),
					headers : {
						"Content-Type" : "application/json"
					},
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
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
					error : error || throwError
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/types/all?page=" + page
							+ "&pageSize=" + pageSize + "&order="
							+ (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			remove : function(id, error) {
				var rtn = false;
				ajax({
					url : apiUrl.get() + "/types?id=" + id,
					method : "DELETE",
					async : false,
					success : function() {
						rtn = true;
					},
					error : error || throwError
				});
				return rtn;
			},
			insert : function(t, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/types",
					method : "POST",
					async : false,
					data : JSON.stringify(t),
					headers : {
						"Content-Type" : "application/json"
					},
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
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
					error : error || throwError
				});
				return rtn;
			},
			getAll : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/expenses/all?page=" + page
							+ "&pageSize=" + pageSize + "&order="
							+ (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			remove : function(id, error) {
				var rtn = false;
				ajax({
					url : apiUrl.get() + "/expenses?id=" + id,
					method : "DELETE",
					async : false,
					success : function() {
						rtn = true;
					},
					error : error || throwError
				});
				return rtn;
			},
			insert : function(e, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/expenses",
					method : "POST",
					async : false,
					data : JSON.stringify(e),
					headers : {
						"Content-Type" : "application/json"
					},
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			totalActive : function(auto, error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/expenses/totalActive?auto=" + auto,
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			}
		},
		general : {
			budget : function(error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/general/budget",
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			importFile : function(rule, success, error) {
				ajax({
					url : apiUrl.get() + "/general/import?rule=" + rule,
					method : "GET",
					success : success,
					error : error || throwError
				});
			},
			layouts : function(error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/general/layouts",
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			rules : function(error) {
				var rtn = null;
				ajax({
					url : apiUrl.get() + "/general/rules",
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			}
		}
	}
})();

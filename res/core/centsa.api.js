/**
 * 
 */
var centsa = (function() {
	// Get the unique key from the URL
	var url = "/api/" + location.search.substr(1);

	// Make simple async http request
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

	// Default throw errors
	var throwError = function(resp) {
		throw resp.responseText;
	};

	// Return object to handle REST calls
	return {
		settings : {
			get : function(key, error) {
				var val = null;
				ajax({
					url : url + "/settings?key=" + key,
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
					url : url + "/settings/" + key,
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
					url : url + "/transactions?id=" + id,
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
					url : url + "/transactions/all?page=" + page + "&pageSize="
							+ pageSize + "&order=" + (order || ""),
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
					url : url + "/transactions?id=" + id,
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
					url : url + "/transactions",
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
					url : url + "/transactions/countPages?pageSize=" + pageSize,
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
					url : url + "/transactions/comments",
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			getCumulativeSums : function(precision, error) {
				var rtn = null;
				ajax({
					url : url + "/transactions/sums?precision="
							+ (precision || 0),
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
					url : url + "/accounts?id=" + id,
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
					url : url + "/accounts/all?page=" + page + "&pageSize="
							+ pageSize + "&order=" + (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			insert : function(a, error) {
				var rtn = null;
				ajax({
					url : url + "/accounts",
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
					url : url + "/types?id=" + id,
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
					url : url + "/types/all?page=" + page + "&pageSize="
							+ pageSize + "&order=" + (order || ""),
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
					url : url + "/types?id=" + id,
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
					url : url + "/types",
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
					url : url + "/expenses?id=" + id,
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
					url : url + "/expenses/all?page=" + page + "&pageSize="
							+ pageSize + "&order=" + (order || ""),
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText);
					},
					error : error || throwError
				});
				return rtn;
			},
			getActive : function(page, pageSize, order, error) {
				var rtn = null;
				ajax({
					url : url + "/expenses/active?page=" + page + "&pageSize="
							+ pageSize + "&order=" + (order || ""),
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
					url : url + "/expenses?id=" + id,
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
					url : url + "/expenses",
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
					url : url + "/expenses/totalActive?auto=" + auto,
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
					url : url + "/general/budget",
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
					url : url + "/general/import?rule=" + rule,
					method : "GET",
					success : success,
					error : error || throwError
				});
			},
			importProgress : function(error) {
				var rtn = null;
				ajax({
					url : url + "/general/import/progress",
					method : "GET",
					async : false,
					success : function(data) {
						rtn = JSON.parse(data.responseText || null);
					},
					error : error || throwError
				});
				return rtn;
			},
			layouts : function(error) {
				var rtn = null;
				ajax({
					url : url + "/general/layouts",
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
					url : url + "/general/rules",
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

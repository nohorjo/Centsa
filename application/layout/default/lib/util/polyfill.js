Object.assign = Object.assign || function assign(base, toCopy) {
	for ( var p in toCopy) {
		var e = toCopy[p];
		if(typeof e == "object") {
			base[p] = assign(e.constructor == Array ? []:{}, e);
		} else {
			base[p] = toCopy[p];
		}
	}
	return base;
};

String.prototype.startsWith = String.prototype.startsWith || function(s) {
	if (s) {
		for (var i = 0; i < s.length; i++) {
			if (this[i] != s[i])
				return false;
		}
		return true;
	}
	return false;
};

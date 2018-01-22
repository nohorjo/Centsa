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
	return this.substr(0, s.length) === s
};

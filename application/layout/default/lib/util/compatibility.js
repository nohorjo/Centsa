Object.assign = Object.assign || function(base, toCopy) {
	for ( var p in toCopy) {
		base[p] = toCopy[p];
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

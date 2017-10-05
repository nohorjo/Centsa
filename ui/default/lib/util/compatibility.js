Object.assign = Object.assign || function(base, toCopy) {
	for ( var p in toCopy) {
		base[p] = toCopy[p];
	}
	return base;
};
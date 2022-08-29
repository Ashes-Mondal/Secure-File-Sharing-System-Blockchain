const joinUINT8arrays = (arr) => {
	// Get the total length of all arrays.
	let length = 0;
	arr.forEach(item => {
		length += item.length;
	});

	// Create a new array with total length and merge all source arrays.
	let mergedArray = new Uint8Array(length);
	let offset = 0;
	arr.forEach(item => {
		mergedArray.set(item, offset);
		offset += item.length;
	});
	return mergedArray;
}

export {joinUINT8arrays}
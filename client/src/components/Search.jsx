
const Search = () => {
	return (
		<div className="container">
			<div className="p-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
					File Hash:
				</label>
				<input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight border-black" id="hash" type="text" placeholder="File Hash" />
			</div>
		</div>
	);
}

export default Search;
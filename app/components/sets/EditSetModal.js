import React, { useEffect, useState } from "react";

const EditSetModal = ({ isOpen, onClose, onSubmit, set }) => {
	const [setData, setSetData] = useState({
		setName: "",
		strategy: "",
		symbol: "",
		enabled: false,
		setFile: null,
		expertName: "", // Add expertName to the state
		apiKey: "", // Add apiKey to the state
	});
	const [hasExistingFile, setHasExistingFile] = useState(false);

	useEffect(() => {
		if (set) {
			console.log(set);
			setSetData({
				setName: set.name || "",
				strategy: set.strategy || "",
				symbol: set.symbol || "",
				enabled: set.enabled || false,
				setFile: null,
				magic: set.magic,
				expertName: set.expertName || "", // Initialize expertName
				apiKey: set.apiKey || "", // Initialize apiKey
			});
			setHasExistingFile(!!set.setFileURL);
		}
	}, [set]);

	const handleChange = (e) => {
		const { name, value, type, checked, files } = e.target;
		setSetData((prevData) => ({
			...prevData,
			[name]:
				type === "checkbox"
					? checked
					: type === "file"
					? files[0]
					: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit({ id: set?.id, ...setData });
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96">
				<h2 className="text-2xl font-bold mb-4">Edit Set</h2>
				<form onSubmit={handleSubmit}>
					{/* setName input */}
					<div className="mb-4">
						<label
							htmlFor="setName"
							className="block text-sm font-medium text-gray-700">
							Set Name
						</label>
						<input
							type="text"
							id="setName"
							name="setName"
							value={setData.setName}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
						/>
					</div>

					{/* strategy input */}
					<div className="mb-4">
						<label
							htmlFor="strategy"
							className="block text-sm font-medium text-gray-700">
							Strategy
						</label>
						<input
							type="text"
							id="strategy"
							name="strategy"
							value={setData.strategy}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
						/>
					</div>

					{/* symbol input */}
					<div className="mb-4">
						<label
							htmlFor="symbol"
							className="block text-sm font-medium text-gray-700">
							Symbol
						</label>
						<input
							type="text"
							id="symbol"
							name="symbol"
							value={setData.symbol}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
						/>
					</div>

					{/* setFile input */}
					<div className="mb-4">
						<label
							htmlFor="setFile"
							className="block text-sm font-medium text-gray-700">
							{hasExistingFile
								? "Change Set File"
								: "Upload Set File"}
						</label>
						<input
							type="file"
							id="setFile"
							name="setFile"
							onChange={handleChange}
							className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
						/>
					</div>

					{/* enabled checkbox */}
					<div className="mb-4">
						<label className="flex items-center">
							<input
								type="checkbox"
								name="enabled"
								checked={setData.enabled}
								onChange={handleChange}
								disabled={!hasExistingFile && !setData.setFile}
								className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
							<span className="ml-2 text-sm text-gray-700">
								Enabled
							</span>
						</label>
					</div>

					{/* expertName input */}
					<div className="mb-4">
						<label
							htmlFor="expertName"
							className="block text-sm font-medium text-gray-700">
							Expert Name
						</label>
						<input
							type="text"
							id="expertName"
							name="expertName"
							value={setData.expertName}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</div>

					{/* apiKey input */}
					<div className="mb-4">
						<label
							htmlFor="apiKey"
							className="block text-sm font-medium text-gray-700">
							API Key
						</label>
						<input
							type="text"
							id="apiKey"
							name="apiKey"
							value={setData.apiKey}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</div>

					{/* Submit and Cancel buttons */}
					<div className="flex justify-end space-x-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
							Update Set
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditSetModal;

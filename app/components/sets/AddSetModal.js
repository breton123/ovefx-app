import { storage } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";

const AddSetModal = ({ isOpen, onClose, onSubmit }) => {
	const { user } = useAuth();
	const [isMultiUpload, setIsMultiUpload] = useState(false);
	const [setData, setSetData] = useState({
		name: "",
		strategy: "",
		symbol: "",
		setFile: null,
		autoGenerateMagicNumber: true,
		magicNumber: "",
		expertName: "",
		apiKey: "",
	});
	const [sets, setSets] = useState([]);
	const [multiUploadData, setMultiUploadData] = useState({
		expertName: "",
		apiKey: "",
	});

	const parseSetFile = async (file) => {
		// Parse file name
		const fileName = file.name;
		const fileNameParts = fileName.split("_");
		const nameWithoutExtension = fileNameParts[0];
		const magicNumber = fileNameParts[1]?.split(".")[0] || "";

		// Extract symbol and strategy
		const parts = nameWithoutExtension.split(" ");
		const symbol = parts[0] || "";
		const strategy = parts.slice(1).join(" ") || "";

		// Parse file content for additional information
		const text = await file.text();
		const lines = text.split("\n");
		const fileSymbol =
			lines.find((line) => line.startsWith("Symbol="))?.split("=")[1] ||
			symbol;
		const fileStrategy =
			lines.find((line) => line.startsWith("Expert="))?.split("=")[1] ||
			strategy;
		const fileMagicNumber =
			lines.find((line) => line.startsWith("Magic="))?.split("=")[1] ||
			magicNumber;

		return {
			name: fileName,
			strategy: fileStrategy || strategy,
			symbol: fileSymbol || symbol,
			setFile: file,
			magicNumber: fileMagicNumber || magicNumber,
			autoDetectMagicNumber: true,
		};
	};

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

	const handleMultiUploadDataChange = (e) => {
		const { name, value } = e.target;
		setMultiUploadData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleFileChange = async (e) => {
		if (isMultiUpload) {
			const files = Array.from(e.target.files);
			const newSets = await Promise.all(files.map(parseSetFile));
			setSets(newSets);
		} else {
			handleChange(e);
		}
	};

	const handleSetChange = (index, field, value) => {
		setSets((prevSets) => {
			const newSets = [...prevSets];
			newSets[index] = { ...newSets[index], [field]: value };
			return newSets;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!user) {
			console.error("User not authenticated");
			return;
		}

		if (isMultiUpload) {
			const uploadPromises = sets.map(async (set) => {
				let finalSetData = { ...set, ...multiUploadData };
				delete finalSetData.autoDetectMagicNumber;

				if (set.autoDetectMagicNumber) {
					// Use the detected magic number
				} else {
					finalSetData.magicNumber = null; // Let the server generate it
				}

				if (set.setFile) {
					try {
						const storageRef = ref(
							storage,
							`sets/${user.uid}/${set.setFile.name}`
						);
						await uploadBytes(storageRef, set.setFile);
						const downloadURL = await getDownloadURL(storageRef);
						finalSetData.setFileURL = downloadURL;
					} catch (error) {
						console.error("Error uploading file:", error);
						return null;
					}
				}

				return finalSetData;
			});

			const uploadedSets = await Promise.all(uploadPromises);
			const validSets = uploadedSets.filter((set) => set !== null);

			onSubmit(validSets);
		} else {
			let finalSetData = { ...setData };
			delete finalSetData.autoGenerateMagicNumber;

			if (setData.autoGenerateMagicNumber) {
				finalSetData.magicNumber = null;
			} else if (!setData.magicNumber) {
				console.error(
					"Magic number is required when not auto-generating"
				);
				return;
			}

			if (setData.setFile) {
				try {
					const storageRef = ref(
						storage,
						`sets/${user.uid}/${setData.setFile.name}`
					);
					await uploadBytes(storageRef, setData.setFile);
					const downloadURL = await getDownloadURL(storageRef);
					finalSetData.setFileURL = downloadURL;
				} catch (error) {
					console.error("Error uploading file:", error);
					return;
				}
			}

			onSubmit([finalSetData]);
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold">
						Add New Set{isMultiUpload ? "s" : ""}
					</h2>
					<button
						onClick={() => setIsMultiUpload(!isMultiUpload)}
						className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
						{isMultiUpload ? "Single Upload" : "Multi Upload"}
					</button>
				</div>
				<form onSubmit={handleSubmit}>
					{isMultiUpload ? (
						<>
							{/* Multi-upload file input */}
							<div className="mb-4">
								<label
									htmlFor="setFiles"
									className="block text-sm font-medium text-gray-700">
									Upload .set files
								</label>
								<input
									type="file"
									id="setFiles"
									name="setFiles"
									onChange={handleFileChange}
									accept=".set"
									multiple
									className="mt-1 block w-full text-sm text-gray-500
										file:mr-4 file:py-2 file:px-4
										file:rounded-md file:border-0
										file:text-sm file:font-semibold
										file:bg-blue-50 file:text-blue-700
										hover:file:bg-blue-100"
									required
								/>
							</div>
							{/* Expert Name input for multi-upload */}
							<div className="mb-4">
								<label
									htmlFor="multiExpertName"
									className="block text-sm font-medium text-gray-700">
									Expert Name
								</label>
								<input
									type="text"
									id="multiExpertName"
									name="expertName"
									value={multiUploadData.expertName}
									onChange={handleMultiUploadDataChange}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
									required
								/>
							</div>
							{/* API Key input for multi-upload */}
							<div className="mb-4">
								<label
									htmlFor="multiApiKey"
									className="block text-sm font-medium text-gray-700">
									API Key
								</label>
								<input
									type="text"
									id="multiApiKey"
									name="apiKey"
									value={multiUploadData.apiKey}
									onChange={handleMultiUploadDataChange}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
									required
								/>
							</div>
							{/* List of sets */}
							{sets.map((set, index) => (
								<div
									key={index}
									className="mb-6 p-4 border rounded">
									<h3 className="text-lg font-semibold mb-2">
										{set.name}
									</h3>
									<div className="mb-2">
										<label className="block text-sm font-medium text-gray-700">
											Strategy
										</label>
										<input
											type="text"
											value={set.strategy}
											onChange={(e) =>
												handleSetChange(
													index,
													"strategy",
													e.target.value
												)
											}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
											placeholder="Enter strategy if not detected"
										/>
									</div>
									<div className="mb-2">
										<label className="block text-sm font-medium text-gray-700">
											Symbol
										</label>
										<input
											type="text"
											value={set.symbol}
											onChange={(e) =>
												handleSetChange(
													index,
													"symbol",
													e.target.value
												)
											}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
											placeholder="Enter symbol if not detected"
										/>
									</div>
									<div className="mb-2">
										<div className="flex items-center">
											<input
												type="checkbox"
												id={`autoDetectMagicNumber-${index}`}
												checked={
													set.autoDetectMagicNumber
												}
												onChange={(e) =>
													handleSetChange(
														index,
														"autoDetectMagicNumber",
														e.target.checked
													)
												}
												className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											/>
											<label
												htmlFor={`autoDetectMagicNumber-${index}`}
												className="ml-2 block text-sm text-gray-900">
												Auto-detect Magic Number
											</label>
										</div>
										{!set.autoDetectMagicNumber && (
											<input
												type="text"
												value={set.magicNumber}
												onChange={(e) =>
													handleSetChange(
														index,
														"magicNumber",
														e.target.value
													)
												}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
												placeholder="Enter Magic Number"
											/>
										)}
									</div>
								</div>
							))}
						</>
					) : (
						<>
							{/* Name input */}
							<div className="mb-4">
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700">
									Set Name
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={setData.name}
									onChange={handleChange}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
									required
								/>
							</div>

							{/* Strategy input */}
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

							{/* Symbol input */}
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

							{/* File upload */}
							<div className="mb-4">
								<label
									htmlFor="setFile"
									className="block text-sm font-medium text-gray-700">
									Upload .set file
								</label>
								<input
									type="file"
									id="setFile"
									name="setFile"
									onChange={handleChange}
									accept=".set"
									className="mt-1 block w-full text-sm text-gray-500
										file:mr-4 file:py-2 file:px-4
										file:rounded-md file:border-0
										file:text-sm file:font-semibold
										file:bg-blue-50 file:text-blue-700
										hover:file:bg-blue-100"
									required
								/>
							</div>

							{/* Expert Name input */}
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
									required
								/>
							</div>

							{/* API Key input */}
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
									required
								/>
							</div>

							{/* Magic number checkbox and input */}
							<div className="mb-4">
								<div className="flex items-center">
									<input
										type="checkbox"
										id="autoGenerateMagicNumber"
										name="autoGenerateMagicNumber"
										checked={
											setData.autoGenerateMagicNumber
										}
										onChange={handleChange}
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<label
										htmlFor="autoGenerateMagicNumber"
										className="ml-2 block text-sm text-gray-900">
										Auto-generate Magic Number
									</label>
								</div>
								{!setData.autoGenerateMagicNumber && (
									<input
										type="text"
										id="magicNumber"
										name="magicNumber"
										value={setData.magicNumber}
										onChange={handleChange}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										placeholder="Enter Magic Number"
									/>
								)}
							</div>
						</>
					)}

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
							Add Set{isMultiUpload ? "s" : ""}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddSetModal;

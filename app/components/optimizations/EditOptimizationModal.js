import { useEffect, useState } from "react";

const EditOptimizationModal = ({ isOpen, onClose, onSubmit, optimization }) => {
	const [editedOptimization, setEditedOptimization] = useState({
		id: "",
		name: "",
		status: "",
		scheduledDate: "",
	});

	useEffect(() => {
		console.log(optimization);
		if (optimization) {
			setEditedOptimization({
				id: optimization.id || "",
				name: optimization.name || "",
				status: optimization.status || "",
				scheduledDate: optimization.scheduledDate || "",
			});
		}
	}, [optimization]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setEditedOptimization((prev) => ({ ...prev, [name]: value }));
	};

	const handleRemoveScheduledDate = () => {
		setEditedOptimization((prev) => ({ ...prev, scheduledDate: "" }));
	};

	const canEditScheduledDate = () => {
		if (editedOptimization.status !== "pending") return false;
		if (!editedOptimization.scheduledDate) return true;
		return new Date(editedOptimization.scheduledDate) > new Date();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(editedOptimization);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96">
				<h2 className="text-2xl font-bold mb-4">Edit Optimization</h2>
				<form onSubmit={handleSubmit}>
					{/* Name input */}
					<div className="mb-4">
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700">
							Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={editedOptimization.name}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
					{/* Scheduled Date input */}
					{canEditScheduledDate() && (
						<div className="mb-4">
							<label
								htmlFor="scheduledDate"
								className="block text-sm font-medium text-gray-700">
								Scheduled Date
							</label>
							<div className="flex items-center">
								<input
									type="datetime-local"
									id="scheduledDate"
									name="scheduledDate"
									value={editedOptimization.scheduledDate}
									onChange={handleChange}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
								/>
								{editedOptimization.scheduledDate && (
									<button
										type="button"
										onClick={handleRemoveScheduledDate}
										className="ml-2 text-red-600 hover:text-red-800">
										Remove
									</button>
								)}
							</div>
						</div>
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
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditOptimizationModal;

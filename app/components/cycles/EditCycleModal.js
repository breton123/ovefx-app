import React, { useEffect, useState } from "react";

const EditCycleModal = ({ isOpen, onClose, onSubmit, cycle }) => {
	const [status, setStatus] = useState("");

	useEffect(() => {
		if (cycle) {
			setStatus(cycle.status || "");
		}
	}, [cycle]);

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit({ ...cycle, status });
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96">
				<h2 className="text-2xl font-bold mb-4">Edit Cycle Status</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="status"
							className="block text-sm font-medium text-gray-700">
							Status
						</label>
						<select
							id="status"
							name="status"
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required>
							<option value="">Select a status</option>
							<option value="pending">Pending</option>
							<option value="in_progress">In Progress</option>
							<option value="completed">Completed</option>
							<option value="failed">Failed</option>
						</select>
					</div>
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
							Update
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditCycleModal;

import { useEffect, useState } from "react";

const EditAccountModal = ({ isOpen, onClose, onSubmit, account }) => {
	const [editedAccount, setEditedAccount] = useState({
		id: "",
		name: "",
		login: "",
		server: "",
		enabled: false,
	});

	useEffect(() => {
		if (account) {
			console.log("Account received in modal:", account); // Add this line for debugging
			setEditedAccount({
				id: account.id || "",
				name: account.name || "",
				login: account.login || "",
				server: account.server || "",
				enabled: account.enabled || false,
			});
		}
	}, [account]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setEditedAccount((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const updatedAccount = {
			...editedAccount,
			enabled:
				editedAccount.enabled === true ||
				editedAccount.enabled === "true",
		};
		console.log("Submitting updated account:", updatedAccount); // Add this for debugging
		onSubmit(updatedAccount);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96">
				<h2 className="text-2xl font-bold mb-4">Edit Account</h2>
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
							value={editedAccount.name}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
					{/* Login input */}
					<div className="mb-4">
						<label
							htmlFor="login"
							className="block text-sm font-medium text-gray-700">
							Login
						</label>
						<input
							type="text"
							id="login"
							name="login"
							value={editedAccount.login}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
					{/* Server input */}
					<div className="mb-4">
						<label
							htmlFor="server"
							className="block text-sm font-medium text-gray-700">
							Server
						</label>
						<input
							type="text"
							id="server"
							name="server"
							value={editedAccount.server}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
					{/* Enabled select */}
					<div className="mb-4">
						<label
							htmlFor="enabled"
							className="block text-sm font-medium text-gray-700">
							Enabled
						</label>
						<select
							id="enabled"
							name="enabled"
							value={editedAccount.enabled.toString()}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							<option value="true">Enabled</option>
							<option value="false">Disabled</option>
						</select>
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
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditAccountModal;

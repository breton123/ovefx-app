import React, { useState } from "react";

const AddAccountModal = ({ isOpen, onClose, onSubmit }) => {
	const [accountData, setAccountData] = useState({
		name: "",
		login: "",
		server: "",
		password: "",
		enabled: "true",
		terminalType: "Self hosted",
		type: "Demo",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setAccountData((prevData) => ({ ...prevData, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(accountData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96">
				<h2 className="text-2xl font-bold mb-4">Add Account</h2>
				<form onSubmit={handleSubmit}>
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
							value={accountData.name}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
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
							value={accountData.login}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
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
							value={accountData.server}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							value={accountData.password}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
							maxLength={31}
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="enabled"
							className="block text-sm font-medium text-gray-700">
							Enabled
						</label>
						<select
							id="enabled"
							name="enabled"
							value={accountData.enabled}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							<option value="true">True</option>
							<option value="false">False</option>
						</select>
					</div>
					<div className="mb-4">
						<label
							htmlFor="terminalType"
							className="block text-sm font-medium text-gray-700">
							Terminal Type
						</label>
						<select
							id="terminalType"
							name="terminalType"
							value={accountData.terminalType}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							<option value="Self hosted">Self hosted</option>
							<option value="Cloud">Cloud</option>
						</select>
					</div>
					<div className="mb-4">
						<label
							htmlFor="type"
							className="block text-sm font-medium text-gray-700">
							Account Type
						</label>
						<select
							id="type"
							name="type"
							value={accountData.type}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							<option value="Demo">Demo</option>
							<option value="Live">Live</option>
							<option value="Optimize">Optimize</option>
							<option value="Auto">Auto</option>
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
							Add Account
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddAccountModal;

import React, { useEffect, useState } from "react";

const EditCopierModal = ({
	isOpen,
	onClose,
	onSubmit,
	copier,
	accounts,
	selectedAccount,
	accountsWithCopier,
}) => {
	const [copierData, setCopierData] = useState({
		name: "",
		magicNumbers: [],
	});
	const [slaveAccounts, setSlaveAccounts] = useState([]);

	useEffect(() => {
		if (copier) {
			setCopierData({
				name: copier.name || "",
				magicNumbers: copier.magicNumbers || [],
			});
			setSlaveAccounts(
				accountsWithCopier
					.filter((account) => account.id !== selectedAccount.id)
					.map((account) => ({
						id: account.id,
						maxDrawdown: account.maxDrawdown || 0,
					}))
			);
		}
	}, [copier, accountsWithCopier, selectedAccount]);

	const handleChange = (e) => {
		setCopierData({ ...copierData, [e.target.name]: e.target.value });
	};

	const handleMagicNumberChange = (magic) => {
		setCopierData((prevData) => ({
			...prevData,
			magicNumbers: prevData.magicNumbers.includes(magic)
				? prevData.magicNumbers.filter((m) => m !== magic)
				: [...prevData.magicNumbers, magic],
		}));
	};

	const handleSlaveAccountChange = (accountId, isChecked) => {
		setSlaveAccounts((prevAccounts) => {
			if (isChecked) {
				if (!prevAccounts.some((acc) => acc.id === accountId)) {
					return [...prevAccounts, { id: accountId, maxDrawdown: 0 }];
				}
				return prevAccounts;
			} else {
				return prevAccounts.filter((acc) => acc.id !== accountId);
			}
		});
	};

	const handleMaxDrawdownChange = (accountId, maxDrawdown) => {
		setSlaveAccounts((prevAccounts) =>
			prevAccounts.map((acc) =>
				acc.id === accountId ? { ...acc, maxDrawdown } : acc
			)
		);
	};

	const isAccountSelected = (accountId) => {
		return slaveAccounts.some((acc) => acc.id === accountId);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const updatedCopier = {
			...copier,
			...copierData,
			slaveAccounts: slaveAccounts.map((account) => ({
				id: account.id,
				maxDrawdown: account.maxDrawdown,
				action: accountsWithCopier.some((acc) => acc.id === account.id)
					? "update"
					: "add",
			})),
			deletedAccounts: accountsWithCopier
				.filter(
					(account) =>
						!slaveAccounts.some((acc) => acc.id === account.id)
				)
				.map((account) => ({ id: account.id, action: "delete" })),
		};
		onSubmit(updatedCopier);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-bold mb-4">Edit Copier</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700">
							Copier Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={copierData.name}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
						/>
					</div>

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Magic Numbers
						</label>
						{copierData.magicNumbers.map((magic) => (
							<div key={magic} className="flex items-center mb-2">
								<input
									type="checkbox"
									id={`magic-${magic}`}
									checked={copierData.magicNumbers.includes(
										magic
									)}
									onChange={() =>
										handleMagicNumberChange(magic)
									}
									className="mr-2"
								/>
								<label htmlFor={`magic-${magic}`}>
									{magic}
								</label>
							</div>
						))}
					</div>

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Slave Accounts
						</label>
						{accounts
							.filter(
								(account) =>
									account.id !== selectedAccount.id &&
									account.type === "Live"
							)
							.map((account) => (
								<div
									key={account.id}
									className="flex items-center mb-2">
									<input
										type="checkbox"
										id={`account-${account.id}`}
										checked={isAccountSelected(account.id)}
										onChange={(e) =>
											handleSlaveAccountChange(
												account.id,
												e.target.checked
											)
										}
										className="mr-2"
									/>
									<label
										htmlFor={`account-${account.id}`}
										className="mr-2">
										{account.name}
									</label>
									{isAccountSelected(account.id) && (
										<input
											type="number"
											placeholder="Max Drawdown"
											value={
												slaveAccounts.find(
													(acc) =>
														acc.id === account.id
												)?.maxDrawdown || 0
											}
											onChange={(e) =>
												handleMaxDrawdownChange(
													account.id,
													parseFloat(e.target.value)
												)
											}
											className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
										/>
									)}
								</div>
							))}
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

export default EditCopierModal;

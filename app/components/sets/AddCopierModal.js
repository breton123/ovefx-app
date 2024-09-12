import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Spinner } from "../spinner";

const AddCopierModal = ({ isOpen, onClose, masterAccountId, selectedSets }) => {
	const { user } = useAuth();
	const [copierData, setCopierData] = useState({
		name: "",
		magicNumbers: [],
		slaveAccounts: [],
	});
	const [availableAccounts, setAvailableAccounts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (isOpen && user && masterAccountId) {
			setLoading(true);
			setError(null);
			fetchAvailableAccounts()
				.then(() => setLoading(false))
				.catch((err) => {
					console.error("Error fetching accounts:", err);
					setError("Failed to load accounts. Please try again.");
					setLoading(false);
				});
		}
	}, [isOpen, user, masterAccountId]);

	const fetchAvailableAccounts = async () => {
		const accountsRef = collection(db, `users/${user.uid}/accounts`);
		const accountsSnapshot = await getDocs(accountsRef);
		const accountsList = accountsSnapshot.docs
			.map((doc) => ({ id: doc.id, ...doc.data() }))
			.filter((account) => account.id !== masterAccountId);
		setAvailableAccounts(accountsList);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setCopierData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleMagicNumberChange = (magic) => {
		setCopierData((prevData) => ({
			...prevData,
			magicNumbers: prevData.magicNumbers.includes(magic)
				? prevData.magicNumbers.filter((m) => m !== magic)
				: [...prevData.magicNumbers, magic],
		}));
	};

	const handleSlaveAccountChange = (accountId, maxDrawdown) => {
		setCopierData((prevData) => {
			const updatedSlaveAccounts = prevData.slaveAccounts.some(
				(acc) => acc.id === accountId
			)
				? prevData.slaveAccounts.map((acc) =>
						acc.id === accountId ? { ...acc, maxDrawdown } : acc
				  )
				: [...prevData.slaveAccounts, { id: accountId, maxDrawdown }];
			return { ...prevData, slaveAccounts: updatedSlaveAccounts };
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!user) return;

		try {
			setLoading(true);
			const masterCopierRef = collection(
				db,
				`users/${user.uid}/accounts/${masterAccountId}/copiers`
			);
			const masterCopierDoc = await addDoc(masterCopierRef, {
				name: copierData.name,
				magicNumbers: copierData.magicNumbers,
				type: "master",
			});

			for (const slaveAccount of copierData.slaveAccounts) {
				const slaveCopierRef = collection(
					db,
					`users/${user.uid}/accounts/${slaveAccount.id}/copiers`
				);
				await addDoc(slaveCopierRef, {
					name: copierData.name,
					magicNumbers: copierData.magicNumbers,
					type: "slave",
					maxDrawdown: slaveAccount.maxDrawdown,
				});
			}

			onClose();
		} catch (error) {
			console.error("Error adding copier:", error);
			setError("Failed to add copier. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-bold mb-4">Add New Copier</h2>
				{loading ? (
					<Spinner />
				) : error ? (
					<div className="text-red-500 mb-4">{error}</div>
				) : (
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
								Select Magic Numbers
							</label>
							{selectedSets.map((set) => (
								<div key={set.id} className="flex items-center">
									<input
										type="checkbox"
										id={`magic-${set.magic}`}
										checked={copierData.magicNumbers.includes(
											set.magic
										)}
										onChange={() =>
											handleMagicNumberChange(set.magic)
										}
										className="mr-2"
									/>
									<label htmlFor={`magic-${set.magic}`}>
										{set.name} (Magic: {set.magic})
									</label>
								</div>
							))}
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700">
								Select Slave Accounts
							</label>
							{availableAccounts.map((account) => (
								<div
									key={account.id}
									className="flex items-center mb-2">
									<input
										type="checkbox"
										id={`account-${account.id}`}
										checked={copierData.slaveAccounts.some(
											(acc) => acc.id === account.id
										)}
										onChange={() =>
											handleSlaveAccountChange(
												account.id,
												0
											)
										}
										className="mr-2"
									/>
									<label
										htmlFor={`account-${account.id}`}
										className="mr-2">
										{account.name}
									</label>
									{copierData.slaveAccounts.some(
										(acc) => acc.id === account.id
									) && (
										<input
											type="number"
											placeholder="Max Drawdown"
											value={
												copierData.slaveAccounts.find(
													(acc) =>
														acc.id === account.id
												).maxDrawdown
											}
											onChange={(e) =>
												handleSlaveAccountChange(
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
								Add Copier
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default AddCopierModal;

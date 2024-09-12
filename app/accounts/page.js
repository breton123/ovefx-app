"use client";

import { db } from "@/lib/firebase"; // Ensure this import is correct
import { useAuth } from "@/lib/hooks/useAuth";
import {
	addDoc,
	collection,
	doc,
	getDocs,
	updateDoc,
	deleteDoc,
	query,
	where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import AddAccountModal from "../components/accounts/AddAccountModal.js";
import EditAccountModal from "../components/accounts/EditAccountModal.js";
import { Button } from "../components/button";
import { Search } from "../components/search";
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import Table from "../components/table";

// Sample test data
const testData = [
	{ name: "Account 1", login: "12345", server: "Server A", enabled: true },
	{ name: "Account 2", login: "67890", server: "Server B", enabled: false },
	{ name: "Account 3", login: "11111", server: "Server C", enabled: true },
	{ name: "Account 4", login: "22222", server: "Server A", enabled: false },
	{ name: "Account 5", login: "33333", server: "Server B", enabled: true },
	{ name: "Account 6", login: "44444", server: "Server C", enabled: false },
	{ name: "Account 7", login: "55555", server: "Server A", enabled: true },
	{ name: "Account 8", login: "66666", server: "Server B", enabled: false },
	{ name: "Account 9", login: "77777", server: "Server C", enabled: true },
	{ name: "Account 10", login: "88888", server: "Server A", enabled: false },
	{ name: "Account 11", login: "99999", server: "Server B", enabled: true },
	{ name: "Account 12", login: "10101", server: "Server C", enabled: false },
	{ name: "Account 13", login: "20202", server: "Server A", enabled: true },
	{ name: "Account 14", login: "30303", server: "Server B", enabled: false },
	{ name: "Account 15", login: "40404", server: "Server C", enabled: true },
	{ name: "Account 16", login: "50505", server: "Server A", enabled: false },
	{ name: "Account 17", login: "60606", server: "Server B", enabled: true },
	{ name: "Account 18", login: "70707", server: "Server C", enabled: false },
	{ name: "Account 19", login: "80808", server: "Server A", enabled: true },
	{ name: "Account 20", login: "90909", server: "Server B", enabled: false },
];

export default function AccountsPage() {
	const { user, loading } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [accounts, setAccounts] = useState([]); // Your existing accounts data
	const [selectedAccount, setSelectedAccount] = useState(null);

	useEffect(() => {
		if (user) {
			fetchAccounts();
		}
	}, [user]);

	const fetchAccounts = async () => {
		if (!user) return;

		try {
			const accountsRef = collection(db, `users/${user.uid}/accounts`);
			const accountsSnapshot = await getDocs(accountsRef);
			const accountsList = accountsSnapshot.docs.map((doc) => ({
				id: doc.id, // Change this line
				...doc.data(),
			}));
			console.log(accountsList);
			setAccounts(accountsList);
		} catch (error) {
			console.error("Error fetching accounts:", error);
		}
	};

	const handleAddAccount = async (newAccount) => {
		if (!user) return;

		try {
			const accountsRef = collection(db, `users/${user.uid}/accounts`);
			await addDoc(accountsRef, { ...newAccount, enabled: true });
			fetchAccounts(); // Refresh the accounts list
			setIsModalOpen(false);
		} catch (error) {
			console.error("Error adding account:", error);
		}
	};

	const handleEditAccount = async (updatedAccount) => {
		if (!user) return;

		try {
			console.log("Updating account:", updatedAccount); // Keep this line

			// Log each required field separately
			console.log("ID:", updatedAccount.id);
			console.log("Name:", updatedAccount.name);
			console.log("Login:", updatedAccount.login);
			console.log("Server:", updatedAccount.server);

			// Ensure all required fields are present
			if (
				!updatedAccount.id ||
				!updatedAccount.name ||
				!updatedAccount.login ||
				!updatedAccount.server
			) {
				throw new Error("Missing required fields for account update");
			}

			const accountRef = doc(
				db,
				`users/${user.uid}/accounts`,
				updatedAccount.id
			);

			// Create an object with only the fields we want to update
			const accountUpdate = {
				name: updatedAccount.name,
				login: updatedAccount.login,
				server: updatedAccount.server,
				enabled: updatedAccount.enabled,
			};

			await updateDoc(accountRef, accountUpdate);
			console.log("Account updated successfully");
			fetchAccounts(); // Refresh the accounts list
			setIsEditModalOpen(false);
		} catch (error) {
			console.error("Error updating account:", error);
		}
	};

	const handleDeleteAccount = async (accountId) => {
		if (!user) return;

		try {
			// First, delete all sets associated with this account
			const setsRef = collection(
				db,
				`users/${user.uid}/accounts/${accountId}/sets`
			);
			const setsSnapshot = await getDocs(setsRef);

			const deleteSetsPromises = setsSnapshot.docs.map(async (setDoc) => {
				await deleteDoc(setDoc.ref);
			});

			await Promise.all(deleteSetsPromises);

			// Then, delete the account itself
			const accountRef = doc(db, `users/${user.uid}/accounts`, accountId);
			await deleteDoc(accountRef);

			console.log("Account and associated sets deleted successfully");
			fetchAccounts(); // Refresh the accounts list
		} catch (error) {
			console.error("Error deleting account and sets:", error);
		}
	};

	const openEditModal = (account) => {
		console.log("Selected account:", account);
		setSelectedAccount(account); // This now includes the entire account object
		setIsEditModalOpen(true);
	};

	return (
		<div className="flex font-DM justify-start min-h-screen w-screen bg-[#081028] relative">
			<Spinner className={`${loading ? "flex" : "hidden"}`} />
			<SideBar />
			<div className="flex flex-col w-full px-16 py-10">
				<div className="flex justify-between">
					<div className="flex gap-10 items-center">
						<h1 className="text-white text-2xl font-bold">
							Accounts
						</h1>
						<Search placeholder="Search for account..." />
					</div>
					<Button
						value="Add Account"
						onClick={() => setIsModalOpen(true)}
					/>
				</div>
				<Table
					data={accounts}
					title="Accounts"
					filtersEnabled={false}
					settingsButton={openEditModal} // Simplified this line
					deleteButton={handleDeleteAccount}
				/>
				<AddAccountModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleAddAccount}
				/>
				<EditAccountModal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setSelectedAccount(null); // Reset selected account when closing
					}}
					onSubmit={handleEditAccount}
					account={selectedAccount}
				/>
			</div>
		</div>
	);
}

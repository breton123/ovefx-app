"use client";

import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button } from "../components/button";
import { Search } from "../components/search";
import { Select } from "../components/select"; // Assuming you have a Select component
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import Table from "../components/table";

export default function CopiersPage() {
	const { user, loading } = useAuth();
	const [accounts, setAccounts] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState("");
	const [copiers, setCopiers] = useState([]);

	useEffect(() => {
		if (user) {
			fetchAccounts();
		}
	}, [user]);

	useEffect(() => {
		if (selectedAccount) {
			fetchCopiers(selectedAccount);
		}
	}, [selectedAccount]);

	const fetchAccounts = async () => {
		if (!user) return;

		try {
			const accountsRef = collection(db, `users/${user.uid}/accounts`);
			const accountsSnapshot = await getDocs(accountsRef);
			const accountsList = accountsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setAccounts(accountsList);
		} catch (error) {
			console.error("Error fetching accounts:", error);
		}
	};

	const fetchCopiers = async (accountId) => {
		if (!user) return;

		try {
			const copiersRef = collection(
				db,
				`users/${user.uid}/accounts/${accountId}/copiers`
			);
			const copiersSnapshot = await getDocs(copiersRef);
			const copiersList = copiersSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setCopiers(copiersList);
		} catch (error) {
			console.error("Error fetching copiers:", error);
		}
	};

	const deleteCopier = async (copier) => {
		if (!user || !selectedAccount) return;

		try {
			const copierRef = doc(
				db,
				`users/${user.uid}/accounts/${selectedAccount}/copiers/${copier.id}`
			);
			await deleteDoc(copierRef);
			setCopiers((prevCopiers) =>
				prevCopiers.filter((c) => c.id !== copier.id)
			);
		} catch (error) {
			console.error("Error deleting copier:", error);
		}
	};

	const accountOptions = accounts.map((account) => ({
		value: account.id,
		label: account.name,
	}));

	return (
		<div className="flex font-DM justify-start min-h-screen w-screen bg-[#081028] relative">
			<Spinner className={`${loading ? "flex" : "hidden"}`} />
			<SideBar />
			<div className="flex flex-col w-full px-16 py-10">
				<div className="flex justify-between">
					<div className="flex gap-10 items-center">
						<h1 className="text-white text-2xl font-bold">
							Copiers
						</h1>
						<Search placeholder="Search for copier..." />
					</div>
				</div>
				<Select
					options={accountOptions}
					value={selectedAccount}
					onChange={setSelectedAccount}
					placeholder="Select an account"
					className="mb-4 mt-4"
				/>
				{selectedAccount && (
					<Table
						data={copiers}
						title="Copiers"
						filtersEnabled={false}
						deleteButton={deleteCopier}
						selectedAccount={selectedAccount}
						viewButton={false}
					/>
				)}
			</div>
		</div>
	);
}

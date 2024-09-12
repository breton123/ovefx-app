"use client";

import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import {
	getDownloadURL,
	getStorage,
	ref as storageRef,
	uploadBytes,
} from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/button";
import { Search } from "../components/search";
import { Select } from "../components/select";
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import Table from "../components/table";

export default function OptSetsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [sets, setSets] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [targetDrawdown, setTargetDrawdown] = useState("");
	const [isAddSetsModalOpen, setIsAddSetsModalOpen] = useState(false);
	const [numberOfSetsToAdd, setNumberOfSetsToAdd] = useState("");
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	const optId = searchParams.get("optId");
	const cycleId = searchParams.get("cycleId"); // Add this line to get the cycleId

	useEffect(() => {
		if (user) {
			fetchAccounts();
			if (optId && cycleId) {
				// Update this condition
				fetchOptimizedSets(optId, cycleId); // Update this function call
			}
		}
	}, [user, optId, cycleId, db]); // Add cycleId to the dependency array

	const fetchAccounts = async () => {
		// ... (keep existing fetchAccounts logic)
	};

	const fetchOptimizedSets = async (optId, cycleId) => {
		// Update function signature
		if (!user || !optId || !cycleId) return; // Update condition

		setLoading(true);
		try {
			const setsRef = collection(
				db,
				`users/${user.uid}/optimizations/${optId}/cycles/${cycleId}/sets` // Update the path
			);
			const setsSnapshot = await getDocs(setsRef);
			const setsList = setsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setSets(setsList);
		} catch (error) {
			console.error("Error fetching optimized sets:", error);
		} finally {
			setLoading(false);
		}
	};

	// New function to handle adding sets to account
	const handleAddSetsToAccount = async (numberOfSets) => {
		if (!user || !optId) return;

		try {
			const sortedSets = [...sets].sort(
				(a, b) => b.oveScore - a.oveScore
			);
			const setsToAdd = sortedSets.slice(0, numberOfSets);

			for (let set of setsToAdd) {
				await handleAddSet(set);
			}

			setIsAddSetsModalOpen(false);
			fetchSets();
		} catch (error) {
			console.error("Error adding sets to account:", error);
		}
	};

	// Add this new function to handle clearing sets
	const handleClearSets = async () => {
		setIsConfirmModalOpen(false);
		if (!user || !optId || !cycleId) return;

		setLoading(true);
		try {
			const setsRef = collection(
				db,
				`users/${user.uid}/optimizations/${optId}/cycles/${cycleId}/sets`
			);
			const setsSnapshot = await getDocs(setsRef);

			const deletePromises = setsSnapshot.docs.map((doc) =>
				deleteDoc(doc.ref)
			);
			await Promise.all(deletePromises);

			setSets([]);
		} catch (error) {
			console.error("Error clearing sets:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleGoBack = () => {
		router.push(`/cycles?optId=${optId}`);
	};

	return (
		<div className="flex font-DM justify-start min-h-screen w-screen bg-[#081028] relative">
			<Spinner className={`${loading ? "flex" : "hidden"}`} />
			<SideBar />
			<div className="flex flex-col w-full px-16 py-10">
				<div className="flex justify-between mb-4">
					<div className="flex items-center gap-4">
						<button
							onClick={handleGoBack}
							className="text-white hover:text-gray-300 transition-colors">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
						</button>
						<h1 className="text-white text-2xl font-bold">
							Optimized Sets
						</h1>
					</div>
					<div className="flex gap-4 items-center">
						<Button
							value="Add Sets to Account"
							onClick={() => setIsAddSetsModalOpen(true)}
						/>
						<Button
							value="Clear Sets"
							onClick={() => setIsConfirmModalOpen(true)}
							className="bg-red-600 hover:bg-red-700"
						/>
					</div>
				</div>
				{optId &&
					cycleId && ( // Update this condition
						<p className="text-white mb-4">
							Optimization ID: {optId}, Cycle ID: {cycleId}
						</p>
					)}
				{/* Dashboard Cards */}
				{/* ... (keep existing dashboard cards) */}
				<Table
					data={sets}
					title="Set Finder"
					filtersEnabled={true}
					defaultRowsPerPage={50}
					selectable={true}
				/>
				<div className="mt-6 w-full">
					{/* ... (keep existing chart component) */}
				</div>
			</div>
			{/* Confirmation Modal */}
			{isConfirmModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg">
						<h2 className="text-xl font-bold mb-4">
							Confirm Deletion
						</h2>
						<p className="mb-4">
							Are you sure you want to clear all sets? This action
							cannot be undone.
						</p>
						<div className="flex justify-end gap-4">
							<Button
								value="Cancel"
								onClick={() => setIsConfirmModalOpen(false)}
								className="bg-gray-300 hover:bg-gray-400 text-black"
							/>
							<Button
								value="Confirm"
								onClick={handleClearSets}
								className="bg-red-600 hover:bg-red-700"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

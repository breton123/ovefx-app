"use client";

import { db, storage } from "@/lib/firebase";
import { useAccounts } from "@/lib/hooks/useAccounts"; // Add this import
import { useAuth } from "@/lib/hooks/useAuth";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	onSnapshot,
	query,
	Timestamp,
	updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { useRouter } from "next/navigation"; // Add this import
import { useEffect, useState } from "react";
import { Button } from "../components/button";
import AddOptimizationModal from "../components/optimizations/AddOptimizationModal.js";
import EditOptimizationModal from "../components/optimizations/EditOptimizationModal.js";
import { Search } from "../components/search";
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import Table from "../components/table";

export default function OptimizationsPage() {
	const { user, loading } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [optimizations, setOptimizations] = useState([]);
	const [selectedOptimization, setSelectedOptimization] = useState(null);
	const { accounts } = useAccounts(user); // Add this line
	const router = useRouter(); // Add this line

	useEffect(() => {
		if (!user) return;

		const fetchOptimizations = () => {
			const optimizationsRef = collection(
				db,
				`users/${user.uid}/optimizations`
			);
			const optimizationsQuery = query(optimizationsRef);

			const unsubscribe = onSnapshot(optimizationsQuery, (snapshot) => {
				const optimizationsList = snapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						id: doc.id,
						name: data.name,
						status: data.status,
						symbols: data.symbols.join(", "),
						createdAt:
							data.createdAt instanceof Timestamp
								? data.createdAt.toDate().toLocaleString()
								: data.createdAt,
						scheduledDate:
							data.scheduledDate instanceof Timestamp
								? data.scheduledDate.toDate().toLocaleString()
								: data.scheduledDate,
					};
				});
				setOptimizations(optimizationsList);
				console.log(optimizationsList);
			});

			// Return the unsubscribe function
			return unsubscribe;
		};

		const unsubscribe = fetchOptimizations();

		// Cleanup function to unsubscribe when component unmounts
		return () => unsubscribe();
	}, [user]); // Remove db from the dependency array

	const handleAddOptimization = async (newOptimization) => {
		if (!user) return;

		try {
			const optimizationsRef = collection(
				db,
				`users/${user.uid}/optimizations`
			);

			// Prepare the optimization data for Firestore
			const optimizationData = {
				name: newOptimization.optimizationName,
				expertName: newOptimization.expertName,
				symbols: newOptimization.symbols,
				period: newOptimization.period,
				startDate: newOptimization.startDate,
				endDate: newOptimization.endDate,
				forward: newOptimization.forward,
				delays: newOptimization.delays,
				customDelay: newOptimization.customDelay,
				modelling: newOptimization.modelling,
				deposit: parseFloat(newOptimization.deposit),
				leverage: parseFloat(newOptimization.leverage),
				optModel: newOptimization.optModel,
				optCriterion: newOptimization.optCriterion,
				scheduleStart: newOptimization.scheduleStart,
				scheduledDate: newOptimization.scheduledDate,
				status: newOptimization.scheduleStart ? "scheduled" : "pending",
				createdAt: new Date(),
				optimizationFiles: [], // Add this new field
			};

			// Add the optimization to Firestore
			const docRef = await addDoc(optimizationsRef, optimizationData);
			const cyclesCollectionRef = collection(
				db,
				`users/${user.uid}/optimizations/${docRef.id}/cycles`
			);

			// Handle file uploads
			if (newOptimization.optimizationFiles.length > 0) {
				const storageRef = ref(
					storage,
					`users/${user.uid}/optimizations/${docRef.id}`
				);
				for (let file of newOptimization.optimizationFiles) {
					const fileRef = ref(storageRef, file.name);
					await uploadBytes(fileRef, file);
					const downloadURL = await getDownloadURL(fileRef);

					// Add file info to the optimizationFiles array
					optimizationData.optimizationFiles.push({
						name: file.name,
						path: downloadURL,
					});

					for (let symbol of newOptimization.symbols) {
						await addDoc(cyclesCollectionRef, {
							status: "pending",
							symbol: symbol,
							optFile: downloadURL,
							createdAt: new Date(),
						});
					}
				}

				// Update the document with the file information
				await updateDoc(docRef, {
					optimizationFiles: optimizationData.optimizationFiles,
				});
			}

			// Remove the call to fetchOptimizations() as it's no longer needed
			setIsModalOpen(false);
		} catch (error) {
			console.error("Error adding optimization:", error);
		}
	};

	const handleEditOptimization = async (updatedOptimization) => {
		if (!user || !updatedOptimization.id) return;

		try {
			const optimizationRef = doc(
				db,
				`users/${user.uid}/optimizations`,
				updatedOptimization.id
			);

			const updateData = {
				name: updatedOptimization.name,
			};

			const currentDate = new Date();
			let newScheduledDate = null;

			if (updatedOptimization.scheduledDate) {
				newScheduledDate = new Date(updatedOptimization.scheduledDate);
				if (!isNaN(newScheduledDate.getTime())) {
					if (newScheduledDate > currentDate) {
						updateData.scheduledDate =
							Timestamp.fromDate(newScheduledDate);
						updateData.status = "scheduled";
					} else {
						console.error("Scheduled date must be in the future");
						// You might want to show an error message to the user here
						return;
					}
				} else {
					console.error(
						"Invalid scheduledDate:",
						updatedOptimization.scheduledDate
					);
					// You might want to show an error message to the user here
					return;
				}
			} else {
				// If scheduledDate is empty, remove it from Firestore and update status
				updateData.scheduledDate = null;
				updateData.status = "pending";
			}

			await updateDoc(optimizationRef, updateData);
			// Remove the call to fetchOptimizations() as it's no longer needed
			setIsEditModalOpen(false);
		} catch (error) {
			console.error("Error updating optimization:", error);
			// You might want to show an error message to the user here
		}
	};

	const handleDeleteOptimization = async (optimizationId) => {
		if (!user) return;

		try {
			const optimizationRef = doc(
				db,
				`users/${user.uid}/optimizations`,
				optimizationId
			);
			await deleteDoc(optimizationRef);
			// Remove the call to fetchOptimizations() as it's no longer needed
		} catch (error) {
			console.error("Error deleting optimization:", error);
		}
	};

	const handleViewOptimization = (optimization) => {
		router.push(`/cycles?optId=${optimization.id}`);
	};

	const openEditModal = (optimization) => {
		setSelectedOptimization({
			...optimization,
			id: optimization.id || optimization.uid, // Try both id and uid
		});
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
							Optimizations
						</h1>
						<Search placeholder="Search for optimization..." />
					</div>
					<Button
						value="Add Optimization"
						onClick={() => setIsModalOpen(true)}
					/>
				</div>
				<Table
					data={optimizations}
					title="Optimizations"
					filtersEnabled={false}
					settingsButton={openEditModal}
					deleteButton={handleDeleteOptimization}
					viewButton={handleViewOptimization} // This line is updated
				/>
				<AddOptimizationModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleAddOptimization}
				/>
				<EditOptimizationModal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setSelectedOptimization(null);
					}}
					onSubmit={handleEditOptimization}
					optimization={selectedOptimization}
				/>
			</div>
		</div>
	);
}

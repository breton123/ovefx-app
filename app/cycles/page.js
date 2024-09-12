"use client";

import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeftIcon } from "@heroicons/react/24/solid"; // Add this import
import { format } from "date-fns";
import {
	collection,
	doc,
	onSnapshot,
	query,
	updateDoc,
} from "firebase/firestore"; // Add this import
import { Suspense, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/button";
import EditCycleModal from "../components/cycles/EditCycleModal"; // Add this import
import { Search } from "../components/search";
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import Table from "../components/table";

function CyclesPageContent() {
	const searchParams = useSearchParams();
	return <CyclesPageInner searchParams={searchParams} />;
}

export default function CyclesPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CyclesPageContent />
		</Suspense>
	);
}

function CyclesPageInner({ searchParams }) {
	const { user } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [cycles, setCycles] = useState([]);
	const optId = searchParams.get("optId");
	const [selectedCycle, setSelectedCycle] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const fetchCycles = useCallback(() => {
		if (!user || !optId) return;

		setLoading(true);
		const cyclesRef = collection(
			db,
			`users/${user.uid}/optimizations/${optId}/cycles`
		);
		const cyclesQuery = query(cyclesRef);

		return onSnapshot(
			cyclesQuery,
			(snapshot) => {
				const cyclesList = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setCycles(cyclesList);
				setLoading(false);
			},
			(error) => {
				console.error("Error fetching cycles:", error);
				setLoading(false);
			}
		);
	}, [user, optId]);

	useEffect(() => {
		if (user && optId) {
			const unsubscribe = fetchCycles();
			return () => unsubscribe && unsubscribe();
		}
	}, [user, optId, fetchCycles]);

	const handleViewSets = useCallback(
		(row) => {
			router.push(`/setfinder?optId=${optId}&cycleId=${row.id}`);
		},
		[router, optId]
	);

	const handleEditCycle = useCallback((row) => {
		setSelectedCycle(row);
		setIsEditModalOpen(true);
	}, []);

	const handleEditSubmit = useCallback(
		async (updatedCycle) => {
			try {
				const cycleRef = doc(
					db,
					`users/${user.uid}/optimizations/${optId}/cycles/${updatedCycle.id}`
				);
				await updateDoc(cycleRef, updatedCycle);
				console.log("Cycle updated successfully");
				setIsEditModalOpen(false);
				setSelectedCycle(null);
			} catch (error) {
				console.error("Error updating cycle:", error);
				// Optionally, you can add error handling logic here (e.g., show an error message to the user)
			}
		},
		[user, optId]
	);

	const formatValue = useCallback((value) => {
		if (value && typeof value === "object") {
			if (value.seconds && value.nanoseconds) {
				// Handle Firestore Timestamp
				return format(
					new Date(value.seconds * 1000),
					"yyyy-MM-dd HH:mm:ss"
				);
			} else {
				// Handle other objects
				return JSON.stringify(value);
			}
		}
		return value;
	}, []);

	const formattedCycles = cycles.map((cycle) => {
		const formattedCycle = {};
		for (const [key, value] of Object.entries(cycle)) {
			formattedCycle[key] = formatValue(value);
		}
		return formattedCycle;
	});

	const handleBack = useCallback(() => {
		router.push("/optimizations");
	}, [router]);

	return (
		<div className="flex font-DM justify-start min-h-screen w-screen bg-[#081028] relative">
			<Spinner className={`${loading ? "flex" : "hidden"}`} />
			<SideBar />
			<div className="flex flex-col w-full px-16 py-10">
				<div className="flex justify-between mb-4">
					<div className="flex gap-10 items-center">
						<button
							onClick={handleBack}
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
							Optimization Cycles
						</h1>
						<Search placeholder="Search for cycle..." />
					</div>
				</div>
				<Table
					data={formattedCycles}
					title="Optimization Cycles"
					filtersEnabled={false}
					defaultHiddenColumns={["optFile"]}
					defaultRowsPerPage={10}
					selectable={true}
					viewButton={handleViewSets}
					settingsButton={handleEditCycle}
				/>
				<EditCycleModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					onSubmit={handleEditSubmit}
					cycle={selectedCycle}
				/>
			</div>
		</div>
	);
}

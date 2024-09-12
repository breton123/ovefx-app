"use client";

import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import {
	addDoc,
	collection,
	doc,
	getDocs,
	onSnapshot,
	query,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/button";
import { Search } from "../components/search";
import { Select } from "../components/select";
import AddSetModal from "../components/sets/AddSetModal";
import EditSetModal from "../components/sets/EditSetModal";
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import Table from "../components/table";
// Add this near the top of your file
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import {
	getDownloadURL,
	getStorage,
	ref as storageRef,
	uploadBytes,
} from "firebase/storage";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card } from "../components/card";
import { Chart } from "../components/chart";
import AddCopierModal from "../components/sets/AddCopierModal";

function SetsPageContent() {
	const searchParams = useSearchParams();
	return <SetsPageInner searchParams={searchParams} />;
}

export default function SetsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SetsPageContent />
		</Suspense>
	);
}

function SetsPageInner({ searchParams }) {
	const { user, loading } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [sets, setSets] = useState([]);
	const [selectedSet, setSelectedSet] = useState(null);
	const [accounts, setAccounts] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [accountStats, setAccountStats] = useState({
		totalProfit: 0,
		averageWinRate: 0,
		totalTrades: 0,
		averageDrawdown: 0,
	});
	const [selectedRows, setSelectedRows] = useState([]);
	const [hideDisabledSets, setHideDisabledSets] = useState(true);
	const [selectedSetsData, setSelectedSetsData] = useState(null);
	const [isAddCopierModalOpen, setIsAddCopierModalOpen] = useState(false);
	const [selectedSets, setSelectedSets] = useState([]);
	const [showSelectedRows, setShowSelectedRows] = useState(false);
	const [selectedStat, setSelectedStat] = useState("cumulativeProfit");
	const [cumulativeProfitData, setCumulativeProfitData] = useState({});
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (user) {
			const unsubscribeAccounts = fetchAccounts();
			return () => {
				if (unsubscribeAccounts) unsubscribeAccounts();
			};
		}
	}, [user]);

	useEffect(() => {
		let unsubscribeSets = () => {};
		let unsubscribeTrades = () => {};

		if (user && selectedAccount) {
			const fetchData = async () => {
				unsubscribeSets = (await fetchSets()) || (() => {});
				unsubscribeTrades =
					(await fetchTradesForAllSets()) || (() => {});
			};

			fetchData();
		}

		return () => {
			if (typeof unsubscribeSets === "function") unsubscribeSets();
			if (typeof unsubscribeTrades === "function") unsubscribeTrades();
		};
	}, [user, selectedAccount]);

	const formatTime = (timeData) => {
		var d = new Date(0);
		d.setUTCSeconds(timeData);
		return d.toLocaleString("en-GB", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	};

	const statOptions = [
		{ value: "cumulativeProfit", label: "Cumulative Profit" },
		{ value: "profit", label: "Profit" },
		{ value: "maxDrawdown", label: "Max Drawdown" },
		{ value: "profitFactor", label: "Profit Factor" },
		// Add more options as needed
	];

	useEffect(() => {
		if (user) {
			fetchSets();
		}
	}, [user, db]);

	useEffect(() => {
		if (sets.length > 0) {
			calculateAccountStats();
		}
	}, [sets]);

	const fetchAccounts = () => {
		if (!user) return;

		const accountsRef = collection(db, `users/${user.uid}/accounts`);
		return onSnapshot(accountsRef, (snapshot) => {
			const accountsList = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setAccounts(accountsList);

			const accountIdFromUrl = searchParams.get("id");
			if (
				accountIdFromUrl &&
				accountsList.some((account) => account.id === accountIdFromUrl)
			) {
				setSelectedAccount(accountIdFromUrl);
			} else if (accountsList.length > 0) {
				setSelectedAccount(accountsList[0].id);
			}
		});
	};

	const fetchSets = useCallback(() => {
		if (!user || !selectedAccount) return;

		const setsRef = collection(
			db,
			`users/${user.uid}/accounts/${selectedAccount}/sets`
		);
		return onSnapshot(setsRef, (snapshot) => {
			const setsList = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					...data,
					...data.latest_stats,
				};
			});
			setSets(setsList);
		});
	}, [user, selectedAccount]);

	const handleAddSet = async (newSets) => {
		if (!user || !selectedAccount) return;

		try {
			const setsRef = collection(
				db,
				`users/${user.uid}/accounts/${selectedAccount}/sets`
			);

			// Ensure newSets is always an array
			const setsToAdd = Array.isArray(newSets) ? newSets : [newSets];

			for (let newSet of setsToAdd) {
				let setDataToAdd = { ...newSet, enabled: true };

				// Ensure apiKey is not empty or undefined
				if (!setDataToAdd.apiKey) {
					console.error(
						"API key is required for set:",
						setDataToAdd.setName
					);
					continue;
				}

				// Generate a magic number if it's not provided
				if (!setDataToAdd.magicNumber) {
					setDataToAdd.magicNumber = Math.floor(
						Math.random() * 1000000
					);
				}

				// Use the magic number as both the document ID and the uid field
				const docId = setDataToAdd.magicNumber.toString();
				setDataToAdd.uid = docId;

				// Rename magicNumber to magic and include expertName and apiKey
				const { magicNumber, expertName, apiKey, ...restOfSet } =
					setDataToAdd;
				setDataToAdd = {
					...restOfSet,
					magic: magicNumber,
					expertName,
					apiKey,
				};

				// Remove setFile from the data to be added to Firestore
				const { setFile, ...setDataWithoutFile } = setDataToAdd;

				// Handle file upload if a file is provided
				if (setFile) {
					const storage = getStorage();
					const fileRef = storageRef(
						storage,
						`users/${user.uid}/sets/${docId}`
					);
					await uploadBytes(fileRef, setFile);
					const downloadURL = await getDownloadURL(fileRef);
					setDataWithoutFile.setFileURL = downloadURL;
				}

				// Use setDoc instead of addDoc to specify the document ID
				await setDoc(doc(setsRef, docId), setDataWithoutFile);
			}

			fetchSets();
			setIsModalOpen(false);
		} catch (error) {
			console.error("Error adding set(s):", error);
		}
	};

	const handleEditSet = async (updatedSet) => {
		if (!user || !selectedAccount || !updatedSet || !updatedSet.magic) {
			console.error("Missing required data for update");
			return;
		}

		try {
			console.log("Updating set:", updatedSet);

			const setDocPath = `users/${user.uid}/accounts/${selectedAccount}/sets/${updatedSet.magic}`;
			console.log("Document path:", setDocPath);

			const setRef = doc(db, setDocPath);

			const setUpdate = {};

			// Only add fields to setUpdate if they are defined
			if (updatedSet.setName !== undefined)
				setUpdate.name = updatedSet.setName;
			if (updatedSet.symbol !== undefined)
				setUpdate.symbol = updatedSet.symbol;
			if (updatedSet.strategy !== undefined)
				setUpdate.strategy = updatedSet.strategy;
			if (updatedSet.enabled !== undefined)
				setUpdate.enabled = updatedSet.enabled;
			if (updatedSet.apiKey !== undefined)
				setUpdate.apiKey = updatedSet.apiKey;
			if (updatedSet.expertName !== undefined)
				setUpdate.expertName = updatedSet.expertName;
			// Add other relevant set fields here, following the same pattern

			// Handle file upload if a new file is provided
			if (updatedSet.setFile) {
				const storage = getStorage();
				const fileRef = storageRef(
					storage,
					`users/${user.uid}/sets/${updatedSet.magic}`
				);
				await uploadBytes(fileRef, updatedSet.setFile);
				const downloadURL = await getDownloadURL(fileRef);
				setUpdate.setFileURL = downloadURL;
			}

			// Only proceed with the update if there are fields to update
			if (Object.keys(setUpdate).length > 0) {
				console.log("Updating document with:", setUpdate);
				await updateDoc(setRef, setUpdate);
				console.log("Set updated successfully");
				fetchSets();
				setIsEditModalOpen(false);
			} else {
				console.log("No fields to update");
			}
		} catch (error) {
			console.error("Error updating set:", error);
			console.error("Error details:", error.stack);
		}
	};

	const openEditModal = (set) => {
		console.log("Selected set:", set);
		setSelectedSet(set);
		setIsEditModalOpen(true);
	};

	useEffect(() => {
		if (selectedAccount) {
			fetchSets();
		}
	}, [selectedAccount]);

	const calculateAccountStats = useCallback(() => {
		let setsToCalculate = hideDisabledSets
			? sets.filter((set) => set.enabled)
			: sets;

		if (selectedRows.length > 0) {
			setsToCalculate = setsToCalculate.filter((set) =>
				selectedRows.includes(set.id)
			);
		}

		let totalProfit = 0;
		let totalWinRate = 0;
		let totalTrades = 0;
		let totalDrawdown = 0;

		setsToCalculate.forEach((set) => {
			totalProfit += set.profit || 0;
			totalWinRate += set.winRate || 0;
			totalTrades += set.totalTrades || 0;
			totalDrawdown += set.maxDrawdown || 0;
		});

		const setCount = setsToCalculate.length;

		setAccountStats({
			totalProfit,
			averageWinRate: setCount > 0 ? totalWinRate / setCount : 0,
			totalTrades,
			averageDrawdown: setCount > 0 ? totalDrawdown / setCount : 0,
		});
	}, [sets, selectedRows, hideDisabledSets]);

	useEffect(() => {
		calculateAccountStats();
	}, [calculateAccountStats]);

	const calculateTrend = useCallback((currentValue, historicalData) => {
		if (historicalData.length < 2) return 0;
		const oldValue =
			historicalData[historicalData.length - 2][currentValue] || 0;
		const newValue =
			historicalData[historicalData.length - 1][currentValue] || 0;
		return oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
	}, []);

	const getHistoricalData = useCallback(() => {
		let setsToUse = hideDisabledSets
			? sets.filter((set) => set.enabled)
			: sets;

		if (selectedRows.length > 0) {
			setsToUse = setsToUse.filter((set) =>
				selectedRows.includes(set.id)
			);
		}

		return setsToUse.flatMap((set) => set.stats_history || []);
	}, [sets, selectedRows, hideDisabledSets]);

	const handleRowSelection = (selectedRowIds) => {
		setSelectedRows(selectedRowIds);
	};

	const toggleHideDisabledSets = () => {
		setHideDisabledSets(!hideDisabledSets);
	};

	const handleSelectedSetsChange = (selectedIds) => {
		// Calculate the data for the cards based on the selected sets
		const calculatedData = calculateDataForCards(sets, selectedIds);
		setSelectedSetsData(calculatedData);
	};

	const calculateDataForCards = (allSets, selectedIds) => {
		const selectedSets = allSets.filter((set) =>
			selectedIds.includes(set.id)
		);

		const totalProfit = selectedSets.reduce(
			(sum, set) => sum + (set.profit || 0),
			0
		);
		const averageWinRate =
			selectedSets.length > 0
				? selectedSets.reduce(
						(sum, set) => sum + (set.winRate || 0),
						0
				  ) / selectedSets.length
				: 0;
		const totalTrades = selectedSets.reduce(
			(sum, set) => sum + (set.totalTrades || 0),
			0
		);
		const averageDrawdown =
			selectedSets.length > 0
				? selectedSets.reduce(
						(sum, set) => sum + (set.maxDrawdown || 0),
						0
				  ) / selectedSets.length
				: 0;

		return {
			totalProfit,
			averageWinRate,
			totalTrades,
			averageDrawdown,
		};
	};

	const handleAddCopier = () => {
		const selectedSetsData = sets.filter((set) =>
			selectedRows.includes(set.id)
		);
		setSelectedSets(selectedSetsData);
		setIsAddCopierModalOpen(true);
	};

	const handleToggleSelectedRows = (showSelected) => {
		// If no rows are selected, always show all
		if (selectedRows.length === 0) {
			setShowSelectedRows(false);
		} else {
			setShowSelectedRows(showSelected);
		}
	};

	const getFilteredSets = useCallback(() => {
		let filteredSets = sets;

		if (hideDisabledSets) {
			filteredSets = filteredSets.filter((set) => set.enabled);
		}

		if (showSelectedRows && selectedRows.length > 0) {
			filteredSets = filteredSets.filter((set) =>
				selectedRows.includes(set.id)
			);
		}

		// Add this block to filter by magic number
		if (searchTerm) {
			filteredSets = filteredSets.filter((set) =>
				set.magic.toString().includes(searchTerm)
			);
		}

		return filteredSets;
	}, [sets, hideDisabledSets, showSelectedRows, selectedRows, searchTerm]);

	const fetchTradesForAllSets = async () => {
		if (!user || !selectedAccount) return;

		const setsRef = collection(
			db,
			`users/${user.uid}/accounts/${selectedAccount}/sets`
		);
		const setsSnapshot = await getDocs(setsRef);

		const allCumulativeProfitData = {};

		for (const setDoc of setsSnapshot.docs) {
			const setId = setDoc.id;
			const tradesRef = collection(setsRef, setId, "trades");
			const tradesSnapshot = await getDocs(tradesRef);

			let cumulativeProfit = 0;
			const setData = tradesSnapshot.docs
				.map((doc) => {
					const trade = doc.data();
					cumulativeProfit += parseFloat(trade.profit);
					return {
						time: formatTime(trade.time),
						timestamp: trade.time,
						cumulativeProfit: parseFloat(
							cumulativeProfit.toFixed(2)
						),
					};
				})
				.sort((a, b) => a.timestamp - b.timestamp);

			allCumulativeProfitData[setId] = setData;
		}

		setCumulativeProfitData(allCumulativeProfitData);
	};

	const getChartData = useCallback(() => {
		const visibleSets = getFilteredSets();
		const chartData = {};
		let latestTimestamp = 0;

		// First pass: Collect data and find the latest timestamp
		visibleSets.forEach((set) => {
			if (selectedStat === "cumulativeProfit") {
				const setData = cumulativeProfitData[set.id] || [];
				setData.forEach((dataPoint) => {
					const time = dataPoint.time;
					if (!chartData[time]) {
						chartData[time] = { time };
					}
					chartData[time][set.magic] = dataPoint.cumulativeProfit;
					latestTimestamp = Math.max(
						latestTimestamp,
						new Date(time).getTime()
					);
				});
			} else if (set.stats_history) {
				set.stats_history.forEach((stat) => {
					const time = formatTime(stat.timestamp);
					if (!chartData[time]) {
						chartData[time] = { time };
					}
					chartData[time][set.magic] = stat[selectedStat] || 0;
					latestTimestamp = Math.max(
						latestTimestamp,
						new Date(time).getTime()
					);
				});
			}
		});

		// Second pass: Extend lines to the latest timestamp
		const sortedData = Object.values(chartData).sort(
			(a, b) => new Date(a.time) - new Date(b.time)
		);
		if (sortedData.length > 0) {
			const lastDataPoint = sortedData[sortedData.length - 1];
			visibleSets.forEach((set) => {
				if (!(set.magic in lastDataPoint)) {
					// Find the last available value for this set
					let lastValue = 0;
					for (let i = sortedData.length - 1; i >= 0; i--) {
						if (set.magic in sortedData[i]) {
							lastValue = sortedData[i][set.magic];
							break;
						}
					}
					// Add this last value to the final data point
					lastDataPoint[set.magic] = lastValue;
				}
			});
		}

		return sortedData;
	}, [getFilteredSets, selectedStat, cumulativeProfitData]);

	return (
		<div className="flex font-DM justify-start min-h-screen w-full bg-[#081028] relative overflow-x-hidden">
			<Spinner className={`${loading ? "flex" : "hidden"}`} />
			<SideBar />
			<div className="flex flex-col w-full px-4 sm:px-8 lg:px-16 py-10 overflow-x-hidden">
				<div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
					<div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start sm:items-center">
						<h1 className="text-white text-2xl font-bold">Sets</h1>
						<Search
							placeholder="Search by magic number..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className="flex gap-4">
						<Button
							value="Add Set"
							onClick={() => setIsModalOpen(true)}
						/>
						<Button
							value="Add Copier"
							onClick={handleAddCopier}
							disabled={selectedRows.length === 0}
						/>
					</div>
				</div>
				<Select
					options={accounts.map((account) => ({
						value: account.id,
						label: account.name + " - " + account.login,
					}))}
					value={selectedAccount}
					onChange={(value) => setSelectedAccount(value)}
					placeholder="Select an account"
					className="mb-4"
				/>
				{/* Dashboard Cards */}
				<div className="flex justify-between gap-4 mb-6">
					<Card
						title="Total Profit"
						value={`$${(
							selectedSetsData?.totalProfit ||
							accountStats.totalProfit
						).toFixed(2)}`}
						trend={calculateTrend("profit", getHistoricalData())}
					/>
					<Card
						title="Average Win Rate"
						value={`${(
							selectedSetsData?.averageWinRate ||
							accountStats.averageWinRate
						).toFixed(2)}%`}
						trend={calculateTrend("winRate", getHistoricalData())}
					/>
					<Card
						title="Total Trades"
						value={
							selectedSetsData?.totalTrades ||
							accountStats.totalTrades
						}
						trend={calculateTrend(
							"totalTrades",
							getHistoricalData()
						)}
					/>
					<Card
						title="Average Max Drawdown"
						value={`${(
							selectedSetsData?.averageDrawdown ||
							accountStats.averageDrawdown
						).toFixed(2)}`}
						trend={calculateTrend(
							"maxDrawdown",
							getHistoricalData()
						)}
					/>
				</div>
				<div className="overflow-x-auto">
					<Table
						data={getFilteredSets()}
						title="Sets"
						filtersEnabled={true}
						settingsButton={openEditModal}
						defaultHiddenColumns={[
							"minTradeDuration",
							"maxTradeDuration",
							"minLotSize",
							"maxLotSize",
							"wins",
							"losses",
							"enabled",
							"avgTradeDuration",
						]}
						defaultRowsPerPage={10}
						onRowSelection={handleRowSelection}
						selectable={true}
						toggleHideDisabledSets={toggleHideDisabledSets}
						onSelectedSetsChange={handleSelectedSetsChange}
						onToggleSelectedRows={handleToggleSelectedRows}
						selectedAccount={selectedAccount}
					/>
				</div>
				<div className="mt-6 w-full">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
						<h2 className="text-white text-xl font-bold">
							Sets Performance
						</h2>
						<Select
							options={statOptions}
							value={selectedStat}
							onChange={(value) => setSelectedStat(value)}
						/>
					</div>
					<Chart
						data={getChartData()}
						magics={getFilteredSets().map((set) =>
							set.magic.toString()
						)}
						title={
							selectedStat.charAt(0).toUpperCase() +
							selectedStat.slice(1)
						}
					/>
				</div>
				<AddSetModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleAddSet}
				/>
				<EditSetModal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setSelectedSet(null);
					}}
					onSubmit={handleEditSet}
					set={selectedSet}
				/>
				<AddCopierModal
					isOpen={isAddCopierModalOpen}
					onClose={() => setIsAddCopierModalOpen(false)}
					masterAccountId={selectedAccount}
					selectedSets={selectedSets}
				/>
			</div>
		</div>
	);
}

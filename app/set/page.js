"use client";

import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { calculatePercentageChange } from "@/lib/utils"; // Assume this function exists
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card } from "../components/card";
import { Chart } from "../components/chart";
import { Select } from "../components/select";
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import Table from "../components/table";

export default function SetPage() {
	const router = useRouter();
	const { user } = useAuth();
	const searchParams = useSearchParams();
	const [setData, setSetData] = useState(null);
	const [trades, setTrades] = useState([]);
	const [graphData, setGraphData] = useState([]);
	const [selectedStat, setSelectedStat] = useState("cumulativeProfit");
	const [cumulativeProfitData, setCumulativeProfitData] = useState([]);
	const [statsHistoryData, setStatsHistoryData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let unsubscribeSet = () => {};
		let unsubscribeTrades = () => {};

		const fetchSetData = async () => {
			if (!user) return;

			const accountId = searchParams.get("accountId");
			const setId = searchParams.get("setId");

			if (!accountId || !setId) return;

			const setRef = doc(
				db,
				`users/${user.uid}/accounts/${accountId}/sets/${setId}`
			);

			// Set up real-time listener for set data
			unsubscribeSet = onSnapshot(setRef, (doc) => {
				if (doc.exists()) {
					const data = doc.data();
					setSetData(data);
					console.log(data.stats_history);

					// Process stats_history
					const statsHistoryData = data.stats_history.map(
						(stats) => ({
							time: formatTime(stats.timestamp),
							timestamp: stats.timestamp,
							profit: parseFloat(stats.profit.toFixed(2)),
							maxDrawdown: parseFloat(
								stats.maxDrawdown.toFixed(2)
							),
							profitFactor: parseFloat(
								stats.profitFactor.toFixed(2)
							),
							// Add other stats as needed
						})
					);

					// Set separate state for cumulative profit and stats history
					setCumulativeProfitData(cumulativeProfitData);
					setStatsHistoryData(statsHistoryData);
				}
			});

			// Set up real-time listener for trades
			const tradesRef = collection(setRef, "trades");
			const tradesQuery = query(tradesRef);

			try {
				unsubscribeTrades = onSnapshot(tradesQuery, (snapshot) => {
					const tradesData = snapshot.docs.map((doc) => {
						const trade = doc.data();
						return {
							ticket: trade.ticket,
							time: formatTime(trade.time),
							tradeDuration: formatDuration(trade.trade_duration),
							symbol: trade.symbol,
							type: trade.type === 0 ? "Short" : "Long",
							openPrice: Number(trade.open_price).toFixed(2),
							closePrice: Number(trade.price).toFixed(2),
							volume: Number(trade.volume).toFixed(2),
							profit: Number(trade.profit).toFixed(2),
							commission: Number(trade.commission).toFixed(2),
						};
					});

					setTrades(tradesData);

					// Calculate cumulative profit from trades
					let cumulativeProfit = 0;
					const cumulativeProfitData = tradesData.map((trade) => {
						cumulativeProfit += parseFloat(trade.profit);
						return {
							time: trade.time,
							timestamp: new Date(trade.time).getTime() / 1000,
							cumulativeProfit: parseFloat(
								cumulativeProfit.toFixed(2)
							),
						};
					});

					// Set separate state for cumulative profit and stats history
					setCumulativeProfitData(cumulativeProfitData);
				});
			} catch (error) {
				console.error("Error setting up trades listener:", error);
			}

			// Return a cleanup function to unsubscribe from listeners
			return () => {
				unsubscribeSet();
				unsubscribeTrades();
			};
		};

		fetchSetData();

		// Cleanup function
		return () => {
			unsubscribeSet();
			unsubscribeTrades();
		};
	}, [user, searchParams]);

	// Add this function to format the time
	const formatTime = (timeData) => {
		var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
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

	// Add this function to format the duration
	const formatDuration = (seconds) => {
		if (typeof seconds !== "number") return "00:00:00";
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return [hours, minutes, remainingSeconds]
			.map((v) => v.toString().padStart(2, "0"))
			.join(":");
	};

	// Instead, use useMemo to derive loading state
	const isLoading = useMemo(() => !setData, [setData]);

	// Update getChartData function
	const getChartData = () => {
		if (selectedStat === "cumulativeProfit") {
			return cumulativeProfitData.map((item) => ({
				time: item.time,
				[selectedStat]: item[selectedStat],
			}));
		} else {
			return statsHistoryData.map((item) => ({
				time: item.time,
				[selectedStat]: item[selectedStat],
			}));
		}
	};

	// Update statOptions
	const statOptions = [
		{ value: "cumulativeProfit", label: "Cumulative Profit" },
		{ value: "profit", label: "Profit" },
		{ value: "maxDrawdown", label: "Max Drawdown" },
		{ value: "profitFactor", label: "Profit Factor" },
		// Add more options as needed
	];

	// Add this function to safely access nested properties
	const safelyGetNestedValue = (obj, path, defaultValue = 0) => {
		return path
			.split(".")
			.reduce(
				(acc, part) =>
					acc && acc[part] !== undefined ? acc[part] : defaultValue,
				obj
			);
	};

	// Update the calculateTrend function
	const calculateTrend = (statKey) => {
		const previousValue = safelyGetNestedValue(
			setData,
			`previous_stats.${statKey}`
		);
		const currentValue = safelyGetNestedValue(
			setData,
			`latest_stats.${statKey}`
		);
		return calculatePercentageChange(previousValue, currentValue);
	};

	const handleGoBack = () => {
		router.push("/sets");
	};

	return (
		<div className="flex font-DM justify-start min-h-screen w-screen bg-[#081028] relative">
			<Spinner className={`${isLoading ? "flex" : "hidden"}`} />
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
							Set Details
						</h1>
					</div>
					{/* Add any additional buttons here if needed */}
				</div>
				<p className="text-white text-lg font-bold">
					{setData ? `Magic: ${setData.magic}` : ""}
				</p>
				{/* Set Stats Cards */}
				<div className="flex justify-between">
					<Card
						title="Total Profit"
						value={`$${safelyGetNestedValue(
							setData,
							"latest_stats.profit",
							0
						).toFixed(2)}`}
						trend={calculateTrend("profit")}
					/>
					<Card
						title="Win Rate"
						value={`${safelyGetNestedValue(
							setData,
							"latest_stats.winRate",
							0
						).toFixed(2)}%`}
						trend={calculateTrend("winRate")}
					/>
					<Card
						title="Total Trades"
						value={safelyGetNestedValue(
							setData,
							"latest_stats.totalTrades",
							0
						)}
						trend={calculateTrend("totalTrades")}
					/>
					<Card
						title="Max Drawdown"
						value={`${safelyGetNestedValue(
							setData,
							"latest_stats.maxDrawdown",
							0
						).toFixed(2)}`}
						trend={calculateTrend("maxDrawdown")}
					/>
					{/* Add more cards for other stats */}
				</div>

				{/* Trades Table */}
				<Table
					data={trades}
					title="Trades"
					defaultHiddenColumns={[]}
					defaultRowsPerPage={10}
					onRowSelection={() => {}}
					onSelectedSetsChange={() => {}}
					selectable={true}
					searchable={true}
					sortable={true}
					pagination={true}
				/>

				{/* Updated Graph */}
				<div className="mt-6 w-full">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-white text-xl font-bold">
							Set Performance
						</h2>
						<Select
							options={statOptions}
							value={selectedStat}
							onChange={(value) => setSelectedStat(value)}
						/>
					</div>
					<Chart
						data={getChartData()}
						magics={[selectedStat]}
						title={
							selectedStat.charAt(0).toUpperCase() +
							selectedStat.slice(1)
						}
					/>
				</div>
			</div>
		</div>
	);
}

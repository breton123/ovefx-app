"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Chart } from "../components/chart";
import { Card } from "../components/dashboard/card";
import { SideBar } from "../components/sidebar";
import { Spinner } from "../components/spinner";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
	const { user, loading } = useAuth();
	const [dashboardData, setDashboardData] = useState({
		avgProfit: 0,
		avgMaxDrawdown: 0,
		avgWinRate: 0,
		avgReturnOnDD: 0,
		accountsCount: 0,
	});

	useEffect(() => {
		if (!user) return;

		const accountsRef = collection(db, `users/${user.uid}/accounts`);
		const accountsQuery = query(accountsRef);

		const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
			const accounts = snapshot.docs.map((doc) => doc.data());
			const accountsCount = accounts.length;

			const avgProfit =
				accounts.reduce(
					(sum, account) => sum + (account.profit || 0),
					0
				) / accountsCount;
			const avgMaxDrawdown =
				accounts.reduce(
					(sum, account) => sum + (account.maxDrawdown || 0),
					0
				) / accountsCount;
			const avgWinRate =
				accounts.reduce(
					(sum, account) => sum + (account.winRate || 0),
					0
				) / accountsCount;
			const avgReturnOnDD =
				accounts.reduce(
					(sum, account) => sum + (account.returnOnDD || 0),
					0
				) / accountsCount;

			setDashboardData({
				avgProfit,
				avgMaxDrawdown,
				avgWinRate,
				avgReturnOnDD,
				accountsCount,
			});
		});

		return () => unsubscribe();
	}, [user]);

	return (
		<div className="flex font-DM justify-start min-h-screen w-full bg-[#081028] relative overflow-x-hidden">
			<Spinner className={`${loading ? "flex" : "hidden"}`} />
			<SideBar />
			<div className="flex flex-col flex-grow px-8 py-10 gap-16 overflow-x-hidden">
				<div className="flex justify-between">
					<div className="flex gap-2 flex-col">
						<h1 className="text-white text-2xl font-bold">
							Welcome back, {user?.email || "User"}
						</h1>
						<p className="text-[#adb9e1] text-md font-normal leading-[14px]">
							View your accounts live data
						</p>
					</div>
				</div>
				<div className="flex flex-wrap justify-between gap-4">
					<Card
						title="Avg Profit"
						value={`$${dashboardData.avgProfit.toFixed(2)}`}
						percentage="65"
					/>
					<Card
						title="Avg Max Drawdown"
						value={`$${dashboardData.avgMaxDrawdown.toFixed(2)}`}
						percentage="23"
					/>
					<Card
						title="Avg Win Rate"
						value={`${dashboardData.avgWinRate.toFixed(2)}%`}
						percentage="14"
					/>
					<Card
						title="Avg Return on DD"
						value={dashboardData.avgReturnOnDD.toFixed(2)}
						percentage="34"
					/>
					<Card
						title="Accounts"
						value={dashboardData.accountsCount}
						percentage="2"
					/>
				</div>
				<div className="flex w-full">
					<Chart />
				</div>
			</div>
		</div>
	);
}

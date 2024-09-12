"use client";
import { auth } from "@/lib/firebase";
import {
	ArrowLeftStartOnRectangleIcon,
	ArrowsRightLeftIcon,
	ArrowUpTrayIcon,
	CodeBracketIcon,
	Cog6ToothIcon,
	Cog8ToothIcon,
	ComputerDesktopIcon,
	CurrencyDollarIcon,
	HomeIcon,
	NewspaperIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { Search } from "./search";

export const SideBar = () => {
	const router = useRouter();
	const [path, setPath] = useState("");

	useEffect(() => {
		// Update path on mount
		setPath(window.location.pathname);

		// Optionally, listen to URL changes (e.g., for Single Page Application)
		const handleLocationChange = () => setPath(window.location.pathname);

		window.addEventListener("popstate", handleLocationChange);

		return () => {
			window.removeEventListener("popstate", handleLocationChange);
		};
	}, [path]);

	const handleLogout = async () => {
		await signOut(auth);
		router.push("/login");
	};

	const navItems = [
		{
			title: "Dashboard",
			icon: HomeIcon,
			href: "/dashboard",
			activeHrefs: ["/dashboard"],
		},
		{
			title: "Accounts",
			icon: ComputerDesktopIcon,
			href: "/accounts",
			activeHrefs: ["/accounts"],
		},
		{
			title: "Sets",
			icon: NewspaperIcon,
			href: "/sets",
			activeHrefs: ["/sets", "/set"],
		},
		{
			title: "Optimizations",
			icon: ArrowsRightLeftIcon,
			href: "/optimizations",
			activeHrefs: ["/optimizations", "/cycles", "/setfinder"],
		},
		{
			title: "Copiers",
			icon: CurrencyDollarIcon,
			href: "/copiers",
			activeHrefs: ["/copiers"],
		},
	];

	return (
		<div className="w-[350px] h-screen relative flex flex-col gap-10 bg-[#081028] bg-opacity-30 drop-shadow-xl justify-between pl-5 py-5">
			<div className="flex flex-col gap-10">
				<div className="flex items-center justify-between px-3">
					<CodeBracketIcon className="h-5 text-[#AEB9E1] transition ease-in-out opacity-30 hover:text-white cursor-pointer hover:opacity-100" />
				</div>
				<div className="w-full">
					<Search placeholder="Search..." />
				</div>

				<div className="flex flex-col justify-between gap-16 w-full">
					<div className="flex flex-col gap-2 font-semibold">
						{navItems.map(
							({ title, icon: Icon, href, activeHrefs }) => (
								<a key={title} href={href}>
									<NavItem
										title={title}
										Icon={Icon}
										active={activeHrefs.includes(path)}
										href={href}
									/>
								</a>
							)
						)}
					</div>
				</div>
			</div>
			<div>
				<div className="flex flex-col gap-2">
					<NavItem
						title="Account Settings"
						Icon={Cog8ToothIcon}
						href="/"
					/>
					<div
						onClick={handleLogout}
						className={`relative text-[#adb9e1] hover:bg-[#7e89ac] hover:border-[#0a1330] hover:border-opacity-10 hover:bg-opacity-5 rounded-[7px] flex items-baseline justify-start px-4 py-2 w-[90%] h-10 cursor-pointer transition ease-in-out group`}>
						<ArrowLeftStartOnRectangleIcon className="h-5 pr-2 translate-y-[2px] group-hover:text-white transition ease-in-out" />
						<span
							className={`text-sm font-medium text-[#adb9e1] group-hover:text-white transition ease-in-out`}>
							Sign Out
						</span>
						<div
							className={`w-[3.19px] h-full bg-[#cb3cff] absolute left-0 top-[-0.95px] rounded-l opacity-0 transition ease-in-out group-hover:opacity-100`}></div>
					</div>
				</div>
			</div>
		</div>
	);
};

const NavItem = ({ title, active, Icon, href }) => {
	return (
		<div
			className={`relative ${
				active
					? "text-[#cb3cff] bg-[#7e89ac] border-[#0a1330] border-opacity-10 bg-opacity-5"
					: "text-[#adb9e1] hover:bg-[#7e89ac] hover:border-[#0a1330] hover:border-opacity-10 hover:bg-opacity-5"
			} rounded-[7px] flex items-baseline justify-start px-4 py-2 w-[90%] h-10 cursor-pointer
                transition ease-in-out group`}>
			<Icon className="h-5 pr-2 translate-y-[2px] group-hover:text-white transition ease-in-out" />
			<span
				className={`${
					active
						? "text-sm font-medium text-[#cb3cff]"
						: "text-sm font-medium text-[#adb9e1] group-hover:text-white transition ease-in-out"
				}`}>
				{title}
			</span>
			<div
				className={`${
					active
						? "w-[3.19px] h-full bg-[#cb3cff] absolute left-0 top-[-0.95px] rounded-l opacity-100 transition ease-in-out"
						: "w-[3.19px] h-full bg-[#cb3cff] absolute left-0 top-[-0.95px] rounded-l opacity-0 transition ease-in-out group-hover:opacity-100"
				}`}></div>
		</div>
	);
};

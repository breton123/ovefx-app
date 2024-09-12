import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useAccounts(user) {
	const [accounts, setAccounts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchAccounts() {
			if (!user) {
				setAccounts([]);
				setLoading(false);
				return;
			}

			try {
				const accountsRef = collection(
					db,
					`users/${user.uid}/accounts`
				);
				const q = query(accountsRef);
				const querySnapshot = await getDocs(q);
				const accountsData = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(accountsData);
				setAccounts(accountsData);
				setError(null);
			} catch (err) {
				console.error("Error fetching accounts:", err);
				setError(
					err instanceof Error
						? err
						: new Error("An unknown error occurred")
				);
			} finally {
				setLoading(false);
			}
		}

		fetchAccounts();
	}, [user]);

	return { accounts, loading, error };
}

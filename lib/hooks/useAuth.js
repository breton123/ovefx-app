import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export function useAuth() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				setUser(user);
				setLoading(false);
			} else {
				setUser(null);
				setLoading(false);
				router.push("/login");
			}
		});

		return () => unsubscribe();
	}, [router]);

	return { user, loading };
}

// "use client";

// import Link from "next/link";
// import { useEffect } from "react";
// import { CheckCircle2, ArrowRight } from "lucide-react";
// import { useQueryClient } from "@tanstack/react-query";

// export default function SuccessPage() {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     // Invalidate the 'me' and 'subscription' queries
//     // to ensure the UI updates to "Active" status
//     queryClient.invalidateQueries({ queryKey: ["me"] });
//   }, [queryClient]);

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
//         <div className="flex justify-center mb-6">
//           <div className="bg-green-100 p-3 rounded-full">
//             <CheckCircle2 className="w-12 h-12 text-green-600" />
//           </div>
//         </div>

//         <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
//           Payment Successful!
//         </h1>
//         <p className="text-gray-600 mb-8">
//           Thank you for subscribing. Your school account is now being activated.
//           It may take a minute for the status to update.
//         </p>

//         <Link
//           href="/school-admin/dashboard"
//           className="w-full flex items-center justify-center py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors group"
//         >
//           Go to Dashboard
//           <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//         </Link>

//         <p className="mt-6 text-sm text-gray-400">
//           A receipt has been sent to your email.
//         </p>
//       </div>
//     </div>
//   );
// }

// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
// import { useAuth } from "@/context/AuthContext"; // Import your new hook

// export default function SuccessPage() {
//   const { refreshUser, user } = useAuth();
//   const [isSyncing, setIsSyncing] = useState(true);

//   useEffect(() => {
//     // 🔄 Sync the new "ACTIVE" status from the backend to our Auth Context
//     const syncStatus = async () => {
//       await refreshUser();
//       setIsSyncing(false);
//     };

//     syncStatus();
//   }, [refreshUser]);

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
//         <div className="flex justify-center mb-6">
//           {isSyncing ? (
//             <div className="bg-blue-50 p-3 rounded-full">
//               <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
//             </div>
//           ) : (
//             <div className="bg-green-100 p-3 rounded-full">
//               <CheckCircle2 className="w-12 h-12 text-green-600" />
//             </div>
//           )}
//         </div>

//         <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
//           {isSyncing ? "Finalizing..." : "Payment Successful!"}
//         </h1>

//         <p className="text-gray-600 mb-8">
//           {isSyncing
//             ? "We are updating your school's access levels. Please wait a moment."
//             : `Thank you for subscribing! ${user?.school?.name || "Your school"} is now fully activated.`}
//         </p>

//         <Link
//           href="/school-admin/dashboard"
//           className={`w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all group ${
//             isSyncing
//               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//               : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
//           }`}
//           onClick={(e) => isSyncing && e.preventDefault()}
//         >
//           {isSyncing ? "Updating Account..." : "Go to Dashboard"}
//           {!isSyncing && (
//             <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//           )}
//         </Link>

//         {!isSyncing && (
//           <p className="mt-6 text-sm text-gray-400">
//             A receipt has been sent to your email.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SuccessPage() {
  const { refreshUser, user } = useAuth();
  const router = useRouter();

  const [isSyncing, setIsSyncing] = useState(true);

  // useEffect(() => {
  //   const syncStatus = async () => {
  //     try {
  //       // 🔥 Force refresh so cached subscription doesn't cause billing redirect
  //       await refreshUser(true);
  //     } catch (err) {
  //       console.error("Failed to sync subscription:", err);
  //     } finally {
  //       setIsSyncing(false);

  //       // 🚀 Auto redirect after sync
  //       setTimeout(() => {
  //         router.push("/school-admin/dashboard");
  //       }, 2000);
  //     }
  //   };

  //   syncStatus();
  // }, [refreshUser, router]);

  // useEffect(() => {
  //   let attempts = 0;
  //   const maxAttempts = 10;

  //   const interval = setInterval(async () => {
  //     try {
  //       await refreshUser(true);

  //       attempts++;

  //       // ✅ check latest user state AFTER refresh
  //       if (user?.school?.status === "ACTIVE") {
  //         clearInterval(interval);
  //         router.push("/school-admin/dashboard");
  //       }

  //       // ❌ stop after too many tries
  //       if (attempts >= maxAttempts) {
  //         clearInterval(interval);
  //         console.warn("Subscription sync timeout");
  //       }
  //     } catch (err) {
  //       console.error("Polling error:", err);
  //     }
  //   }, 2000); // every 2 seconds

  //   return () => clearInterval(interval);
  // }, [refreshUser, router, user]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
      try {
        attempts++;

        // ✅ refreshUser returns the updated user — don't rely on the stale closure
        const updatedUser = await refreshUser(true);

        if (updatedUser?.org?.status === "ACTIVE") {
          clearInterval(interval);
          setIsSyncing(false); // ✅ triggers UI update to show success state
          setTimeout(() => {
            router.push("/org-admin/dashboard");
          }, 2000);
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsSyncing(false); // ✅ unblock UI even on timeout
          console.warn("Subscription sync timeout — webhook may be delayed");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []); // ✅ empty deps — run once on mount only

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          {isSyncing ? (
            <div className="bg-blue-50 p-3 rounded-full">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {isSyncing ? "Finalizing..." : "Payment Successful!"}
        </h1>

        <p className="text-gray-600 mb-8">
          {isSyncing
            ? "We are updating your organisation's access levels. Please wait a moment."
            : `Thank you for subscribing! ${
                user?.org?.name || "Your organisation"
              } is now fully activated.`}
        </p>

        <Link
          href="/org-admin/dashboard"
          className={`w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all group ${
            isSyncing
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
          }`}
          onClick={(e) => isSyncing && e.preventDefault()}
        >
          {isSyncing ? "Updating Account..." : "Go to Dashboard"}
          {!isSyncing && (
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          )}
        </Link>

        {!isSyncing && (
          <p className="mt-6 text-sm text-gray-400">
            Redirecting you to your dashboard...
          </p>
        )}
      </div>
    </div>
  );
}

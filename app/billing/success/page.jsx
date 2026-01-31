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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import your new hook

export default function SuccessPage() {
  const { refreshUser, user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    // 🔄 Sync the new "ACTIVE" status from the backend to our Auth Context
    const syncStatus = async () => {
      await refreshUser();
      setIsSyncing(false);
    };

    syncStatus();
  }, [refreshUser]);

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
            ? "We are updating your school's access levels. Please wait a moment."
            : `Thank you for subscribing! ${user?.school?.name || "Your school"} is now fully activated.`}
        </p>

        <Link
          href="/school-admin/dashboard"
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
            A receipt has been sent to your email.
          </p>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/axios";
// import { CheckIcon, Loader2, Star } from "lucide-react";

// export default function BillingPage() {
//   const [selectedPlan, setSelectedPlan] = useState(null);

//   const { data: user, isLoading: isLoadingUser } = useQuery({
//     queryKey: ["me"],
//     queryFn: async () => {
//       const res = await api.get("/auth/me");
//       console.log("User Data Received:", res.data);
//       return res.data;
//     },
//   });

//   const subscriptionMutation = useMutation({
//     mutationFn: async (planType) => {
//       const response = await api.post("/billing/initialize", {
//         schoolId: user?.schoolId,
//         adminEmail: user?.email,
//         planTier: planType, // Sending 'monthly' or 'yearly' as the tier
//       });
//       return response.data;
//     },
//     onSuccess: (data) => {
//       if (data.checkoutUrl) window.location.href = data.checkoutUrl;
//     },
//     onError: (error) => {
//       alert(error.response?.data?.error || "Payment failed to initialize.");
//     },
//   });

//   const handleSubscribe = (type) => {
//     setSelectedPlan(type);
//     subscriptionMutation.mutate(type);
//   };

//   if (isLoadingUser) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

//   return (
//     <div className="py-16 px-4 max-w-5xl mx-auto">
//       <div className="text-center mb-12">
//         <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
//           Activate Your School Account
//         </h1>
//         <p className="mt-4 text-lg text-gray-600">
//           Get full access to all LimaHealth features for your staff and students.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
//         {/* Monthly Plan */}
//         <div className="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
//           <h2 className="text-2xl font-bold text-gray-900">Monthly Access</h2>
//           <p className="mt-2 text-gray-500">Flexible month-to-month subscription.</p>
//           <p className="mt-6 flex items-baseline">
//             <span className="text-5xl font-extrabold tracking-tight">$99</span>
//             <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
//           </p>

//           <ul className="mt-8 space-y-4 flex-1">
//             <FeatureItem text="All Core Platform Features" />
//             <FeatureItem text="Unlimited Students & Staff" />
//             <FeatureItem text="AI Sentiment Analysis" />
//             <FeatureItem text="Cancel Anytime" />
//           </ul>

//           <button
//             onClick={() => handleSubscribe("monthly")}
//             disabled={subscriptionMutation.isPending}
//             className="mt-8 w-full py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 flex justify-center items-center"
//           >
//             {subscriptionMutation.isPending && selectedPlan === "monthly" ? <Loader2 className="animate-spin h-5 w-5" /> : "Start Monthly Plan"}
//           </button>
//         </div>

//         {/* Yearly Plan - Highlighted */}
//         <div className="flex flex-col p-8 bg-blue-600 border border-blue-700 rounded-2xl shadow-xl relative transform md:scale-105">
//           <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
//             Best Value
//           </div>
//           <h2 className="text-2xl font-bold text-white">Yearly Access</h2>
//           <p className="mt-2 text-blue-100">Full year of access at a discounted rate.</p>
//           <p className="mt-6 flex items-baseline text-white">
//             <span className="text-5xl font-extrabold tracking-tight">$990</span>
//             <span className="ml-1 text-xl font-semibold text-blue-100">/yr</span>
//           </p>

//           <ul className="mt-8 space-y-4 flex-1 text-white">
//             <FeatureItem text="Everything in Monthly" color="text-white" />
//             <FeatureItem text="Priority 24/7 Support" color="text-white" />
//             <FeatureItem text="2 Months Free included" color="text-white" />
//             <FeatureItem text="Yearly Compliance Report" color="text-white" />
//           </ul>

//           <button
//             onClick={() => handleSubscribe("yearly")}
//             disabled={subscriptionMutation.isPending}
//             className="mt-8 w-full py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center"
//           >
//             {subscriptionMutation.isPending && selectedPlan === "yearly" ? <Loader2 className="animate-spin h-5 w-5 text-blue-600" /> : "Start Yearly Plan"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function FeatureItem({ text, color = "text-gray-700" }) {
//   return (
//     <li className="flex items-start">
//       <CheckIcon className={`shrink-0 w-5 h-5 ${color === 'text-white' ? 'text-white' : 'text-green-500'}`} />
//       <span className={`ml-3 text-sm font-medium ${color}`}>{text}</span>
//     </li>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { getOrgTheme } from "@/lib/orgTheme";
import { CheckIcon, Loader2, LogOut, AlertCircle } from "lucide-react";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    console.log("AuthContext User:", user);
    console.log("Loading state:", loading);
  }, [user, loading]);

  // The 402 payload a PAYMENT_REQUIRED/EXPIRED org gets routed here with
  // doesn't include orgType, so look it up the same way the login page does.
  const { data: fetchedOrgType } = useQuery({
    queryKey: ["billing-org-type", user?.email],
    queryFn: async () => {
      const res = await api.get("/auth/admin/org-type", {
        params: { email: user.email },
      });
      return res.data?.orgType ?? null;
    },
    enabled: !!user?.email && !user?.org?.orgType,
  });

  const theme = getOrgTheme(user?.org?.orgType ?? fetchedOrgType);

  const subscriptionMutation = useMutation({
    mutationFn: async (planType) => {
      const payload = {
        orgId: user?.orgId,
        adminEmail: user?.email,
        planTier: planType,
      };

      console.log("Submitting payment initialization:", payload);

      const response = await api.post("/billing/initialize", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.error || "Payment failed to initialize.";
      const details = error.response?.data?.details;
      console.error("Subscription Error:", { message, details });
      alert(message + (details ? ` (${JSON.stringify(details)})` : ""));
    },
  });

  const handleSubscribe = (type) => {
    // Final validation before calling the API
    if (!user?.orgId || !user?.email) {
      console.error("Mutation blocked: User context is empty", { user });
      alert(
        "Your session details are still loading. Please wait a moment and try again.",
      );
      return;
    }

    setSelectedPlan(type);
    subscriptionMutation.mutate(type);
  };

  // 1. Initial Loading State (Fetching Token/Session)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            className="animate-spin h-10 w-10 mx-auto"
            style={{ color: theme.primary }}
          />
          <p className="mt-4 text-gray-500 font-medium">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State: Token exists but User data failed to fetch
  if (!user || !user.orgId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">
            Session Sync Issue
          </h2>
          <p className="mt-2 text-gray-600">
            We couldn't verify your school details. This usually happens if the
            session expired or the profile failed to load.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.primary }}
          >
            Refresh Page
          </button>
          <button
            onClick={logout}
            className="mt-3 w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
          >
            Sign out and try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-end mb-8">
        <button
          onClick={logout}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Activate {user?.org?.name || "Your Organisation"}
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Choose a plan below to unlock student analytics and wearable
          integration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
        {/* Monthly Plan */}
        <div className="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <h2 className="text-xl font-bold text-gray-900">Monthly Access</h2>
          <p className="mt-2 text-sm text-gray-500">
            Flexible month-to-month subscription.
          </p>
          <p className="mt-6 flex items-baseline">
            <span className="text-5xl font-extrabold tracking-tight text-gray-900">
              €200
            </span>
            <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>
          </p>

          <ul className="mt-8 space-y-4 flex-1">
            <FeatureItem text="All Core Platform Features" />
            <FeatureItem text="Unlimited Students & Staff" />
            <FeatureItem text="AI Sentiment Analysis" />
            <FeatureItem text="Cancel Anytime" />
          </ul>

          <button
            onClick={() => handleSubscribe("monthly")}
            disabled={subscriptionMutation.isPending}
            className="mt-8 w-full py-4 bg-white border-2 rounded-xl font-bold transition-opacity hover:opacity-80 disabled:opacity-50 flex justify-center items-center"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            {subscriptionMutation.isPending && selectedPlan === "monthly" ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Start Monthly Plan"
            )}
          </button>
        </div>

        {/* Yearly Plan */}
        <div
          className="flex flex-col p-8 rounded-2xl shadow-xl relative transform md:scale-105 ring-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryText})`,
            "--tw-ring-color": theme.primaryLight,
          }}
        >
          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
            Save 20%
          </div>
          <h2 className="text-xl font-bold text-white">Yearly Access</h2>
          <p className="mt-2 text-sm text-white/75">
            Full year of access at a discounted rate.
          </p>
          <p className="mt-6 flex items-baseline text-white">
            <span className="text-5xl font-extrabold tracking-tight">
              €2000
            </span>
            <span className="ml-1 text-xl font-medium text-white/75">/yr</span>
          </p>

          <ul className="mt-8 space-y-4 flex-1 text-white">
            <FeatureItem text="Everything in Monthly" color="text-white" />
            <FeatureItem text="Priority 24/7 Support" color="text-white" />
            <FeatureItem text="2 Months Free included" color="text-white" />
            <FeatureItem text="Yearly Compliance Report" color="text-white" />
          </ul>

          <button
            onClick={() => handleSubscribe("yearly")}
            disabled={subscriptionMutation.isPending}
            className="mt-8 w-full py-4 bg-white rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center"
            style={{ color: theme.primary }}
          >
            {subscriptionMutation.isPending && selectedPlan === "yearly" ? (
              <Loader2 className="animate-spin h-5 w-5" style={{ color: theme.primary }} />
            ) : (
              "Start Yearly Plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, color = "text-gray-700" }) {
  return (
    <li className="flex items-start">
      <CheckIcon
        className={`shrink-0 w-5 h-5 ${color === "text-white" ? "text-white" : "text-green-500"}`}
      />
      <span className={`ml-3 text-sm font-medium ${color}`}>{text}</span>
    </li>
  );
}

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

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext"; // Using your new hook
import { CheckIcon, Loader2, LogOut } from "lucide-react";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user, loading, logout } = useAuth();

  const subscriptionMutation = useMutation({
    mutationFn: async (planType) => {
      const response = await api.post("/billing/initialize", {
        schoolId: user?.schoolId,
        adminEmail: user?.email,
        planTier: planType,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Payment failed to initialize.");
    },
  });

  const handleSubscribe = (type) => {
    setSelectedPlan(type);
    subscriptionMutation.mutate(type);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto">
      {/* Utility Header */}
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
          Activate {user?.school?.name || "Your School"}
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Your account is approved! Choose a plan below to unlock student
          analytics and wearable integration.
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
              $99
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
            className="mt-8 w-full py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {subscriptionMutation.isPending && selectedPlan === "monthly" ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Start Monthly Plan"
            )}
          </button>
        </div>

        {/* Yearly Plan - Best Value */}
        <div className="flex flex-col p-8 bg-blue-600 border border-blue-700 rounded-2xl shadow-xl relative transform md:scale-105 ring-4 ring-blue-100">
          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
            Save 20%
          </div>
          <h2 className="text-xl font-bold text-white">Yearly Access</h2>
          <p className="mt-2 text-sm text-blue-100">
            Full year of access at a discounted rate.
          </p>
          <p className="mt-6 flex items-baseline text-white">
            <span className="text-5xl font-extrabold tracking-tight">$990</span>
            <span className="ml-1 text-xl font-medium text-blue-100">/yr</span>
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
            className="mt-8 w-full py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center"
          >
            {subscriptionMutation.isPending && selectedPlan === "yearly" ? (
              <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
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
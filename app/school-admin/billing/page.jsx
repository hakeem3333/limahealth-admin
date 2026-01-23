"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have an auth hook
import { CheckIcon, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "$99",
    description: "Ideal for small schools starting their wellness journey.",
    features: ["Up to 100 students", "Basic Analytics", "Email Support"],
  },
  {
    id: "standard",
    name: "Standard",
    price: "$249",
    description: "Best for growing schools needing deeper insights.",
    features: ["Up to 500 students", "AI Sentiment Analysis", "Priority Support", "Bulk Uploads"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$499",
    description: "Full enterprise features for large institutions.",
    features: ["Unlimited students", "Custom Reports", "Dedicated Account Manager", "API Access"],
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscriptionMutation = useMutation({
    mutationFn: async (planTier: string) => {
      const response = await api.post("/payments/create-session", {
        schoolId: user?.schoolId,
        adminEmail: user?.email,
        planTier,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect the user to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to start checkout. Please try again.");
    },
  });

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    subscriptionMutation.mutate(planId);
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Unlock the full potential of LimaHealth for your school.
        </p>
      </div>

      

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 bg-white border rounded-2xl shadow-sm transition-all ${
              selectedPlan === plan.id ? "ring-2 ring-blue-600 border-transparent" : "border-gray-200"
            }`}
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-xl font-semibold">/month</span>
              </p>
              <p className="mt-6 text-gray-500">{plan.description}</p>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="flex-shrink-0 w-5 h-5 text-green-500" />
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscriptionMutation.isPending}
              className={`mt-8 w-full py-3 px-6 rounded-md font-medium transition-colors ${
                plan.id === "standard"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-50 text-blue-700 hover:bg-gray-100"
              } disabled:opacity-50 flex justify-center items-center`}
            >
              {subscriptionMutation.isPending && selectedPlan === plan.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Subscribe to ${plan.name}`
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        Secure payments powered by Stripe. Cancel anytime.
      </div>
    </div>
  );
}
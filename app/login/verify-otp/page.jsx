// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { api } from "@/lib/axios";

// export default function VerifyOtpPage() {
//   const router = useRouter();
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [timeLeft, setTimeLeft] = useState(600);

//   const inputRef = useRef(null);

//   // Timer logic
//   useEffect(() => {
//     if (timeLeft <= 0) return;
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => prev - 1);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [timeLeft]);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (otp.length !== 6) {
//       setError("Please enter the 6-digit code");
//       return;
//     }

//     try {
//       setLoading(true);
//       await api.post("/auth/admin/verify-otp", { otp });
//       router.push("/school-admin/dashboard");
//     } catch (err) {
//       // 🌐 Network / backend unreachable
//       if (err?.type === "NETWORK_ERROR") {
//         setError("Unable to connect to the server. Please try again later.");
//         return;
//       }

//       // 🔐 OTP validation / expiry
//       setError(err?.response?.data?.message || "Invalid or expired code.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBoxClick = () => {
//     inputRef.current?.focus();
//   };

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm border border-gray-100">
//         <h1 className="text-2xl font-bold text-center text-gray-900">
//           Verify Login
//         </h1>
//         <p className="mt-2 text-sm text-center text-gray-600">
//           We sent a code to your email. It expires in{" "}
//           <span className="font-semibold text-orange-600">
//             {formatTime(timeLeft)}
//           </span>
//         </p>

//         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
//           {error && (
//             <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100 text-center">
//               {error}
//             </div>
//           )}

//           <div className="relative">
//             <input
//               ref={inputRef}
//               type="text"
//               inputMode="numeric"
//               maxLength={6}
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//               className="absolute inset-0 opacity-0 cursor-default"
//               autoFocus
//             />

//             <div
//               className="flex justify-between gap-2"
//               onClick={handleBoxClick}
//             >
//               {[...Array(6)].map((_, i) => (
//                 <div
//                   key={i}
//                   className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
//                     otp.length === i
//                       ? "border-black ring-2 ring-black/5"
//                       : "border-gray-200"
//                   } ${otp[i] ? "bg-gray-50" : "bg-white"}`}
//                 >
//                   {otp[i] || ""}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading || timeLeft === 0 || otp.length < 6}
//             className="w-full rounded-md bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
//           >
//             {loading
//               ? "Verifying..."
//               : timeLeft === 0
//                 ? "Code Expired"
//                 : "Verify & Sign In"}
//           </button>

//           <div className="flex flex-col gap-3 pt-2">
//             {timeLeft === 0 && (
//               <button
//                 type="button"
//                 onClick={() => window.location.reload()}
//                 className="text-sm font-semibold text-blue-600 hover:text-blue-700"
//               >
//                 Resend Code
//               </button>
//             )}
//             <button
//               type="button"
//               onClick={() => router.replace("/login")}
//               className="text-sm text-gray-500 hover:text-black transition-colors"
//             >
//               Back to login
//             </button>
//           </div>
//         </form>
//       </div>
//     </main>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck, ArrowLeft, RefreshCcw } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);

  const inputRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    try {
      setLoading(true);

      // 1. Verify OTP
      await api.post("/auth/admin/verify-otp", { otp });

      // 2. Refresh Auth Context to get role and schoolStatus
      await refreshUser();

      // 3. Navigation is handled by middleware automatically if we go to dashboard,
      // but we can be explicit here for a faster feel:
      router.push("/school-admin/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = () => {
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Security Verification
          </h1>
          <p className="mt-2 text-sm text-gray-600 px-6">
            Enter the 6-digit code sent to your email. Expiring in{" "}
            <span
              className={`font-mono font-bold ${timeLeft < 60 ? "text-red-500" : "text-blue-600"}`}
            >
              {formatTime(timeLeft)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 text-center animate-shake">
              {error}
            </div>
          )}

          <div className="relative group cursor-text" onClick={handleBoxClick}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="absolute inset-0 opacity-0 cursor-default"
              autoFocus
            />

            <div className="flex justify-between gap-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                    otp.length === i
                      ? "border-blue-600 ring-4 ring-blue-50"
                      : "border-gray-200"
                  } ${otp[i] ? "bg-blue-50/30 border-blue-200 text-blue-600" : "bg-white text-gray-900"}`}
                >
                  {otp[i] || ""}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || timeLeft === 0 || otp.length < 6}
            className="w-full rounded-xl bg-blue-600 py-4 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 transition-all shadow-lg shadow-blue-100 flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Complete Sign In"
            )}
          </button>

          <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-50">
            {timeLeft === 0 ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Resend New Code
              </button>
            ) : (
              <p className="text-xs text-gray-400">
                Didn't get a code? Check your spam folder.
              </p>
            )}

            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Mail, RefreshCcw, TriangleAlert } from "lucide-react";
import OtpInput from "./OtpInput";
import { markOtpIssued, readOtpIssued } from "@/lib/otpSession";

const LENGTH = 6;
const EMPTY = Array(LENGTH).fill("");

export function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0] ?? ""}•••@${domain}`;
  return `${local[0]}•••${local[local.length - 1]}@${domain}`;
}

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function CountdownRing({ timeLeft, total, color }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const ringColor = timeLeft <= 15 ? "#EF4444" : timeLeft <= 60 ? "#F59E0B" : color;
  return (
    <svg width="34" height="34" viewBox="0 0 36 36" className="-rotate-90 shrink-0" aria-hidden="true">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#E5E7EB" strokeWidth="3.5" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - timeLeft / total)}
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
      />
    </svg>
  );
}

/**
 * Shared OTP entry screen. The page supplies the API call (`onSubmit` must
 * throw on failure) and the theme; this component owns the input, timer,
 * error/success states and resend/expiry handling.
 *
 * resend: optional { cooldown, onResend } — only pages whose API can issue a
 * new code without a password (parent login) provide it.
 * onExpiredAction: shown when the code lapses and there is no resend.
 */
export default function OtpVerifyScreen({
  theme,
  sessionKey,
  pageBackground,
  icon: Icon,
  title,
  description,
  destination,
  totalSeconds,
  submitLabel = "Verify & Continue",
  onSubmit,
  resend,
  onExpiredAction,
  hint,
  back,
}) {
  const [digits, setDigits] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [cooldownLeft, setCooldownLeft] = useState(resend?.cooldown ?? 0);
  const [resending, setResending] = useState(false);
  const [sessionGone, setSessionGone] = useState(false);

  const inputRef = useRef(null);
  const deadline = useRef(Date.now() + totalSeconds * 1000);
  const resendAt = useRef(Date.now() + (resend?.cooldown ?? 0) * 1000);

  const startClock = useCallback(
    (issuedAt) => {
      deadline.current = issuedAt + totalSeconds * 1000;
      resendAt.current = issuedAt + (resend?.cooldown ?? 0) * 1000;
      setTimeLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      setCooldownLeft(Math.max(0, Math.ceil((resendAt.current - Date.now()) / 1000)));
    },
    [totalSeconds, resend?.cooldown],
  );

  useEffect(() => {
    // Anchor the clock to when the code was really issued so a refresh can't reset it.
    let issuedAt = sessionKey ? readOtpIssued(sessionKey) : null;
    if (!issuedAt) {
      issuedAt = Date.now();
      if (sessionKey) markOtpIssued(sessionKey);
    }
    startClock(issuedAt);

    const id = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      setCooldownLeft(Math.max(0, Math.ceil((resendAt.current - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expired = timeLeft === 0 && status !== "success";
  const dead = expired || sessionGone; // no code can be entered any more
  const code = digits.join("");
  const complete = code.length === LENGTH;
  const locked = status === "loading" || status === "success" || dead;

  const fail = useCallback((message) => {
    setError(message);
    setStatus("error");
    setShake(true);
    setTimeout(() => setShake(false), 550);
    setDigits(EMPTY);
    setTimeout(() => inputRef.current?.focusFirst(), 60);
  }, []);

  const submit = async (value) => {
    if (locked || value.length !== LENGTH) return;
    setError("");
    setStatus("loading");
    try {
      await onSubmit(value);
      setStatus("success");
    } catch (err) {
      fail(
        err?.type === "NETWORK_ERROR"
          ? "Unable to connect to the server. Please try again."
          : err?.response?.data?.message || err?.message || "Invalid or expired code.",
      );
    }
  };

  const handleChange = (next) => {
    if (status === "error") {
      setStatus("idle");
      setError("");
    }
    setDigits(next);
  };

  const handleResend = async () => {
    if (!resend || resending || cooldownLeft > 0) return;
    setResending(true);
    setError("");
    try {
      await resend.onResend();
      if (sessionKey) markOtpIssued(sessionKey);
      startClock(Date.now());
      setDigits(EMPTY);
      setStatus("idle");
      setTimeout(() => inputRef.current?.focusFirst(), 60);
    } catch (err) {
      const data = err?.response?.data;
      // The sign-in session behind the code has lapsed too — only a fresh sign-in helps.
      if (data?.code === "SESSION_EXPIRED" && onExpiredAction) setSessionGone(true);
      setError(data?.message || "Couldn't send a new code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const gradient = `linear-gradient(135deg, ${theme.primary}, ${theme.primaryText})`;
  const inputStatus = status === "error" ? "error" : status === "success" ? "success" : "idle";

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: pageBackground }}
    >
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-2xl shadow-black/10">
          <div className="h-1.5" style={{ background: gradient }} />

          <div className="p-7 sm:p-10">
            {/* Icon */}
            <div className="relative mx-auto mb-6 h-16 w-16">
              {status !== "success" && (
                <span
                  className="otp-halo absolute inset-0 rounded-2xl"
                  style={{ backgroundColor: theme.primaryRing }}
                  aria-hidden="true"
                />
              )}
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                style={{
                  background: status === "success" ? "linear-gradient(135deg,#34D399,#059669)" : gradient,
                  boxShadow: `0 10px 24px ${theme.primary}40`,
                }}
              >
                {status === "success" ? (
                  <Check key="ok" className="otp-pop h-8 w-8 text-white" strokeWidth={3} />
                ) : (
                  <Icon className="h-8 w-8 text-white" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                {status === "success" ? "Verified" : title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {status === "success" ? "Signing you in…" : description}
              </p>

              {destination && status !== "success" && (
                <div
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold"
                  style={{ backgroundColor: theme.primaryLight, color: theme.primaryText }}
                >
                  <Mail className="h-3.5 w-3.5" />
                  {destination}
                </div>
              )}
            </div>

            {/* Timer */}
            {status !== "success" && (
              <div className="mt-6 flex items-center justify-center gap-2.5" aria-live="off">
                <CountdownRing timeLeft={sessionGone ? 0 : timeLeft} total={totalSeconds} color={theme.primary} />
                <p className="text-sm font-medium text-gray-500">
                  {dead ? (
                    <span className="font-bold text-red-500">{sessionGone ? "Session expired" : "Code expired"}</span>
                  ) : (
                    <>
                      Expires in{" "}
                      <span
                        className="font-mono font-black tabular-nums"
                        style={{ color: timeLeft <= 60 ? "#EF4444" : theme.primaryText }}
                      >
                        {formatTime(timeLeft)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(code);
              }}
              className="mt-7 space-y-5"
              aria-busy={status === "loading"}
            >
              <OtpInput
                ref={inputRef}
                digits={digits}
                onChange={handleChange}
                onComplete={submit}
                disabled={locked}
                status={inputStatus}
                theme={theme}
                shake={shake}
              />

              <div className="min-h-[1.25rem]" role="alert" aria-live="assertive">
                {error && (
                  <p className="flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-red-600">
                    <TriangleAlert className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!complete || locked}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black tracking-wide text-white shadow-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none"
                style={
                  status === "success"
                    ? { background: "linear-gradient(135deg,#34D399,#059669)" }
                    : complete && !dead
                      ? { background: gradient, boxShadow: `0 12px 28px ${theme.primary}40` }
                      : { background: "#E5E7EB", color: "#9CA3AF" }
                }
              >
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : status === "success" ? (
                  <>
                    <Check className="h-5 w-5" strokeWidth={3} /> Verified
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </form>

            {/* Footer actions */}
            {status !== "success" && (
              <div className="mt-6 space-y-4 border-t border-gray-100 pt-5 text-center">
                {resend && !sessionGone ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldownLeft > 0 || resending}
                    className={
                      expired
                        ? "flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-sm font-black transition-all active:scale-[0.98] disabled:opacity-50"
                        : "inline-flex items-center gap-2 text-sm font-bold transition-opacity disabled:opacity-50"
                    }
                    style={
                      expired
                        ? { color: theme.primaryText, borderColor: theme.primaryRing, backgroundColor: theme.primaryLight }
                        : { color: theme.primaryText }
                    }
                  >
                    <RefreshCcw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                    {resending
                      ? "Sending…"
                      : cooldownLeft > 0
                        ? `Resend code in ${formatTime(cooldownLeft)}`
                        : expired
                          ? "Resend code"
                          : "Didn't get it? Resend code"}
                  </button>
                ) : (expired || sessionGone) && onExpiredAction ? (
                  <button
                    type="button"
                    onClick={onExpiredAction.onClick}
                    className="inline-flex items-center gap-2 text-sm font-bold"
                    style={{ color: theme.primaryText }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {onExpiredAction.label}
                  </button>
                ) : (
                  hint && <p className="text-xs font-medium text-gray-400">{hint}</p>
                )}

                {back && (
                  <div>
                    <button
                      type="button"
                      onClick={back.onClick}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 transition-colors hover:text-gray-800"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      {back.label}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

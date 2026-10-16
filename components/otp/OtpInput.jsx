"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const STATE_STYLES = {
  error: { borderColor: "#F87171", backgroundColor: "#FEF2F2", color: "#DC2626" },
  success: { borderColor: "#34D399", backgroundColor: "#ECFDF5", color: "#059669" },
};

const OtpInput = forwardRef(function OtpInput(
  { digits, onChange, onComplete, disabled = false, status = "idle", theme, shake = false, autoFocus = true },
  ref,
) {
  const length = digits.length;
  const inputs = useRef([]);
  const [active, setActive] = useState(null);

  useImperativeHandle(ref, () => ({ focusFirst: () => inputs.current[0]?.focus() }));

  const focusAt = (i) => {
    const el = inputs.current[Math.min(Math.max(i, 0), length - 1)];
    el?.focus();
    el?.select();
  };

  const commit = (next) => {
    onChange(next);
    if (next.every(Boolean)) onComplete?.(next.join(""));
  };

  // Typing, pasting and one-time-code autofill all funnel through here.
  const fillFrom = (start, chars) => {
    const next = [...digits];
    let j = start;
    for (const ch of chars) {
      if (j >= length) break;
      next[j++] = ch;
    }
    commit(next);
    focusAt(j);
  };

  const handleChange = (i, e) => {
    const chars = e.target.value.replace(/\D/g, "");
    if (!chars) {
      const next = [...digits];
      next[i] = "";
      onChange(next);
      return;
    }
    fillFrom(i, chars);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
        onChange(next);
      } else if (i > 0) {
        next[i - 1] = "";
        onChange(next);
        focusAt(i - 1);
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      const next = [...digits];
      next[i] = "";
      onChange(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (i, e) => {
    e.preventDefault();
    const chars = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!chars) return;
    fillFrom(chars.length === length ? 0 : i, chars);
  };

  const boxStyle = (i) => {
    const filled = Boolean(digits[i]);
    if (STATE_STYLES[status]) return STATE_STYLES[status];
    if (active === i && !disabled) {
      return {
        borderColor: theme.primary,
        backgroundColor: "#FFFFFF",
        color: theme.primaryText,
        boxShadow: `0 0 0 4px ${theme.primaryRing}66`,
        transform: "translateY(-2px)",
      };
    }
    if (filled) return { borderColor: theme.primaryRing, backgroundColor: "#FFFFFF", color: theme.primaryText };
    return { borderColor: "#EEF1F4", backgroundColor: "#F8FAFC", color: "#0F172A" };
  };

  return (
    <div
      role="group"
      aria-label={`${length}-digit verification code`}
      className={`flex items-center justify-center gap-2 ${shake ? "otp-shake" : ""}`}
    >
      {digits.map((digit, i) => (
        <div key={i} className="contents">
          {i === length / 2 && <span className="w-1.5 shrink-0" aria-hidden="true" />}
          <input
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name={i === 0 ? "otp" : undefined}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && i === 0}
            maxLength={length}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={status === "error"}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => {
              setActive(i);
              e.target.select();
            }}
            onBlur={() => setActive((cur) => (cur === i ? null : cur))}
            style={boxStyle(i)}
            className="h-14 sm:h-16 min-w-0 max-w-[3.5rem] flex-1 rounded-2xl border-2 text-center text-2xl font-black tabular-nums outline-none transition-all duration-200 disabled:opacity-60"
          />
        </div>
      ))}
    </div>
  );
});

export default OtpInput;

// The OTP countdown must reflect when the code was really issued, not when the
// page last mounted — otherwise a refresh (or hot reload) shows a fresh 10:00
// for a code that is already nearly dead. Login pages call markOtpIssued() when
// a code is sent; the OTP screen derives its timer from it.
const storageKey = (key) => `lh_otp_issued:${key}`;

export function markOtpIssued(key) {
  try {
    sessionStorage.setItem(storageKey(key), String(Date.now()));
  } catch {}
}

export function readOtpIssued(key) {
  try {
    const value = Number(sessionStorage.getItem(storageKey(key)));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

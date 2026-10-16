"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";
import {
  ShieldCheck,
  CloudUpload,
  FileDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  XCircle,
  Download,
  ArrowLeft,
} from "lucide-react";

export default function BulkEnrollPage() {
  const { memberLabel, supportLabel, orgType } = useAuth();
  const isSchool = orgType === "SCHOOL";
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const memberWord = (memberLabel || "Student").toUpperCase();
  const supportWord = (supportLabel || "Counselor").toUpperCase();

  const allowedExtensions = [".csv", ".xlsx", ".xls"];
  const allowedMimeTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    const isValid =
      allowedMimeTypes.includes(selectedFile.type) ||
      allowedExtensions.includes(`.${fileExtension}`);

    if (!isValid) {
      setError("Please upload a valid CSV or Excel file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setPreview(null);
    setResult(null);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dryRun", "true");

    try {
      const { data } = await api.post("/auth/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to read file.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/auth/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setPreview(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process file.");
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Bulk Enrollment
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Onboard your entire {memberLabel ? memberLabel.toLowerCase() : "member"}{" "}
          community in seconds using a CSV or Excel template.
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
          <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 dark:text-blue-300">Formatting Instructions</h3>
          <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-1 leading-relaxed">
            Your file must include headers for:{" "}
            <code className="bg-blue-200/50 dark:bg-blue-500/20 px-1.5 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">
              firstName
            </code>
            ,{" "}
            <code className="bg-blue-200/50 dark:bg-blue-500/20 px-1.5 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">
              lastName
            </code>
            ,{" "}
            <code className="bg-blue-200/50 dark:bg-blue-500/20 px-1.5 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">
              email
            </code>
            , and{" "}
            <code className="bg-blue-200/50 dark:bg-blue-500/20 px-1.5 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">
              role
            </code>{" "}
            ({memberWord} or {supportWord}).
          </p>
          {isSchool && (
            <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-2 leading-relaxed">
              Optional, for parental consent:{" "}
              {["dateOfBirth", "parentFirstName", "parentLastName", "parentEmail"].map((col, i, all) => (
                <span key={col}>
                  <code className="bg-blue-200/50 dark:bg-blue-500/20 px-1.5 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">{col}</code>
                  {i < all.length - 1 ? ", " : ""}
                </span>
              ))}
              . Dates use <code className="bg-blue-200/50 dark:bg-blue-500/20 px-1.5 py-0.5 rounded font-mono text-blue-900 dark:text-blue-200">YYYY-MM-DD</code>.
              Students under 18 with parent details are emailed a consent request automatically.
            </p>
          )}
          <a
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/upload/template`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-500/30 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Template
          </a>
        </div>
      </div>

      {!result && !preview && (
        <form
          onSubmit={handlePreview}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white dark:bg-gray-900 dim:bg-white border-2 border-dashed rounded-3xl p-16 text-center space-y-6 transition-all duration-200 shadow-sm ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-4 ring-blue-50 dark:ring-blue-500/10"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`p-5 rounded-full mb-4 transition-colors ${isDragging ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-gray-50 dark:bg-gray-800 text-gray-400"}`}
            >
              <CloudUpload
                className={`h-12 w-12 ${isDragging ? "animate-bounce" : ""}`}
              />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              <span className="font-bold text-gray-900 dark:text-white">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-sm text-gray-400 mt-1">
              CSV, XLSX, or XLS (Max 10MB)
            </p>

            <label className="mt-6 cursor-pointer">
              <span className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 inline-block">
                Browse Files
              </span>
              <input
                type="file"
                className="hidden"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-6 flex items-center gap-3 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-full border border-green-100 dark:border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-bold text-green-700 dark:text-green-400">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="text-green-700/50 dark:text-green-400/60 hover:text-red-500"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20 mx-auto max-w-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 text-white py-4 rounded-xl font-bold disabled:opacity-30 hover:bg-black dark:hover:bg-gray-600 transition shadow-xl"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Preview Enrollment"
            )}
          </button>
        </form>
      )}

      {preview && !result && (
        /* Preview / Confirm Section */
        <div className="bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review Before Enrolling
            </h2>
            <button
              onClick={startOver}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Choose Different File
            </button>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-center bg-gray-50/30 dark:bg-gray-800/30">
            <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900 dark:text-white">
                {preview.wouldCreateCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Ready to Enroll
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900 dark:text-white">
                {preview.wouldFailCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Would Fail
              </p>
            </div>
          </div>

          {preview.minorsCount > 0 && (
            <div className="mx-8 mb-4 flex items-start gap-3 text-sm bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
              <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="font-medium">
                {preview.minorsCount} student{preview.minorsCount === 1 ? " is" : "s are"} under 18.{" "}
                {preview.minorsWithParentCount} will be emailed a parental consent request automatically.
                {preview.minorsMissingParentCount > 0 &&
                  ` ${preview.minorsMissingParentCount} ${preview.minorsMissingParentCount === 1 ? "has" : "have"} no parent details — you'll need to link a parent for ${preview.minorsMissingParentCount === 1 ? "them" : "each"} afterwards.`}
              </p>
            </div>
          )}

          {preview.sampleInvalid?.length > 0 && (
            <div className="px-8 pb-2">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-3">
                Rows that need fixing (showing first {preview.sampleInvalid.length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-red-100 dark:border-red-500/20">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 dark:bg-red-500/10">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-red-800 dark:text-red-400">Email</th>
                      <th className="px-4 py-2 text-left font-semibold text-red-800 dark:text-red-400">Role</th>
                      <th className="px-4 py-2 text-left font-semibold text-red-800 dark:text-red-400">Error</th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-gray-900">
                    {preview.sampleInvalid.map((row, i) => (
                      <tr key={i} className="border-t border-red-50 dark:border-red-500/10">
                        <td className="px-4 py-2 dark:text-gray-200">{row.email || "—"}</td>
                        <td className="px-4 py-2 dark:text-gray-200">{row.role || "—"}</td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400">{row.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-8 mb-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="p-8 pt-4 flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={loading || preview.wouldCreateCount === 0}
              className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold disabled:opacity-30 hover:bg-black dark:hover:bg-gray-600 transition shadow-xl"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `Confirm & Enroll ${preview.wouldCreateCount}`
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        /* Result Summary Section */
        <div className="bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Summary</h2>
            <button
              onClick={startOver}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-lg transition-colors"
            >
              Start New Upload
            </button>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-center bg-gray-50/30 dark:bg-gray-800/30">
            <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900 dark:text-white">
                {result.createdCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Created Successfully
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900 dark:text-white">
                {result.failedCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Failed / Duplicates
              </p>
            </div>
          </div>

          {(result.consentRequestsSent > 0 ||
            result.minorsMissingParentCount > 0 ||
            result.parentLinkFailures?.length > 0) && (
            <div className="px-8 pb-6 space-y-3 bg-gray-50/30 dark:bg-gray-800/30">
              {result.consentRequestsSent > 0 && (
                <div className="flex items-center gap-3 text-sm bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-400 p-4 rounded-xl border border-green-100 dark:border-green-500/20 font-medium">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  {result.consentRequestsSent} parental consent request
                  {result.consentRequestsSent === 1 ? "" : "s"} emailed.
                </div>
              )}
              {result.minorsMissingParentCount > 0 && (
                <div className="flex items-center gap-3 text-sm bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20 font-medium">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>
                    {result.minorsMissingParentCount} under-18 student
                    {result.minorsMissingParentCount === 1 ? " has" : "s have"} no parent details.{" "}
                    <Link href="/org-admin/parent-consent" className="underline font-bold">
                      Review on the Parental Consent page
                    </Link>
                    .
                  </span>
                </div>
              )}
              {result.parentLinkFailures?.length > 0 && (
                <div className="text-sm bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-500/20 font-medium space-y-1">
                  <p className="font-bold">
                    Couldn&apos;t link {result.parentLinkFailures.length} parent
                    {result.parentLinkFailures.length === 1 ? "" : "s"}:
                  </p>
                  {result.parentLinkFailures.slice(0, 5).map((f) => (
                    <p key={f.email} className="text-xs">
                      {f.email} — {f.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {result.failedDownload && (
            <div className="bg-red-50/50 dark:bg-red-500/10 p-6 border-t border-red-100 dark:border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-900 dark:text-red-400">
                  Some records encountered errors. Download the report to review
                  and fix them.
                </p>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${result.failedDownload}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl border border-red-200 dark:border-red-500/30 transition-all shadow-sm"
              >
                <FileDown className="h-5 w-5" />
                Download Error Report
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

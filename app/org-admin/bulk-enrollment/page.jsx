"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";
import {
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
  const { memberLabel, supportLabel } = useAuth();
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Bulk Enrollment
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Onboard your entire {memberLabel ? memberLabel.toLowerCase() : "member"}{" "}
          community in seconds using a CSV or Excel template.
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <FileSpreadsheet className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900">Formatting Instructions</h3>
          <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
            Your file must include headers for:{" "}
            <code className="bg-blue-200/50 px-1.5 py-0.5 rounded font-mono text-blue-900">
              firstName
            </code>
            ,{" "}
            <code className="bg-blue-200/50 px-1.5 py-0.5 rounded font-mono text-blue-900">
              lastName
            </code>
            ,{" "}
            <code className="bg-blue-200/50 px-1.5 py-0.5 rounded font-mono text-blue-900">
              email
            </code>
            , and{" "}
            <code className="bg-blue-200/50 px-1.5 py-0.5 rounded font-mono text-blue-900">
              role
            </code>{" "}
            ({memberWord} or {supportWord}).
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/upload/template`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm transition-colors"
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
          className={`bg-white border-2 border-dashed rounded-3xl p-16 text-center space-y-6 transition-all duration-200 shadow-sm ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-50"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`p-5 rounded-full mb-4 transition-colors ${isDragging ? "bg-blue-100 text-blue-600" : "bg-gray-50 text-gray-400"}`}
            >
              <CloudUpload
                className={`h-12 w-12 ${isDragging ? "animate-bounce" : ""}`}
              />
            </div>
            <p className="text-lg text-gray-600">
              <span className="font-bold text-gray-900">Click to upload</span>{" "}
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
              <div className="mt-6 flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-bold text-green-700">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="text-green-700/50 hover:text-red-500"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 mx-auto max-w-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold disabled:opacity-30 hover:bg-black transition shadow-xl"
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
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Review Before Enrolling
            </h2>
            <button
              onClick={startOver}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-50 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Choose Different File
            </button>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-center bg-gray-50/30">
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900">
                {preview.wouldCreateCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Ready to Enroll
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900">
                {preview.wouldFailCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Would Fail
              </p>
            </div>
          </div>

          {preview.sampleInvalid?.length > 0 && (
            <div className="px-8 pb-2">
              <h3 className="text-sm font-bold text-red-700 mb-3">
                Rows that need fixing (showing first {preview.sampleInvalid.length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-red-100">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-red-800">Email</th>
                      <th className="px-4 py-2 text-left font-semibold text-red-800">Role</th>
                      <th className="px-4 py-2 text-left font-semibold text-red-800">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sampleInvalid.map((row, i) => (
                      <tr key={i} className="border-t border-red-50">
                        <td className="px-4 py-2">{row.email || "—"}</td>
                        <td className="px-4 py-2">{row.role || "—"}</td>
                        <td className="px-4 py-2 text-red-600">{row.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-8 mb-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="p-8 pt-4 flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={loading || preview.wouldCreateCount === 0}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold disabled:opacity-30 hover:bg-black transition shadow-xl"
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
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Upload Summary</h2>
            <button
              onClick={startOver}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              Start New Upload
            </button>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-center bg-gray-50/30">
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900">
                {result.createdCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Created Successfully
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-5xl font-black text-gray-900">
                {result.failedCount}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">
                Failed / Duplicates
              </p>
            </div>
          </div>

          {result.failedDownload && (
            <div className="bg-red-50/50 p-6 border-t border-red-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <p className="text-sm font-medium text-red-900">
                  Some records encountered errors. Download the report to review
                  and fix them.
                </p>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${result.failedDownload}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold bg-white text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl border border-red-200 transition-all shadow-sm"
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

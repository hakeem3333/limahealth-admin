"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import {
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function BulkEnrollPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Define allowed types for validation
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
    setResult(null);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  // Drag and Drop Handlers
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/admin/setup/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bulk Enrollment
        </h1>
        <p className="text-gray-500 mt-1">
          Upload a CSV or Excel file to register multiple users at once.
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-4">
        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center shrink-0">
          <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">
            File Requirements
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
            Headers required:{" "}
            <code className="bg-blue-200/50 px-1 rounded">firstName</code>,{" "}
            <code className="bg-blue-200/50 px-1 rounded">lastName</code>,{" "}
            <code className="bg-blue-200/50 px-1 rounded">email</code>, and{" "}
            <code className="bg-blue-200/50 px-1 rounded">role</code> (STUDENT,
            TEACHER, or COUNSELOR).
          </p>
        </div>
      </div>

      {!result ? (
        <form
          onSubmit={handleUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white dark:bg-gray-800 border-2 border-dashed rounded-2xl p-12 text-center space-y-4 transition-colors ${
            isDragging
              ? "border-black bg-gray-50 dark:bg-gray-700"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex flex-col items-center">
            <CloudArrowUpIcon
              className={`h-12 w-12 mb-4 transition-transform ${isDragging ? "scale-110 text-black" : "text-gray-400"}`}
            />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-black dark:text-white">
                Drag and drop
              </span>{" "}
              your file here, or
            </p>
            <label className="cursor-pointer">
              <span className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm inline-block">
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
              <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  {file.name}
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-slate-100 dark:bg-gray-700 py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-slate-200 transition"
          >
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              "Start Processing"
            )}
          </button>
        </form>
      ) : (
        /* Result Summary Section */
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold">Upload Summary</h2>
            <button
              onClick={() => setResult(null)}
              className="text-sm text-gray-500 hover:underline"
            >
              Upload another
            </button>
          </div>
          <div className="p-8 grid grid-cols-2 gap-8 text-center">
            <div className="space-y-2">
              <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto" />
              <p className="text-3xl font-bold">{result.createdCount}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                Created Successfully
              </p>
            </div>
            <div className="space-y-2">
              <ExclamationCircleIcon className="h-10 w-10 text-red-500 mx-auto" />
              <p className="text-3xl font-bold">{result.failedCount}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                Failed / Duplicates
              </p>
            </div>
          </div>

          {result.failedDownload && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Some records failed. Download the report to see why.
              </p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}${result.failedDownload}`}
                target="_blank"
                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Download Failed Records
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

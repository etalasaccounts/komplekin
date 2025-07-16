"use client";

import React, { useState } from "react";
import { ChooseFile } from "@/components/input/chooseFile";

export default function ChooseFileDemo() {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [fileWithError, setFileWithError] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Example of a function that only accepts File (not null)
  const handleFileUpload = (file: File | null) => {
    if (file) {
      console.log("File uploaded:", file.name);
      setUploadedFile(file);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-md">
      <h1 className="text-2xl font-bold">Choose File Component Demo</h1>

      {/* Basic Image Upload */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Basic Image Upload</h2>
        <ChooseFile
          label="Profile Photo"
          id="profilePhoto"
          accept="image/*"
          onChange={setProfilePhoto}
          value={profilePhoto}
          placeholder="Select profile photo"
          required
        />
        {profilePhoto && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {profilePhoto.name} (
            {(profilePhoto.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Document Upload */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Document Upload</h2>
        <ChooseFile
          label="Upload Document"
          id="document"
          accept=".pdf,.doc,.docx"
          onChange={setDocument}
          value={document}
          placeholder="Choose document file"
        />
        {document && (
          <p className="text-sm text-gray-600 mt-2">
            Document: {document.name}
          </p>
        )}
      </div>

      {/* File Processing Example */}
      <div>
        <h2 className="text-lg font-semibold mb-4">File Processing Example</h2>
        <ChooseFile
          label="Upload for Processing"
          id="processFile"
          accept="*/*"
          onChange={handleFileUpload}
          value={uploadedFile}
          placeholder="File will be processed immediately"
        />
        {uploadedFile && (
          <p className="text-sm text-green-600 mt-2">
            Processed: {uploadedFile.name}
          </p>
        )}
      </div>

      {/* With Error State */}
      <div>
        <h2 className="text-lg font-semibold mb-4">With Error State</h2>
        <ChooseFile
          label="File with Error"
          id="fileError"
          accept="*/*"
          onChange={setFileWithError}
          value={fileWithError}
          placeholder="Any file type"
          error="File size must be less than 5MB"
          required
        />
      </div>

      {/* Disabled State */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Disabled State</h2>
        <ChooseFile
          label="Disabled Upload"
          id="disabledFile"
          onChange={() => {}}
          placeholder="Upload disabled"
          disabled
        />
      </div>
    </div>
  );
}

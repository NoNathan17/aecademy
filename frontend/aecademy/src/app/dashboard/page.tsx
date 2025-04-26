'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PdfViewer from '@/components/PdfViewer';

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  return (
    <DashboardLayout>
      <div className="text-2xl font-bold mb-4">Upload a PDF 📄</div>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {file && (
        <div className="mt-8">
          <PdfViewer file={file} />
        </div>
      )}
    </DashboardLayout>
  );
}

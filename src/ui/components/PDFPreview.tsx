'use client';

interface PDFPreviewProps {
  url: string;
}

export default function PDFPreview({ url }: PDFPreviewProps) {
  if (!url) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded flex items-center justify-center">
        <p className="text-gray-500">Aucun fichier sélectionné</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gray-100 rounded overflow-hidden">
      <embed
        src={url}
        type="application/pdf"
        width="100%"
        height="100%"
        className="border-0"
      />
    </div>
  );
}

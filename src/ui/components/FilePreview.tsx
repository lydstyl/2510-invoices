'use client';

import Image from 'next/image';

interface FilePreviewProps {
  url: string;
  fileType?: string;
}

export default function FilePreview({ url, fileType }: FilePreviewProps) {
  if (!url) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] min-h-[600px] bg-gray-100 rounded flex items-center justify-center">
        <p className="text-gray-500">Aucun fichier sélectionné</p>
      </div>
    );
  }

  const isPDF = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');

  return (
    <div className="w-full h-[calc(100vh-12rem)] min-h-[600px] bg-gray-100 rounded overflow-hidden">
      {isPDF && (
        <embed
          src={url}
          type="application/pdf"
          width="100%"
          height="100%"
          className="border-0"
        />
      )}
      {isImage && (
        <div className="w-full h-full flex items-center justify-center p-4 relative">
          <Image
            src={url}
            alt="Aperçu de la facture"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}
      {!isPDF && !isImage && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">Type de fichier non supporté pour la prévisualisation</p>
        </div>
      )}
    </div>
  );
}

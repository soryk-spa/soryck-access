"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle } from "lucide-react";

const QRCodeCanvas = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-48 w-48 bg-gray-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Generando QR...</p>
      </div>
    ),
  }
);

interface QRCodeDisplayProps {
  qrCodeValue: string | null | undefined;
}

export default function QRCodeDisplay({ qrCodeValue }: QRCodeDisplayProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-48 bg-gray-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Cargando QR...</p>
      </div>
    );
  }

  if (qrCodeValue === undefined || qrCodeValue === null) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-48 bg-gray-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Cargando QR...</p>
      </div>
    );
  }

  if (!qrCodeValue || qrCodeValue.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-48 bg-red-50 text-red-700 rounded-lg p-4 text-center">
        <AlertTriangle className="h-8 w-8" />
        <p className="mt-2 text-sm font-semibold">
          No se pudo generar el código QR.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md inline-block">
      <QRCodeCanvas
        value={qrCodeValue}
        size={192}
        bgColor="#ffffff"
        fgColor="#000000"
        level="L"
        includeMargin={false}
      />
    </div>
  );
}
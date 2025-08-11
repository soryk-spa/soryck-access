"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Loader2, AlertTriangle } from "lucide-react";

interface QRCodeDisplayProps {
  qrCodeValue: string | null | undefined;
}

export default function QRCodeDisplay({ qrCodeValue }: QRCodeDisplayProps) {
  if (qrCodeValue === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-48 bg-gray-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Cargando QR...</p>
      </div>
    );
  }

  if (!qrCodeValue) {
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
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
      />
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { uploadAttachmentAction, deleteAttachmentAction } from "@/actions/attachment.actions";
import type { AttachmentEntity } from "@prisma/client";

type Attachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  notes: string | null;
  uploadedByName: string;
  createdAt: Date;
};

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(type: string) {
  if (type.startsWith("image/")) return "🖼️";
  if (type.includes("pdf")) return "📄";
  if (type.includes("word")) return "📝";
  if (type.includes("sheet") || type.includes("excel")) return "📊";
  return "📎";
}

export function AttachmentsSection({
  entity,
  entityId,
  attachments,
}: {
  entity: AttachmentEntity;
  entityId: string;
  attachments: Attachment[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      toast("Archivo demasiado grande (máx 2MB)", "error");
      return;
    }

    setUploading(true);

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      const result = await uploadAttachmentAction({
        entity,
        entityId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dataUrl,
      });

      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";

      if (result.success) {
        toast("Archivo subido");
        router.refresh();
      } else {
        toast(result.error || "Error al subir", "error");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este archivo?")) return;
    const result = await deleteAttachmentAction({ id, entity, entityId });
    if (result.success) {
      toast("Archivo eliminado");
      router.refresh();
    } else {
      toast(result.error || "Error", "error");
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Documentos adjuntos ({attachments.length})
        </h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "+ Adjuntar archivo"}
        </button>
        <input
          ref={fileRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
        />
      </div>

      {attachments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-400">Sin documentos. Adjunta una foto, albarán o factura.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
            >
              <span className="text-2xl flex-shrink-0">{iconFor(att.fileType)}</span>
              <a
                href={`/api/attachments/${att.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                  {att.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatSize(att.fileSize)} · {att.uploadedByName} ·{" "}
                  {new Date(att.createdAt).toLocaleDateString("es-ES")}
                </p>
              </a>
              <button
                onClick={() => handleDelete(att.id)}
                className="text-xs text-gray-400 hover:text-red-600 px-2"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

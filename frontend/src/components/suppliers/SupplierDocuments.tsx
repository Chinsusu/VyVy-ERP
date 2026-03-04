import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, FileText, FileImage, File, Download } from 'lucide-react';
import { supplierDocumentsAPI } from '../../api/supplierDocuments';
import type { SupplierDocument } from '../../api/supplierDocuments';

interface Props {
    supplierId: number;
    readOnly?: boolean;
}

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SupplierDocuments({ supplierId, readOnly }: Props) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const { data: docs = [], isLoading } = useQuery({
        queryKey: ['supplier-documents', supplierId],
        queryFn: () => supplierDocumentsAPI.list(supplierId),
        enabled: !!supplierId,
    });

    const deleteMutation = useMutation({
        mutationFn: (docId: number) => supplierDocumentsAPI.delete(supplierId, docId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-documents', supplierId] });
            setDeleteConfirm(null);
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');
        setUploading(true);
        try {
            await supplierDocumentsAPI.upload(supplierId, file);
            queryClient.invalidateQueries({ queryKey: ['supplier-documents', supplierId] });
        } catch (err: any) {
            setUploadError(err?.response?.data?.error?.message || 'Tải lên thất bại');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownload = (doc: SupplierDocument) => {
        const url = supplierDocumentsAPI.getDownloadUrl(doc);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.original_name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Chứng Từ
                    <span className="text-sm text-gray-400 font-normal">({docs.length})</span>
                </h2>
                {!readOnly && (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="btn btn-primary flex items-center gap-2 text-sm"
                        >
                            <Upload className="w-4 h-4" />
                            {uploading ? 'Đang tải...' : 'Tải lên'}
                        </button>
                    </div>
                )}
            </div>

            {uploadError && (
                <div className="mb-3 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                    {uploadError}
                </div>
            )}

            {isLoading ? (
                <p className="text-sm text-gray-400">Đang tải...</p>
            ) : docs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Chưa có chứng từ nào</p>
                    <p className="text-xs text-gray-300 mt-1">PDF, Word, Excel, hình ảnh — tối đa 20MB</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                {getFileIcon(doc.mime_type)}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{doc.original_name}</p>
                                    <p className="text-xs text-gray-400">
                                        {formatFileSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                        {doc.uploaded_by_user && ` · ${doc.uploaded_by_user.full_name || doc.uploaded_by_user.username}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded transition-colors"
                                    title="Tải về"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                {!readOnly && (deleteConfirm === doc.id ? (
                                    <>
                                        <button
                                            onClick={() => deleteMutation.mutate(doc.id)}
                                            disabled={deleteMutation.isPending}
                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Xóa
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                        >
                                            Hủy
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(doc.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

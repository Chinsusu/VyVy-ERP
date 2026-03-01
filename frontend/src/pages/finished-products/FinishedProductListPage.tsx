import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinishedProducts } from '../../hooks/useFinishedProducts';
import type { FinishedProductFilters } from '../../types/finishedProduct';

export default function FinishedProductListPage() {
    const [filters, setFilters] = useState<FinishedProductFilters>({
        page: 1,
        page_size: 20,
    });

    const { data, isLoading, error } = useFinishedProducts(filters);
    const products = data?.data || [];
    const pagination = data?.pagination;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    if (error) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi tải danh sách thành phẩm: {(error as Error).message}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-8 h-8 text-primary" />
                                Thành Phẩm
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý danh mục thành phẩm và tồn kho</p>
                        </div>
                        <Link to="/finished-products/new" className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Thêm Sản Phẩm
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm theo mã, tên sản phẩm hoặc barcode..."
                                className="input pl-10 w-full"
                                value={filters.search || ''}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card shadow-md">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                Đang tải dữ liệu...
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Chưa có thành phẩm nào</p>
                            <Link to="/finished-products/new" className="btn btn-primary mt-4">
                                Tạo Sản Phẩm Đầu Tiên
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="w-32">Mã SP</th>
                                            <th className="min-w-[200px]">Tên Sản Phẩm</th>
                                            <th>Danh Mục</th>
                                            <th>ĐVT</th>
                                            <th>Giá Bán</th>
                                            <th>Trạng Thái</th>
                                            <th className="text-right">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id}>
                                                <td className="font-mono font-semibold text-primary">{product.code}</td>
                                                <td>
                                                    <div className="max-w-[300px] truncate font-medium text-gray-900" title={product.name}>
                                                        {product.name}
                                                    </div>
                                                </td>
                                                <td>
                                                    {product.category ? (
                                                        <span className="badge badge-secondary">{product.category}</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td>{product.unit}</td>
                                                <td className="font-medium">
                                                    {product.selling_price ? (
                                                        `${product.selling_price.toLocaleString('vi-VN')} VNĐ`
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {product.is_active ? (
                                                        <span className="badge badge-success">Đang dùng</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Ngưng dùng</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-3">
                                                        <Link
                                                            to={`/finished-products/${product.id}`}
                                                            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                                                        >
                                                            Xem
                                                        </Link>
                                                        <Link
                                                            to={`/finished-products/${product.id}/edit`}
                                                            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                                                        >
                                                            Sửa
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total > 0 && (
                                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Hiển thị {(pagination.page - 1) * pagination.page_size + 1} –{' '}
                                        {Math.min(pagination.page * pagination.page_size, pagination.total)} trong tổng số{' '}
                                        {pagination.total} sản phẩm
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Trước
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Sau
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

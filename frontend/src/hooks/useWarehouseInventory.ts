import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

export interface StockBalanceItem {
    id: number;
    item_type: 'material' | 'finished_product';
    item_id: number;
    warehouse_id: number;
    warehouse_location_id?: number;
    batch_number?: string;
    lot_number?: string;
    expiry_date?: string;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    unit_cost?: number;
    total_cost?: number;
    last_transaction_date?: string;
    // Resolved from join
    item_name?: string;
    item_code?: string;
    item_unit?: string;
}

/**
 * Fetch all stock balances for a specific warehouse (no item_id filter).
 * Resolves item names by fetching materials + finished products in parallel.
 */
export const useWarehouseInventory = (warehouseId: number) => {
    return useQuery({
        queryKey: ['warehouse-inventory', warehouseId],
        queryFn: async (): Promise<StockBalanceItem[]> => {
            // Fetch all 3 in parallel
            const [balanceRes, materialsRes, productsRes] = await Promise.all([
                axios.get('/inventory/balance', { params: { warehouse_id: warehouseId } }),
                axios.get('/materials', { params: { page_size: 9999 } }),
                axios.get('/finished-products', { params: { page_size: 9999 } }),
            ]);

            const balances: StockBalanceItem[] = balanceRes.data.data || [];
            const materials: any[] = materialsRes.data.data || [];
            const products: any[] = productsRes.data.data || [];

            // Build lookup maps for O(1) resolve
            const materialMap = new Map(materials.map((m: any) => [m.id, m]));
            const productMap = new Map(products.map((p: any) => [p.id, p]));

            return balances.map((b) => {
                if (b.item_type === 'material') {
                    const mat = materialMap.get(b.item_id);
                    return {
                        ...b,
                        item_name: mat?.name ?? `NL #${b.item_id}`,
                        item_code: mat?.code ?? '',
                        item_unit: mat?.unit ?? '',
                    };
                } else {
                    const prod = productMap.get(b.item_id);
                    return {
                        ...b,
                        item_name: prod?.name ?? `TP #${b.item_id}`,
                        item_code: prod?.code ?? '',
                        item_unit: prod?.unit ?? '',
                    };
                }
            });
        },
        enabled: warehouseId > 0,
    });
};

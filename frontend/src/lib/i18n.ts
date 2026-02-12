import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English
import commonEn from '../locales/en/common.json';
import sidebarEn from '../locales/en/sidebar.json';
import loginEn from '../locales/en/login.json';
import dashboardEn from '../locales/en/dashboard.json';
import materialsEn from '../locales/en/materials.json';
import suppliersEn from '../locales/en/suppliers.json';
import warehousesEn from '../locales/en/warehouses.json';
import purchaseOrdersEn from '../locales/en/purchaseOrders.json';
import grnsEn from '../locales/en/grns.json';
import materialRequestsEn from '../locales/en/materialRequests.json';
import minsEn from '../locales/en/mins.json';
import deliveryOrdersEn from '../locales/en/deliveryOrders.json';
import inventoryEn from '../locales/en/inventory.json';
import reportsEn from '../locales/en/reports.json';
import finishedProductsEn from '../locales/en/finishedProducts.json';

// Vietnamese
import commonVi from '../locales/vi/common.json';
import sidebarVi from '../locales/vi/sidebar.json';
import loginVi from '../locales/vi/login.json';
import dashboardVi from '../locales/vi/dashboard.json';
import materialsVi from '../locales/vi/materials.json';
import suppliersVi from '../locales/vi/suppliers.json';
import warehousesVi from '../locales/vi/warehouses.json';
import purchaseOrdersVi from '../locales/vi/purchaseOrders.json';
import grnsVi from '../locales/vi/grns.json';
import materialRequestsVi from '../locales/vi/materialRequests.json';
import minsVi from '../locales/vi/mins.json';
import deliveryOrdersVi from '../locales/vi/deliveryOrders.json';
import inventoryVi from '../locales/vi/inventory.json';
import reportsVi from '../locales/vi/reports.json';
import finishedProductsVi from '../locales/vi/finishedProducts.json';

export const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
] as const;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: commonEn,
                sidebar: sidebarEn,
                login: loginEn,
                dashboard: dashboardEn,
                materials: materialsEn,
                suppliers: suppliersEn,
                warehouses: warehousesEn,
                purchaseOrders: purchaseOrdersEn,
                grns: grnsEn,
                materialRequests: materialRequestsEn,
                mins: minsEn,
                deliveryOrders: deliveryOrdersEn,
                inventory: inventoryEn,
                reports: reportsEn,
                finishedProducts: finishedProductsEn,
            },
            vi: {
                common: commonVi,
                sidebar: sidebarVi,
                login: loginVi,
                dashboard: dashboardVi,
                materials: materialsVi,
                suppliers: suppliersVi,
                warehouses: warehousesVi,
                purchaseOrders: purchaseOrdersVi,
                grns: grnsVi,
                materialRequests: materialRequestsVi,
                mins: minsVi,
                deliveryOrders: deliveryOrdersVi,
                inventory: inventoryVi,
                reports: reportsVi,
                finishedProducts: finishedProductsVi,
            },
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: [
            'common', 'sidebar', 'login', 'dashboard',
            'materials', 'suppliers', 'warehouses', 'purchaseOrders',
            'grns', 'materialRequests', 'mins', 'deliveryOrders',
            'inventory', 'reports', 'finishedProducts',
        ],
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'vyvy-lang',
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

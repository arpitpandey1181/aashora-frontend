import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export const billingService = {
  // Get all OPD/IPD invoices
  getAllInvoices: async (fromDate = '', toDate = '') => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_INVOICES, {
        params: { fromDate, toDate },
      });
      return response;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Create new bill (maps to patopdvisitmainmodel billing fields: cashamt, cardamt, discountamt, etc.)
  createInvoice: async (invoiceData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_INVOICE, invoiceData);
      return response;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Get invoice details by billno
  getInvoiceDetails: async (billno) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.GET_INVOICE_DETAILS}?billno=${billno}`);
      return response;
    } catch (error) {
      console.error(`Error fetching bill #${billno}:`, error);
      throw error;
    }
  },
};

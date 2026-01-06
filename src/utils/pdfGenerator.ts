import type { Invoice, Client, ExpenseInvoice } from '../types';
import { formatCurrency } from './calculations';
import dayjs from 'dayjs';

export const generateInvoicePDF = (invoice: Invoice, client: Client) => {
  // Company information
  const COMPANY_INFO = {
    name: 'المهندس محمد التركي',
    address: 'تاجوراء شارع اولاد التركي',
    phone: '0913041404',
    email: '',
    taxNumber: '',
  };

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بفتح النوافذ المنبثقة لطباعة الفاتورة');
    return;
  }

  // Generate HTML for the invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة ${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A5;
          margin: 10mm;
        }
        
        body {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.7;
          color: #1a1a1a;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          padding: 25px;
        }
        
        .invoice-container {
          max-width: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          padding: 30px;
        }
        
        .header {
          text-align: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 30px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }
        
        .company-name {
          font-size: 32px;
          font-weight: 900;
          color: white;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .company-details {
          font-size: 14px;
          color: rgba(255,255,255,0.95);
          line-height: 1.8;
        }
        
        .invoice-title {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 16px;
          text-align: center;
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 25px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          letter-spacing: 1px;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 20px;
        }
        
        .info-section {
          flex: 1;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .info-section h3 {
          font-size: 16px;
          color: #3b82f6;
          margin-bottom: 12px;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 8px;
          font-weight: 800;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .info-label {
          font-weight: 600;
          color: #555;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 12px;
        }
        
        .items-table thead {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
        }
        
        .items-table th {
          padding: 16px;
          text-align: right;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        
        .items-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          text-align: right;
          font-size: 13px;
        }
        
        .items-table tbody tr {
          transition: all 0.2s;
        }
        
        .items-table tbody tr:hover {
          background: #f8fafc;
          transform: scale(1.01);
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #fafbfc;
        }
        
        .totals-section {
          width: 100%;
          max-width: 300px;
          margin-right: auto;
          margin-bottom: 20px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 15px;
          font-size: 13px;
        }
        
        .total-row.subtotal {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          font-weight: 600;
        }
        
        .total-row.final {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          font-size: 20px;
          font-weight: 900;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          letter-spacing: 0.5px;
        }
        
        .notes-section {
          background: #fff9e6;
          padding: 15px;
          border-right: 4px solid #ffc107;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .notes-section h4 {
          font-size: 14px;
          color: #f57c00;
          margin-bottom: 8px;
        }
        
        .notes-section p {
          font-size: 12px;
          color: #666;
        }
        
        .footer {
          text-align: center;
          font-size: 11px;
          color: #999;
          border-top: 2px solid #ddd;
          padding-top: 15px;
          margin-top: 30px;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .invoice-container {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div class="company-details">
            📍 ${COMPANY_INFO.address}<br>
            📱 ${COMPANY_INFO.phone}
          </div>
        </div>
        
        <!-- Invoice Title -->
        <div class="invoice-title">
          فاتورة
        </div>
        
        <!-- Invoice & Client Info -->
        <div class="invoice-info">
          <div class="info-section">
            <h3>معلومات الفاتورة</h3>
            <div class="info-row">
              <span class="info-label">رقم الفاتورة:</span>
              <span>${invoice.invoiceNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">تاريخ الإصدار:</span>
              <span>${dayjs(invoice.issueDate).format('DD/MM/YYYY')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">تاريخ الاستحقاق:</span>
              <span>${dayjs(invoice.dueDate).format('DD/MM/YYYY')}</span>
            </div>
          </div>
          
          <div class="info-section">
            <h3>بيانات العميل</h3>
            <div class="info-row">
              <span class="info-label">الاسم:</span>
              <span>${client.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الهاتف:</span>
              <span>${client.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">البريد:</span>
              <span>${client.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">العنوان:</span>
              <span>${client.address}</span>
            </div>
          </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>📋 الوصف</th>
              <th style="width: 80px;">🔢 الكمية</th>
              <th style="width: 100px;">💰 السعر</th>
              <th style="width: 100px;">💵 الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td><strong>${formatCurrency(item.total)}</strong></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row final">
            <span>الإجمالي:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
        </div>
        
        ${
          invoice.notes
            ? `
        <!-- Notes -->
        <div class="notes-section">
          <h4>ملاحظات:</h4>
          <p>${invoice.notes}</p>
        </div>
        `
            : ''
        }
        
        <!-- Footer -->
        <div class="footer">
          <p style="font-size: 15px; color: #475569; margin-bottom: 8px;">شكراً لتعاملكم معنا 🙏</p>
          <p style="font-size: 12px; color: #94a3b8;">هذه فاتورة رسمية معتمدة</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const generateExpenseInvoicePDF = (expenseInvoice: ExpenseInvoice, client: Client) => {
  // Company information - يمكن تخصيصها
  const COMPANY_INFO = {
    name: 'شركة البناء والتشييد',
    address: 'الرياض، المملكة العربية السعودية',
    phone: '+966 50 123 4567',
    email: 'info@construction.com',
    taxNumber: '123456789',
  };

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بفتح النوافذ المنبثقة لطباعة الفاتورة');
    return;
  }

  // Group expenses by date
  const expensesByDate = expenseInvoice.expenses.reduce((acc, exp) => {
    const dateKey = dayjs(exp.date).format('YYYY-MM-DD');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(exp);
    return acc;
  }, {} as Record<string, typeof expenseInvoice.expenses>);

  // Generate HTML for the expense invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة مصروفات ${expenseInvoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A5;
          margin: 10mm;
        }
        
        body {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20px;
        }
        
        .invoice-container {
          max-width: 100%;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #10b981;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        
        .company-details {
          font-size: 11px;
          color: #666;
        }
        
        .invoice-title {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          border-radius: 5px;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .info-section {
          flex: 1;
          min-width: 200px;
          background: #f5f5f5;
          padding: 12px;
          border-radius: 5px;
        }
        
        .info-section h3 {
          font-size: 14px;
          color: #10b981;
          margin-bottom: 8px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .info-label {
          font-weight: 600;
          color: #555;
        }
        
        .period-section {
          background: #ecfdf5;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          border-right: 4px solid #10b981;
        }
        
        .period-section h4 {
          font-size: 14px;
          color: #059669;
          margin-bottom: 8px;
        }
        
        .expenses-by-date {
          margin-bottom: 20px;
        }
        
        .date-group {
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .date-header {
          background: #10b981;
          color: white;
          padding: 10px 15px;
          font-weight: bold;
          font-size: 14px;
        }
        
        .expenses-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        
        .expenses-table thead {
          background: #f3f4f6;
        }
        
        .expenses-table th {
          padding: 10px;
          text-align: right;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .expenses-table td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          text-align: right;
        }
        
        .expenses-table tbody tr:hover {
          background: #f9fafb;
        }
        
        .category-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .totals-section {
          width: 100%;
          max-width: 300px;
          margin-right: auto;
          margin-bottom: 20px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          font-size: 13px;
        }
        
        .total-row.count {
          background: #f3f4f6;
        }
        
        .total-row.final {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
        }
        
        .notes-section {
          background: #fff9e6;
          padding: 15px;
          border-right: 4px solid #ffc107;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .notes-section h4 {
          font-size: 14px;
          color: #f57c00;
          margin-bottom: 8px;
        }
        
        .notes-section p {
          font-size: 12px;
          color: #666;
        }
        
        .footer {
          text-align: center;
          font-size: 11px;
          color: #999;
          border-top: 2px solid #ddd;
          padding-top: 15px;
          margin-top: 30px;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .invoice-container {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div class="company-details">
            ${COMPANY_INFO.address} • ${COMPANY_INFO.phone} • ${COMPANY_INFO.email}<br>
            الرقم الضريبي: ${COMPANY_INFO.taxNumber}
          </div>
        </div>
        
        <!-- Invoice Title -->
        <div class="invoice-title">
          فاتورة مصروفات
        </div>
        
        <!-- Invoice & Client Info -->
        <div class="invoice-info">
          <div class="info-section">
            <h3>معلومات الفاتورة</h3>
            <div class="info-row">
              <span class="info-label">رقم الفاتورة:</span>
              <span>${expenseInvoice.invoiceNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">تاريخ الإصدار:</span>
              <span>${dayjs(expenseInvoice.issueDate).format('DD/MM/YYYY')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الحالة:</span>
              <span>${
                expenseInvoice.status === 'paid'
                  ? 'مدفوعة'
                  : expenseInvoice.status === 'sent'
                  ? 'مرسلة'
                  : 'مسودة'
              }</span>
            </div>
          </div>
          
          <div class="info-section">
            <h3>بيانات العميل</h3>
            <div class="info-row">
              <span class="info-label">الاسم:</span>
              <span>${client.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الهاتف:</span>
              <span>${client.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">البريد:</span>
              <span>${client.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">العنوان:</span>
              <span>${client.address}</span>
            </div>
          </div>
        </div>
        
        <!-- Period Section -->
        <div class="period-section">
          <h4>📅 الفترة المغطاة</h4>
          <div class="info-row">
            <span class="info-label">من:</span>
            <span>${dayjs(expenseInvoice.startDate).format('DD/MM/YYYY')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">إلى:</span>
            <span>${dayjs(expenseInvoice.endDate).format('DD/MM/YYYY')}</span>
          </div>
        </div>
        
        <!-- Expenses by Date -->
        <div class="expenses-by-date">
          ${Object.entries(expensesByDate)
            .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
            .map(
              ([date, expenses]) => `
            <div class="date-group">
              <div class="date-header">
                📆 ${dayjs(date).format('DD/MM/YYYY')} - ${dayjs(date).format('dddd')}
              </div>
              <table class="expenses-table">
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th style="width: 100px;">الفئة</th>
                    <th style="width: 120px;">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenses
                    .map(
                      (exp) => `
                    <tr>
                      <td>${exp.description}${exp.notes ? `<br><small style="color: #666;">${exp.notes}</small>` : ''}</td>
                      <td><span class="category-badge">${exp.category}</span></td>
                      <td style="font-weight: bold; color: #059669;">${formatCurrency(exp.amount)}</td>
                    </tr>
                  `
                    )
                    .join('')}
                  <tr style="background: #f9fafb; font-weight: bold;">
                    <td colspan="2" style="text-align: left;">إجمالي اليوم:</td>
                    <td style="color: #059669;">${formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `
            )
            .join('')}
        </div>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row count">
            <span>عدد المصروفات:</span>
            <span>${expenseInvoice.expenses.length}</span>
          </div>
          <div class="total-row final">
            <span>الإجمالي:</span>
            <span>${formatCurrency(expenseInvoice.totalAmount)}</span>
          </div>
        </div>
        
        ${
          expenseInvoice.notes
            ? `
        <!-- Notes -->
        <div class="notes-section">
          <h4>ملاحظات:</h4>
          <p>${expenseInvoice.notes}</p>
        </div>
        `
            : ''
        }
        
        <!-- Footer -->
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>هذه فاتورة مصروفات رسمية معتمدة</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};


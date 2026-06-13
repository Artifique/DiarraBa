// TypeScript declaration for jspdf-autotable module
declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf';
  interface AutoTableOptions {
    startY?: number;
    head?: any[];
    body?: any[];
    foot?: any[];
    theme?: string;
    headStyles?: any;
    [key: string]: any;
  }
  function autoTable(doc: jsPDF, options: AutoTableOptions): jsPDF;
  export default autoTable;
}

import type { casePoint,activeCases ,pendingQuotes, unpaidInvoices, Tax, Incident } from "@/types/typedata";


export const chartData: casePoint[] = [
  { name: "Active", value: 3 },
  { name: "Pending", value: 2 },
  { name: "Closed", value: 1 },
  { name: "Cancelled", value: 2 },
];

export const activecases: activeCases[] = [
  { caseNo: "TYIM250620",  customer: "ABC Corp",  service: "Import",  status: "Inactive",  pic: "John Doe",  driver: "Driver A",  pickupDate: "2025/06/20",},
  { caseNo: "TYIM250826",  customer: "Pharma Co",  service: "Import",  status: "Active",  pic: "John Doe",  driver: "Driver E",  pickupDate: "2025/08/26",},
];

export const pendingquotes: pendingQuotes[] = [
  { caseNo: "PAREX250121", customer: "XYZ Ltd", service: "Export", pic: "Jane Smith", driver: "Driver B", pickupDate: "2025/01/21", },
  { caseNo: "LADOM250226",  customer: "Global Freight",  service: "Domestic",  pic: "Alice Brown",  driver: "Driver C",  pickupDate: "2025/02/26",},
];

export const unpaidinvoices: unpaidInvoices[] = [
  { caseNo: "TYART250323", customer: "ABC Corp",   totalAmount: "$700.00",  dateDue: "2024-04-26" },
  { caseNo: "PAREX250121", customer: "XYZ Ltd",    totalAmount: "$700.00",  dateDue: "2025-03-22" },
  { caseNo: "TYIM250620",  customer: "ABC Corp",   totalAmount: "$320.00",  dateDue: "2025-02-20" },
  { caseNo: "LADOM250226", customer: "Global Freight", totalAmount: "$3080.00", dateDue: "2025-08-18" },
  { caseNo: "PARART250424",customer: "Art Gallery", totalAmount: "$970.00", dateDue: "2025-08-15" },
  { caseNo: "PARART250424",customer: "ABC Corp", totalAmount: "$970.00", dateDue: "2025-07-15" },
];

export const TAXES: Tax[] = [
  { id: "TAX001", name_en: "Consumption Tax (10%)", name_jp: "消費税 (10%)", rate: 10 },
  { id: "TAX002", name_en: "Tax Imposition",        name_jp: "課税",         rate: 10 },
  { id: "TAX003", name_en: "Consumption-tax exempt",name_jp: "消費税免除",   rate: 5  },
  { id: "TAX004", name_en: "Consumption-tax exempt1",name_jp: "消費税免除",   rate: 7  },
];

export const INCIDENTS: Incident[] = [
  {  id: "ISS001",  case: "TYIM250620",  issueType: "Damaged Item", description: "Broken glass",capa: "Change the glass",  status: "Active",  pic: "John Doe", },
  {  id: "ISS002",  case: "LADOM250226",  issueType: "Failed Pickup/Delivery", description: "During the unloading of a pallet from a supply truck, technician Ray Fields tripped on a curled-up floor mat, causing him to fall",capa: "Immediately remove all damaged floor mats from the dock area and replace them with new, high-quality, anti-slip mats.",  status: "Pending Approval",  pic: "Alice Brown", },
  {  id: "ISS003",  case: "TYIM250620",  issueType: "Damaged Item", description: "Broken glas",capa: "Change the glass",  status: "Resolved",  pic: "John Doe", },
];
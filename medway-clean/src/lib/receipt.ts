import type { Appointment } from '@/lib/data';

export interface ReceiptDetails {
  invoiceId: string;
  paymentId: string;
  bookingId: string;
  transactionStatus: string;
  bookingDate: string;
  patientName: string;
  doctorName: string;
  hospitalName: string;
  department: string;
  appointmentDate: string;
  appointmentSlot: string;
  consultationFee: number;
  convenienceFee: number;
  gst: number;
  total: number;
}

function money(value: number) {
  return `Rs ${value.toLocaleString('en-IN')}`;
}

function formatBookingDate(value: string) {
  if (!value) return new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function stableCode(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000000;
  }
  return String(hash).padStart(6, '0');
}

export function buildReceiptDetails(appt: Appointment, hospitalName: string): ReceiptDetails {
  const consultationFee = Number(appt.fee || 0);
  const convenienceFee = Math.max(25, Math.round(consultationFee * 0.03));
  const gst = Math.round(convenienceFee * 0.18);

  return {
    invoiceId: `INV-${appt.id}`,
    paymentId: `PAY-${stableCode(`${appt.id}-${appt.patient}-${appt.created_at}`)}`,
    bookingId: appt.id,
    transactionStatus: 'Completed',
    bookingDate: formatBookingDate(appt.created_at),
    patientName: appt.patient,
    doctorName: appt.doctor_name,
    hospitalName,
    department: appt.department,
    appointmentDate: appt.date,
    appointmentSlot: appt.slot,
    consultationFee,
    convenienceFee,
    gst,
    total: consultationFee + convenienceFee + gst,
  };
}

function pdfText(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function makePdf(details: ReceiptDetails) {
  const lines: string[] = [];

  const color = (hex: string) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
  };

  const text = (x: number, y: number, value: string, size = 10, font = 'F1', fill = '#102c3a') => {
    lines.push(`BT ${color(fill)} rg /${font} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`);
  };

  const line = (x1: number, y1: number, x2: number, y2: number, stroke = '#e3eef0') => {
    lines.push(`${color(stroke)} RG 1 w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  const rect = (x: number, y: number, width: number, height: number, fill = '#e6f5f5') => {
    lines.push(`${color(fill)} rg ${x} ${y} ${width} ${height} re f`);
  };

  rect(0, 765, 595, 77, '#e6f5f5');
  text(54, 800, 'MedWay', 24, 'F2', '#0b8f91');
  text(54, 782, 'Invoice Receipt', 12, 'F2', '#102c3a');
  text(395, 802, details.invoiceId, 12, 'F2', '#102c3a');
  text(395, 784, 'Transaction Completed', 10, 'F2', '#16a34a');

  text(54, 728, 'Booking Details', 14, 'F2');
  line(54, 716, 541, 716);

  const detailRows: [string, string][] = [
    ['Booking ID', details.bookingId],
    ['Payment ID', details.paymentId],
    ['Booking Date', details.bookingDate],
    ['Patient Name', details.patientName],
    ['Doctor Name', details.doctorName],
    ['Hospital Name', details.hospitalName],
    ['Department', details.department],
    ['Appointment Date', details.appointmentDate],
    ['Appointment Time', details.appointmentSlot],
  ];

  let y = 692;
  detailRows.forEach(([label, value]) => {
    text(64, y, label, 10, 'F2', '#5a7785');
    text(220, y, value, 10, 'F1', '#102c3a');
    y -= 24;
  });

  text(54, y - 8, 'Bill Summary', 14, 'F2');
  line(54, y - 20, 541, y - 20);
  y -= 48;

  const billRows: [string, string][] = [
    ['Doctor consultation fee', money(details.consultationFee)],
    ['Convenience fee', money(details.convenienceFee)],
    ['GST on convenience fee (18%)', money(details.gst)],
  ];

  billRows.forEach(([label, value]) => {
    text(64, y, label, 10, 'F1', '#5a7785');
    text(445, y, value, 10, 'F1', '#102c3a');
    y -= 24;
  });

  line(54, y - 2, 541, y - 2);
  text(64, y - 28, 'Total Paid', 13, 'F2');
  text(434, y - 28, money(details.total), 13, 'F2', '#0b8f91');

  rect(54, 70, 487, 44, '#f3f9fa');
  text(72, 94, 'This is a computer generated receipt for your MedWay booking.', 9, 'F1', '#5a7785');
  text(72, 80, 'Please carry your booking ID when visiting the hospital.', 9, 'F1', '#5a7785');
  text(54, 38, 'MedWay Healthcare Navigation', 9, 'F2', '#0b8f91');
  text(385, 38, 'support@medway.example', 9, 'F1', '#5a7785');

  const stream = lines.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return pdf;
}

export function downloadReceiptPdf(appt: Appointment, hospitalName: string) {
  const details = buildReceiptDetails(appt, hospitalName);
  const blob = new Blob([makePdf(details)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${details.invoiceId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

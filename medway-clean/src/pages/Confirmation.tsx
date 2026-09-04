import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Calendar, Clock, Stethoscope, Building2, IndianRupee, Radio, Phone, Navigation, Home, ListChecks, ReceiptText } from 'lucide-react';
import { useHospital, fetchAppointment, type Appointment } from '@/lib/data';
import { buildReceiptDetails, downloadReceiptPdf } from '@/lib/receipt';

export default function Confirmation() {
  const { appointmentId } = useParams();
  const nav = useNavigate();
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const { hospital: h } = useHospital(appt?.hospital_id);
  const receipt = appt && h ? buildReceiptDetails(appt, h.name) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!appointmentId) return;
    let active = true;
    (async () => {
      try {
        const a = await fetchAppointment(appointmentId);
        if (active) setAppt(a);
      } catch { if (active) setAppt(null); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [appointmentId]);

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => nav('/')} className="flex w-fit items-center gap-1 text-sm font-semibold text-[#5a7785] hover:text-[#0b8f91]">
        <ArrowLeft size={16} /> Home
      </button>
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-green-50 text-green-500"><CheckCircle2 size={36} /></span>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">Appointment Confirmed</h1>
        <p className="text-sm text-[#5a7785]">Booking ID: <span className="font-bold text-[#0b8f91]">{appointmentId}</span></p>
      </div>

      {loading ? (
        <div className="card h-40 animate-pulse bg-[#f3f9fa]" />
      ) : appt && h ? (
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold text-[#102c3a]">Appointment Summary</h2>
          <div className="flex flex-col gap-3 text-sm">
            <Row icon={Building2} label="Hospital" value={h.name} />
            <Row icon={Stethoscope} label="Doctor" value={appt.doctor_name} />
            <Row icon={Calendar} label="Date" value={appt.date} />
            <Row icon={Clock} label="Time slot" value={appt.slot} />
            <Row icon={IndianRupee} label="Consultation fee" value={`₹${appt.fee}`} />
            <div className="flex items-center justify-between border-t border-[#eef3f4] pt-3">
              <span className="text-[#5a7785]">Status</span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">{appt.status}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="card p-6 text-center text-sm text-[#5a7785]">Appointment not found.</p>
      )}

      {appt && h && receipt && (
        <div className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#102c3a]">Invoice Receipt</h2>
              <p className="mt-1 text-xs text-[#5a7785]">{receipt.invoiceId} &middot; Payment {receipt.transactionStatus}</p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-600">Paid</span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Row icon={ReceiptText} label="Payment ID" value={receipt.paymentId} />
            <Row icon={Calendar} label="Booking date" value={receipt.bookingDate} />
            <Row icon={IndianRupee} label="Consultation fee" value={`Rs ${receipt.consultationFee}`} />
            <Row icon={IndianRupee} label="Convenience fee" value={`Rs ${receipt.convenienceFee}`} />
            <Row icon={IndianRupee} label="GST" value={`Rs ${receipt.gst}`} />
            <div className="flex items-center justify-between border-t border-[#eef3f4] pt-3">
              <span className="font-bold text-[#102c3a]">Total paid</span>
              <span className="font-extrabold text-[#0b8f91]">Rs {receipt.total}</span>
            </div>
          </div>
          <button onClick={() => downloadReceiptPdf(appt, h.name)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b8f91] py-3 text-sm font-bold text-white">
            <ReceiptText size={16} /> Download Invoice PDF
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button onClick={() => nav(`/queue/${appointmentId}`)} className="flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f91] py-3.5 text-sm font-bold text-white">
          <Radio size={16} /> Track Live Queue
        </button>
        <button onClick={() => nav('/my-bookings')} className="flex items-center justify-center gap-2 rounded-2xl border border-[#dcebed] py-3.5 text-sm font-bold text-[#5a7785] hover:border-[#0b8f91] hover:text-[#0b8f91]">
          <ListChecks size={16} /> My Bookings
        </button>
        <button onClick={() => nav('/')} className="flex items-center justify-center gap-2 rounded-2xl border border-[#dcebed] py-3.5 text-sm font-bold text-[#5a7785] hover:border-[#0b8f91] hover:text-[#0b8f91]">
          <Home size={16} /> Back to Home
        </button>
      </div>

      {appt && h && (
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:102" className="flex items-center justify-center gap-2 rounded-2xl border border-[#dcebed] py-3 text-sm font-bold text-[#0b8f91]">
            <Phone size={15} /> Call Hospital
          </a>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-[#dcebed] py-3 text-sm font-bold text-[#0b8f91]">
            <Navigation size={15} /> Directions
          </a>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[#5a7785]"><Icon size={15} /> {label}</span>
      <span className="font-semibold text-[#102c3a]">{value}</span>
    </div>
  );
}

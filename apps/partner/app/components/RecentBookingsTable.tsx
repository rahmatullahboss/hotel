"use client";

interface Booking {
  id: string;
  guestName: string;
  guestPhone: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  roomType?: string;
}

interface RecentBookingsTableProps {
  bookings: Booking[];
}

// Helper to format date without external library
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  CHECKED_IN: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  CHECKED_OUT: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  DEFAULT: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
};

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  const getStatusStyle = (status: string) => {
    return statusStyles[status] || statusStyles.DEFAULT!;
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ");
  };

  if (bookings.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}>
          📅
        </div>
        <h3 style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>No recent bookings</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', maxWidth: '250px' }}>New bookings will appear here instantly when they occur.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Guest</th>
            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Room</th>
            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '14px' }}>
          {bookings.map((booking) => {
             const statusStyle = getStatusStyle(booking.status);
             const statusLabel = getStatusLabel(booking.status);
             
             return (
              <tr key={booking.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '9999px', 
                      background: 'linear-gradient(to bottom right, #6366f1, #9333ea)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)'
                    }}>
                      {booking.guestName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#334155' }}>
                        {booking.guestName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                        {formatDate(booking.checkIn)}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ color: '#475569', fontWeight: '600' }}>{booking.roomNumber}</div>
                   <div style={{ fontSize: '12px', color: '#94a3b8' }}>{booking.roomType || 'Standard'}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    border: `1px solid ${statusStyle.border}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {statusLabel}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#334155' }}>৳{booking.totalAmount.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                     {booking.paymentStatus === 'PAID' ? (
                       <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                         Paid ✓
                       </span>
                     ) : (
                       <span style={{ color: '#f59e0b' }}>Pending</span>
                     )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

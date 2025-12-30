"use client";

import Link from "next/link";

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

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CHECKED_IN": return "bg-green-100 text-green-800 border-green-200";
      case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CHECKED_OUT": return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ");
  };

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-dashed border-gray-200">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-3">
          📅
        </div>
        <p className="text-gray-500 text-sm font-medium">No recent bookings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100/50">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Guest</th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Room</th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Dates</th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Amount</th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <tr 
                key={booking.id} 
                className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none"
              >
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {booking.guestName}
                    </span>
                    <span className="text-xs text-gray-500">{booking.guestPhone}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {booking.roomNumber}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col text-sm text-gray-600">
                    <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                    <span className="text-xs text-gray-400">({nights} nights)</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-gray-900">৳{booking.totalAmount.toLocaleString()}</span>
                    <span className={`text-[10px] uppercase font-bold ${booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <Link 
                    href={`/bookings/${booking.id}`}
                    className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    Details →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

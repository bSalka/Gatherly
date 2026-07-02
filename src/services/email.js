import emailJS from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  const months = [
    "januara",
    "februara",
    "marta",
    "aprila",
    "maja",
    "juna",
    "jula",
    "augusta",
    "septembra",
    "oktobra",
    "novembra",
    "decembra",
  ];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.
u ${date.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" })}`;
}

export async function sendBookingConfirmation({ booking, tickets }) {
  console.log("sending to:", booking.userEmail);
  console.log("booking data:", booking);
  const templateParams = {
    user_name: booking.userName || booking.userEmail,
    user_email: booking.userEmail,

    event_title: booking.eventTitle,
    event_date: formatDate(booking.eventStart),
    event_city: booking.eventAddress ? ` · ${booking.eventAddress}` : "",

    tier_name: booking.tierName,
    quantity: booking.quantity,
    total_price:
      booking.totalPrice !== undefined
        ? booking.totalPrice === 0
          ? "Besplatno"
          : `${booking.totalPrice} KM`
        : booking.total !== undefined
          ? `${booking.total} KM`
          : "—",
    booking_id: booking.id,
    ticket_count: tickets.length,
    tickets_ids: tickets
      .map((t) => `Karta ${t.ticketNumber} : ${t.id}`)
      .join("\n"),
  };
  await emailJS.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}

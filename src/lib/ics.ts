import type { Booking, Provider, Service } from './types';
const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
export function downloadIcs(b: Booking, p: Provider, svc: Service) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//meuPet//PT-BR', 'BEGIN:VEVENT', `UID:${b.id}@meupet`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(new Date(b.start))}`, `DTEND:${f(new Date(b.end))}`, `SUMMARY:${svc.name} – ${p.name}`, `LOCATION:${p.address}\\, ${p.area}`,
    `DESCRIPTION:Agendado pelo meuPet. Contato: ${p.phone}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'meupet-agendamento.ics';
  a.click();
}

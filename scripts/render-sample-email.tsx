import * as React from 'react';
import { render } from '@react-email/render';

async function main() {
  const { TicketEmail } = await import('../src/app/api/_emails/ticket-email');
  const html = await render(
    React.createElement(TicketEmail, {
      userName: 'Test User',
      eventName: 'Concierto de Prueba',
      eventDate: '10 de Octubre, 20:00',
      eventLocation: 'Sala Principal',
      orderNumber: 'CORTESÍA-12345678',
      ticketTypeName: 'VIP',
      tickets: [{ qrCode: 'TESTCODE', qrCodeImage: 'data:image/png;base64,AAA' }],
      freeUntil: '10 Oct 2025 19:00',
      afterPrice: '$12.000'
    })
  );

  console.log(html);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

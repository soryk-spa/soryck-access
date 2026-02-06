import * as React from 'react';
import { render } from '@react-email/render';

// Skip temporalmente hasta configurar ESM en Jest
test.skip('ticket email renders freeUntil and afterPrice', async () => {
  const { TicketEmail } = await import('../app/api/_emails/ticket-email');

  const html = await render(
    React.createElement(TicketEmail, {
      userName: 'Prueba',
      eventName: 'Evento Test',
      eventDate: '1 Ene 2026',
      eventLocation: 'Lugar Test',
      orderNumber: 'CORTESÍA-TEST',
      ticketTypeName: 'General',
      tickets: [{ qrCode: 'CODE', qrCodeImage: 'data:image/png;base64,AAA' }],
      freeUntil: '1 Ene 2026 18:00',
      afterPrice: '$5.000'
    })
  );

  expect(html).toMatch(/Gratis hasta/);
  expect(html).toMatch(/\$5.000/);
});

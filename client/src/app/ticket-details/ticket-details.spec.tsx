import { render } from '@testing-library/react';

import TicketDetails from './ticket-details';

describe('TicketDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TicketDetails />);
    expect(baseElement).toBeTruthy();
  });
});

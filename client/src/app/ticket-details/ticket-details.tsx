import { useParams } from 'react-router-dom';
import styles from './ticket-details.module.css';
import { Container } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';

/* eslint-disable-next-line */
export interface TicketDetailsProps {}

const fetchSingleTicket = async (id: string) => {
  const res = await fetch(`/api/tickets/${id}`).then();
  const ticket = await res.json();
  let assigneeName = '(No assign)';
  if (ticket?.assigneeId) {
    const resUser = await fetch(`/api/users/${ticket.assigneeId}`).then();
    const user = await resUser.json();
    assigneeName = user.name;
  }
  return {
    ticket: ticket,
    assigneeName: assigneeName,
  };
};

export function TicketDetails(props: TicketDetailsProps) {
  const { id } = useParams();

  const { data: ticketData, isLoading: isLoadingTicket } = useQuery(
    ['get_ticket_key', id],
    () => fetchSingleTicket(id || ''),
    {
      enabled: !!id,
    }
  );

  return (
    <Container className={styles['ticket-detail']}>
      {isLoadingTicket ? (
        <p>Loading ticket...</p>
      ) : (
        <div>
          <h2 className="mb-4">Ticket {ticketData?.ticket.id} Details</h2>
          <div className="mb-2">
            <strong>Description: </strong>
            <span>{ticketData?.ticket.description}</span>
          </div>
          <div className="mb-2">
            <strong>Assign to: </strong>
            <span>{ticketData?.assigneeName}</span>
          </div>
          <div className="mb-2">
            <strong>Is completed? </strong>
            <span>{ticketData?.ticket.completed ? 'Yes' : 'No'}</span>
          </div>
        </div>
      )}
    </Container>
  );
}

export default TicketDetails;

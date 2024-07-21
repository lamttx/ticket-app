import { useParams } from 'react-router-dom';
import styles from './ticket-details.module.css';
import { Container } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';

/* eslint-disable-next-line */
export interface TicketDetailsProps {}

const fetchSingleTicket = async (id: string) => {
  const res = await fetch(`/api/tickets/${id}`).then();
  return await res.json();
};

export function TicketDetails(props: TicketDetailsProps) {
  const { id } = useParams();

  const { data: ticket, isLoading: isLoadingTicket } = useQuery(
    ['get_ticket_key', id],
    () => fetchSingleTicket(id || ''),
    {
      enabled: !!id,
    }
  );

  return (
    <Container className={styles['ticket-detail']}>
      {isLoadingTicket && <p>Loading ticket...</p>}

      <h2 className="mb-4">Ticket {ticket?.id} Details</h2>
      <div className="mb-2">
        <strong>Description: </strong>
        <span>{ticket?.description}</span>
      </div>
      <div className="mb-2">
        <strong>Is completed? </strong>
        <span>{ticket?.completed ? 'Yes' : 'No'}</span>
      </div>
    </Container>
  );
}

export default TicketDetails;

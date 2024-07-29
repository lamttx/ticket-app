import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { ModalAssignTicket, TicketItem } from '../components';
import styles from './ticket-details.module.css';

/* eslint-disable-next-line */
export interface TicketDetailsProps {}

const GET_TICKET_KEY = 'get_ticket_key';

const fetchSingleTicket = async (id: string) => {
  const res = await fetch(`/api/tickets/${id}`).then();
  return await res.json();
};

export function TicketDetails(props: TicketDetailsProps) {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [showModalAssignTicket, setShowModalAssignTicket] = useState(false);

  const { data: ticketData, isLoading: isLoadingTicket } = useQuery(
    [GET_TICKET_KEY, id],
    () => fetchSingleTicket(id || ''),
    {
      enabled: !!id,
    }
  );

  const handleSelectedTicket = () => {
    return handleShowModalAssignTicket();
  };

  const handleShowModalAssignTicket = () => {
    return setShowModalAssignTicket(true);
  };

  const handleCloseModalAssignTicket = () => {
    return setShowModalAssignTicket(false);
  };

  const handleUpdateTicketSuccess = () => {
    queryClient.invalidateQueries([GET_TICKET_KEY]);
  };

  return (
    <>
      <Container className={styles['ticket-detail']}>
        {isLoadingTicket ? (
          <p>Loading ticket...</p>
        ) : (
          <TicketItem
            ticket={ticketData}
            onSelectedTicket={handleSelectedTicket}
            onUpdateCompleteSuccess={handleUpdateTicketSuccess}
          />
        )}
      </Container>

      <ModalAssignTicket
        isOpen={showModalAssignTicket}
        ticket={ticketData}
        onClose={handleCloseModalAssignTicket}
        onSuccess={handleUpdateTicketSuccess}
      />
    </>
  );
}

export default TicketDetails;

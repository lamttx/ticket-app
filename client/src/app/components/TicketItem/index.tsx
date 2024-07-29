import { Ticket } from '@acme/shared-models';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card } from 'react-bootstrap';
import { MdEdit } from 'react-icons/md';

interface ITicketItemProps {
  ticket: Ticket;
  onSelectedTicket: (ticket: Ticket) => void;
  onRedirectToList?: (id: number) => void;
  onUpdateCompleteSuccess: () => void;
}

const fetchSingleUser = async (id: number) => {
  const res = await fetch(`/api/users/${id}`).then();
  return await res.json();
};

const updateCompleteTicket = async (id: number, complete: boolean) => {
  const res = await fetch(`/api/tickets/${id}/complete`, {
    method: complete ? 'PUT' : 'DELETE',
  }).then();
  return res;
};

export function TicketItem({
  ticket,
  onSelectedTicket,
  onRedirectToList,
  onUpdateCompleteSuccess,
}: ITicketItemProps) {
  const handleSelectedTicket = (ticketValues: Ticket) => {
    return onSelectedTicket(ticketValues);
  };

  const { data: userData, isLoading: isLoadingSingleUser } = useQuery(
    ['get_user_key', ticket.assigneeId],
    () => fetchSingleUser(ticket.assigneeId || 0),
    {
      enabled: !!ticket.assigneeId,
    }
  );

  const {
    mutate: handleUpdateCompleteTicket,
    isLoading: isUpdateCompleteTicketLoading,
  } = useMutation(
    (data: { id: number; complete: boolean }) =>
      updateCompleteTicket(data.id, data.complete),
    {
      onSuccess: () => onUpdateCompleteSuccess(),
      onError: () => console.log('Error'),
    }
  );

  const handleUpdateCompletion = (id: number, complete: boolean) =>
    handleUpdateCompleteTicket({ id: id, complete: complete });

  const handleRedirectToDetailPage = (id: number) => {
    if (onRedirectToList) return onRedirectToList(id);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Text>
          <strong>Description: </strong>
          <span>
            {ticket.description || `(No description for ticket: ${ticket.id})`}
          </span>
        </Card.Text>
        <Card.Text>
          <strong>Assigned to: </strong>{' '}
          {ticket?.assigneeId
            ? isLoadingSingleUser
              ? 'Loading...'
              : userData?.name || 'undefined'
            : 'No assign'}
          <MdEdit
            role="button"
            className="ms-2 mb-1"
            onClick={() => handleSelectedTicket(ticket)}
          />
        </Card.Text>
        <Card.Text>
          <strong>Is completed?</strong> {ticket.completed ? 'Yes' : 'No'}
        </Card.Text>
        {onRedirectToList && (
          <Button onClick={() => handleRedirectToDetailPage(ticket.id)}>
            View
          </Button>
        )}
        <Button
          variant={ticket.completed ? 'success' : 'secondary'}
          className={onRedirectToList && 'ms-2'}
          onClick={() => handleUpdateCompletion(ticket.id, !ticket.completed)}
          disabled={isUpdateCompleteTicketLoading}
        >
          {ticket.completed ? 'Mark as incomplete' : 'Mark as complete'}
        </Button>
      </Card.Body>
    </Card>
  );
}

import { Ticket, User } from '@acme/shared-models';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

interface IModalAssignProps {
  isOpen: boolean;
  ticket?: Ticket;
  onClose: () => void;
  onSuccess?: () => void;
}

const GET_LIST_USERS_KEY = 'get_list_users_key';

const fetchUsers = async () => {
  const res = await fetch('/api/users').then();
  return await res.json();
};

const updateAssigneeTicket = async (id: number, assigneeId: number) => {
  if (assigneeId > 0) {
    return await fetch(`/api/tickets/${id}/assign/${assigneeId}`, {
      method: 'PUT',
    }).then();
  }
  return await fetch(`/api/tickets/${id}/unassign`, {
    method: 'PUT',
  }).then();
};

export function ModalAssignTicket({
  isOpen,
  ticket,
  onClose,
  onSuccess,
}: IModalAssignProps) {
  const {
    register: registerAssignTicket,
    setValue: setValueAssignTicket,
    handleSubmit: handleSubmitAssignTicket,
  } = useForm<{ userId: number }>();

  const { data: users, isLoading: isLoadingUsers } = useQuery(
    [GET_LIST_USERS_KEY],
    fetchUsers
  );

  useEffect(() => {
    if (isOpen) {
      setValueAssignTicket('userId', ticket?.assigneeId || 0);
    }
  }, [isOpen, setValueAssignTicket, ticket]);

  const {
    mutate: handleAssignUserToTicket,
    isLoading: isAssignUserToTicketLoading,
  } = useMutation(
    (data: { id: number; assigneeId: number }) =>
      updateAssigneeTicket(data.id, data.assigneeId),
    {
      onSuccess: () => {
        return handleCloseModalAssignTicket();
      },
      onError: () => console.log('Error'),
    }
  );

  const onSubmitAssignTicket = (formValues: { userId: number }) => {
    if (!ticket?.id) return;
    return handleAssignUserToTicket({
      id: ticket.id,
      assigneeId: formValues.userId,
    });
  };

  const handleCloseModalAssignTicket = () => {
    if (onSuccess) onSuccess();
    return onClose();
  };

  return (
    <Modal show={isOpen} onHide={handleCloseModalAssignTicket}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Ticket</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitAssignTicket(onSubmitAssignTicket)}>
        <Modal.Body>
          <Form.Group controlId="assignedTo">
            <Form.Label>Assign to</Form.Label>

            <Form.Control
              as="select"
              {...registerAssignTicket('userId')}
              aria-label="Assign to"
            >
              {isLoadingUsers ? (
                <option key={0} value={0}>
                  {'Loading...'}
                </option>
              ) : (
                <>
                  <option key={0} value={0}>
                    {'(Unassign)'}
                  </option>
                  {(users || []).map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </>
              )}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModalAssignTicket}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isAssignUserToTicketLoading}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

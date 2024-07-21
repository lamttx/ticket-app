import { Ticket, User } from '@acme/shared-models';
import styles from './tickets.module.css';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
} from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BsPlusCircle } from 'react-icons/bs';
import { MdEdit } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TCreateTicketForm = {
  description: string;
};

const GET_LIST_TICKETS_KEY = 'get_list_tickets_key';
const GET_LIST_USERS_KEY = 'get_list_users_key';

const fetchTickets = async () => {
  const res = await fetch('/api/tickets').then();
  return await res.json();
};

const fetchUsers = async () => {
  const res = await fetch('/api/users').then();
  return await res.json();
};

const createTicket = async (data: TCreateTicketForm) => {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then();
  return await res.json();
};

const updateCompleteTicket = async (id: number, complete: boolean) => {
  const res = await fetch(`/api/tickets/${id}/complete`, {
    method: complete ? 'PUT' : 'DELETE',
  }).then();
  return res;
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

export function Tickets() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<boolean | undefined>(undefined);

  const [showModalCreateTicket, setShowModalCreateTicket] = useState(false);
  const [showModalAssignTicket, setShowModalAssignTicket] = useState(false);

  const selectedTicketRef = useRef<Ticket | undefined>(undefined);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateTicketForm>();

  const {
    register: registerAssignTicket,
    setValue: setValueAssignTicket,
    handleSubmit: handleSubmitAssignTicket,
  } = useForm<{ userId: number }>();

  const { data: tickets, isLoading: isLoadingTickets } = useQuery(
    [GET_LIST_TICKETS_KEY],
    fetchTickets
  );

  const { data: users, isLoading: isLoadingUsers } = useQuery(
    [GET_LIST_USERS_KEY],
    fetchUsers
  );

  const listTickets = useMemo(() => {
    if (filter === undefined) return tickets;
    return (tickets || []).filter((x: Ticket) => x.completed === filter);
  }, [tickets, filter]);

  const { mutate: handleCreateTicket, isLoading: isCreateTicketLoading } =
    useMutation((data: TCreateTicketForm) => createTicket(data), {
      onSuccess: () => {
        queryClient.invalidateQueries([GET_LIST_TICKETS_KEY]);
        setShowModalCreateTicket(false);
      },
      onError: () => console.log('Error'),
    });

  const onSubmit = (formValues: TCreateTicketForm) =>
    handleCreateTicket(formValues);

  const {
    mutate: handleUpdateCompleteTicket,
    isLoading: isUpdateCompleteTicketLoading,
  } = useMutation(
    (data: { id: number; complete: boolean }) =>
      updateCompleteTicket(data.id, data.complete),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GET_LIST_TICKETS_KEY]);
      },
      onError: () => console.log('Error'),
    }
  );

  const handleUpdateCompletion = (id: number, complete: boolean) =>
    handleUpdateCompleteTicket({ id: id, complete: complete });

  const handleRedirectToDetailPage = (id: number) => navigate(`/${id}`);

  const handleModalCreateTicket = () => {
    reset();
    return setShowModalCreateTicket(true);
  };

  const handleSelectedTicket = (ticketValues: Ticket) => {
    selectedTicketRef.current = ticketValues;
    return handleShowModalAssignTicket();
  };

  const handleShowModalAssignTicket = () => {
    if (!selectedTicketRef.current) return;
    setValueAssignTicket('userId', selectedTicketRef.current.assigneeId || 0);
    return setShowModalAssignTicket(true);
  };

  const {
    mutate: handleAssignUserToTicket,
    isLoading: isAssignUserToTicketLoading,
  } = useMutation(
    (data: { id: number; assigneeId: number }) =>
      updateAssigneeTicket(data.id, data.assigneeId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GET_LIST_TICKETS_KEY]);
        return handleCloseModalAssignTicket();
      },
      onError: () => console.log('Error'),
    }
  );

  const onSubmitAssignTicket = (formValues: { userId: number }) => {
    if (!selectedTicketRef.current?.id) return;
    return handleAssignUserToTicket({
      id: selectedTicketRef.current.id,
      assigneeId: formValues.userId,
    });
  };

  const handleCloseModalAssignTicket = () => {
    selectedTicketRef.current = undefined;
    return setShowModalAssignTicket(false);
  };

  return (
    <>
      <Container className={styles['tickets']}>
        <Row className="mb-4">
          <Col className="d-flex flex-row align-items-center">
            <h2 className="mb-0 me-3 text-uppercase">Tickets</h2>
            <BsPlusCircle role="button" onClick={handleModalCreateTicket} />
          </Col>
          <Col className="d-flex flex-row justify-content-end align-items-center">
            <p className="mb-0 me-2">Filter: </p>
            <Button
              variant={filter === undefined ? 'warning' : 'secondary'}
              className="me-2"
              onClick={() => setFilter(undefined)}
            >
              All
            </Button>
            <Button
              variant={filter ? 'warning' : 'secondary'}
              className="me-2"
              onClick={() => setFilter(true)}
            >
              Completed
            </Button>
            <Button
              variant={filter === false ? 'warning' : 'secondary'}
              onClick={() => setFilter(false)}
            >
              Incompleted
            </Button>
          </Col>
        </Row>

        <Row className="d-flex gap-3 justify-content-between align-items-stretch">
          {(isLoadingTickets || isLoadingUsers) && <p>Loading tickets...</p>}
          {(listTickets || []).map((ticket: Ticket) => (
            <Col key={ticket.id} lg>
              <Card>
                <Card.Body>
                  <Card.Text>
                    <strong>Description: </strong>
                    <span>
                      {ticket.description ||
                        `(No description for ticket: ${ticket.id})`}
                    </span>
                  </Card.Text>
                  <Card.Text>
                    <strong>Assigned to: </strong>{' '}
                    {users.find((x: User) => x.id === ticket.assigneeId)
                      ?.name || 'No assign'}
                    <MdEdit
                      role="button"
                      className="ms-2 mb-1"
                      onClick={() => handleSelectedTicket(ticket)}
                    />
                  </Card.Text>
                  <Card.Text>
                    <strong>Is completed?</strong>{' '}
                    {ticket.completed ? 'Yes' : 'No'}
                  </Card.Text>
                  <Button onClick={() => handleRedirectToDetailPage(ticket.id)}>
                    View
                  </Button>
                  <Button
                    variant={ticket.completed ? 'success' : 'secondary'}
                    className="ms-2"
                    onClick={() =>
                      handleUpdateCompletion(ticket.id, !ticket.completed)
                    }
                    disabled={isUpdateCompleteTicketLoading}
                  >
                    {ticket.completed
                      ? 'Mark as incomplete'
                      : 'Mark as complete'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal
        show={showModalCreateTicket}
        onHide={() => setShowModalCreateTicket(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Ticket</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Label>Description</Form.Label>
            <Form.Control
              aria-label="Description"
              {...register('description', { required: true })}
            ></Form.Control>
            {errors.description && <span>This field is required</span>}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModalCreateTicket(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreateTicketLoading}>
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalAssignTicket} onHide={handleCloseModalAssignTicket}>
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
    </>
  );
}

export default Tickets;

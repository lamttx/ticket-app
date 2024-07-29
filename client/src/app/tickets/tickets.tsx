import { Ticket } from '@acme/shared-models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsPlusCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ModalAssignTicket, TicketItem } from '../components';
import styles from './tickets.module.css';

type TCreateTicketForm = {
  description: string;
};

const GET_LIST_TICKETS_KEY = 'get_list_tickets_key';

const fetchTickets = async () => {
  const res = await fetch('/api/tickets').then();
  return await res.json();
};

const createTicket = async (data: TCreateTicketForm) => {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then();
  return await res.json();
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

  const { data: tickets, isLoading: isLoadingTickets } = useQuery(
    [GET_LIST_TICKETS_KEY],
    fetchTickets
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

  const handleModalCreateTicket = () => {
    reset();
    return setShowModalCreateTicket(true);
  };

  const handleRedirectToDetailPage = (id: number) => navigate(`/${id}`);

  const handleShowModalAssignTicket = () => {
    if (!selectedTicketRef.current) return;
    return setShowModalAssignTicket(true);
  };

  const handleSelectedTicket = (ticket: Ticket) => {
    selectedTicketRef.current = ticket;
    return handleShowModalAssignTicket();
  };

  const handleCloseModalAssignTicket = () => {
    selectedTicketRef.current = undefined;
    return setShowModalAssignTicket(false);
  };

  const handleUpdateTicketSuccess = () => {
    queryClient.invalidateQueries([GET_LIST_TICKETS_KEY]);
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
          {isLoadingTickets && <p>Loading tickets...</p>}
          {(listTickets || []).map((ticket: Ticket) => (
            <Col key={ticket.id} lg>
              <TicketItem
                ticket={ticket}
                onSelectedTicket={handleSelectedTicket}
                onRedirectToList={handleRedirectToDetailPage}
                onUpdateCompleteSuccess={handleUpdateTicketSuccess}
              />
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

      <ModalAssignTicket
        isOpen={showModalAssignTicket}
        ticket={selectedTicketRef.current}
        onClose={handleCloseModalAssignTicket}
        onSuccess={handleUpdateTicketSuccess}
      />
    </>
  );
}

export default Tickets;

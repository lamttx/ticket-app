import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './app.module.css';
import Tickets from './tickets/tickets';
import TicketDetails from './ticket-details/ticket-details';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar, Container } from 'react-bootstrap';

const queryClient = new QueryClient();

const App = () => {
  // const [tickets, setTickets] = useState([] as Ticket[]);
  // const [users, setUsers] = useState([] as User[]);

  // Very basic way to synchronize state with server.
  // Feel free to use any state/fetch library you want (e.g. react-query, xstate, redux, etc.).
  // useEffect(() => {
  //   async function fetchTickets() {
  //     const data = await fetch('/api/tickets').then();
  //     setTickets(await data.json());
  //   }

  //   async function fetchUsers() {
  //     const data = await fetch('/api/users').then();
  //     setUsers(await data.json());
  //   }

  //   fetchTickets();
  //   fetchUsers();
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles['app']}>
        <Navbar className="bg-secondary mb-4">
          <Container>
            <h1 className="mb-0 py-2 text-uppercase">Ticketing App</h1>
          </Container>
        </Navbar>
        <Routes>
          <Route path="/" element={<Tickets />} />
          {/* Hint: Try `npx nx g component TicketDetails --project=client --no-export` to generate this component  */}
          <Route path="/:id" element={<TicketDetails />} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
};

export default App;

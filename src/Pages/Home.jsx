import { useLocation } from 'react-router-dom';
import BusinessView from './BusinessView';

function Home() {
  const location = useLocation();

  // Si estamos en "/" (index), mostrar todos los negocios
  // Si estamos en "/home", mostrar solo comida
  const isIndex = location.pathname === '/';
  const type = isIndex ? null : 'comida';

  return <BusinessView type={type} />;
}

export default Home;
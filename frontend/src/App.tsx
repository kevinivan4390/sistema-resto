import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ListaMesas } from './components/ListaMesas';
import { Menu } from './components/Menu';
import { Cocina } from './components/Cocina';
import { Mozo } from './components/Mozo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vista del dueño: donde ves los QR de las 5 mesas */}
        <Route path="/admin" element={<ListaMesas />} />
        
        {/* Vista del cliente: donde aparecen los ravioles, cocas, etc. */}
        {/* Se accede como: http://localhost:5173/menu?mesa=1 */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/cocina" element={<Cocina />} />
        <Route path="/mozo" element={<Mozo />} />
        {/* Por defecto te mando a admin para que no veas la pantalla vacía */}
        <Route path="/" element={<ListaMesas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
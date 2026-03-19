import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface OpcionItem {
  id: number;
  nombre: string;
  precio_adicional: number;
}

interface Producto {
  id: number;
  nombre: string;
  precio_actual: number;
  categorias?: { nombre: string };
  opciones: {
    grupo: {
      nombre: string;
      items: OpcionItem[];
    };
  }[];
}

interface ItemPedido {
  productoId: number;
  nombre: string;
  cantidad: number;
  precio: number;
  notas?: string;
  opcionesSeleccionadas?: { id: number; nombre: string; precio: number }[]; 
}

export const Menu = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidoActual, setPedidoActual] = useState<ItemPedido[]>([]);
  const [mostrarDetalleCarrito, setMostrarDetalleCarrito] = useState(false);
  const [searchParams] = useSearchParams();
  
  const [productoParaPersonalizar, setProductoParaPersonalizar] = useState<Producto | null>(null);
  const [notaTemporal, setNotaTemporal] = useState("");
  const [opcionElegida, setOpcionElegida] = useState<OpcionItem | null>(null);

  const mesaId = searchParams.get('mesa');

  useEffect(() => {
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando menú:", err));
  }, []);

  const productosAgrupados = productos.reduce((acc: any, prod) => {
    const catNombre = prod.categorias?.nombre || "Varios";
    if (!acc[catNombre]) acc[catNombre] = [];
    acc[catNombre].push(prod);
    return acc;
  }, {});

  const abrirModal = (prod: Producto) => {
    setProductoParaPersonalizar(prod);
    setNotaTemporal("");
    setOpcionElegida(null);
  };

  const confirmarPersonalizacionYAgregar = () => {
    if (!productoParaPersonalizar) return;
    const precioBase = Number(productoParaPersonalizar.precio_actual);
    const adicional = opcionElegida ? Number(opcionElegida.precio_adicional) : 0;
    const precioFinal = precioBase + adicional;

    setPedidoActual(prev => [...prev, { 
      productoId: productoParaPersonalizar.id, 
      nombre: productoParaPersonalizar.nombre, 
      cantidad: 1, 
      precio: precioFinal,
      notas: notaTemporal,
      opcionesSeleccionadas: opcionElegida ? [{ 
        id: opcionElegida.id, 
        nombre: opcionElegida.nombre, 
        precio: adicional 
      }] : [] 
    }]);
    setProductoParaPersonalizar(null);
  };

  const eliminarItem = (index: number) => {
    const nuevoPedido = [...pedidoActual];
    nuevoPedido.splice(index, 1);
    setPedidoActual(nuevoPedido);
    if (nuevoPedido.length === 0) setMostrarDetalleCarrito(false);
  };

  const enviarPedidoAlBackend = async () => {
    if (pedidoActual.length === 0) return;
    try {
      const response = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesaId: mesaId,
          items: pedidoActual,
          total: totalPedido
        })
      });

      if (response.ok) {
        alert("¡Pedido enviado a cocina!");
        setPedidoActual([]);
        setMostrarDetalleCarrito(false);
      }
    } catch (error) {
      console.error("Error enviando pedido:", error);
      alert("No se pudo enviar el pedido.");
    }
  };

  const totalPedido = pedidoActual.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', paddingBottom: '140px', color: 'white', fontFamily: 'sans-serif' }}>
      
      <header style={{ padding: '20px', borderBottom: '1px solid #374151', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#f97316', margin: 0 }}>RESTO-APP</h1>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>📍 MESA SELECCIONADA: {mesaId || '---'}</p>
      </header>

      <main style={{ padding: '0 15px' }}>
        {Object.keys(productosAgrupados).map(categoria => (
          <section key={categoria} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f97316', marginBottom: '15px', textTransform: 'uppercase', borderLeft: '4px solid #f97316', paddingLeft: '10px' }}>
              {categoria}
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {productosAgrupados[categoria].map((prod: Producto) => (
                <div key={prod.id} style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #374151' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{prod.nombre}</h3>
                    <p style={{ margin: '5px 0 0', color: '#fb923c', fontWeight: '800', fontSize: '20px' }}>${Number(prod.precio_actual)}</p>
                  </div>
                  <button 
                    onClick={() => abrirModal(prod)}
                    style={{ backgroundColor: '#ea580c', color: 'white', width: '50px', height: '50px', borderRadius: '15px', border: 'none', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {productoParaPersonalizar && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ backgroundColor: '#1f2937', width: '100%', padding: '30px', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#f97316', textTransform: 'uppercase' }}>{productoParaPersonalizar.nombre}</h2>
            <div style={{ margin: '25px 0' }}>
              {productoParaPersonalizar.opciones?.map((opc, idx) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>{opc.grupo.nombre}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    {opc.grupo.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setOpcionElegida(item)}
                        style={{ padding: '12px', borderRadius: '12px', border: opcionElegida?.id === item.id ? '2px solid #f97316' : '2px solid #374151', backgroundColor: opcionElegida?.id === item.id ? 'rgba(249,115,22,0.1)' : '#111827', color: opcionElegida?.id === item.id ? '#f97316' : '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}
                      >
                        {item.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' }}>Notas especiales</label>
              <textarea 
                style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '15px', padding: '15px', color: 'white', marginTop: '10px', boxSizing: 'border-box' }}
                placeholder="Ej: Sin sal..."
                rows={2}
                value={notaTemporal}
                onChange={(e) => setNotaTemporal(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setProductoParaPersonalizar(null)} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#374151', color: 'white', fontWeight: 'bold' }}>CERRAR</button>
              <button onClick={confirmarPersonalizacionYAgregar} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#ea580c', color: 'white', fontWeight: 'bold' }}>AGREGAR</button>
            </div>
          </div>
        </div>
      )}

      {pedidoActual.length > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 90 }}>
          {mostrarDetalleCarrito && (
            <div style={{ backgroundColor: '#1f2937', borderRadius: '25px', padding: '20px', marginBottom: '10px', border: '2px solid #f97316', maxHeight: '40vh', overflowY: 'auto', boxShadow: '0 -10px 20px rgba(0,0,0,0.5)' }}>
              <h4 style={{ margin: '0 0 15px', color: '#f97316', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Tu Pedido</h4>
              {pedidoActual.map((item, index) => (
                <div key={index} style={{ borderBottom: '1px solid #374151', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{item.nombre}</p>
                    {item.opcionesSeleccionadas?.map(o => (
                      <p key={o.id} style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>↳ {o.nombre}</p>
                    ))}
                    {item.notas && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#fb923c', fontStyle: 'italic' }}>"{item.notas}"</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <p style={{ margin: 0, fontWeight: '900', fontSize: '14px' }}>${item.precio}</p>
                    <button 
                      onClick={() => eliminarItem(index)}
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', width: '25px', height: '25px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ backgroundColor: '#f97316', padding: '18px 25px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div onClick={() => setMostrarDetalleCarrito(!mostrarDetalleCarrito)} style={{ cursor: 'pointer', flex: 1 }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#7c2d12', textTransform: 'uppercase' }}>
                {pedidoActual.length} items {mostrarDetalleCarrito ? '▲' : '▼'}
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>${totalPedido}</p>
            </div>
            <button 
              onClick={enviarPedidoAlBackend}
              style={{ backgroundColor: 'white', color: '#f97316', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px', cursor: 'pointer' }}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
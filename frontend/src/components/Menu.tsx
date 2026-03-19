import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Interfaces actualizadas para coincidir con tu nuevo include de Prisma
interface OpcionItem {
  id: number;
  nombre: string;
  precio_adicional: number;
}

interface Producto {
  id: number;
  nombre: string;
  precio_actual: number;
  // Estructura según tu schema: producto -> opciones -> grupo -> items
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
  const [searchParams] = useSearchParams();
  
  // Estados para el Modal
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

  const abrirModal = (prod: Producto) => {
    setProductoParaPersonalizar(prod);
    setNotaTemporal("");
    setOpcionElegida(null); // Reseteamos la salsa/marca elegida
  };

  const confirmarPersonalizacionYAgregar = () => {
    if (!productoParaPersonalizar) return;

    // Calculamos el precio sumando la opción si existe
    const precioBase = Number(productoParaPersonalizar.precio_actual);
    const adicional = opcionElegida ? Number(opcionElegida.precio_adicional) : 0;
    const precioFinal = precioBase + adicional;

    setPedidoActual(prev => {
      // Agregamos como un item nuevo para que no se pisen las notas/opciones de diferentes platos iguales
      return [...prev, { 
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
      }];
    });

    setProductoParaPersonalizar(null);
  };

  const totalPedido = pedidoActual.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const confirmarPedido = async () => {
    if (pedidoActual.length === 0) return;

    try {
      const res = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesaId: mesaId,
          items: pedidoActual,
          total: totalPedido
        })
      });

      if (res.ok) {
        alert(`¡Pedido de la Mesa ${mesaId} enviado con éxito!`);
        setPedidoActual([]); 
      } else {
        alert("Hubo un problema al enviar el pedido.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-orange-500 uppercase tracking-tighter italic">Resto-App</h1>
        <p className="text-gray-400 mt-1">📍 Mesa Seleccionada: {mesaId || 'Ninguna'}</p>
      </header>
      
      <div className="space-y-4">
        {productos.map((prod) => (
          <div key={prod.id} className="flex justify-between items-center bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">
            <div>
              <h3 className="text-lg font-bold uppercase">{prod.nombre}</h3>
              <p className="text-orange-400 font-mono text-xl font-bold">${Number(prod.precio_actual)}</p>
            </div>
            <button 
              onClick={() => abrirModal(prod)}
              className="bg-orange-600 hover:bg-orange-500 active:scale-90 w-12 h-12 rounded-xl font-bold text-2xl flex items-center justify-center transition-all shadow-lg"
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE PERSONALIZACIÓN */}
      {productoParaPersonalizar && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-gray-800 w-full max-w-md rounded-[2rem] p-8 border border-gray-700 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black text-orange-500 uppercase mb-1">
              {productoParaPersonalizar.nombre}
            </h2>
            <p className="text-gray-400 mb-6 text-sm">Personalizá tu pedido:</p>

            {/* RENDERIZADO DE GRUPOS DE OPCIONES (Salsas, Marcas, etc.) */}
            {productoParaPersonalizar.opciones?.map((opc, idx) => (
              <div key={idx} className="mb-6">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                  {opc.grupo.nombre}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {opc.grupo.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setOpcionElegida(item)}
                      className={`p-3 rounded-xl text-xs font-bold uppercase transition-all border-2 ${
                        opcionElegida?.id === item.id 
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {item.nombre}
                      {Number(item.precio_adicional) > 0 && (
                        <span className="block text-[9px] text-orange-300 mt-1">
                          +${Number(item.precio_adicional)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-8">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                Notas especiales
              </label>
              <textarea 
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
                placeholder="Ej: Sin sal, bien cocido..."
                rows={2}
                value={notaTemporal}
                onChange={(e) => setNotaTemporal(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setProductoParaPersonalizar(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 rounded-2xl font-bold uppercase text-xs transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarPersonalizacionYAgregar}
                className="flex-1 bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl font-bold uppercase text-xs transition-colors shadow-lg shadow-orange-900/20"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de pedido acumulado */}
      {pedidoActual.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 bg-orange-600 p-5 rounded-[2rem] flex justify-between items-center shadow-2xl shadow-black ring-4 ring-gray-900">
          <div>
            <span className="text-[10px] uppercase font-black bg-orange-800 px-2 py-0.5 rounded-full">Mesa {mesaId}</span>
            <p className="font-black text-2xl mt-1">${totalPedido.toLocaleString('es-AR')}</p>
          </div>
          <button 
            onClick={confirmarPedido}
            className="bg-white text-orange-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-tighter active:scale-95 transition-transform"
          >
            Confirmar Pedido
          </button>
        </div>
      )}
    </div>
  );
};
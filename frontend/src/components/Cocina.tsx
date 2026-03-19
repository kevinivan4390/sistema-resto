import { useEffect, useState } from 'react';

export const Cocina = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);

  const cargarPedidos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/pedidos');
      const data = await res.json();
      
      const soloComida = data.filter((p: any) => 
        p.estado === 'PENDIENTE_STOCK' || p.estado === 'EN_PREPARACION'
      ).map((p: any) => ({
        ...p,
        lineas_pedido: p.lineas_pedido.filter((l: any) => 
          l.productos?.categorias?.destino === 'COCINA'
        )
      })).filter((p: any) => p.lineas_pedido.length > 0);

      setPedidos(soloComida);
    } catch (error) { console.error("Error en cocina:", error); }
  };

  useEffect(() => {
    cargarPedidos();
    const int = setInterval(cargarPedidos, 5000);
    return () => clearInterval(int);
  }, []);

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevoEstado })
    });
    cargarPedidos();
  };

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white font-sans">
      <h1 className="text-4xl font-black mb-10 text-orange-500 italic uppercase border-b-4 border-orange-500 inline-block">Comandas Cocina</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos.map(p => (
          <div key={p.id} className={`rounded-xl overflow-hidden shadow-2xl border-t-[15px] transition-all duration-500 ${p.estado === 'PENDIENTE_STOCK' ? 'bg-red-50 border-red-600' : 'bg-orange-50 border-orange-500'}`}>
            <div className="p-4 border-b-2 border-dashed border-gray-300 flex justify-between items-center bg-white/50">
              <h2 className="text-5xl font-black italic text-black">M{p.sesiones_mesa?.mesas?.numero}</h2>
            </div>
            <div className="p-6 text-black flex-grow">
              {p.lineas_pedido.map((l: any) => (
                <div key={l.id} className="mb-4 border-l-4 border-orange-500 pl-3">
                  <p className="text-2xl font-black uppercase leading-tight">{l.cantidad}x {l.productos.nombre}</p>
                  {l.opciones?.map((o: any, i: number) => (
                    <p key={i} className="text-sm font-bold text-gray-500 italic">+ {o.nombre_historico}</p>
                  ))}
                  {l.notas_especiales && (
                    <p className="mt-2 bg-yellow-200 p-2 text-[10px] font-bold border border-yellow-400">"{l.notas_especiales}"</p>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4">
              <button 
                onClick={() => cambiarEstado(p.id, p.estado === 'PENDIENTE_STOCK' ? 'EN_PREPARACION' : 'LISTO')}
                className={`w-full py-5 rounded-xl font-black uppercase text-xl shadow-lg transition-all ${p.estado === 'PENDIENTE_STOCK' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}
              >
                {p.estado === 'PENDIENTE_STOCK' ? 'Confirmar Stock' : 'Listo para Servir'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
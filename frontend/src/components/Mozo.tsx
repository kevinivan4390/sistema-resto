import { useEffect, useState } from 'react';

export const Mozo = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);

  const cargarPedidos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/pedidos');
      const data = await res.json();
      setPedidos(data.filter((p: any) => p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO'));
    } catch (error) { console.error("Error en mozo:", error); }
  };

  useEffect(() => {
    cargarPedidos();
    const int = setInterval(cargarPedidos, 5000);
    return () => clearInterval(int);
  }, []);

  const entregar = async (id: number) => {
    await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevoEstado: 'ENTREGADO' })
    });
    cargarPedidos();
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white font-sans">
      <h1 className="text-4xl font-black mb-10 text-blue-400 uppercase italic border-b-4 border-blue-400 inline-block">Control de Salón</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pedidos.map(p => (
          <div key={p.id} className={`rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${p.estado === 'LISTO' ? 'bg-green-50 ring-8 ring-green-500 animate-pulse' : 'bg-white'}`}>
            <div className={`p-6 text-center ${p.estado === 'LISTO' ? 'bg-green-500' : 'bg-red-600'} text-white`}>
              <p className="font-black text-6xl italic leading-none">M{p.sesiones_mesa?.mesas?.numero}</p>
              <p className="text-xs font-bold uppercase mt-2 tracking-widest">{p.estado === 'LISTO' ? '¡LISTO!' : 'EN MARCHA'}</p>
            </div>
            <div className="p-6 text-black">
              <div className="space-y-4 mb-6">
                {p.lineas_pedido.map((l: any) => (
                  <div key={l.id} className="border-b border-gray-100 pb-2">
                    <p className="font-black text-lg uppercase leading-tight">{l.cantidad}x {l.productos.nombre}</p>
                    {l.opciones?.map((o: any, idx: number) => (
                      <p key={idx} className="text-[10px] font-bold text-blue-600 uppercase italic">↳ {o.nombre_historico}</p>
                    ))}
                    
                    {/* Bloque agregado para mostrar las notas (ej: "con hielo") */}
                    {l.notas_especiales && (
                      <p className="mt-2 bg-yellow-200 p-1 px-2 text-[10px] font-black border-l-4 border-yellow-500 uppercase italic">
                        "{l.notas_especiales}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => entregar(p.id)}
                disabled={p.estado !== 'LISTO'}
                className={`w-full py-4 rounded-2xl font-black uppercase transition-all shadow-lg ${p.estado === 'LISTO' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}
              >
                {p.estado === 'LISTO' ? 'Entregar Pedido' : 'En Cocina...'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
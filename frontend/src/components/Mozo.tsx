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
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '30px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* HEADER ESTILO RESTO-APP */}
      <header style={{ borderBottom: '1px solid #374151', marginBottom: '40px', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#f97316', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Control de Salón
          </h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px', fontWeight: 'bold' }}>📋 SEGUIMIENTO DE MESAS</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', padding: '10px 20px', borderRadius: '15px', border: '1px solid #374151' }}>
          <span style={{ color: '#f97316', fontWeight: '900' }}>{pedidos.length}</span> MESAS ACTIVAS
        </div>
      </header>

      {/* GRID DE MESAS */}
      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {pedidos.map(p => (
          <div key={p.id} style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '25px', 
            border: p.estado === 'LISTO' ? '3px solid #22c55e' : '2px solid #374151', 
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            animation: p.estado === 'LISTO' ? 'pulse 2s infinite' : 'none'
          }}>
            
            {/* INDICADOR DE ESTADO SUPERIOR */}
            <div style={{ 
              padding: '25px', 
              backgroundColor: p.estado === 'LISTO' ? '#22c55e' : '#374151',
              textAlign: 'center',
              color: 'white'
            }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>
                {p.estado === 'LISTO' ? '¡PEDIDO LISTO!' : 'EN PREPARACIÓN'}
              </p>
              <h2 style={{ fontSize: '50px', fontWeight: '900', margin: '5px 0 0', fontStyle: 'italic', lineHeight: 1 }}>
                M{p.sesiones_mesa?.mesas?.numero}
              </h2>
            </div>

            {/* DETALLE DEL PEDIDO */}
            <div style={{ padding: '20px', flexGrow: 1 }}>
              <div style={{ marginBottom: '15px' }}>
                {p.lineas_pedido.map((l: any) => (
                  <div key={l.id} style={{ marginBottom: '12px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: p.estado === 'LISTO' ? '#22c55e' : '#f97316', fontWeight: '900' }}>{l.cantidad}x</span>
                      <span style={{ fontWeight: '700', fontSize: '14px', textTransform: 'uppercase' }}>{l.productos.nombre}</span>
                    </div>
                    
                    {l.opciones?.map((o: any, idx: number) => (
                      <p key={idx} style={{ margin: '2px 0 0 25px', fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                        ↳ {o.nombre_historico}
                      </p>
                    ))}
                    
                    {l.notas_especiales && (
                      <div style={{ backgroundColor: 'rgba(249,115,22,0.1)', padding: '5px 10px', marginTop: '6px', marginLeft: '20px', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                        <p style={{ margin: 0, fontSize: '11px', color: '#fb923c', fontWeight: 'bold' }}>
                          📝 "{l.notas_especiales}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN ENTREGAR */}
            <div style={{ padding: '15px' }}>
              <button 
                onClick={() => entregar(p.id)}
                disabled={p.estado !== 'LISTO'}
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  borderRadius: '15px', 
                  border: 'none', 
                  backgroundColor: p.estado === 'LISTO' ? '#22c55e' : '#111827', 
                  color: p.estado === 'LISTO' ? 'white' : '#4b5563', 
                  fontWeight: '900', 
                  fontSize: '14px', 
                  textTransform: 'uppercase',
                  cursor: p.estado === 'LISTO' ? 'pointer' : 'not-allowed',
                  transition: '0.3s'
                }}
              >
                {p.estado === 'LISTO' ? 'Confirmar Entrega ✓' : 'Esperando Cocina...'}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* ESTILO PARA LA ANIMACIÓN PULSE */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
          100% { transform: scale(1); }
        }
      `}</style>

      {pedidos.length === 0 && (
        <div style={{ textAlign: 'center', gridColumn: '1 / -1', marginTop: '100px' }}>
          <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: 'bold' }}>No hay pedidos activos en el salón.</p>
        </div>
      )}
    </div>
  );
};
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
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '30px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* HEADER ESTILO RESTO-APP */}
      <header style={{ borderBottom: '1px solid #374151', marginBottom: '40px', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#f97316', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Comandas Cocina
          </h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px', fontWeight: 'bold' }}>📍 PEDIDOS EN PREPARACIÓN</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', padding: '10px 20px', borderRadius: '15px', border: '1px solid #374151' }}>
          <span style={{ color: '#f97316', fontWeight: '900' }}>{pedidos.length}</span> PEDIDOS ACTIVOS
        </div>
      </header>

      {/* GRID DE TARJETAS */}
      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {pedidos.map(p => (
          <div key={p.id} style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '25px', 
            border: p.estado === 'PENDIENTE_STOCK' ? '2px solid #ef4444' : '2px solid #374151', 
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
          }}>
            
            {/* CABECERA DE LA TARJETA (NÚMERO DE MESA) */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: p.estado === 'PENDIENTE_STOCK' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.05)',
              borderBottom: '1px dashed #374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#f97316', margin: 0, fontStyle: 'italic' }}>
                MESA {p.sesiones_mesa?.mesas?.numero}
              </h2>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>
                ID: #{p.id}
              </span>
            </div>

            {/* CUERPO CON LOS ITEMS */}
            <div style={{ padding: '25px', flexGrow: 1 }}>
              {p.lineas_pedido.map((l: any) => (
                <div key={l.id} style={{ marginBottom: '20px', borderLeft: '4px solid #f97316', paddingLeft: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: '#f97316', fontWeight: '900', fontSize: '20px' }}>{l.cantidad}x</span>
                    <span style={{ fontWeight: '800', fontSize: '18px', textTransform: 'uppercase' }}>{l.productos.nombre}</span>
                  </div>
                  
                  {/* OPCIONES/ADICIONALES */}
                  {l.opciones?.map((o: any, i: number) => (
                    <p key={i} style={{ margin: '4px 0 0 35px', fontSize: '13px', color: '#9ca3af', fontWeight: '600' }}>
                      + {o.nombre_historico}
                    </p>
                  ))}

                  {/* NOTAS ESPECIALES RESALTADAS (MISMO COLOR QUE EL MENÚ) */}
                  {l.notas_especiales && (
                    <div style={{ 
                      backgroundColor: 'rgba(249,115,22,0.1)', 
                      border: '1px solid rgba(249,115,22,0.3)', 
                      padding: '8px 12px', 
                      marginTop: '10px', 
                      marginLeft: '10px', 
                      borderRadius: '10px' 
                    }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#fb923c', fontWeight: 'bold' }}>
                        📝 "{l.notas_especiales}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <div style={{ padding: '20px' }}>
              <button 
                onClick={() => cambiarEstado(p.id, p.estado === 'PENDIENTE_STOCK' ? 'EN_PREPARACION' : 'LISTO')}
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  borderRadius: '18px', 
                  border: 'none', 
                  backgroundColor: p.estado === 'PENDIENTE_STOCK' ? '#ef4444' : '#ea580c', 
                  color: 'white', 
                  fontWeight: '900', 
                  fontSize: '16px', 
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: '0.3s'
                }}
              >
                {p.estado === 'PENDIENTE_STOCK' ? 'Confirmar Stock' : 'Listo para Servir ✓'}
              </button>
            </div>
          </div>
        ))}

        {pedidos.length === 0 && (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', marginTop: '100px' }}>
            <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: 'bold' }}>
              No hay comandas pendientes. ¡Buen trabajo! ☕
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
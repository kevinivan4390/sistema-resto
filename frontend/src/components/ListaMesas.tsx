import { useEffect, useState } from 'react';

interface Mesa {
  id: number;
  numero: number;
  estado: string;
  qrCode?: string;
}

export const ListaMesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);

  const fetchMesas = async () => {
    try {
      // Ojo: acá usamos el puerto 3000 que es donde corre tu BACKEND
      const res = await fetch('http://localhost:3000/api/mesas');
      const data = await res.json();
      setMesas(data);
    } catch (error) {
      console.error("Error cargando mesas:", error);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Nuestras Mesas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mesas.map((mesa) => (
          <div key={mesa.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Mesa N° {mesa.numero}</h2>
            {mesa.qrCode ? (
              <div className="bg-white p-2 rounded-lg">
                <img src={mesa.qrCode} alt="QR" className="w-40 h-40" />
              </div>
            ) : (
              <p className="text-gray-500">Generando QR...</p>
            )}
            <p className="mt-4 text-sm text-gray-400">Estado: {mesa.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
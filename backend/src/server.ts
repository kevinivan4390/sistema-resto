import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import categoriaRoutes from './routes/categoria.routes';
import productoRoutes from './routes/producto.routes';
import mesaRoutes from './routes/mesa.routes';
import pedidoRoutes from './routes/pedido.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/mesas', mesaRoutes);
app.use('/api/pedidos', pedidoRoutes);

const PORT = process.env.PORT || 3000;

// Ruta de prueba para ver si los datos llegan
app.get('/test-db', async (req, res) => {
  try {
    // Cambiá "usuario" por el nombre de alguna de tus tablas en minúscula si falla
    const datos = await prisma.usuarios.findMany();
    res.json({ 
      status: "Conectado", 
      message: "Traje los datos de la DB", 
      data: datos 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error conectando a la DB", detalle: error });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
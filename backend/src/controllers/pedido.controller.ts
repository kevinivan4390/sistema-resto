import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createPedido = async (req: Request, res: Response) => {
    try {
        const { mesaId, items, total } = req.body;
        const nuevoPedido = await prisma.pedidos.create({
            data: {
                sesion_id: Number(mesaId), 
                estado: 'PENDIENTE_STOCK' as any,
                metodo_pago: 'CUENTA_ABIERTA_EFECTIVO' as any,
                pagado: false,
                subtotal: total as any,
                lineas_pedido: {
                    create: items.map((item: any) => ({
                        producto_id: item.productoId,
                        cantidad: item.cantidad,
                        precio_unitario_historico: item.precio,
                        notas_especiales: item.notas || null,
                        opciones: {
                            create: item.opcionesSeleccionadas?.map((opt: any) => ({
                                opcion_id: opt.id,
                                nombre_historico: opt.nombre,
                                precio_historico: opt.precio
                            }))
                        }
                    }))
                }
            }
        });
        res.status(201).json(nuevoPedido);
    } catch (error) {
        console.error("ERROR AL CREAR PEDIDO:", error);
        res.status(500).json({ error: "No se pudo guardar el pedido" });
    }
};

export const actualizarEstadoPedido = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    try {
        const pedidoActualizado = await prisma.pedidos.update({
            where: { id: Number(id) },
            data: { estado: nuevoEstado as any }
        });
        res.json(pedidoActualizado);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el pedido" });
    }
};

export const getPedidos = async (req: Request, res: Response) => {
    try {
        const pedidos = await prisma.pedidos.findMany({
            include: {
                sesiones_mesa: { include: { mesas: true } },
                lineas_pedido: {
                    include: { 
                        productos: { include: { categorias: true } },
                        opciones: true 
                    }
                }
            },
            orderBy: { creacion: 'desc' }
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
};
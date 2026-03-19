import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getProductos = async (req: Request, res: Response) => {
    try {
        const productos = await prisma.productos.findMany({
            include: { 
                categorias: true,
                opciones: {
                    include: {
                        grupo: {
                            include: {
                                items: true // Trae los nombres de los sabores, puntos de cocción, etc.
                            }
                        }
                    }
                }
            } 
        });
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
};

export const createProducto = async (req: Request, res: Response) => {
    try {
        const { categoria_id, nombre, precio_actual, stock_disponible, activo } = req.body;
        
        const nuevo = await prisma.productos.create({
            data: {
                categoria_id: Number(categoria_id),
                nombre: String(nombre),
                precio_actual: Number(precio_actual),
                stock_disponible: Number(stock_disponible) || 0,
                activo: activo !== undefined ? Boolean(activo) : true
            }
        });
        
        res.status(201).json(nuevo);
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: "Error al crear producto", detalle: error });
    }
};
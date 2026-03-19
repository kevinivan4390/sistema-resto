import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getCategorias = async (req: Request, res: Response) => {
    try {
        const categorias = await prisma.categorias.findMany();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener categorías" });
    }
};

export const createCategoria = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;
        const nueva = await prisma.categorias.create({
            data: { nombre }
        });
        res.status(201).json(nueva);
    } catch (error) {
        res.status(500).json({ error: "Error al crear categoría" });
    }
};
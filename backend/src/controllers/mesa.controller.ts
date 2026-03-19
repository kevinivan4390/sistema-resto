import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import QRCode from 'qrcode';

export const getMesas = async (req: Request, res: Response) => {
    try {
        const mesas = await prisma.mesas.findMany();
        
        // Mapeamos las mesas para agregarles el QR en base64
        const mesasConQR = await Promise.all(mesas.map(async (mesa) => {
            // Esta es la URL que va a leer el celular. 
            // Por ahora usamos localhost, después la cambiamos por tu IP.
            const url = `http://localhost:5173/menu?mesa=${mesa.id}`;
            const qrBase64 = await QRCode.toDataURL(url);
            
            return {
                ...mesa,
                qrCode: qrBase64
            };
        }));

        res.json(mesasConQR);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener mesas con QR" });
    }
};

export const createMesa = async (req: Request, res: Response) => {
    try {
        const { numero } = req.body;
        
        const nueva = await prisma.mesas.create({
            data: {
                numero: Number(numero), // Usamos 'numero' como está en tu DB
                estado: 'libre' as any  // El 'as any' para que TS no moleste con el Enum
            }
        });
        
        res.status(201).json(nueva);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear mesa" });
    }
};
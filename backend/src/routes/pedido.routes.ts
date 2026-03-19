import { Router } from 'express';
import { createPedido } from '../controllers/pedido.controller';
import { actualizarEstadoPedido } from '../controllers/pedido.controller';
import { getPedidos } from '../controllers/pedido.controller';

const router = Router();
router.post('/', createPedido);
router.patch('/:id/estado', actualizarEstadoPedido);
router.get('/', getPedidos);

export default router;

import { Router } from 'express';
import { getProductos, createProducto } from '../controllers/producto.controller';

const router = Router();

router.get('/', getProductos);
router.post('/', createProducto);

export default router;
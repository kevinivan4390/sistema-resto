import { Router } from 'express';
import { getCategorias, createCategoria } from '../controllers/categoria.controller';

const router = Router();

router.get('/', getCategorias);
router.post('/', createCategoria);

export default router;
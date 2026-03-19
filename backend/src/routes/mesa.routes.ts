import { Router } from 'express';
import { getMesas, createMesa } from '../controllers/mesa.controller';

const router = Router();

router.get('/', getMesas);
router.post('/', createMesa);

export default router;
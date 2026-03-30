import { Router } from 'express'
import { getStats } from '../controllers/stats.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()
router.use(authMiddleware)
router.get('/', getStats)

export default router
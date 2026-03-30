import { Router } from 'express'
import { getPublicProjects } from '../controllers/public.controller'

const router = Router()

router.get('/projects', getPublicProjects)

export default router
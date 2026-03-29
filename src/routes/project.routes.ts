import { Router } from 'express'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  togglePublish,
  deleteProject
} from '../controllers/project.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', getProjects)
router.get('/:id', getProjectById)
router.post('/', createProject)
router.patch('/:id', updateProject)
router.patch('/:id/publish', togglePublish)
router.delete('/:id', deleteProject)

export default router
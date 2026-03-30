import { Router } from 'express'
import {
  getTasks,
  createTask,
  updateTask,
  reorderTask,
  deleteTask
} from '../controllers/task.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.patch('/:id/reorder', reorderTask)
router.delete('/:id', deleteTask)

export default router
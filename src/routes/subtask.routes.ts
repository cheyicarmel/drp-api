import { Router } from 'express'
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  reorderSubtask,
  deleteSubtask
} from '../controllers/subtask.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

router.get('/', getSubtasks)
router.post('/', createSubtask)
router.patch('/:id', updateSubtask)
router.patch('/:id/reorder', reorderSubtask)
router.delete('/:id', deleteSubtask)

export default router
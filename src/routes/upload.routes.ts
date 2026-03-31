import { Router } from 'express'
import { uploadImage } from '../controllers/upload.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { upload } from '../lib/multer'

const router = Router()

router.use(authMiddleware)
router.post('/', upload.single('image'), uploadImage)

export default router
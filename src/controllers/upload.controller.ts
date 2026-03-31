import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import cloudinary from '../lib/cloudinary'

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Aucun fichier fourni', code: 'NO_FILE' })
      return
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'drp/projects',
          transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto', fetch_format: 'webp' }]
        },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result)
        }
      ).end(req.file!.buffer)
    })

    res.json({ url: result.secure_url })
  } catch {
    res.status(500).json({ error: 'Erreur lors de l\'upload', code: 'UPLOAD_ERROR' })
  }
}
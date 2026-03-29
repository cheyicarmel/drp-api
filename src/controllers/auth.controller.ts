import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Tous les champs sont requis', code: 'MISSING_FIELDS' })
    return
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      res.status(409).json({ error: 'Cet email est déjà utilisé', code: 'EMAIL_TAKEN' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis', code: 'MISSING_FIELDS' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      res.status(401).json({ error: 'Identifiants incorrects', code: 'INVALID_CREDENTIALS' })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Identifiants incorrects', code: 'INVALID_CREDENTIALS' })
      return
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

export const me = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    })

    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable', code: 'USER_NOT_FOUND' })
      return
    }

    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/project.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DrP API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
import { Router } from 'express'
import { analyzeProjectController } from '../controllers/analysisController.js'

const router = Router()

router.post('/', analyzeProjectController)

export default router

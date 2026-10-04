import { Router } from 'express'
import { accountRouter } from './account.js'
import { adminRouter } from './admin.js'
import { authRouter } from './auth.js'
import { blogRouter } from './blog.js'
import { storefrontRouter } from './storefront.js'

/** Mangrove Collection REST API, mounted at `/v1`. */
export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/account', accountRouter)
apiRouter.use('/admin', adminRouter)
apiRouter.use(blogRouter)
apiRouter.use(storefrontRouter)

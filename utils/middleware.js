const User = require('../models/user')
const jwt = require('jsonwebtoken')

const errorHandler = (error, request, response, next) => {
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'token missing or invalid '})
    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.replace('Bearer ', '')
    }
    else request.token = null

    next()
}

const userExtractor = async (request, response, next) => {
    if (request.token) {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)

        if (!decodedToken.id) {
            request.user = null
            response.status(401).json({ error: 'token invalid' })
        } else request.user = await User.findById(decodedToken.id)
    }

    next()
}

module.exports = {
    errorHandler,
    tokenExtractor,
    userExtractor
}
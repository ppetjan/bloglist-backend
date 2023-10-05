const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    let users = await User.find({}).populate('blogs')
    users = users.map(user => {
      if (user.blogs.length === 0) {
        user.blogs = undefined
        return user
      }
      user.blogs.map(blog => {
          blog.user = undefined
          return blog
      })
      return user
    })
    response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs')
  user.blogs = user.blogs.map(blog => {
    blog.user = undefined
    return blog  
  })
  response.json(user)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter
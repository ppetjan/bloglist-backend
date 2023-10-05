const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    let blogs = await Blog.find({}).populate('user')
    blogs = blogs.map(blog => {
        blog.user.blogs = undefined
        return blog    
    })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user')
    blog.user.blogs = undefined
    response.json(blog)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const user = request.user

    const blog = new Blog({
        author: body.author,
        title: body.title,
        url: body.url,
        likes: body.likes,
        user: user.id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (blog === null) response.status(404).json({ error: 'blog id invalid' })

    if (blog.user.toString() === user.id) {
        await Blog.findByIdAndRemove(request.params.id)
    }

    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (blog === null) response.status(404).json({ error: 'blog id invalid' })
    
    const blogUpdate = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    if (blog.user.toString() === user.id) {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogUpdate, {new: true})
        response.json(updatedBlog)
    }
})

module.exports = blogsRouter
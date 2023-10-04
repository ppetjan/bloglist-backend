const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
        
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

describe('api get method tests', () => {
    test('blogs are returned as JSON', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')
        const titles = response.body.map(response => response.title)

        expect(titles).toContain('React patterns')
    })

    test('all blogs have property: "id"', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(response => {
            expect(response.id).toBeDefined()
        })
    })
})

describe('api post method tests', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'Testing',
            author: 'Tester',
            url: 'test.ing'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDB()
        const titles = blogsAtEnd.map(blog => blog.title)

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
        expect(titles).toContain('Testing')
    })

    test('if a new blog has no value for likes, set likes to 0', async () => {
        const newBlog = {
            title: 'Testing',
            author: 'Tester',
            url: 'test.ing'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)

        const blogsAtEnd = await helper.blogsInDB()
        const addedBlog = blogsAtEnd.find(response => response.title === 'Testing')

        expect(addedBlog.likes).toBe(0)
    })

    test('if a new blog object doesn\'t contain url, return status code 400', async () => {
        const newBlogNoUrl = {
            title: 'Testing',
            author: 'Tester',
        }

        await api
            .post('/api/blogs')
            .send(newBlogNoUrl)
            .expect(400)
    })

    test('if a new blog object doesn\'t contain title, return status code 400', async () => {
        const newBlogNoTitle = {
            author: 'Tester',
            url: 'test.ing'
        }

        await api
            .post('/api/blogs')
            .send(newBlogNoTitle)
            .expect(400)
    })
})

describe('api put method tests', () => {
    test('responds with the changed blog when succesful', async () => {
        const blogToUpdate = helper.initialBlogs[0]
        blogToUpdate.author = 'Updated author'
        blogToUpdate.title = 'Updated title'

        const response = await api
                            .put(`/api/blogs/${blogToUpdate.id}`)
                            .send(blogToUpdate)
        
        expect(response.body.author).toBe('Updated author')
        expect(response.body.title).toBe('Updated title')
        expect(response.body.id).toBe(blogToUpdate.id)
    })
})

describe('api delete method tests', () => {
    test('deleting a blog works', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDB()
        
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
        
        const titles = blogsAtEnd.map(blog => blog.title)
        expect(titles).not.toContain(blogToDelete.title)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
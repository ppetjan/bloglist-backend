const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.length === 0
        ? 0 
        : blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return 
    const allLikes = blogs.map(blog => blog.likes)
    const mostLikedIndex = allLikes.indexOf(Math.max(...allLikes)) 
    const mostLikedBlog = blogs[mostLikedIndex]
    return {
        title: mostLikedBlog.title,
        author: mostLikedBlog.author,
        likes: mostLikedBlog.likes
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return
    let authors = {}
    blogs.filter(blog => {
        const author = blog.author
        if (author in authors)
            authors[author] += 1
        else (authors[author] = 1)
    })

    const authorWithMostBlogs = Object.keys(authors).reduce((most, current) => (
        authors[current] < authors[most]
            ? most
            : current
    ))

    return {
        author: authorWithMostBlogs,
        blogs: authors[authorWithMostBlogs]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return
    let authors = {}
    blogs.filter(blog => {
        const author = blog.author
        if (author in authors)
            authors[author] += blog.likes
        else (authors[author] = blog.likes)
    })

    const authorWithMostLikes = Object.keys(authors).reduce((most, current) => (
        authors[current] < authors[most]
            ? most
            : current
    ))

    return {
        author: authorWithMostLikes,
        likes: authors[authorWithMostLikes]
    }
}

module.exports = {
    dummy,
    totalLikes, 
    favoriteBlog,
    mostBlogs,
    mostLikes
}
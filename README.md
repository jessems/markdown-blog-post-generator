# Markdown Blogpost Generator

## Features

Generates a markdown blog post file with front matter.

When you press CMD + SHIFT + N the extension will ask you for a blog post title and then generate a markdown file with the following front matter:

```markdown
---
title: 'Blog Post Title'
slug: 'blog-post-title'
date: '2020-01-01'
categories: ''
tags: ''
---
```

The extension saves this file as an `index.md` file in the following folder structure:

```bash
src/posts/2020-01-01-blog-post-title/index.md
```

## Extension Settings

This extension contributes the following settings:

-   `markdown-blog-post-generator.blogPostsDirectory`: Set the directory for blog posts.

## Release Notes

First release

### 1.0.0

First release

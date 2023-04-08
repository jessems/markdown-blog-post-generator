import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TextDocument } from 'vscode';

// Declare a variable to store the previous title
let previousTitle: string | null = null;
let previousDocumentState: Map<string, string>;

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "markdown-blog-post-generator" is now active!'
	);

	let disposable = vscode.commands.registerCommand(
		'markdown-blog-post-generator.createBlogPost',
		async () => {
			const blogPostName = await vscode.window.showInputBox({
				prompt: 'Enter the name of your blog post',
				placeHolder: 'My Awesome Blog Post'
			});

			if (blogPostName) {
				const sanitizedBlogPostName =
					sanitizeBlogPostName(blogPostName);
				const blogPostsDirectory = vscode.workspace
					.getConfiguration()
					.get(
						'markdown-blog-post-generator.blogPostsDirectory'
					) as string;
				const filePath = createMarkdownFile(
					blogPostName,
					sanitizedBlogPostName,
					blogPostsDirectory
				);
				if (filePath) {
					const textDocument =
						await vscode.workspace.openTextDocument(filePath);
					const textEditor = await vscode.window.showTextDocument(
						textDocument
					);

					const lastLine = textDocument.lineAt(
						textDocument.lineCount - 1
					);
					const lastCharPosition = lastLine.range.end;
					textEditor.selection = new vscode.Selection(
						lastCharPosition,
						lastCharPosition
					);
				} else {
					vscode.window.showErrorMessage(
						'Failed to create blog post file'
					);
				}
			}
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function sanitizeBlogPostName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^\w\s]/gi, '')
		.replace(/\s+/g, '-');
}

function createMarkdownFile(
	title: string,
	name: string,
	blogPostsDirectory: string
): string | null {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showErrorMessage(
			'Please open a workspace folder to create a blog post file'
		);
		return null;
	}

	const workspaceFolderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const targetDirectory = blogPostsDirectory
		? path.join(workspaceFolderPath, blogPostsDirectory)
		: workspaceFolderPath;

	if (!fs.existsSync(targetDirectory)) {
		fs.mkdirSync(targetDirectory, { recursive: true });
	}

	const currentDate = new Date();
	const datePrefix = `${currentDate.getFullYear()}-${(
		currentDate.getMonth() + 1
	)
		.toString()
		.padStart(2, '0')}-${currentDate
		.getDate()
		.toString()
		.padStart(2, '0')}`;
	const postDirectoryName = `${datePrefix}-${name}`;
	const postDirectoryPath = path.join(targetDirectory, postDirectoryName);

	if (!fs.existsSync(postDirectoryPath)) {
		fs.mkdirSync(postDirectoryPath);
	} else {
		vscode.window.showErrorMessage(
			'A directory with the same name already exists'
		);
		return null;
	}

	const dateISO = currentDate.toISOString().split('T')[0];

	const frontmatter = `---
slug: ${name}
date: "${dateISO}"
title: "${title}"
description: ""
tags: ""
published: true
category: ""
---

Your blog post here
`;

	const fileName = `index.md`;
	const filePath = path.join(postDirectoryPath, fileName);

	if (fs.existsSync(filePath)) {
		vscode.window.showErrorMessage(
			'A file with the same name already exists'
		);
		return null;
	}

	fs.writeFileSync(filePath, frontmatter);
	return filePath;
}

// Update blog post file name when title is changed

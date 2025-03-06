const express = require('express');
const multer = require('multer');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// GitHub সেটআপ
const octokit = new Octokit({
    auth: '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' // আপনার টোকেন
});

const repoOwner = 'darkbd404';
const repoName = 'darkbd404.github.io';
const folderPath = 'free_host';

// ফাইল আপলোড এন্ডপয়েন্ট
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const fullPath = `${folderPath}/${fileName}`;
        const githubUrl = `https://darkbd404.github.io/free_host/${fileName}`;

        // GitHub-এ ফাইল আপলোড
        await octokit.repos.createOrUpdateFileContents({
            owner: repoOwner,
            repo: repoName,
            path: fullPath,
            message: `Upload ${fileName} via API`,
            content: Buffer.from(fileContent).toString('base64')
        });

        // অস্থায়ী ফাইল মুছে ফেলা
        fs.unlinkSync(filePath);

        res.json({ url: githubUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// সার্ভার চালু
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

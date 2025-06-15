const { fetch } = require('@netlify/functions');  // Modern way
// Instead of: const fetch = require('node-fetch');

exports.handler = async (event) => {
    // 1. Check if it's a POST request
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // 2. Parse JSON body
    let data;
    try {
        data = JSON.parse(event.body);
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON body' })
        };
    }

    const { appName, appVersion, downloadLink } = data;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = "darksideyt762/darkside-website"; // Your repo

    try {
        // 3. Fetch current downloads.html
        const fileResponse = await fetch(
            `https://api.github.com/repos/${REPO}/contents/downloads.html`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        if (!fileResponse.ok) {
            throw new Error(`GitHub API error: ${fileResponse.statusText}`);
        }

        const fileData = await fileResponse.json();
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

        // 4. Generate new HTML entry
        const newEntry = `
<div class="update-item">
    <h3>${appName}</h3>
    <p>Version: ${appVersion}</p>
    <a href="${downloadLink}" class="download-btn">
        <i class="fas fa-download"></i> Download
    </a>
</div>`;

        // 5. Update content between markers
        const updatedContent = currentContent.replace(
            /<!-- AUTO-GENERATED CONTENT START -->[\s\S]*<!-- AUTO-GENERATED CONTENT END -->/,
            `<!-- AUTO-GENERATED CONTENT START -->\n${newEntry}\n<!-- AUTO-GENERATED CONTENT END -->`
        );

        // 6. Push changes to GitHub
        const updateResponse = await fetch(
            `https://api.github.com/repos/${REPO}/contents/downloads.html`,
            {
                method: 'PUT',
                headers: { Authorization: `token ${GITHUB_TOKEN}` },
                body: JSON.stringify({
                    message: `Added ${appName} via admin panel`,
                    content: Buffer.from(updatedContent).toString('base64'),
                    sha: fileData.sha
                })
            }
        );

        if (!updateResponse.ok) {
            throw new Error(`GitHub update failed: ${updateResponse.statusText}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

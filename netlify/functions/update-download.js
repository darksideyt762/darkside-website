const fetch = require('node-fetch');

exports.handler = async (event) => {
    // 1. Extract data from admin panel
    const { appName, appVersion, downloadLink } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = "darkside762/darkside-website"; // ← Change this!

    try {
        // 2. Fetch current downloads.html from GitHub
        const fileResponse = await fetch(
            `https://api.github.com/repos/${REPO}/contents/downloads.html`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        const fileData = await fileResponse.json();
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

        // 3. Generate new download entry
        const newEntry = `
<div class="update-item">
    <h3>${appName}</h3>
    <p>Version: ${appVersion}</p>
    <a href="${downloadLink}" class="download-btn">
        <i class="fas fa-download"></i> Download
    </a>
</div>`;

        // 4. Insert between AUTO-GENERATED markers
        const updatedContent = currentContent.replace(
            /<!-- AUTO-GENERATED CONTENT START -->[\s\S]*<!-- AUTO-GENERATED CONTENT END -->/,
            `<!-- AUTO-GENERATED CONTENT START -->\n${newEntry}\n<!-- AUTO-GENERATED CONTENT END -->`
        );

        // 5. Push changes back to GitHub
        await fetch(
            `https://api.github.com/repos/${REPO}/contents/downloads.html`,
            {
                method: 'PUT',
                headers: { Authorization: `token ${GITHUB_TOKEN}` },
                body: JSON.stringify({
                    message: `Added ${appName} via admin panel`,
                    content: Buffer.from(updatedContent).toString('base64'),
                    sha: fileData.sha  // Required to update existing files
                })
            }
        );

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

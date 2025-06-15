const { fetch } = require('@netlify/functions');

exports.handler = async (event) => {
  // 1. Validate request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Only POST requests allowed' })
    };
  }

  // 2. Parse input data
  let data;
  try {
    data = JSON.parse(event.body);
    if (!data.appName || !data.appVersion || !data.downloadLink) {
      throw new Error('Missing required fields');
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid input: ' + err.message })
    };
  }

  // 3. Prepare GitHub API request
  const { appName, appVersion, downloadLink } = data;
  const repo = "darksideyt762/darkside-website";
  const path = "downloads.html";
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    // 4. Fetch current file from GitHub
    const fileRes = await fetch(apiUrl, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    });

    if (!fileRes.ok) {
      throw new Error(`GitHub API error: ${fileRes.status}`);
    }

    const fileData = await fileRes.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');

    // 5. Insert new download entry
    const newEntry = `
<div class="update-item">
  <h3>${appName}</h3>
  <p>Version: ${appVersion}</p>
  <a href="${downloadLink}" class="download-btn">
    <i class="fas fa-download"></i> Download
  </a>
</div>`;

    const updatedContent = content.replace(
      /<!-- AUTO-GENERATED CONTENT START -->[\s\S]*<!-- AUTO-GENERATED CONTENT END -->/,
      `<!-- AUTO-GENERATED CONTENT START -->\n${newEntry}\n<!-- AUTO-GENERATED CONTENT END -->`
    );

    // 6. Push changes back to GitHub
    const updateRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
      body: JSON.stringify({
        message: `Added ${appName} via admin panel`,
        content: Buffer.from(updatedContent).toString('base64'),
        sha: fileData.sha
      })
    });

    if (!updateRes.ok) {
      throw new Error('Failed to update GitHub: ' + await updateRes.text());
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

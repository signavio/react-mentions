const ghpages = require('gh-pages')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const branchName = process.argv[2]
const dir = path.resolve(__dirname, '..', 'demo', 'dist')
const demoUrl = `https://signavio.github.io/react-mentions/${branchName}`

if (!fs.existsSync(dir)) {
  throw new Error(`${dir} does not exist. Run \`yarn build\` first.`)
}

// Synchronously execute command and return trimmed stdout as string
const exec = (command, options) =>
  execSync(command, options)
    .toString('utf8')
    .trim()

// Syncronously POST to `url` with `data` content
const curl = (url, data) =>
  exec(`curl --silent --data @- ${url}`, { input: data })

console.log(`Publishing demo/dist to ${demoUrl}...`)

ghpages.publish(
  dir,
  {
    dest: branchName,
    message: `Published demo build for \`${branchName}\` branch.`,
  },
  err => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    // post PR comment with link to demo page
    const {
      CI_PULL_REQUEST,
      GH_AUTH_TOKEN,
      CIRCLE_PROJECT_USERNAME,
      CIRCLE_PROJECT_REPONAME,
    } = process.env
    const prNumber = path.basename(CI_PULL_REQUEST)
    const commitMessage = exec(
      'git --no-pager log --pretty=format:"%s" -1'
    ).replace(/\\"/g, '\\\\"')
    const body = `Demo page for commit <code>${commitMessage}</code> has been published at:<br /><strong>https://signavio.github.io/react-mentions/${branchName}</strong>`
    curl(
      `https://${GH_AUTH_TOKEN}:x-oauth-basic@api.github.com/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/issues/${prNumber}/comments`,
      JSON.stringify({ body })
    )

    console.log(
      '\x1b[32m%s\x1b[0m',
      `✓ Demo page successfully published at ${demoUrl}`
    )
  }
)

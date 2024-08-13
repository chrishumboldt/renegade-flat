const { spawn } = require('child_process')

const package = 'Renegade Flat'

const commands = [
  `npm run test`,
  `npm run build`,
  `echo "Build complete!"`,
  `npm publish --access public`,
  `echo "Publish complete!"`,
]

console.log(`Publishing ${package} package`)
const runCommands = spawn(commands.join(' && '), { shell: true })

runCommands.stdout.on('data', data => {
  console.log(data.toString())
})

runCommands.stderr.on('data', data => {
  console.error(data.toString())
})

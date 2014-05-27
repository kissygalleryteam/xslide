{ spawn } = require 'child_process'
{ join } = require 'path'

module.exports = (path, locals, cb) ->
  process = spawn 'php', [(join __dirname, 'runner.php'), path, JSON.stringify locals]
  stdout = ''
  stderr = ''
  process.stdout.on 'data', (data) -> stdout += data
  process.stderr.on 'data', (data) -> stderr += data
  process.on 'exit', (code) -> if code isnt 0 then cb new Error stderr, code else cb null, stdout

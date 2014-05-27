## Installation
npm install php-template

## Usage

```js
var php = require('php-template');
php('/path/to/php/file.php', { local: 'environment', in: 'php' }, function(err, response) { /* ... */ });
```


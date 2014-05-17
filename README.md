# Resemble.js in PhantomJS

```js
var Resemble = require('./phantomjs-resemble');
var fs = require('fs');

var image1 = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAcEBAQFBAcFBQcKBwUHCgwJBwcJD......";
var image2 = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4TIraHR0cDovL25zLmFkb2JlLmNvbS94Y......";

new Resemble().analysis(image1, function (data) {
  console.log(data);
  this.exit();
});

new Resemble().compare(image1, image2, function (data) {
  fs.writeFileSync('demo.png', new Buffer(data.imageDataUrl.replace('data:image/png;base64,', ''), 'base64'));
  this.exit();
}, 'ignoreColors');

```

Read more in `test.js`.

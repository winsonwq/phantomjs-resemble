var phantom = require('phantom');
var PATH = require('path');

module.exports = Resemble;

function Resemble () {}

Resemble.prototype = {
  constructor: Resemble,
  analysis: function (image, cb) {
    this._preparePhantomResemble(function () {
      this._analysis(image, cb);
    });
  },
  compare: function (srcImage, destImage, cb, ignoreMethod) {
    this._preparePhantomResemble(function () {
      this._compare(srcImage, destImage, cb, ignoreMethod);
    });
  },
  exit: function () {
    this.ph && this.ph.exit();
  },
  _preparePhantomResemble: function (cb) {
    var self = this;
    if (!self.page || !self.ph) {
      phantom.create(function (ph) {
        ph.createPage(function (page) {
          self.ph = ph;
          self.page = page;

          self.page.injectJs(PATH.join(__dirname, 'Resemble.js/resemble.js'), function () {
            cb.call(self);
          });
        });
      });
    } else {
      cb.call(self);
    }
  },
  _analysis: function (image, cb) {
    var self = this, page = this.page, ph = this.ph;

    page.set('onCallback', function (data) {
      cb.call(self, data);
    });

    page.evaluate(function (img) {
      resemble(img).onComplete(function (data) {
        if (typeof window.callPhantom === 'function') {
          window.callPhantom(data);
        }
      });
    }, function() {}, image);
  },
  _compare: function (srcImage, destImage, cb, ignoreMethod) {
    var self = this, page = this.page, ph = this.ph;

    var imageDataUrl = '';
    page.set('onCallback', function(data) {
      if (data.chunk) {
        imageDataUrl += data.chunk;
      } else {
        data.imageDataUrl = imageDataUrl;
        delete data.getImageDataUrl;
        cb.call(self, data);
      }
    });

    page.evaluate(function (srcImage, destImage, ignoreMethod) {
      var diff = resemble(srcImage).compareTo(destImage);

      if (ignoreMethod) {
        diff = diff[ignoreMethod]();
      }

      diff.onComplete(function (data) {
        if (typeof window.callPhantom === 'function') {
          var dataUrl = data.getImageDataUrl();
          for (var i = 0; i < dataUrl.length; i+= 1024) {
            window.callPhantom({ chunk : dataUrl.slice(i, i + 1024) });
          }
          window.callPhantom(data);
        }
      });
    }, function () {}, srcImage, destImage, ignoreMethod);
  }
};

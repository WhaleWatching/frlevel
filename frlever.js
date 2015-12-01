/*
 * frlever
 *
 * Usage:
 * <canvas class="frlever" data-background="background.png" data-active="active.png"></canvas>
 * $(canvas_element_or_selector).frlever({background: 'background.png', active: 'active.png'})
 * 
 * by Edward Cheng
 * Under GPLv2
*/

(function (window, $) {
  "use strict";
  var frleverElementsList = [];

  class FrleverElement {
    constructor(target, background, active) {
      if(!(target && target.tagName && target.tagName.toUpperCase() == "CANVAS")) {
        console.dir(target);
        throw "Failed frleverlize an element";
      }

      var self = this;

      // Setup self variables
      this.canvas = target;
      this.context = this.canvas.getContext('2d');

      // Setup canvas
      this.canvas.addEventListener('mousemove', function (event) {
        self.isActive = true;
      });
      this.canvas.addEventListener('mouseleave', function (event) {
        self.isActive = false;
        self.preAnimationCount = 0;
      });

      // Load images
      this.background_path = background;
      this.background = new Image();
      this.background.src = this.background_path;
      this.background.attributes.loaded = false;
      this.background.addEventListener('load', function () {
        self.background.attributes.loaded = true;
      });
      this.active_path = active;
      this.active = new Image();
      this.active.src = this.active_path;
      this.active.attributes.loaded = false;
      this.active.addEventListener('load', function () {
        self.active.attributes.loaded = true;
      });

      // Self state
      this.isActive = false;
      this.preAnimationCount = 0;
    }
    update(delta) {
      // Check if element ready
      if (this.active.attributes.loaded && this.background.attributes.loaded) {
        this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height);
        if(this.isActive) {
          if (this.preAnimationCount < 12) {
            drawPieceslyAndRandomly(this.context, this.active, 3, 30);
            this.preAnimationCount++;
          } else {
            drawPieceslyAndRandomly(this.context, this.active, 3, 4);
          }
        } else {
          drawPieceslyAndRandomly(this.context, this.background, 3, 6);
        }
        if (this) {};
      }
    }
  }

  function drawPieceslyAndRandomly (context, image, piece_height, random_range) {
    var pieces_total = Math.floor(image.height / piece_height);
    for (var i = 0; i < pieces_total; i++) {
      var random_offset = Math.round(Math.random() * random_range) - random_range / 2;
      context.drawImage(
        image,
        0, i * piece_height, image.width, piece_height,
        random_offset, i * piece_height, image.width, piece_height);
    }
  }

  var timestamp_last = 0;
  var bucket_of_water = 0;
  function animationFrame (timestamp_now) {
    // Call next round
    window.requestAnimationFrame(animationFrame);
    if(timestamp_now == undefined) {
      return
    }
    // Check time stamp
    if(timestamp_last == 0) {
      timestamp_last = timestamp_now;
      return;
    }
    var delta = timestamp_now - timestamp_last;
    timestamp_last = timestamp_now;
    if(delta > 20) {
      delta = 20;
    }
    bucket_of_water += delta;
    if (bucket_of_water < 40) {
      return;
    } else {
      bucket_of_water -= 40;
    }
    // Deal with them
    frleverElementsList.forEach(function (element) {
      element.update(delta);
    });
  }
  animationFrame();

  jQuery.fn.extend({
    frlever: function (options) {
      frleverElementsList.push(new FrleverElement(this[0], options.background, options.active));
    }
  });

  $(function () {
    $('.frlever').each(function (index, origin_element) {
      var element = $(origin_element);
      element.frlever({
        background: element.data('background'),
        active: element.data('active')
      });
    });
  });
})(window, jQuery);
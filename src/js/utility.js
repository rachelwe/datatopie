// Debounce
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
      var context = this, args = arguments;
      var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
  };
};

// Utility for setting multiple attributes (NS specific for SVG)
// Borrowed and slightly modified from gomakethings.com
var setAttributesNS = function (elem, atts) {
	atts.forEach(function (attribute) {
    attribute = Object.entries(attribute)[0]
		elem.setAttributeNS(null, attribute[0], attribute[1]);
	});
};

// nice scale utility
// source :  https://stackoverflow.com/a/8855530
function calculateTicks(min, max, tickCount) {
  var span = max - min,
      step = Math.pow(10, Math.floor(Math.log(span / tickCount) / Math.LN10)),
      err = tickCount / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  var tstart = Math.ceil(min / step) * step,
      tstop = Math.floor(max / step) * step + step * .5,
      ticks = [];

  // now generate ticks
  for (i=tstart; i < tstop; i += step) {
      ticks.push(i);  
  } 
  return ticks;
}
/**
 * nice scale utility
 * @source  https://stackoverflow.com/a/8855530
 * 
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @param {number} tickCount - number of steps wished (-+ 2 steps)
 * @returns {array} array of ticks values
 * 
 * @example
 * // returns [ 0, 500, 1000, 1500, 2000 ]
 * _calculateTicks(0, 2200, 6)
 */
export function _calculateTicks(min, max, tickCount) {
  let span = max - min,
      step = Math.pow(10, Math.floor(Math.log(span / tickCount) / Math.LN10)),
      err = tickCount / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  let tstart = Math.ceil(min / step) * step,
      tstop = Math.floor(max / step) * step + step * .5,
      ticks = [];

  // now generate ticks
  for (let i = tstart; i < tstop; i += step) {
      ticks.push(i);  
  }

  return ticks;
}
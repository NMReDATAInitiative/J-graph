export function getRegionsWithSignal(
  chemShifts,
  minSpacePPMin,
  marginPPMin,
  level = 0.01,
) {
  const minSpacePPM = Math.abs(minSpacePPMin);
  const marginPPM = Math.abs(marginPPMin);
  const maxY = d3.max(chemShifts, function (d) {
    return +d.value;
  });
  const minScale = d3.min(chemShifts, function (d) {
    return +d.chemShift;
  });
  const maxScale = d3.max(chemShifts, function (d) {
    return +d.chemShift;
  });

  // Determine the maximum value in the dataset

  // Step 1: Identify regions where y > 1% of maxY and merge close fragments
  var regions = [];
  var currentRegion = null;
  var lastIn = null;
  chemShifts.forEach(function (d, i) {
    if (d.value > level * maxY) {
      if (!currentRegion) {
        // Start a new region
        currentRegion = { start: d.chemShift, end: d.chemShift };
      } else {
        // Continue the current region
        currentRegion.end = d.chemShift;
      }
      lastIn = d.chemShift;
    } else if (currentRegion) {
      // Close the current region if a gap is detected
      if (lastIn && Math.abs(d.chemShift - lastIn) < minSpacePPM) {
        // Fuse with the next fragment if the gap is smaller than 0.1
        currentRegion.end = d.chemShift;
      } else {
        // Finalize the current region and add margins
        currentRegion.start += marginPPM;
        if (currentRegion.start < minScale) currentRegion.start = minScale;
        currentRegion.end -= marginPPM;
        if (currentRegion.end > maxScale) currentRegion.end = maxScale;
        regions.push(currentRegion);
        currentRegion = null;
        lastIn = null;
      }
    }
  });

  // If there's an unfinished region, add it
  if (currentRegion) {
    currentRegion.start += marginPPM;
    if (currentRegion.start < minScale) currentRegion.start = minScale;
    currentRegion.end -= marginPPM;
    if (currentRegion.end > maxScale) currentRegion.end = maxScale;
    regions.push(currentRegion);
  }

  let newRegions = [];
  let curRegion;
  regions.forEach(function (d, i) {
    if (i != 0) {
      if (curRegion.end < d.start) {
        // fuse
        curRegion.end = d.end;

        if (i + 1 == regions.length) {
          newRegions.push(curRegion);
        }
      } else {
        newRegions.push(curRegion);
        curRegion = d;
        if (i + 1 == regions.length) {
          newRegions.push(curRegion);
        }
      }
    } else {
      curRegion = d;
    }
  });

  var totalCoveredPPM = 0.0;
  newRegions.forEach(function (currentRegion, i) {
    totalCoveredPPM += Math.abs(currentRegion.start - currentRegion.end);
  });

  // Create an Object
  const obj = {
    totalCoveredPPM: totalCoveredPPM,
    regions: newRegions,
  };

  return obj;
}

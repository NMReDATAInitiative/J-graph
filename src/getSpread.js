export function getSpread(spreadDelta, smallSpace) {

  shouldd not be used anymore... 
    // determine how to spead objects to avoid contacts
    // there muss be enough space for this function to work
    // this is obtained by setting smallSpace to a value below the width/number of items
    for (var i = 0; i < spreadDelta.length; i++) {
      const curDelta = spreadDelta[i];
      if (curDelta < smallSpace) {
        const spreadFull = (smallSpace - curDelta);
        var spreadleft = spreadFull / 2.0;
        // try shift left (1 of 3)
        for (var j = i - 1; j >= 0; j -= 1) {
          const curExtraSpace = (spreadDelta[j] - smallSpace);
          if (curExtraSpace > 0.0) {
            if (curExtraSpace > spreadleft) {
              spreadDelta[j] -= spreadleft;
              spreadDelta[i] += spreadleft;
              spreadleft = 0;
            } else {
              spreadDelta[j] -= curExtraSpace;
              spreadDelta[i] += curExtraSpace;
              spreadleft -= curExtraSpace;
            }
          }
        }
        // work left over
        var spreadRight = spreadFull - spreadleft;
        // try shift right (2 of 3)
        for (j = i + 1; j < spreadDelta.length; j += 1) {
          const curExtraSpace = (spreadDelta[j] - smallSpace);
          if (curExtraSpace > 0.0) {
            if (curExtraSpace > spreadRight) {
              spreadDelta[j] -= spreadRight;
              spreadDelta[i] += spreadRight;
              spreadRight = 0;
            } else {
              spreadDelta[j] -= curExtraSpace;
              spreadDelta[i] += curExtraSpace;
              spreadRight -= curExtraSpace;
            }
          }
        }
        // work left over (rare but there may be a left over....)
        if (spreadRight > 0.0) {
          spreadleft = spreadRight;
          // try shift left (3 of 3)
          for (j = i - 1; j >= 0; j -= 1) {
            const curExtraSpace = (spreadDelta[j] - smallSpace);
            if (curExtraSpace > 0.0) {
              if (curExtraSpace > spreadleft) {
                spreadDelta[j] -= spreadleft;
                spreadDelta[i] += spreadleft;
                spreadleft = 0;
              } else {
                spreadDelta[j] -= curExtraSpace;
                spreadDelta[i] += curExtraSpace;
                spreadleft -= curExtraSpace;
              }
            }
          }
        }
        // Done 3/3
      }
    }
    return spreadDelta;
  }

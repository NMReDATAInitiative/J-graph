
J-graphs are graphical representations of NMR scalar coupling constants. 

### VisualVisualization of assigned coupling constants 

An on-line dynamic [J-graph visualizer of androsten with most coupling constants assigned](./html/chart_example_from_d3-graph-gallery_zoom.html) shows how J-Graph can be used to assign coupling constants.

### Demo for manual assignement of coupling constants

J-graphs can be used to [facilitate the assignment of homonuclear coupling constants](assembleCouplingNetwork), *i.e.* make pairs of protons with equal values of J.

[J-graph visualizer of androsten with no assigned couplings](./html/androstenNoAssignement.html) This is a demo of the guided assignement feature: Double-click on dots if the horizontal line is green when rolling over a dot. The green line is indicating that only one coupling partner is compatible with the structure and the value of the coupling constant.

[Mnova json reader](./html/mnovaFileDemo.html) 

### Other demonstration

[demoDispProcToVal](./html/demoDispProcToVal.html) 

### More info

More [details](./details.md). 

### See also 

For two-dimensional COSY cross-peaks, a two-dimensional representation of coupling constants was introduced. This work is inspired by it. (D. Jeannerat, PhD thesis, Group G. Bodenhausen).

Installation 
npm install -g browserify
browserify src/nodeModules.js -r nmredata  > src/browserifiedModules.js
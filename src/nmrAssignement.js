import { GraphBase } from './graphBase.js';

export class NmrAssignment extends GraphBase {
  constructor(svg, jgraphObj, settings) {
    // data for base which takes care of communication between classes
    const name = 'nameIsWiredInConstructor_NmrSpectrum1';
    super(name, {
      dataTypesSend: [''],
      dataTypesReceive: [''],
    });

    this.theColumnsConnectColumnToSpectrumPosition = svg
      .selectAll('columnns')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'ColunnSegment1')
      .attr('x1', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', function (d) {
        return (
          settings.jGraph.bottomJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('y2', function (d) {
        return (
          settings.jGraph.pointingLineColum + settings.jGraph.positionJscale
        );
      })
      .attr('stroke', settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthColumn)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);
    // streight down
    this.theColumnsVerticalInSpectrum = svg
      .selectAll('ColunnSegment2')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'Colunn')
      .attr('x1', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', function (d) {
        return (
          settings.jGraph.pointingLineColum + settings.jGraph.positionJscale
        );
      })
      .attr('y2', function (d) {
        return settings.spectrum.height;
      })
      .attr('stroke', settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthColumn)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    this.theColumnsMainVerticalBackLine = svg
      .selectAll('ColunnSegment9')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'Colunn')
      .attr('x1', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', function (d) {
        return (
          settings.jGraph.topJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('y2', function (d) {
        return (
          settings.jGraph.bottomJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('stroke', settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthColumn)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    this.theColumnLabel = svg
      .selectAll('textc')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('text')
      .attr('class', function (d) {
        return 'textColumn' + d.uniqIndex;
      })
      .attr('x', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y', function (d) {
        return (
          -3 +
          settings.jGraph.topJGraphYposition +
          settings.jGraph.positionJscale
        );
      })
      // .text(function (d) { return "" + d.chemShift; })
      .text(function (d) {
        return '' + d.labelColumn;
      })
      .attr('dx', -1.0 * settings.jGraph.generalUseWidth)
      .style('font-size', settings.jGraph.generalUseWidth * 2.5)
      .style('font-family', 'Helvetica')
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    //.style("font-weight", "2pt")
    // Lines

    this.theColumns = {
      theColumnsConnectColumnToSpectrumPosition:
        this.theColumnsConnectColumnToSpectrumPosition,
      theColumnsVerticalInSpectrum: this.theColumnsVerticalInSpectrum,
      theColumnLabel: this.theColumnLabel,
      theColumnsMainVerticalBackLine: this.theColumnsMainVerticalBackLine,
    };

    this.theColumns = {
      theColumnsConnectColumnToSpectrumPosition:
        this.theColumnsConnectColumnToSpectrumPosition,
      theColumnsVerticalInSpectrum: this.theColumnsVerticalInSpectrum,
      theColumnLabel: this.theColumnLabel,
      theColumnsMainVerticalBackLine: this.theColumnsMainVerticalBackLine,
    };

    jgraphObj = {
      ...jgraphObj, // Copy all existing properties of jgraphObj
      theColumns: this.theColumns,
    };
  }

  getTheColumns() {
    return this.theColumns;
  }

  updateJgraphObj(jgraphObj) {
	this.jgraphObj = jgraphObj;
  }
}

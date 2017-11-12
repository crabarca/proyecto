(function() {

  const svgSize = {
    x: window.innerWidth,
    y: 5 * window.innerHeight
  };

  let svg = d3.select('#timeline')
    .append('svg')
    .attr('width', svgSize.x)
    .attr('height', svgSize.y);

  let timeline = svg.append('g');
  let timeScale

}());

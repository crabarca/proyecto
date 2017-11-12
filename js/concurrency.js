(function() {

  const parseTime = d3.timeParse('%H:%M:%S');

  const svgSize = {
    x: window.innerWidth * .9,
    y: 5 * window.innerHeight
  };

  const svgPos = {
    x: 50,
    y: 50
  };
  const mapPos = {
    x: svgPos.x,
    y: svgPos.y
  };
  const mapSize = {
    x: 300,
    y: 300
  };
  const timelinePos = {
    x: mapPos.x + mapSize.x + 40,
    y: svgPos.y
  };
  const timelineSize = {
    x: svgSize.x - mapSize.x - mapPos.x - 50,
    y: 300
  };

  let svg = d3.select('#concurrency')
    .append('svg')
    .attr('width', svgSize.x)
    .attr('height', svgSize.y);

  d3.csv('./data/metro_pos_normalized.csv', posData => {
    console.log(posData);
    let posDict = {};
    posData.forEach(elem => {
      posDict[elem[0]] = [elem[1], elem[2]];
    });

    let stations = svg.append('g')
      .attr('transform', `translate(${mapPos.x}, ${mapPos.y})`)
      .selectAll('.station')
      .data(Object.values(posDict));

    stations.enter()
      .append('circle')
        .attr('class', 'station')
        .attr('cx', d => d[0] * mapSize.x)
        .attr('cy', d => d[1] * mapSize.y)
        .attr('r', 2);

    function updateMap(newData) {
      const usedStations = newData.map(d => d.origin);
      const allStations = Object.keys(posDict);
      allStations.forEach(station => {
        if (usedStations.indexOf(station) == -1) {
          newData.push({
            origin: station,
            count: 0
          });
        }
      });

      let newStations = svg.selectAll('.station')
        .data(newData);
      newStations
        .attr('cx', d => posDict[d['origin']][0] * mapSize.x)
        .attr('cy', d => posDict[d['origin']][1] * mapSize.y)
        .attr('r', d => d['count'] / 10);
    };

    d3.csv('./data/3_minutes_all.csv', d => {
      let count = parseFloat(d['count']);
      let time = parseTime(d['time']);
      if (count > 0 && time > parseTime('01:00:00')) {
        return {
          'time': time,
          'count': count,
          'day': parseInt(d['day'])
        };
      }
      else return null;
    }, timeData => {
      d3.csv('./data/3_minutes_by_station.csv', d => {
        let count = parseFloat(d['count']);
        let time = parseTime(d['time']);
        return {
          'time': time,
          'count': count,
          'day': parseInt(d['day']),
          'origin': d['origin']
        };
      }, stationData => {
        console.log(stationData);

        let timeline = svg.append('g')
          .attr('transform', `translate(${timelinePos.x}, ${timelinePos.y})`);

        let xScale = d3.scaleTime()
          .range([0, timelineSize.x])
          .domain(d3.extent(timeData, d => d['time']));

        let yScale = d3.scaleLinear()
          .range([(timelineSize.y - 60) / 5, 0])
          .domain([0, d3.max(timeData, d => d['count'])]);

        timeline.append('g')
          .call(d3.axisBottom(xScale));

        let valueLine = d3.line()
          .x(d => xScale(d['time']))
          .y(d => yScale(d['count']));

        let dataPerDay = [[], [], [], [], [], [], []];
        timeData.forEach(d => {
          dataPerDay[d.day].push(d);
        });
        dataPerDay.forEach((d, i) => {
          let dayPlot = timeline.append('rect')
            .attr('x', 0)
            .attr('y', 50 * (i + 1))
            .attr('width', timelineSize.x)
            .attr('height', (timelineSize.y - 60) / 5)
            .attr('fill', 'white')
          timeline.append('path')
            .attr('transform', d => `translate(0, ${50 * (i + 1)})`)
            .datum(dataPerDay[i])
            .attr('day', i)
            .attr('d', valueLine)
            .on('mousemove', mousemove);
        });

        function mousemove() {
          // Borrar la línea que estaba dibujada antes
          d3.selectAll('.selector-line').remove();

          // Cambiar de posición la línea de selección
          const mousePosX = d3.mouse(this)[0];
          const curElem = d3.select(this);
          const transString = curElem.attr('transform');
          const yPos = parseFloat(transString.substring(transString.indexOf("(")+1, transString.indexOf(")")).split(",")[1]);
          d3.select(this.parentNode).append('line')
            .attr('class', 'selector-line')
            .attr('x1', mousePosX)
            .attr('x2', mousePosX)
            .attr('y1', yPos + 50)
            .attr('y2', yPos)
            .attr('stroke', 'red')
            .attr('stroke-width', 2);

          const time = xScale.invert(mousePosX);
          let filtered = stationData.filter(d =>
            parseInt(curElem.attr('day')) == d.day &&
            (time.getTime() - d.time.getTime()) < 180000 && (time.getTime() - d.time.getTime()) > 0);
          updateMap(filtered);
        };
      });
    });
  });
}());

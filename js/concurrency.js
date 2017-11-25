(function() {

  const dayNames = ['L', 'M', 'W', 'J', 'V', 'S', 'D'];
  // const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const lines = {
    '1': ['SAN PABLO L1', 'NEPTUNO', 'PAJARITOS', 'LAS REJAS', 'ECUADOR', 'SAN ALBERTO HURTADO',
        'UNIVERSIDAD DE SANTIAGO', 'ESTACION CENTRAL', 'UNION LATINO AMERICANA', 'REPUBLICA',
        'LOS HEROES L1', 'LA MONEDA', 'UNIVERSIDAD DE CHILE', 'SANTA LUCIA', 'UNIVERSIDAD CATOLICA',
        'BAQUEDANO L1', 'SALVADOR', 'MANUEL MONTT', 'PEDRO DE VALDIVIA', 'LOS LEONES', 'TOBALABA L1',
        'EL GOLF', 'ALCANTARA', 'ESCUELA MILITAR', 'MANQUEHUE', 'HERNANDO DE MAGALLANES', 'LOS DOMINICOS'],
    '2': ['VESPUCIO NORTE', 'ZAPADORES', 'DORSAL', 'EINSTEIN', 'CEMENTERIOS', 'CERRO BLANCO', 'PATRONATO',
       'CAL Y CANTO', 'SANTA ANA L2', 'LOS HEROES L2', 'TOESCA', 'PARQUE OHIGGINS',
       'RONDIZONNI', 'FRANKLIN', 'EL LLANO', 'SAN MIGUEL', 'LO VIAL', 'DEPARTAMENTAL', 'CIUDAD DEL NINO',
       'LO OVALLE', 'EL PARRON', 'LA CISTERNA L2'],
    '4': ['TOBALABA L4', 'CRISTOBAL COLON', 'FRANCISCO BILBAO', 'PRINCIPE DE GALES', 'SIMON BOLIVAR', 'PLAZA EGANA',
       'LOS ORIENTALES', 'GRECIA', 'LOS PRESIDENTES', 'QUILIN', 'LAS TORRES', 'MACUL', 'VICUNA MACKENNA L4',
       'VICENTE VALDES L4', 'ROJAS MAGALLANES', 'TRINIDAD', 'SAN JOSE DE LA ESTRELLA', 'LOS QUILLAYES',
       'ELISA CORREA', 'HOSPITAL SOTERO DEL RIO', 'PROTECTORA DE LA INFANCIA', 'LAS MERCEDES',
        'PLAZA DE PUENTE ALTO'],
    '4A': ['LA CISTERNA L4A', 'SAN RAMON', 'SANTA ROSA', 'LA GRANJA', 'SANTA JULIA', 'VICUNA MACKENNA L4A'],
    '5': ['PLAZA MAIPU', 'SANTIAGO BUERAS', 'DEL SOL', 'MONTE TABOR', 'LAS PARCELAS', 'LAGUNA SUR',
       'BARRANCAS', 'PUDAHUEL', 'SAN PABLO L5', 'LO PRADO', 'BLANQUEADO', 'GRUTA DE LOURDES', 'QUINTA NORMAL',
       'CUMMING', 'SANTA ANA L5', 'PLAZA DE ARMAS', 'BELLAS ARTES', 'BAQUEDANO L5', 'PARQUE BUSTAMANTE',
       'SANTA ISABEL', 'IRARRAZAVAL', 'NUBLE', 'RODRIGO DE ARAYA', 'CARLOS VALDOVINOS', 'CAMINO AGRICOLA',
       'SAN JOAQUIN', 'PEDRERO', 'MIRADOR', 'BELLAVISTA DE LA FLORIDA', 'VICENTE VALDES L5'],
    '0': ['SANTA ANA', 'SAN PABLO', 'LOS HEROES', 'BAQUEDANO', 'VICENTE VALDES', 'VICUNA MACKENNA',
      'TOBALABA', 'LA CISTERNA']
  };
  let linesByStation = {};
  Object.keys(lines).forEach(key => {
    lines[key].forEach(station => {
      linesByStation[station] = key;
    });
  });
  const lineColors = {
    '1': '#cf142b',
    '2': '#e37105',
    '4': '#212465',
    '4A': '#256dca',
    '5': '#019370',
    '0': '#e9a3a3'
  };

  const selectorLineColor = '#474c48';
  const fixedSelectorLineColor = 'black';

  const parseTime = d3.timeParse('%H:%M:%S');

  const svgSize = {
    x: window.innerWidth * .95,
    y: 600
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
    x: 500,
    y: svgSize.y - 100
  };
  const timelinePos = {
    x: mapPos.x + mapSize.x + 60,
    y: svgPos.y
  };
  const timelineSize = {
    x: svgSize.x - timelinePos.x - 20,
    y: 300
  };

  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const showTooltip = function(d) {
    d3.select(this)
      .attr('stroke', 'black');
    tooltip.transition()
      .duration(200)
      .style('opacity', .9);
    let countString = '';
    if (d.count !== undefined) countString = Math.round(parseFloat(d.count)) + ' entradas/min';
    tooltip.html(d.name + '<br/>' + countString)
      .style('left', (d3.event.pageX) + 'px')
      .style('top', (d3.event.pageY - 28) + 'px')
      .style('height', '1000');
  };
  const hideTooltip = function() {
    d3.select(this)
      .attr('stroke', null);
    tooltip.transition()
      .duration(500)
      .style('opacity', 0);
  };

  let svg = d3.select('#concurrency')
    .append('svg')
    .attr('width', svgSize.x)
    .attr('height', svgSize.y);

  d3.csv('./data/metro_pos_normalized.csv', posData => {
    console.log(posData);
    let posDict = {};
    posData.forEach(elem => {
      let name = elem['metro'];
      name = name.replace(' L1', '');
      name = name.replace(' L2', '');
      name = name.replace(' L4A', '');
      name = name.replace(' L4', '');
      name = name.replace(' L5', '');
      posDict[name] = {
        name: name,
        x: elem['longitude'],
        y: elem['latitude']
      };
    });

    let map = svg.append('g')
      .attr('id', 'map')
      .attr('transform', `translate(${mapPos.x}, ${mapPos.y})`);

    // Add color legend
    let mapLegend = map.append('g')
      .attr('id', 'map-legend')
      .attr('transform', `translate(20, ${mapSize.y})`);
    const xColorCircle = 20;
    const xColorText = 30;
    const yBetween = 20;
    const yColorTotal = 100;
    Object.keys(lineColors).forEach((key, i) => {
      const yColorLegend = i * yBetween - yColorTotal;
      let color = lineColors[key];
      mapLegend.append('circle')
        .attr('cx', xColorCircle)
        .attr('cy', yColorLegend)
        .attr('r', 5)
        .attr('fill', color);
      let colorText;
      if (key == '0') colorText = 'Intersección';
      else colorText = `Línea ${key}`;
      mapLegend.append('text')
        .text(colorText)
        .attr('font-size', 12)
        .attr('x', xColorText)
        .attr('y', yColorLegend + 5);
    });

    let stations = map.selectAll('.station')
      .data(Object.values(posDict));

    stations.enter()
      .append('circle')
        .attr('class', 'station')
        .attr('cx', d => d.x * mapSize.x)
        .attr('cy', d => mapSize.y * (1 - d.y))
        .attr('r', 3)
        .attr('fill', d => lineColors[linesByStation[d.name]])
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);

    function updateMap(newData) {
      const usedStations = newData.map(d => d.name);
      const allStations = Object.keys(posDict);
      allStations.forEach(station => {
        if (usedStations.indexOf(station) == -1) {
          newData.push({
            name: station,
            count: 0
          });
        }
      });

      const stationRadiusScale = d3.scaleLinear()
        .range([3, 10])
        .domain(d3.extent(newData, d => d.count))
      let newStations = svg.selectAll('.station')
        .data(newData);
      newStations
        .attr('cx', d => posDict[d['name']].x * mapSize.x)
        .attr('cy', d => mapSize.y * (1 - posDict[d['name']].y))
        .attr('r', d => stationRadiusScale(d.count))
        .attr('fill', d => lineColors[linesByStation[d.name]])
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);
      // Add map legend
      d3.selectAll('#map-size-legend').remove();

      const xSizeText = 40;
      const textSize = 12;
      const ySizeLegendTotal = 20;
      const yBigCircle = 20;
      // Size legend
      let mapSizeLegend = mapLegend.append('g')
        .attr('id', 'map-size-legend')
        .attr('transform', `translate(150, 0)`)
      mapSizeLegend.append('circle')
        .attr('cx', 0)
        .attr('cy', -ySizeLegendTotal)
        .attr('r', stationRadiusScale.range()[0])
        .attr('fill', 'grey');
      mapSizeLegend.append('text')
        .text(Math.round(stationRadiusScale.domain()[0]) + ' entradas/min')
        .attr('font-size', textSize)
        .attr('x', xSizeText)
        .attr('y', -ySizeLegendTotal + 5);
      mapSizeLegend.append('circle')
        .attr('cx', 0)
        .attr('cy', -ySizeLegendTotal + yBigCircle)
        .attr('r', stationRadiusScale.range()[1])
        .attr('fill', 'grey');
      mapSizeLegend.append('text')
        .text(Math.round(stationRadiusScale.domain()[1]) + ' entradas/min')
        .attr('font-size', textSize)
        .attr('x', xSizeText)
        .attr('y', -ySizeLegendTotal + yBigCircle + 5);
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
          'name': d['origin']
        };
      }, stationData => {
        console.log(stationData);

        let timeline = svg.append('g')
          .attr('id', 'timeline')
          .attr('transform', `translate(${timelinePos.x}, ${timelinePos.y})`);

        let xScale = d3.scaleTime()
          .range([0, timelineSize.x])
          .domain(d3.extent(timeData, d => d['time']));

        let yScale = d3.scaleLinear()
          .range([(timelineSize.y - 60) / 5, 0])
          .domain([0, d3.max(timeData, d => d['count'])]);

        // Add horizontal axis
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
          const yPos = 60 * (i + 1);
          let dayPlot = timeline.append('rect')
            .attr('x', 0)
            .attr('y', yPos)
            .attr('width', timelineSize.x)
            .attr('height', (timelineSize.y - 60) / 5)
            .attr('fill', 'white');
          // Add vertical axis
          timeline.append('g')
            .attr('transform', `translate(0, ${yPos})`)
            .call(d3.axisLeft(yScale)
              .tickValues(yScale.domain()));
          // Add plot
          timeline.append('path')
            .attr('transform', `translate(0, ${yPos})`)
            .datum(dataPerDay[i])
            .attr('day', i)
            .attr('d', valueLine)
            .attr('fill', 'grey')
            .on('click', clickTimeline)
            .on('mousemove', mousemoveTimeline);
          // Add day text
          timeline.append('text')
            .text(dayNames[i])
            .attr('x', timelineSize.x)
            .attr('y', yPos + 35);
        });

        svg.on('dblclick', dblclickSvg);

        function clickTimeline() {
          d3.selectAll('#timeline path').on('mousemove', null);
          d3.selectAll('.selector-line').attr('stroke', fixedSelectorLineColor);
        };

        function dblclickSvg() {
          d3.selectAll('#timeline path').on('mousemove', mousemoveTimeline);
          d3.selectAll('.selector-line').attr('stroke', selectorLineColor);
        };

        function mousemoveTimeline(selectedData) {
          // Borrar línea y texto que estaban dibujados antes
          d3.selectAll('.selector-line').remove();
          d3.selectAll('.time-info-text').remove();

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
            .attr('stroke', selectorLineColor)
            .attr('stroke-width', 2)
            .on('click', clickTimeline);

          const time = xScale.invert(mousePosX);
          // Agregar texto informativo
          d3.select(this.parentNode).append('text')
            .text(time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"))
            .attr('class', 'time-info-text')
            .attr('font-size', 12)
            .attr('x', mousePosX - 50)
            .attr('y', yPos + 10);
          let selectedDatum = selectedData.find(d => (time.getTime() - d.time.getTime()) < 180000 && (time.getTime() - d.time.getTime()) > 0);
          d3.select(this.parentNode).append('text')
            .text(`${Math.round(parseFloat(selectedDatum.count))} entradas/min`)
            .attr('class', 'time-info-text')
            .attr('font-size', 12)
            .attr('x', mousePosX + 10)
            .attr('y', yPos + 10);

          // Actualizar mapa
          let filtered = stationData.filter(d =>
            parseInt(curElem.attr('day')) == d.day &&
            (time.getTime() - d.time.getTime()) < 180000 && (time.getTime() - d.time.getTime()) > 0);
          updateMap(filtered);
        };
      });
    });
  });
}());

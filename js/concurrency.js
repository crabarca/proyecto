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
    '0': 'grey'
  };

  const parseTime = d3.timeParse('%H:%M:%S');

  const svgSize = {
    x: window.innerWidth * .95,
    y: 500
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
    y: svgSize.y
  };
  const timelinePos = {
    x: mapPos.x + mapSize.x + 40,
    y: svgPos.y
  };
  const timelineSize = {
    x: svgSize.x - mapSize.x - mapPos.x - 60,
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
    if (d.count !== undefined) countString = parseInt(d.count) + ' entradas/min';
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
      let name = elem[0];
      name = name.replace(' L1', '');
      name = name.replace(' L2', '');
      name = name.replace(' L4A', '');
      name = name.replace(' L4', '');
      name = name.replace(' L5', '');
      posDict[name] = {
        name: name,
        x: elem[2],
        y: elem[1]
      };
    });

    let stations = svg.append('g')
      .attr('transform', `translate(${mapPos.x}, ${mapPos.y})`)
      .selectAll('.station')
      .data(Object.values(posDict));

    stations.enter()
      .append('circle')
        .attr('class', 'station')
        .attr('cx', d => d.x * mapSize.x)
        .attr('cy', d => mapSize.y - d.y * mapSize.y)
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
        .attr('cy', d => mapSize.y - posDict[d['name']].y * mapSize.y)
        .attr('r', d => stationRadiusScale(d.count))
        .attr('fill', d => lineColors[linesByStation[d.name]])
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);
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
            .attr('transform', `translate(0, ${50 * (i + 1)})`)
            .datum(dataPerDay[i])
            .attr('day', i)
            .attr('d', valueLine)
            .attr('fill', 'grey')
            .on('mousemove', mousemove);
          timeline.append('text')
            .text(dayNames[i])
            .attr('x', timelineSize.x)
            .attr('y', 50 * (i + 1) + 35);
        });

        function mousemove(selectedData) {
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
            .attr('stroke', 'red')
            .attr('stroke-width', 2);

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
            .text(`${parseInt(selectedDatum.count)} entradas/min`)
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

/*
Copyright (c) 2016, Nebil Kawas García
This source code is subject to the terms of the Mozilla Public License.
You can obtain a copy of the MPL at <https://www.mozilla.org/MPL/2.0/>.

snippet05.js -- Ejemplo: mapa de Santiago
*/

// Intentaremos construir algo (un poco) más interesante que un _bar chart_.
// Usaremos D3 para presentar información demográfica sobre nuestra capital.

var WIDTH  = 800;
var HEIGHT = 800;
var FILEPATH = 'data/santiago.geojson';
var FILEPATH2 = 'data/dow_data/total_trips_lunes.json';
var POINTS = 'data/data_Domingo.csv';

var COLORS = d3.schemeYlOrRd[6];
console.log(COLORS);
// Definamos algunos parámetros relacionados con la población.
var MINTRIPS =  100;
var MEDTRIPS = 3500;
var MAXTRIPS = 7000;
var PREFIX = 'https://es.wikipedia.org/wiki/';

d3.select('#d3-header').text("Provincia de Santiago");
d3.selectAll('#dow-container p').remove();

var body = d3.select('#dow-container');
body.append('p').text("Comuna: ")
                .attr('id', 'region')
                .style('font-weight', 'bold');

var container = body.append('svg')
                    .attr('width', WIDTH)
                    .attr('height', HEIGHT);

function getMapParameters(bounds) {
    // Adaptado desde http://stackoverflow.com/a/14691788.

    // Obtenemos las coordenadas de ambos puntos: b0 y b1.
    // Estos puntos encuadran este mapa, en una caja.
    var [[b0x, b0y], [b1x, b1y]] = bounds; // (¡ES6!)

    // Luego, utilizamos estos puntos para hallar los parámetros adecuados.
    var scale = 0.95 / Math.max((b1x - b0x) / WIDTH, (b1y - b0y) / HEIGHT);
    var translate = [(WIDTH - scale * (b1x + b0x)) / 2,
              -75 + (HEIGHT - scale * (b1y + b0y)) / 2];
    return [scale, translate];
}

const updateDay = newDataset => {
  // Obtengamos los datos desde el archivo en formato JSON.
  d3.json(FILEPATH, function(json) {
      // Antes de dibujar un mapa, debemos primero escoger una proyección,
      // ya que no es posible representar —sin provocar alguna distorsión—
      // nuestro magnífico y esférico planeta Tierra      (tridimensional)
      // en la plana superficie de nuestro navegador.      (bidimensional)
      // (Más información en: https://www.youtube.com/watch?v=kIID5FDi2JQ)
      d3.json(newDataset, json2 => {
        var total_trips = Object.values(json2).reduce((a, b) => a + b, 0);
        console.log(total_trips);

        var tripScale = d3.scaleLinear()
                          .domain([MINTRIPS, 1380, 2760, 4140, 5520, MAXTRIPS])
                          .range(COLORS);

        // En este caso, usaremos la proyección de Gerardus Mercator.
        var projection = d3.geoMercator().scale(1).translate([0, 0]);
        var path = d3.geoPath().projection(projection);

        // Busquemos parámetros apropiados de 'scale' y 'translate'.
        var [s, t] = getMapParameters(path.bounds(json)); // (¡ES6!)

        // Luego, actualicémoslos en la proyección.
        projection.scale(s).translate(t);
        container.selectAll('path').remove().exit()

        // Hagamos, finalmente, entrar a los datos.
        container.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .on('mouseover', (d, i, e) => setName(d))
            .transition()
            .attr('d', path)
            .attr('fill', datum => {
                return tripScale(getTripsComuna(datum, json2));
              });
        })
  });
}

updateDay(FILEPATH2);

d3.select('#dow-selector').on('change', () => {
    var base_path = 'data/dow_data/'
    var dow = {'0': 'lunes', '1': 'martes', '2': 'miercoles', '3': 'jueves',
              '4': 'viernes', '5': 'sabado', '6': 'domingo'};
    var dataset = base_path + 'total_trips_' +
                  dow[d3.select('#dow-selector').property('value')] +
                  '.json';

    console.log(dataset);
    updateDay(dataset);
    });

function setName(datum) {
    var box = d3.select('#region');
    var name = datum.properties.NAME;
    var population = getPopulation(datum).toLocaleString();
    box.text(`Comuna: ${name}`); // (¡ES6!)
}

function getWiki(datum) {
    return PREFIX + datum.properties.WIKI;
}

function getPopulation(datum) {
    return datum.properties.POP;
}

function getTripsComuna(datum, dataset) {
  var name = datum.properties.NAME;
  console.log(name + " "+  dataset[name]);
  return dataset[name];
}

d3.text("").then(function(dataCSV) {
  var svgWidth = 6000;
  console.log(dataCSV);
  return;

  var svgHeight = 1000;
  
  var margin = {top: 50, right: 50, bottom: 50, left: 50};
  
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  
  var svgViewport = d3.select("body")
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style("background", "#999");
  
  var xAv = d3.extent(dataCSV, d => +d.Age);
  var yAv = d3.extent(dataCSV, d => {
      if(+d.TotalHours < 10000){
          return +d.TotalHours;
      } else {
          console.log(+d.TotalHours);
      }
   });
  var rAv = d3.extent(dataCSV, d => +d.APM);
  var colorAv = d3.extent(dataCSV, d=> +d.LeagueIndex);



 colorPol = d3.scaleOrdinal()
                    .domain(colorAv)
                    .range(['#E8A30C', '#FF0000', '#330CE8', "#0DFFDA", "#82FF40", "#D5E80A", "#E80AD1"])

  // create scale objects
  var xAxisScale =d3.scaleLinear()
    .domain([xAv[0]-1, xAv[1]])
    .range([0,width]);
  
  var yAxisScale = d3.scaleLinear()
    .domain(yAv)
    .range([height,0]);

  var radiusScale = d3.scaleLinear()    
                        .domain(rAv)
                        .range([1,10]);
  
  // create axis objects
  var xAxis = d3.axisBottom(xAxisScale);
  var yAxis = d3.axisLeft(yAxisScale);
  
  // Zoom Function
//   var zoom = d3.zoom()
//       .on("zoom", zoomFunction);
  
  // Inner Drawing Space
  var innerSpace = svgViewport.append("g")
      .attr("class", "inner_space")
       .attr('width',width)
       .attr('height', height)
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
    //   .call(zoom);
  

  // Draw Axis
  var gX = innerSpace.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
  
  var gY = innerSpace.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);
  
  // append zoom area
//   var view = innerSpace.append("rect")
//     .attr("class", "zoom")
//     .attr("width", width)
//     .attr("height", height)
//     .call(zoom)
  
  function zoomFunction(){
    // create new scale ojects based on event
    var new_xScale = d3.event.transform.rescaleX(xAxisScale)
    var new_yScale = d3.event.transform.rescaleY(yAxisScale)
    // console.log(d3.event.transform)
  
    // update axes
    gX.call(xAxis.scale(new_xScale));
    gY.call(yAxis.scale(new_yScale));
  
    // update circle
    // circles.attr("transform", d3.event.transform)
  };

    var newData = sortedAge(dataCSV);
    // console.log(newData);

    var circlesList = {};
    // for(var i = xAv[0]; i < xAv[1]; i++){
    //     let circleIn = drawAge(innerSpace, newData[i], i, yAxisScale, xAxisScale, radiusScale );
        
    // }
    
    // var itCirc22 = drawAge(innerSpace, newData['22'], 22, yAxisScale, xAxisScale, radiusScale );

    // drawAge(svg, dataAge, age, yScale, xScale, radiusScale)



    for(let i = xAv[0]; i < xAv[1]; i++ ){
        if(newData[i] === undefined) return;
        let itCirc = drawAge(innerSpace, newData[i], i, yAxisScale, xAxisScale, radiusScale );

        let simulatino = d3.forceSimulation()
            .force('x', d3.forceX(d => xAxisScale(d.Age)).strength(0.05))
            .force('y', d3.forceY(d => yAxisScale(d.TotalHours)).strength(0.05))
            .force('collide', d3.forceCollide(d => {
                // console.log(d);
                return radiusScale(d.APM)+1
            }));

        simulatino.nodes(newData[i])
            .on('tick', tiked);

        function tiked(){
            itCirc
            .attr('cy', d => {
                // return yScale(d.TotalHours);
                return d.y
            })
            .attr('cx', d => {
                return d.x;
            })
        }
    }
  
});


function sortedAge(data) {
  var sorted = {};
  data.forEach(el => {
    if (sorted[`${el.Age}`] === undefined) {
      sorted[`${el.Age}`] = [];
    }
    sorted[`${el.Age}`].push(el);
  });
  return sorted;
}

function drawAge(svg, dataAge, age, yScale, xScale, radiusScale) {
  var circles = svg
    .selectAll(`circle.age-${age}`)
    .data(dataAge)
    .enter()
    .append("circle")
    .attr("class", `age-${age}`)
    .attr("r", d => {
      var r = radiusScale(+d.APM);
      return r;
    })
    .attr("cy", d => {
      var a = yScale(+d.TotalHours);
      return a;
    })
    .attr('data-v', d=>d.TotalHours)
    .attr("cx", d => {
      var b = xScale(+d.Age);
      return b;
    })
    .attr("fill", d=> colorPol(d.LeagueIndex))

  return circles;
}

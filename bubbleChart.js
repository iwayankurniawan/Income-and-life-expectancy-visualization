var sliderYear=1800;

// Chart dimensions.
var margin = { top: 10, right: 30, bottom: 30, left: 45 },
    width = 960 - margin.right,
    height = 500 - margin.top - margin.bottom;

//Set the range for scaling
var lowestIncome = 300,
    highestIncome = 1e5,
    lowestAge = 10,
    highestAge = 85,
    lowestPopulation = 0,
    highestPopulation = 5e8
    maxRadius = 40;

// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scale.log().domain([lowestIncome, highestIncome]).range([0, width]),
    yScale = d3.scale.linear().domain([lowestAge, highestAge]).range([height, 0]),
    radiusScale = d3.scale.sqrt().domain([lowestPopulation, highestPopulation]).range([0, maxRadius]),
    colorScale = d3.scale.category10();

// The x & y axes.
var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(12, d3.format(",d"));
var yAxis = d3.svg.axis().scale(yScale).orient("left");

// Create the SVG container and set the origin.
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add the x-axis.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// Add an x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("income per capita, (dollars)");

// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("life expectancy (years)");

// Add the year label; the value is set on transition.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text(1800);

var format = d3.format(".2s");
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .direction('s')
  .html(function(d) {
    return "<p><strong>" + d.name + "</strong></p><p><strong>Population: </strong>" + format(d.population) + "</p>";
  })
// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.income; }
function y(d) { return d.lifeExpectancy; }
function radius(d) { return d.population; }
function color(d) { return d.region; }
function key(d) { return d.name; }

// Load the data.
d3.json("nations.json", function(nations) {
  	// A bisector since many nation's data is sparsely-defined.
  	var bisect = d3.bisector(function(d) { return d[0]; });

  	// Add a dot per nation. Initialize the data at 1800, and set the colors.
  	var dot = svg.append("g")
    		.call(tip)
    		.attr("class", "dots")
    	.selectAll(".dot")
    		.data(interpolateData(1800))
    	.enter().append("circle")
      .on('mouseover', function () {
        tip.show
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", function(d) { return radiusScale(radius(d))+3; })
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        tip.hide
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", function(d) { return radiusScale(radius(d)); })
          .attr('stroke-width',1)
      })
    		//.on('mouseover', tip.show)
     		//.on('mouseout', tip.hide)
    		.attr("class", function (d) { return "dot " + d.name; })
      	.style("fill", function(d) { return colorScale(color(d)); })
      	.call(position)
      	.sort(order);

  	// Start a transition that interpolates the data based on year.
  	svg.transition()
      	.duration((20000*(2009-sliderYear))/(2009-1800))
      	.ease("linear")
      	.tween("year", tweenYear);

  	// Positions the dots based on data.
  	function position(dot) {
      	dot.attr("cx", function(d) { return xScale(x(d)); })
          	.attr("cy", function(d) { return yScale(y(d)); })
          	.attr("r", function(d) { return radiusScale(radius(d)); });
    		}

  	// Defines a sort order so that the smallest dots are drawn on top.
  	function order(a, b) { return radius(b) - radius(a); }

  	// Tweens the entire chart by first tweening the year, and then the data.
  	// For the interpolated data, the dots and label are redrawn.
  	function tweenYear() {
      	var year = d3.interpolateNumber(sliderYear, 2009);
      	return function(t) { displayYear(year(t)); };
    }

  	// Updates the display to show the specified year.
  	function displayYear(year) {
      	//console.log(dot.data(interpolateData(year), key).call(position).sort(order))
        dot.data(interpolateData(year), key).call(position).sort(order);
      	label.text(Math.round(year));
    }

  	// Interpolates the dataset for the given (fractional) year.
  	function interpolateData(year) {
      document.getElementById("myRange").value = year;
      document.getElementById("yearValue").innerHTML = "Year: "+Math.round(year);
      	return nations.map(function(d) {
          	return {
              	name: d.name,
              	region: d.region,
              	income: interpolateValues(d.income, year),
              	population: interpolateValues(d.population, year),
              	lifeExpectancy: interpolateValues(d.lifeExpectancy, year)
            };
        });
    }

  	// Finds (and possibly interpolates) the value for the specified year.
  	function interpolateValues(values, year) {
      	var i = bisect.left(values, year, 0, values.length - 1),
            a = values[i];
      	if (i > 0) {
          	var b = values[i - 1],
                t = (year - a[0]) / (b[0] - a[0]);
          	return a[1] * (1 - t) + b[1] * t;
        }
      return a[1];
    }

    //slider for control the year
    var slider = document.getElementById("myRange");
    slider.oninput = function() {
      document.getElementById("yearValue").innerHTML = "Year: "+Math.round(this.value);
      sliderYear = this.value;
      displayYear(sliderYear);
      pauseFunction();
    }

    //Play Button to start the animation
    document.getElementById("playButton").onclick = function() {playFunction()};
    function playFunction() {
      svg.transition()
          .duration((20000*(2009-slider.value))/(2009-1800))
          .ease("linear")
          .tween("year", tweenYear);
    }

    document.getElementById("pauseButton").onclick = function() {pauseFunction()};
    function pauseFunction(){
    	// Cancel the current transition, if any.
    	svg.transition().duration(0);
      sliderYear = slider.value;
    }
});

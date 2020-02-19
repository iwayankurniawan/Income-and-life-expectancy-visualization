//Set dimension for the chart
var margin = {top:10, right:30, left:30, bottom:40},
    height = 600 - margin.top - margin.bottom,
    width = 900 - margin.right;

//Set variable for the axis scaling and bubble scaling
var lowestIncomeForAxis = 200,
    maxIncomeForAxis = 110000,
    lowestAgesForAxis = 10,
    maxAgesForAxis = 90,
    lowestPopulationForRadius = 0,
    maxPopulationForRadius = 4*10^8,
    maxRadius = 35;

//D3.js function to create the scaling for axis, color, and bubble radius
var scaleXAxis = d3.scale.linear().domain([lowestIncomeForAxis, maxIncomeForAxis]).range([0,width]),
    scaleYAxis = d3.scale.linear().domain([lowestAgesForAxis, maxAgesForAxis]).range([height,0]),
    scaleForRadius = d3.scale.sqrt().domain([lowestPopulationForRadius,maxPopulationForRadius]).range(0,maxRadius),
    scaleForColor = d3.scale.category10();

//Create X axis and Y axis
var xAxis = d3.svg.axis().scale(scaleXAxis).orient("bottom").ticks(12, d3.format(",d"));
var yAxis = d3.svg.axis().scale(scaleYAxis).orient("left");

// Create the SVG container and set the origin.
var svgVisualization = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create the x-axis using xAxisScale.
svgVisualization.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

// Create the y-axis using yAxisScale.
svgVisualization.append("g")
                .attr("class", "y axis")
                .call(yAxis);

// Add label to X axis
svgVisualization.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height - 6)
                .text("income per capita (dollars)");

// Add label to Y axis
svgVisualization.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("y", 6)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text("life expectancy (years)");

// Set the year and changing
var label = svgVisualization.append("text")
                            .attr("class", "year label")
                            .attr("text-anchor", "end")
                            .attr("y", height - 24)
                            .attr("x", width)
                            .text(1800);

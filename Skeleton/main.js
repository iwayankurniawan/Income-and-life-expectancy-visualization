var margin = { top: 20, right: 30, bottom: 30, left: 45 };
var width = 800-margin.right; // The width of the svg is a global variable
var height = 800-margin.top - margin.bottom; // The height of the svg is a global variable

var fdata; // The formatted data is a global variable
var rendered_year = 0;
var playing = false;

// Setting the Y axis
var yAxis = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0])

// Setting the X axis
var xAxis = d3.scaleLog()
	.base(10)
	.range([0, width])
	.domain([142, 150000])

var area = d3.scaleLinear()
	.range([25 * Math.PI, 1500 * Math.PI])
	.domain([2000, 1400000000]);

// TODO Ordinal scale for colors for example: d3.scaleOrdinal(d3.schemePastel1)
var continentColor = d3.scaleOrdinal(d3.schemePastel1);


var svg = d3.select("#svg_chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("background", "grey")
	.style("stroke", "black")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Add the x-axis.
	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(xAxis)); // Create an axis component with d3.axisBottom

	// Add the y-axis.
	svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yAxis)); // Create an axis component with d3.axisLeft

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

// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.income; }
function y(d) { return d.lifeExpectancy; }
function radius(d) { return d.population; }
function color(d) { return d.continent; }
function key(d) { return d.name; }

// Reading the input data
d3.json("data.json").then(function (data) {
	// Cleanup data
	fdata = data.map(function (year_data) {
		// retain the countries for which both the income and life_exp is specified
		return year_data["countries"].filter(function (country) {
			var existing_data = (country.income && country.life_exp);
			return existing_data
		}).map(function (country) {
			// convert income and life_exp into integers (everything read from a file defaults to an string)
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			return country;
		})
	});


	// Console log the formatted data
	console.log(fdata[0]);
/*
	function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
download(JSON.stringify(fdata), 'json.txt', 'text/plain');
*/
	// invoke the circle that draws the scatterplot
	// the argument corresponds to the year
	draw_circles(1810);
})

// setting the callback function when the slider changes
d3.select("#slider").on("input", render);

// callback function to render the scene when the slider changes
function render() {

	// extracting the value of slider
	var slider_val = d3.select("#slider").property("value");

	// rendered_year is the global variable that stores the current year
	// get the rendered_year from the slider (+ converts into integer type)
	rendered_year = +slider_val

	// Call rendering function
	draw_circles(rendered_year)
}

function draw_circles(year) {


	var circle_update = svg.selectAll("circle")
		.data(fdata[year]);


	// TODO all your rendering D3 code here




  // this variable gets set only through the button
	// therefore step is called in a loop only when play is pressed
	// step is not called when slider is changed
	if (playing)
        setTimeout(step, 50)
}


// callback function when the button is pressed
function play() {

	if (d3.select("button").property("value") == "Play") {
		d3.select("button").text("Pause")
        d3.select("button").property("value", "Pause")
        playing = true
        step()
	}
	else {
		d3.select("button").text("Play")
        d3.select("button").property("value", "Play")
        playing = false
	}
}

// callback function when the button is pressed (to play the scene)
function step() {

	// At the end of our data, loop back
	rendered_year = (rendered_year < 214) ? rendered_year + 1 : 0
	draw_circles(rendered_year)
}

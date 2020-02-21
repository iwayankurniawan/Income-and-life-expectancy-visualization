var width = 800; // The width of the svg is a global variable
var height = 800; // The height of the svg is a global variable

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
	.attr("width", width)
	.attr("height", height)
	.style("background", "grey")
	.style("stroke", "black");

// Reading the input data
d3.json("data.json").then(function (data) {

	// Console log the original data
	console.log(data);

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
	console.log(fdata);

	// invoke the circle that draws the scatterplot
	// the argument corresponds to the year
	draw_circles(0);
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

	console.log(year);
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

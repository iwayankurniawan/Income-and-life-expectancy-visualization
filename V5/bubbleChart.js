var sliderYear=1800;
var regionList = [];//Store continent list

var fdata; // The formatted data is a global variable

// Chart dimensions.
var margin = { top: 20, right: 30, bottom: 30, left: 45 },
    width = 1000 - margin.right,
    height = 500 - margin.top - margin.bottom;

//Set the range for scaling
var lowestIncome = 142,
    highestIncome = 190000,
    lowestAge = 0,
    highestAge = 90,
    lowestPopulation = 0,
    highestPopulation = 5e8
    maxRadius = 40;

// Setting the Y axis
var yAxis = d3.scaleLinear()
	.domain([lowestAge, highestAge])
	.range([height, 0])

// Setting the X axis
var xAxis = d3.scaleLog()
	.base(10)
	.range([0, width])
	.domain([lowestIncome, highestIncome])

var area = d3.scaleSqrt()
	.range([0, maxRadius])
	.domain([lowestPopulation, highestPopulation]);

// TODO Ordinal scale for colors for example: d3.scaleOrdinal(d3.schemePastel1)
var continentColor = d3.scaleOrdinal(d3.schemePastel1);

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
    .call(d3.axisBottom(xAxis));

// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yAxis));

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

var div = d3.select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.income; }
function y(d) { return d.life_exp; }
function radius(d) { return d.population; }
function color(d) { return d.continent; }
function key(d) { return d.country; }

// Reading the input data
d3.json("data.json").then(function (data) {
    //Create the div to host checkbox and svg
    var createDivForLegend = d3.select(".legend").append("div")
                                .attr("class","row listLegends")
                                .selectAll(".listLegend")
                                .data(getRegionList)
                                .enter().append("div")
                                .attr("class", function (d) { return "listLegend " + d;});

    //Create the checkbox
    createDivForLegend.append("input")
                      .attr("type","checkbox")
                      .attr("id",function (d) { return "check"+ d; })
                      .attr("checked","true")
                      .attr("value",function (d) { return d; });

    //Create the svg to host rect and text
    var regionRect = createDivForLegend.append("svg")
                                      .attr("width", 230)
                                      .attr("height", 30)
                                      .attr("class","regionRects")
                                      .attr("class", function (d) { return "regionRect " + d; });
    //Create the rect
    regionRect.append("rect")
              .attr("width",10)
              .attr("height",10)
              .attr("y", 7)
              .attr("x",10)
            	.style("fill", function(d) { return continentColor(d);});

    //Create the legend text
    regionRect.append("text")
              .attr("y",17)
              .attr("x",25)
              .text(function(d){ return d;})

  	// Add a dot per nation. Initialize the data at 1800, and set the colors.
  	var dot = svg.append("g")
    		.attr("class", "dots")
    	.selectAll(".dot")
    		.data(interpolateData(1800))
    	.enter().append("circle")
      .on('mouseover.tip', function(d){
        //When mouse hover in to the dot create tooltips
        div
        .html("<strong>Country: </strong>"+d.country + "<br/>" + "<strong>Population: </strong>"+ format(d.population) +"<br/>"+ "<strong>Life Expectancy: </strong>"+d.life_exp+" Years" +"<br/>"+"<strong>Income: </strong>"+d.income +" Dollars")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + 14 + "px")
        .style("opacity","1");
      })
      .on('mouseover.circle', function () {
        //Change the size of the dots when cursor hover in to the dot
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", function(d) { return area(radius(d))+3; })
          .attr('stroke-width',3);
      })
      .on('mouseout.tip', function(d) {
            div.style("opacity", 0);
        })
      .on('mouseout.circle', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", function(d) { return area(radius(d)); })
          .attr('stroke-width',1);
      })
    		.attr("class", function (d) { return "dot " + d.country + " region"+ d.continent; })
        .attr("id",function (d) { return d.continent; })
      	.style("fill", function(d) { return continentColor(color(d)); })
      	.call(position)
      	.sort(order);

  	// Start a transition that interpolates the data based on year.
  	svg.transition()
      	.duration((30000*(2009-sliderYear))/(2009-1800))
      	.ease(d3.easeLinear)
      	.tween("year", tweenYear);

  	// Positions the dots based on data.
  	function position(dot) {
      	dot.attr("cx", function(d) { return xAxis(x(d)); })
          	.attr("cy", function(d) { return yAxis(y(d)); })
          	.attr("r", function(d) { return area(radius(d)); });
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
        dot.data(interpolateData(year), key).call(position).sort(order);
      	label.text(Math.round(year));
    }

  	// Interpolates the dataset for the given (fractional) year.
  	function interpolateData(year) {
      document.getElementById("myRange").value = year;
      document.getElementById("yearValue").innerHTML = "Year: "+Math.round(year);

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
      var value = year-1800;

      return fdata[Math.round(value)];
    }

    //Get list of continent
    function getRegionList(){
      interpolateData(1800).map(function(d) {
        var temp = d.continent;
        var found = regionList.find(function(element) {
          return element === temp
        });
          if (found == undefined){
            regionList.push(temp);
          }
        });
        return regionList;
      }

//---------------------Control The Slider, Button, Filter----------------------
    //slider for control the year
    var slider = document.getElementById("myRange");
    slider.oninput = function() {
      document.getElementById("yearValue").innerHTML = "Year: "+Math.round(this.value);
      //Update the slider value
      sliderYear = this.value;
      displayYear(sliderYear);
      d3.select("button").property("value", "Pause");
      play();

    }

    // callback function when the button is pressed
    document.getElementById("animate").onclick = function() {play()};
    function play() {
    	if (d3.select("button").property("value") == "Play") {
        //Set the button to Pause status
    		d3.select("button").text("Pause");
        d3.select("button").property("value", "Pause");
        //Play the animation
        svg.transition()
            .duration((30000*(2009-slider.value))/(2009-1800))
            .ease(d3.easeLinear)
            .tween("year", tweenYear);
    	}
    	else {
    		d3.select("button").text("Play");
        d3.select("button").property("value", "Play");
        //Update the value based on slider value and pause
        sliderYear = slider.value;
        svg.transition()
            .duration((30000*(2009-slider.value))/(2009-1800))
            .ease(d3.easeLinear)
            .tween("year", tweenYear);
        // Cancel the current transition, if any.
        svg.transition().duration(0);
    	}
    }

    //Filter the countries based on continent
    $(document).ready(function(){
       $('input[type="checkbox"]').click(function(){
         //When the checkbox checked, give color and full trasparancey to the continent
           if($(this).prop("checked") == true){
             switch(this.value) {
               case "africa":
                 d3.selectAll(".regionafrica")
                   .transition()
                   .duration(500)
                   .style("fill", function(d) { return continentColor(color(d)); })
                   .style("opacity","1");
                 break;
               case "asia":
                 d3.selectAll(".regionasia")
                   .transition()
                   .duration(500)
                   .style("fill", function(d) { return continentColor(color(d)); })
                   .style("opacity","1");
                 break;
               case "americas":
                 d3.selectAll(".regionamericas")
                   .transition()
                   .duration(500)
                   .style("fill", function(d) { return continentColor(color(d)); })
                   .style("opacity","1");
                 break;
               case "europe":
                 d3.selectAll(".regioneurope")
                   .transition()
                   .duration(500)
                   .style("fill", function(d) { return continentColor(color(d)); })
                   .style("opacity","1");
                 break;
               default:
                 // code block
             }
           }
           //when the checkbox unchecked, give white color to the dots and reduce the transparancy
           else if($(this).prop("checked") == false){
           switch(this.value) {
             case "africa":
               d3.selectAll(".regionafrica")
                 .transition()
                 .duration(500)
                 .style("fill","#f0f0f5")
                 .style("opacity","0.1");
               break;
             case "asia":
               d3.selectAll(".regionasia")
                 .transition()
                 .duration(500)
                 .style("fill","#f0f0f5")
                 .style("opacity","0.1");
               break;
             case "americas":
               d3.selectAll(".regionamericas")
                 .transition()
                 .duration(500)
                 .style("fill","#f0f0f5")
                 .style("opacity","0.1");
               break;
             case "europe":
               d3.selectAll(".regioneurope")
                 .transition()
                 .duration(500)
                 .style("fill","#f0f0f5")
                 .style("opacity","0.1");
               break;
             default:
               // code block
           }
       }
       });
   });
});

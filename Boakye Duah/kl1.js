
// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()
    .center([0,20])                
    .scale(99)                       
    .translate([ width/2, height/2 ])

//Geojson file and the data
Promise.all([
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
d3.csv("For Kluivert1.csv")
]).then(function (initialize) {

    let dataGeo = initialize[0]
    let data = initialize[1]

  // Create a color scale
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.country))
    .range(d3.schemeCategory10);

  // Add a scale for bubble size
  const valueExtent = d3.extent(data, d => +d.firearm_num)
  const size = d3.scaleSqrt()
    .domain(valueExtent)  // What's in the data
    .range([ 1, 50])  // Size in pixel
     
  // Draw the map
  svg.append("g")
  .selectAll("path")
  .data(dataGeo.features)
  .join("path")
    .attr("fill", "#b8b8b8")
    .attr("d", d3.geoPath()
        .projection(projection)
    )
  .style("stroke", "none")
  .style("opacity", .3)

// tooltip:hidden by default:
const tooltip = d3.select("body")
.append('div')
.append("rect")
.attr("id","#chart")
.style("opacity", 0)
.classed("tooltip", true)
.style("background-color", "black")
.style("border-radius", "5px")
.style("padding", "10px")
.style("color", "white")
.style('position', 'absolute')
;
const mouseover = (event, d) => {
tooltip.transition().duration(500);
tooltip
  .style("opacity", 1)
  .html("Country: "+ d.country + " <br/> " 
  + "Year: "+ d.year +" <br/> "
  + "Firearm Number: "+ d.firearm_num )
  .style("left", event.x + 15 + "px")
  .style("top", event.y + 15 + "px")
};
const mousemove = (event, d) => {
tooltip
.style("left", `${d3.pointer(this)[0] + 10}px`)
.style("top", `${d3.pointer(this)[1] + 10}px`)
};
const mouseleave = (event, d) => {
tooltip.transition()
.duration(200)
.style("opacity", 0);
};

  

//circle
let circles;
function drawCircles(year){
  console.log(typeof year)
  
  const thisYearsData = data.filter(d => d.year === year)
  console.log(thisYearsData)
  circles =
    svg.selectAll("circle") 
    .data(thisYearsData)

    // Enter
  circles.enter()
    .append("circle")
      .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
      .attr("cy", d => projection([+d.longitude, +d.latitude])[1])  
      .attr("class", "circle")
        .style("fill", d => color(d.country))
        .attr("stroke-width", 1)
        .attr("fill-opacity", .7)    
        .attr("r", d => size(+d.firearm_num))
         .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave)

        // Update
  circles
  .transition()
  .duration(1000)
  .attr("r", d => size(+d.firearm_num))

    // Remove
  circles.exit().remove()
}

//years
let years =Array.from(new Set(data.map(d => d.year))).sort(d3.ascending)  
console.log(years)

//select menu
const yearMenu = d3.select("#yearDropdown")
.append("select");
yearMenu.selectAll("option")
.data(years)
.join("option")
.attr("value",d => d)
.text(d =>d);

yearMenu.on(
  "change",
  function(event){
    console.log(event, event.target.value)
    drawCircles(event.target.value);
  }
);

//initial circle
drawCircles(yearMenu.property("value"));



      
})
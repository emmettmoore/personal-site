var data = [
    { 'value': 5, 'text': "5", },
    { 'value': 7, 'text': "7", },
    { 'value': 8, 'text': "8", },
    { 'value': 10, 'text': "10", },
    { 'value': 10, 'text': "10", },
    { 'value': 5, 'text': "5", },
];

var chartMargin = {top: 0, right: 20, bottom: 50, left: 50};

var chartWidth = 964, chartHeight = 300;

var y = d3.scaleLinear()
    .domain([0, 31])
    .range([chartHeight, 0]);

var barWidth = chartWidth / data.length;

var x = d3.scaleTime()
    .domain([new Date(2011, 9, 1), new Date(2017, 12, 1)])
    .range([0, chartWidth]);

function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
}

function customYAxis(g) {
    g.call(yAxis);
    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", -13).attr("dy", 3);
}

var xAxis = d3.axisBottom(x)
    .ticks(d3.timeYear);

var yAxis = d3.axisRight(y)
    .tickSize(chartWidth + chartMargin.left)
    .tickFormat(function(d) { return d; });

var chart = d3.select(".chart")
    .attr("width", chartWidth + chartMargin.left + chartMargin.right)  //svg width
    .attr("height", chartHeight + chartMargin.top + chartMargin.bottom) // svg height
    .append("g")
    .attr(
        "transform", // move right / down a bit
        "translate(" + chartMargin.left + "," + chartMargin.top + ")"
     )

var bar = chart.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr(
        "transform",
        function(d, i) {
             return "translate(" + i * barWidth + ",0)";
          }
    );

bar.append("rect")
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return chartHeight - y(d.value); })
    .attr("width", barWidth);

bar.append("text")
    .attr("x", barWidth / 2)
    .attr("y", function(d) { return y(d.value) + 3; })
    .attr("dy", ".75em")
    .text(function(d) { return d.text; });

// X-Axis
chart.append("g")
    .attr( // axis translation
        "transform",
        "translate(0,"+chartHeight+")"
    )
    .call(customXAxis)

// Y-Axis
chart.append("g")
    .attr(
        "transform", "translate(-" + (chartMargin.left-13) + ",0)"
    )
    .call(customYAxis)

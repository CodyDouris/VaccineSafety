var language = "en";
d3.csv('/src/data/vaccine-safety/vaccine-safety-dashboard-data.csv').then(function(data){
    dashboard(data);
    var totalAEFIs = data.length;
    var seriousAEFIs = data.filter(d => d.SERALL == "1").length
    $(".numberTotalAEFI").text(totalAEFIs);
    $(".numberSeriousAEFI").text(seriousAEFIs);
    $(".percentSeriousAEFI").text((seriousAEFIs/totalAEFIs * 100).toFixed(2) + "%");
});

function dashboard(dashboardData){
    var trendsData = d3.nest()
            .key(function(d) {
                return d.SEASON;
            })
            .sortKeys(d3.ascending)
            .map(dashboardData);
    var trendsJson = {"title":"Trends Over Time",
    "frTitle":"Tendances au fil du temps",
    "xTitle":"Season",
    "frXTitle":"Saison",
    "key":"SEASON",
    "svgTitle":"trendsFigure"};
    createFigure(dashboardData,trendsJson,trendsData);
    
    var ageData = d3.nest()
            .key(function(d) {
                return d.stagegr3;
            })
            .sortKeys(d3.ascending)
            .map(dashboardData);
    var ageJson = {"title":"Age Distribution",
    "frTitle":"Répartition par âge",
    "xTitle":"Age Group",
    "frXTitle":"Tranche d'âge",
    "key":"stagegr3",
    "svgTitle":"ageDistFigure"};
    createFigure(dashboardData,ageJson,ageData);
    
    var medDRAData = d3.nest()
            .key(function(d) {
                return d.AEFI_TERM;
            })
            .sortKeys(d3.ascending)
            .map(dashboardData);
    var medDRAJson = {"title":"Specific MedDRA Grouping",
    "frTitle":"Groupement MedDRA spécifique",
    "xTitle":"Specific MedDRA Grouping",
    "frXTitle":"Groupement MedDRA spécifique",
    "key":"AEFI_TERM",
    "svgTitle":"medDRAFigure"};
    createFigure(dashboardData,medDRAJson,medDRAData);
    
    var sexData = d3.nest()
            .key(function(d) {
                return d.SEX;
            })
            .sortKeys(d3.ascending)
            .map(dashboardData);
    var sexJson = {"title":"Sex Distribution",
    "frTitle":"Répartition par sexe",
    "xTitle":"Sex",
    "frXTitle":"Sexe",
    "key":"SEX",
    "svgTitle":"sexDistFigure"};
    createFigure(dashboardData,sexJson,sexData);
    
    var allKeys = Object.keys(trendsData);
    allKeys = allKeys.concat(Object.keys(ageData));
    allKeys = allKeys.concat(Object.keys(medDRAData));
    allKeys = allKeys.concat(Object.keys(sexData));
    
    var getKeyForValue = {};
    getKeyForValue[Object.keys(trendsData).toString()] = "SEASON";
    getKeyForValue[Object.keys(ageData).toString()] = "stagegr3";
    getKeyForValue[Object.keys(medDRAData).toString()] = "AEFI_TERM";
    getKeyForValue[Object.keys(sexData).toString()] = "SEX";
    
    var currentKeys = {};
    allKeys.forEach(function(item){
    Object.keys(getKeyForValue).forEach(function(totalKeyScreen){
        if(totalKeyScreen.includes(item)){
            currentKeys[item] = getKeyForValue[totalKeyScreen];
        }
    });
    });
    d3.select(".dashboardDropdown").on("change",function(){
        
    });
    
    function createFigure(totalData,titlesJson,specificData) {
        var totalSeriousAEFIsArray = {};
        var totalAEFIsArray = {};
        Object.keys(specificData).forEach(function(item){
            totalSeriousAEFIsArray[item] = specificData[item].filter(d => d.SERALL == "1").length;
            totalAEFIsArray[item] = specificData[item].filter(d => d.SERALL == "0").length;
        });
        
        var legendJSON = {};
        var keys1 = [];
        var colors = [];
        
        var parseTimeFigure1 = d3.timeParse("%Y-%m-%d")
    
        if(language == "en"){
            legendJSON = {
                "Total Number of AEFIs": "Total Number of AEFIs",
                "Total Number of Serious AEFIs": "Total Number of Serious AEFIs"
            };
        }else{
            legendJSON = { 
                "Total Number of AEFIs": "Total Number of AEFIs",
                "Total Number of Serious AEFIs": "Total Number of Serious AEFIs"
            };
        }
        keys1 = ["Total Number of AEFIs","Total Number of Serious AEFIs"];
        selectKeys1 = {
            "Total Number of AEFIs": "Total Count",
            "Total Number of Serious AEFIs": "Total Serious Count"
        }
        colors = ["#118dff","#ce4c5c"];
        var unselectedColours = ["#9FD1FF","#EFB4B9"];
        var svg = d3.select("#"+titlesJson.svgTitle);

        const margin = {
            top: 100,
            right: 20,
            bottom: 100,
            left: 105
        };

        let isIE = /*@cc_on!@*/ false || !!document.documentMode;
        if (/Edge\/\d./i.test(navigator.userAgent))
            isIE = true;

        let width = 1140 - margin.left - margin.right;
        let height = 580 - margin.top - margin.bottom;

        svg = svg
            .attr("width", function(d) {
                if (isIE) {
                    return (width + margin.left + margin.right);
                }
                else {
                    return;
                }
            })
            .attr("height", function(d) {
                if (isIE) {
                    return (height + margin.top + margin.bottom);
                }
                else {
                    return;
                }
            })
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", function(d){ 
                if(titlesJson.key == "SEASON")
                    return "0 -10 1100 580";
                else if (titlesJson.key == "SEX")
                    return "0 -10 1100 580";
                else
                    return "0 0 1140 580";})
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .range([height, 0]);
        
        var heightScale = d3.scaleLinear()
            .range([0, height]);

        var z = d3.scaleOrdinal()
            .range(colors);

        svg.append("g")
            .attr("class", "y-axis-2");
    
        svg.append("g")
            .attr("class", "x-axis-2");

        let xAxisTitle = svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top - 10) + ")")
            .style("text-anchor", "middle")
            .style("font-size","28px")
            .style("font-weight","bold")
            .attr("class", "x-axis-title-2");

        let yAxisTitle = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", - 5 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size","24px")
            .style("font-weight","bold")
            .attr("class", "y-axis-title-2");
    
        let selectedBreakdown = null;
        x.domain(totalData.map(function(d) {
            return d[""+titlesJson.key];
        }));

        z = d3.scaleOrdinal()
        .range(colors);
    
        z.domain([]);
        
        var z2 = d3.scaleOrdinal()
        .range(unselectedColours);
        
        z2.domain([]);
        
        svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform",function(d){ 
                if(titlesJson.key == "AEFI_TERM")
                    return "rotate(-30)";
                else if (titlesJson.key == "stagegr3")
                    return "rotate(-25)";
                else
                    return "";
            })
            .style("font-size", function(){
                if(titlesJson.key == "AEFI_TERM")
                    return 11;
                else if (titlesJson.key == "stagegr3")
                    return 19;
                else
                    return 24;
            })
            .style("text-anchor", "end")
            .attr("x", function(d){
                if(titlesJson.key == "AEFI_TERM")
                    return -4;
                else if (titlesJson.key == "stagegr3")
                    return 3;
                else
                    return 40;
            })
            .attr("y", function(d){
                if(titlesJson.key == "AEFI_TERM")
                    return 7;
                else if (titlesJson.key == "stagegr3")
                    return 6;
                else
                    return 10;
            });

        svg.select(".x-axis-2")
            .selectAll(".tick line")
            .style("stroke", "black")
            .style("stroke-width", "2px");
    
        xAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en") {
                    return ""+titlesJson.xTitle;
                }
                else {
                    return ""+titlesJson.frXTitle;
                }
            });
            
        let maxDomain = 0;
        totalData.map(function(d) {
            return d[""+titlesJson.key];
        }).forEach(function(d){
            if(totalAEFIsArray["$"+d] + totalSeriousAEFIsArray["$"+d] > maxDomain)
                maxDomain = totalAEFIsArray["$"+d] + totalSeriousAEFIsArray["$"+d];
        });
        
        y.domain([0, maxDomain + 1000 ]); 
        heightScale.domain([0, maxDomain + 1000 ]);
        
        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('x2', width)
            .selectAll("text")
            .style("font-size", 24)

        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", 24)
    
        yAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en") {
                    return "Number of AEFIs";
                }
                else {
                    return "Nombre de EASIs";
                }
            });    

        let stack = d3.stack();
        let totalGraphData = [];
        Object.keys(totalAEFIsArray).forEach(function(key){
            var dataKey = titlesJson.key;
            totalGraphData.push({"Total Number of AEFIs" : totalAEFIsArray[key], "Total Number of Serious AEFIs" : totalSeriousAEFIsArray[key], dataKey : key.substring(1)});
        });
        
        //background bars
        svg.selectAll(".serie1")
            .data(stack.keys(keys1).value(function(d, key){
                return d[key];
                })(totalGraphData))
            .enter()
            .append("g")
            .attr("fill", function(d) { return z2(d.key); })
            .selectAll("rect")
            .data(function(d){
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function(d) {
                if(titlesJson.key == "AEFI_TERM")
                    return x(d.data["dataKey"]) + 5.5;
                else if (titlesJson.key == "stagegr3")
                    return x(d.data["dataKey"]) + 26;
                else if (titlesJson.key == "SEX")
                    return x(d.data["dataKey"]) + 48;
                else
                    return x(d.data["dataKey"]) + 40;
            })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth()/2)
            .style("pointer-events","none")
            .append("title")
            .text(function(d,i){
                return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + d.data[this.parentNode.parentNode.__data__.key];
            });
            
        svg.selectAll(".serie1")
            .data(stack.keys(keys1).value(function(d, key){
                return d[key];
                })(totalGraphData))
            .enter()
            .append("g")
            .attr("class", function(d,i) {
                return "serie1";
            })
            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d){
                return d;
            })
            .enter()
            .append("rect")
            // .attr("transform-origin","center")
            // .attr("transform","rotate(180)")
            .on("click", function(d) {
                adjustBars(d.data["dataKey"], y, titlesJson);
            })
            .attr("x", function(d) {
                if(titlesJson.key == "AEFI_TERM")
                    return x(d.data["dataKey"]) + 5.5;
                else if (titlesJson.key == "stagegr3")
                    return x(d.data["dataKey"]) + 26;
                else if (titlesJson.key == "SEX")
                    return x(d.data["dataKey"]) + 48;
                else
                    return x(d.data["dataKey"]) + 40;
            })
            .attr('y', function (d) { 
                if(d[0] == 0)
                    return y(d[0] + d[1]);
                else
                    return y(d[1]);
            })
            .attr('height', function (d) { 
                if(d[0] == 0)
                    return y(d[0]) - y(d[0] + d[1]);
                else
                    return y(d[0]) - y(d[1]);
            })
            .attr("width", x.bandwidth()/2)
            .style("cursor","pointer")
            .append("title")
            .text(function(d,i){
                return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + d.data[this.parentNode.parentNode.__data__.key];
            });
        
        var legend = svg.append("g")
            .attr("class","legendG")
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("text-anchor", "start")
            .attr("transform","translate(-965,0)")
            .selectAll("g")
            .data(keys1.slice())
            .enter().append("g")
            .attr("transform", function(d,i) { return "translate("+ ((((width - margin.left) - 610) * i) + 880) + "," +  0 + ")"; });
     
        legend.append("circle")
            // .on("click", function(d) {
            //     adjustBars(specificData, d.data[""+titlesJson.key], y, svg);
            // })
            .attr("cx", 33)
            .attr("cy", -29)
            .attr("r",12)
            .attr("fill", function(d) { return z(d); })
            .style("stroke-width", "0.5px")
            .style("stroke", "black");
        
        legend.append("text")
            // .on("click", function(d) {
            //     adjustBars(specificData, d.data[""+titlesJson.key], y, svg);
            // })
            .attr("x", 53)
            .attr("y", -29)
            .attr("dy", "0.4em")
            .text(function(d) { return legendJSON[d]; });
            
        svg.append("text")
            .attr("x", -58)
            .attr("y", -70)
            .attr("dy", "0.4em")
            .style("font-size","38px")
            .style("font-weight","bold")
            .text(function() {
                if (language == "en") {
                    return ""+titlesJson.title;
                }
                else {
                    return ""+titlesJson.frTitle;
                }
            });
        }
        function adjustBars(key, y, titlesJson) {
            var newDataCountSerious = [];
            var newDataCount = [];
            var c;
            allKeys.forEach(function(item){
                newDataCountSerious[item] = dashboardData.filter(d => d.SERALL == "1" && d[""+titlesJson.key] == key && item == "$"+d[currentKeys[item]]).length;
                newDataCount[item] = dashboardData.filter(d => d.SERALL == "0" && d[""+titlesJson.key] == key && item == "$"+d[currentKeys[item]]).length;
            });

            d3.selectAll(".serie1")
                .selectAll("rect")
                .transition()
                .duration(900)
                .attr("y",function(d) {
                    if(d[0] == 0){
                        d[1] = newDataCount["$"+d.data["dataKey"]];
                        return y(d[0] + d[1]);
                    }
                    else {
                        
                        d[1] = d[0] + newDataCountSerious["$"+d.data["dataKey"]];
                        return y((newDataCount["$"+d.data["dataKey"]] + newDataCountSerious["$"+d.data["dataKey"]]));
                    }
                })
                .attr("height", function(d) {
                    if(d[0] == 0)
                        return y(d[0]) - y(d[0] + d[1]);
                    else {
                        return y(d[0]) - y(d[1]);
                    }
                });
    }
}
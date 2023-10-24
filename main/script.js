
document.addEventListener("DOMContentLoaded", function () {
    const highChartCanvas = document.getElementById("highChartCanvas");
    const lowChartCanvas = document.getElementById("lowChartCanvas");
    const stockDetails = document.getElementById("stockDetails");
    const stockSymbolDisplay = document.getElementById("stockSymbolDisplay");
    const stockName = document.getElementById("stockName");
    const stockVolume = document.getElementById("stockVolume");
    const stockHigh52 = document.getElementById("stockHigh52");
    const stockLow52 = document.getElementById("stockLow52");

    const getDataButton = document.getElementById("getDataButton");
    let highsData = [];
    let lowsData = [];
    let stockSymbol = '';

    getDataButton.addEventListener("click", getData);

    function displayHistoricalData(historicalData) {
        const chartContainer = document.getElementById("chartContainer");
        chartContainer.classList.remove("hidden");
    
        const dataPoints = historicalData.map(dataPoint => ({
            x: new Date(dataPoint.date),
            y: parseFloat(dataPoint.close),
        }));
    
        const chart = new CanvasJS.Chart("historicalChart", {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: "Historical Stock Data",
            },
            axisX: {
                valueFormatString: "MMM YYYY",
            },
            axisY: {
                title: "Closing Price ($)",
            },
            data: [{
                type: "line",
                dataPoints: dataPoints,
            }],
        });
    
        chart.render();
    }

    function getData() {
        clearCharts();
        stockSymbol = document.getElementById("stockSymbol").value.toUpperCase();
        const apiKey = "K49HEAPMN6ARQA8I"; // Replace with your Alpha Vantage API key
        const historicalDataUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`;
        const stockDetailsUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${apiKey}`;

        // Fetch historical data from Alpha Vantage
        fetch(historicalDataUrl)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Failed to fetch historical data.");
                }
            })
            .then(data => {
                // Extract highs and lows data from the response
                const timeSeries = data["Time Series (Daily)"];
                if (timeSeries) {
                    highsData = [];
                    lowsData = [];

                    for (const date in timeSeries) {
                        const high = parseFloat(timeSeries[date]["2. high"]);
                        const low = parseFloat(timeSeries[date]["3. low"]);

                        highsData.push({ date, value: high });
                        lowsData.push({ date, value: low });
                    }

                    displayHighsAndLows();
                }
            })
            .catch(error => {
                console.error("Error fetching historical data:", error);
            });

        // Fetch stock details
        fetch(stockDetailsUrl)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Failed to fetch stock details.");
                }
            })
            .then(data => {
                displayStockDetails(data);
            })
            .catch(error => {
                console.error("Error fetching stock details:", error);
            });

    }

    function displayStockDetails(data) {
        stockDetails.style.display = "block";
        stockSymbolDisplay.textContent = data["Symbol"];
        stockName.textContent = data["Name"];
        stockVolume.textContent = data["Volume"];
        stockHigh52.textContent = data["52WeekHigh"];
        stockLow52.textContent = data["52WeekLow"];
    }

    function displayHighsAndLows() {
        const maxHigh = Math.max(...highsData.map(item => item.value));
        const maxLow = Math.max(...lowsData.map(item => item.value));
        const aspectRatio = calculateAspectRatio(maxHigh, maxLow);
        const maxHeight = calculateMaxHeight(maxHigh, maxLow);

        const options = getChartOptions('Highs', aspectRatio, maxHeight);

        // Create the high chart using Chart.js
        createChart(highChartCanvas, highsData, options, 'red');

        // Create the low chart using Chart.js
        createChart(lowChartCanvas, lowsData, options, 'blue');
    }

    function clearCharts() {
        const contextHigh = highChartCanvas.getContext("2d");
        const contextLow = lowChartCanvas.getContext("2d");
        contextHigh.clearRect(0, 0, highChartCanvas.width, highChartCanvas.height);
        contextLow.clearRect(0, 0, lowChartCanvas.width, lowChartCanvas.height);
        stockDetails.style.display = "none";
    }

    function calculateAspectRatio(maxHigh, maxLow) {
        const baseAspectRatio = 2;

        const maxDataValue = Math.max(maxHigh, maxLow);

        if (maxDataValue > 100) {
            return baseAspectRatio * 0.5;
        } else if (maxDataValue > 10) {
            return baseAspectRatio * 1;
        } else {
            return baseAspectRatio * 2;
        }
    }

    function calculateMaxHeight(maxHigh, maxLow) {
        let maxHeight = 300; // in pixels

        const maxDataValue = Math.max(maxHigh, maxLow);

        if (maxDataValue < 10) {
            maxHeight = 150;
        } else if (maxDataValue < 100) {
            maxHeight = 200;
        }

        return maxHeight;
    }

    function getChartOptions(title, aspectRatio, maxHeight) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date',
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: title,
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10,
                },
            },
            aspectRatio: aspectRatio,
            plugins: {
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y',
                            value: 0, // Minimum value
                            borderColor: 'rgba(0, 0, 0, 0.2)',
                            borderWidth: 2,
                        },
                    },
                },
            },
            elements: {
                line: {
                    tension: 0.4, // Adjust the line tension as needed
                },
            },
            spanGaps: true, // Allow gaps in the line
            height: maxHeight, // Set the maximum height of the chart area
        };
    }

    function createChart(canvas, data, options, borderColor) {
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: options.title,
                    data: data.map(item => item.value),
                    borderColor: borderColor, // Set the border color here
                    borderWidth: options.borderWidth,
                    fill: options.fill,
                }]
            },
            options: options,
        });
    }

    
});


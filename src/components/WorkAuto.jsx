import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import * as ss from 'simple-statistics';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  ReferenceLine
} from 'recharts';
import { Trash2, TrendingUp, AlertTriangle, Info, BarChart2 } from 'lucide-react';

const DataVisualizer = () => {
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedXColumn, setSelectedXColumn] = useState(null);
  const [selectedYColumn, setSelectedYColumn] = useState(null);
  const [graphType, setGraphType] = useState('line');
  const [additionalCharts, setAdditionalCharts] = useState([]);
  const [showFuturePrediction, setShowFuturePrediction] = useState(false);

  // Statistical Analysis
  const statisticalAnalysis = useMemo(() => {
    if (!data || !selectedXColumn || !selectedYColumn) return null;

    const numericData = data.map(item => [
      parseFloat(item[selectedXColumn]), 
      parseFloat(item[selectedYColumn])
    ]).filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]));

    // Calculate quartiles for better distribution understanding
    const sortedYValues = [...numericData.map(d => d[1])].sort((a, b) => a - b);
    const q1 = ss.quantile(sortedYValues, 0.25);
    const q3 = ss.quantile(sortedYValues, 0.75);
    const iqr = q3 - q1;
    
    // Calculate potential outliers
    const outlierThresholdLow = q1 - 1.5 * iqr;
    const outlierThresholdHigh = q3 + 1.5 * iqr;
    const outliers = numericData.filter(d => 
      d[1] < outlierThresholdLow || d[1] > outlierThresholdHigh
    );

    // Linear regression for trend analysis
    const linearRegressionResult = numericData.length > 1 ? 
      ss.linearRegression(numericData) : null;
    
    // Calculate R-squared (coefficient of determination)
    let rSquared = null;
    if (linearRegressionResult) {
      const predictedY = numericData.map(point => 
        linearRegressionResult.m * point[0] + linearRegressionResult.b
      );
      
      const meanY = ss.mean(numericData.map(d => d[1]));
      const totalSumOfSquares = numericData.reduce((sum, point) => 
        sum + Math.pow(point[1] - meanY, 2), 0
      );
      
      const residualSumOfSquares = numericData.reduce((sum, point, i) => 
        sum + Math.pow(point[1] - predictedY[i], 2), 0
      );
      
      rSquared = 1 - (residualSumOfSquares / totalSumOfSquares);
    }
    
    return {
      mean: {
        x: ss.mean(numericData.map(d => d[0])),
        y: ss.mean(numericData.map(d => d[1]))
      },
      median: {
        x: ss.median(numericData.map(d => d[0])),
        y: ss.median(numericData.map(d => d[1]))
      },
      quartiles: {
        q1: q1,
        q3: q3,
        iqr: iqr
      },
      range: {
        x: [Math.min(...numericData.map(d => d[0])), Math.max(...numericData.map(d => d[0]))],
        y: [Math.min(...numericData.map(d => d[1])), Math.max(...numericData.map(d => d[1]))]
      },
      standardDeviation: {
        x: ss.standardDeviation(numericData.map(d => d[0])),
        y: ss.standardDeviation(numericData.map(d => d[1]))
      },
      correlation: ss.sampleCorrelation(
        numericData.map(d => d[0]), 
        numericData.map(d => d[1])
      ),
      outliers: outliers,
      linearRegression: linearRegressionResult,
      rSquared: rSquared,
      dataPoints: numericData.length
    };
  }, [data, selectedXColumn, selectedYColumn]);

  // Time Series Analysis
  const timeSeriesAnalysis = useMemo(() => {
    if (!data || !selectedXColumn || !selectedYColumn) return null;

    const isDateColumn = (column) => {
      return data.some(item => !isNaN(Date.parse(item[column])));
    };

    // Try to find date column
    const dateColumn = columns.find(isDateColumn) || selectedXColumn;
    if (!dateColumn) return null;

    // Check if the selected X column can be parsed as dates
    const canParseAsDates = data.every(item => !isNaN(Date.parse(item[dateColumn])));
    
    if (!canParseAsDates) return null;

    const sortedData = [...data].sort((a, b) => 
      new Date(a[dateColumn]) - new Date(b[dateColumn])
    );

    // Calculate moving average
    const movingAverageWindow = Math.max(2, Math.floor(sortedData.length / 10));
    
    const trendData = sortedData.map((item, index) => {
      // For moving average, use a window of points
      const window = sortedData.slice(
        Math.max(0, index - movingAverageWindow), 
        index + 1
      );
      
      const movingAvg = ss.mean(
        window.map(d => parseFloat(d[selectedYColumn]))
          .filter(val => !isNaN(val))
      );
      
      return {
        date: item[dateColumn],
        value: parseFloat(item[selectedYColumn]),
        movingAverage: movingAvg
      };
    });

    // Detect seasonality (if enough data points)
    let seasonalityScore = null;
    if (sortedData.length > 12) {
      // Simple autocorrelation for seasonality detection
      const values = sortedData.map(item => parseFloat(item[selectedYColumn]))
        .filter(val => !isNaN(val));
      
      // Look for patterns with lag 2 to lag n/4
      const maxLag = Math.floor(values.length / 4);
      let bestCorrelation = 0;
      let bestLag = 0;
      
      for (let lag = 2; lag <= maxLag; lag++) {
        const series1 = values.slice(0, values.length - lag);
        const series2 = values.slice(lag);
        
        const correlation = Math.abs(ss.sampleCorrelation(series1, series2));
        
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestLag = lag;
        }
      }
      
      seasonalityScore = {
        score: bestCorrelation,
        period: bestLag
      };
    }

    // Simple forecast
    let forecast = null;
    if (sortedData.length > 5) {
      // Use last 5 points to predict next 3
      const lastFive = sortedData.slice(-5).map(item => parseFloat(item[selectedYColumn]));
      const avgChange = ss.mean(lastFive.slice(1).map((val, i) => val - lastFive[i]));
      
      const lastDate = new Date(sortedData[sortedData.length - 1][dateColumn]);
      const lastValue = parseFloat(sortedData[sortedData.length - 1][selectedYColumn]);
      
      forecast = [];
      for (let i = 1; i <= 3; i++) {
        const newDate = new Date(lastDate);
        // Attempt to determine the date increment pattern
        if (sortedData.length > 1) {
          const secondLastDate = new Date(sortedData[sortedData.length - 2][dateColumn]);
          const daysDiff = Math.round((lastDate - secondLastDate) / (1000 * 60 * 60 * 24));
          newDate.setDate(lastDate.getDate() + (daysDiff * i));
        } else {
          newDate.setDate(lastDate.getDate() + i);
        }
        
        forecast.push({
          date: newDate.toISOString().split('T')[0],
          forecastValue: lastValue + (avgChange * i),
          isForecast: true
        });
      }
    }

    return {
      trend: trendData,
      timeSpan: {
        start: sortedData[0][dateColumn],
        end: sortedData[sortedData.length - 1][dateColumn]
      },
      seasonality: seasonalityScore,
      forecast: forecast,
      combinedDataWithForecast: forecast ? [...trendData, ...forecast] : trendData
    };
  }, [data, columns, selectedXColumn, selectedYColumn]);

  // Advanced Data Insights Generator
  const generateInsights = () => {
    if (!statisticalAnalysis) return [];

    const insights = [];
    const { mean, median, standardDeviation, correlation, outliers, linearRegression, rSquared, range } = statisticalAnalysis;

    // Correlation insights
    if (Math.abs(correlation) > 0.7) {
      insights.push({
        type: 'correlation',
        severity: 'high',
        icon: <TrendingUp className="inline mr-2" size={18} />,
        title: `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation detected (${correlation.toFixed(2)})`,
        message: correlation > 0 
          ? `As ${selectedXColumn} increases, ${selectedYColumn} tends to increase as well.`
          : `As ${selectedXColumn} increases, ${selectedYColumn} tends to decrease.`,
        recommendation: correlation > 0
          ? `Consider strategies that leverage this positive relationship.`
          : `Be aware of this inverse relationship in your planning.`
      });
    } else if (Math.abs(correlation) > 0.4) {
      insights.push({
        type: 'correlation',
        severity: 'medium',
        icon: <TrendingUp className="inline mr-2" size={18} />,
        title: `Moderate ${correlation > 0 ? 'positive' : 'negative'} correlation (${correlation.toFixed(2)})`,
        message: `There is a moderate relationship between ${selectedXColumn} and ${selectedYColumn}.`,
        recommendation: `Further investigation may reveal stronger patterns in specific segments.`
      });
    }

    // Outlier insights
    if (outliers && outliers.length > 0) {
      const outlierPercentage = (outliers.length / statisticalAnalysis.dataPoints * 100).toFixed(1);
      insights.push({
        type: 'outliers',
        severity: outliers.length > statisticalAnalysis.dataPoints * 0.1 ? 'high' : 'medium',
        icon: <AlertTriangle className="inline mr-2" size={18} />,
        title: `${outliers.length} outliers detected (${outlierPercentage}% of data)`,
        message: `These outliers may represent special cases or errors in data collection.`,
        recommendation: `Review these points individually to determine if they should be excluded or represent important events.`
      });
    }

    // Distribution insights
    if (Math.abs((mean.y - median.y) / standardDeviation.y) > 0.5) {
      insights.push({
        type: 'distribution',
        severity: 'medium',
        icon: <BarChart2 className="inline mr-2" size={18} />,
        title: `Skewed distribution detected`,
        message: `The data is ${mean.y > median.y ? 'right' : 'left'}-skewed, meaning ${mean.y > median.y ? 'higher' : 'lower'} values have more influence.`,
        recommendation: `Consider segmenting the data or using ${mean.y > median.y ? 'median' : 'weighted average'} for more representative analysis.`
      });
    }

    // Prediction confidence
    if (linearRegression && rSquared !== null) {
      const predictionQuality = rSquared > 0.7 ? 'high' : (rSquared > 0.4 ? 'moderate' : 'low');
      insights.push({
        type: 'prediction',
        severity: predictionQuality === 'high' ? 'high' : (predictionQuality === 'moderate' ? 'medium' : 'low'),
        icon: <Info className="inline mr-2" size={18} />,
        title: `${predictionQuality.charAt(0).toUpperCase() + predictionQuality.slice(1)} prediction confidence (R² = ${rSquared.toFixed(2)})`,
        message: `The current model explains ${(rSquared * 100).toFixed(0)}% of the variation in ${selectedYColumn}.`,
        recommendation: predictionQuality === 'high' 
          ? `This relationship is reliable for forecasting future values.`
          : (predictionQuality === 'moderate' 
              ? `Consider adding more variables for more accurate predictions.`
              : `More data or different variables are needed for reliable predictions.`)
      });
      
      // Future trend prediction
      if (linearRegression && range.x.length === 2) {
        const slope = linearRegression.m;
        const xRange = range.x[1] - range.x[0];
        const predictedYChange = slope * xRange;
        const percentChange = (predictedYChange / mean.y) * 100;
        
        if (Math.abs(percentChange) > 10) {
          insights.push({
            type: 'trend',
            severity: 'high',
            icon: <TrendingUp className="inline mr-2" size={18} />,
            title: `Significant ${slope > 0 ? 'upward' : 'downward'} trend detected`,
            message: `Based on current data, expect a ${Math.abs(percentChange).toFixed(0)}% ${slope > 0 ? 'increase' : 'decrease'} over similar time periods.`,
            recommendation: slope > 0 
              ? `Prepare for growth by scaling resources accordingly.`
              : `Develop strategies to address this declining trend.`
          });
        }
      }
    }

    // Time series specific insights
    if (timeSeriesAnalysis && timeSeriesAnalysis.seasonality && timeSeriesAnalysis.seasonality.score > 0.4) {
      insights.push({
        type: 'seasonality',
        severity: 'medium',
        icon: <Info className="inline mr-2" size={18} />,
        title: `Cyclical pattern detected`,
        message: `Your data shows repetitive patterns approximately every ${timeSeriesAnalysis.seasonality.period} data points.`,
        recommendation: `Account for these cycles in your planning and forecasting.`
      });
    }

    return insights;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setData(jsonData);
      setColumns(Object.keys(jsonData[0] || {}));
    };
    reader.readAsBinaryString(file);
  };

  const addComparisonChart = () => {
    if (selectedXColumn && selectedYColumn) {
      setAdditionalCharts([...additionalCharts, {
        x: selectedXColumn,
        y: selectedYColumn,
        type: graphType,
        id: Date.now() // unique identifier
      }]);
    }
  };

  const deleteComparisonChart = (id) => {
    setAdditionalCharts(additionalCharts.filter(chart => chart.id !== id));
  };

  // Generate future prediction data points
  const predictFutureValues = () => {
    if (!statisticalAnalysis?.linearRegression || !data || !selectedXColumn || !selectedYColumn) return null;
    
    const { linearRegression } = statisticalAnalysis;
    const { m, b } = linearRegression;
    
    // Get X values and find the max
    const xValues = data.map(item => parseFloat(item[selectedXColumn])).filter(x => !isNaN(x));
    const maxX = Math.max(...xValues);
    
    // Generate 5 future points
    const futurePredictions = [];
    const step = (maxX - Math.min(...xValues)) / 10; // Use 1/10th of the range as step
    
    for (let i = 1; i <= 5; i++) {
      const futureX = maxX + (step * i);
      const predictedY = m * futureX + b;
      
      futurePredictions.push({
        [selectedXColumn]: futureX,
        [selectedYColumn]: predictedY,
        isPrediction: true
      });
    }
    
    return futurePredictions;
  };

  const renderChart = (chartConfig = { x: selectedXColumn, y: selectedYColumn, type: graphType, id: null }) => {
    const { x, y, type, id } = chartConfig;
    if (!data || !x || !y) return null;

    // Combine actual data with predictions if enabled
    let chartData = [...data];
    if (showFuturePrediction && type !== 'pie') {
      const predictions = predictFutureValues();
      if (predictions) {
        chartData = [...chartData, ...predictions];
      }
    }

    // For time series data, use the time series chart if available
    const isTimeSeries = timeSeriesAnalysis && timeSeriesAnalysis.trend && timeSeriesAnalysis.trend.length > 0;
    
    // Use time series data for line charts if available
    if (isTimeSeries && type === 'line') {
      return (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={showFuturePrediction ? timeSeriesAnalysis.combinedDataWithForecast : timeSeriesAnalysis.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value.toFixed(2), name === 'value' ? selectedYColumn : 'Moving Avg']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {statisticalAnalysis && (
                <ReferenceLine 
                  y={statisticalAnalysis.mean.y} 
                  stroke="red" 
                  strokeDasharray="3 3"
                  label={{ value: 'Mean', position: 'insideBottomRight' }}
                />
              )}
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} name={selectedYColumn} />
              <Line type="monotone" dataKey="movingAverage" stroke="#ff7300" dot={false} name="Moving Avg" />
              {showFuturePrediction && timeSeriesAnalysis.forecast && (
                <Line 
                  type="monotone" 
                  dataKey="forecastValue" 
                  stroke="#82ca9d" 
                  strokeDasharray="5 5" 
                  name="Forecast"
                  connectNulls={true}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    }

    const chartProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const chartComponents = {
      line: (
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={x} 
            tickFormatter={val => typeof val === 'number' ? val.toFixed(1) : val} 
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {statisticalAnalysis && (
            <ReferenceLine 
              y={statisticalAnalysis.mean.y} 
              stroke="red" 
              strokeDasharray="3 3"
              label={{ value: 'Mean', position: 'insideBottomRight' }}
            />
          )}
          <Line 
            type="monotone" 
            dataKey={y} 
            stroke="#8884d8" 
            dot={(props) => {
              // Highlight predictions with different dots
              const isPrediction = props.payload.isPrediction;
              if (isPrediction) {
                return (
                  <svg 
                    x={props.cx - 6} 
                    y={props.cy - 6} 
                    width={12} 
                    height={12} 
                    fill="#82ca9d"
                  >
                    <polygon points="6,0 12,12 0,12" />
                  </svg>
                );
              }
              return <circle cx={props.cx} cy={props.cy} r={4} fill="#8884d8" />;
            }}
            
            // Add a dotted line for predicted values
            strokeDasharray={(dot) => {
              return dot && dot.payload && dot.payload.isPrediction ? "5 5" : "0";
            }}
          />
          {/* Add linear regression line if available */}
          {statisticalAnalysis?.linearRegression && (
            <Line 
              type="linear"
              dataKey={x}
              stroke="#ff7300"
              dot={false}
              activeDot={false}
              label={false}
              legendType="none"
              // Calculate Y values based on regression formula
              data={[
                { [x]: Math.min(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))), 
                  [y]: statisticalAnalysis.linearRegression.m * Math.min(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))) + statisticalAnalysis.linearRegression.b },
                { [x]: Math.max(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))), 
                  [y]: statisticalAnalysis.linearRegression.m * Math.max(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))) + statisticalAnalysis.linearRegression.b }
              ]}
            />
          )}
        </LineChart>
      ),
      bar: (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={x} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey={y} 
            fill={(entry) => entry.isPrediction ? "#82ca9d" : "#8884d8"} 
          />
          {statisticalAnalysis && (
            <ReferenceLine 
              y={statisticalAnalysis.mean.y} 
              stroke="red" 
              strokeDasharray="3 3"
              label={{ value: 'Mean', position: 'insideBottomRight' }}
            />
          )}
        </BarChart>
      ),
      pie: (
        <PieChart {...chartProps}>
          <Pie
            data={chartData}
            dataKey={y}
            nameKey={x}
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label={(entry) => entry[x]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / chartData.length}, 70%, 60%)`} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toFixed(2)} />
          <Legend />
        </PieChart>
      ),
      scatter: (
        <ScatterChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={x} 
            type="number"
            name={x}
            tickFormatter={val => typeof val === 'number' ? val.toFixed(1) : val}
          />
          <YAxis 
            dataKey={y} 
            type="number" 
            name={y}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter 
            name={`${x} vs ${y}`} 
            data={chartData} 
            fill={(entry) => entry.isPrediction ? "#82ca9d" : "#8884d8"}
            shape={(props) => {
              // Custom shape for predictions
              if (props.payload.isPrediction) {
                return (
                  <svg 
                    x={props.cx - 6} 
                    y={props.cy - 6} 
                    width={12} 
                    height={12} 
                    fill="#82ca9d"
                  >
                    <polygon points="6,0 12,12 0,12" />
                  </svg>
                );
              }
              return <circle cx={props.cx} cy={props.cy} r={4} fill="#8884d8" />;
            }} 
          />
          {/* Add linear regression line if available */}
          {statisticalAnalysis?.linearRegression && (
            <Line 
              type="linear"
              dataKey={x}
              stroke="#ff7300"
              dot={false}
              // Calculate Y values based on regression formula
              data={[
                { [x]: Math.min(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))), 
                  [y]: statisticalAnalysis.linearRegression.m * Math.min(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))) + statisticalAnalysis.linearRegression.b },
                { [x]: Math.max(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))), 
                  [y]: statisticalAnalysis.linearRegression.m * Math.max(...chartData.map(item => parseFloat(item[x])).filter(val => !isNaN(val))) + statisticalAnalysis.linearRegression.b }
              ]}
            />
          )}
        </ScatterChart>
      )
    };

    return (
      <div className="relative w-full h-[400px]">
        <ResponsiveContainer width="100%" height={400}>
          {chartComponents[type] || null}
        </ResponsiveContainer>
        {id && (
          <button 
            onClick={() => deleteComparisonChart(id)}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
            title="Remove Chart"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  // Severity to color mapping for insights
  const severityColor = {
    high: 'bg-blue-100 border-blue-500 text-blue-700',
    medium: 'bg-green-100 border-green-500 text-green-700',
    low: 'bg-yellow-100 border-yellow-500 text-yellow-700'
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Intelligent Data Explorer
        </h1>

        <div className="mb-6">
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {data && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <select 
                className="w-40 px-3 py-2 border border-gray-300 rounded-md"
                value={selectedXColumn || ''}
                onChange={(e) => setSelectedXColumn(e.target.value)}
              >
                <option value="">X-Axis Column</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              <select 
                className="w-40 px-3 py-2 border border-gray-300 rounded-md"
                value={selectedYColumn || ''}
                onChange={(e) => setSelectedYColumn(e.target.value)}
              >
                <option value="">Y-Axis Column</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              <select 
                className="w-40 px-3 py-2 border border-gray-300 rounded-md"
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>

              <button 
                onClick={addComparisonChart}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={!selectedXColumn || !selectedYColumn}
              >
                Add Comparison Chart
              </button>    <button 
                onClick={() => setShowFuturePrediction(!showFuturePrediction)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  showFuturePrediction 
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {showFuturePrediction ? 'Hide Predictions' : 'Show Forecast'}
              </button>
            </div>

            {/* Main Visualization */}
            <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-inner">
              {renderChart()}
            </div>

            {/* Statistical Overview */}
            {statisticalAnalysis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Correlation</h3>
                  <p className="text-2xl font-bold">
                    {statisticalAnalysis.correlation.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Data Points</h3>
                  <p className="text-2xl font-bold">
                    {statisticalAnalysis.dataPoints}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Y Range</h3>
                  <p className="text-sm">
                    {statisticalAnalysis.range.y[0].toFixed(2)} - {statisticalAnalysis.range.y[1].toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Outliers</h3>
                  <p className="text-2xl font-bold">
                    {statisticalAnalysis.outliers.length}
                  </p>
                </div>
              </div>
            )}

            {/* Automated Insights */}
            {generateInsights().length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Info size={20} /> Automated Insights
                </h3>
                <div className="space-y-4">
                  {generateInsights().map((insight, index) => (
                    <div 
                      key={index}
                      className={`${severityColor[insight.severity]} p-4 rounded-lg border-l-4 flex items-start gap-3`}
                    >
                      <div className="flex-shrink-0 pt-1">
                        {insight.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                        <p className="text-xs text-gray-500 font-medium">{insight.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Comparison Charts */}
            {additionalCharts.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-6">Comparison Views</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {additionalCharts.map(chartConfig => (
                    <div 
                      key={chartConfig.id}
                      className="bg-white p-4 rounded-xl shadow-lg relative"
                    >
                      {renderChart(chartConfig)}
                      <div className="mt-2 text-center text-sm text-gray-500">
                        {chartConfig.x} vs {chartConfig.y}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizer;

              
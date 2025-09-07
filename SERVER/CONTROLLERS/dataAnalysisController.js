const csvModel = require('../MODELS/csvModel');
const { Analysis } = require('../MODELS/dataAnalysisModels');
const asyncHandler = require('express-async-handler');
const { parse } = require("csv-parse/sync");
// Router
const parseCsv = async function (req, res) {
    const { csvText } = req.body;

    const csvParsed = parse(csvText, {
        columns: false,
        trim: true
    })

    const headers = csvParsed[0] || [];
    const dataRows = csvParsed.slice(1) || [];
    const userId = req.user.id;
    const csvUpload = await csvModel.create({
        headers,
        dataRows,
        user: userId
    })

    res.status(200).json({
        columns: headers,
        id: csvUpload._id
    });
}

// Router
const generatePlotData = async (req, res) => {
    const { plot_type, x_axis, y_axis, id } = req.body;

    if (!plot_type || !id) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Generate plot data logic here
    if (['scatter', 'bar', 'line', 'pie', 'area'].includes(plot_type) && (!x_axis || !y_axis || !y_axis.length)) {
        return res.status(400).json({
            message: 'X-axis and at least one Y-axis are required for this plot type'
        });
    } else if (['heatmap'].includes(plot_type) && (!x_axis || !y_axis || y_axis.length < 1)) {
        return res.status(400).json({
            message: 'X-axis and at least one Y-axis are required for heatmap'
        });
    } else if (['box'].includes(plot_type) && (!y_axis || !y_axis.length)) {
        return res.status(400).json({
            message: 'At least one Y-axis is required for box plot'
        });
    }

    const csvParsed = await csvModel.findById(id);
    if (!csvParsed) {
        return res.status(404).json({
            message: 'CSV not found'
        });
    }

    if (csvParsed.user.toString() !== req.user.id) {
        return res.status(403).json({
            message: 'Not authorized to access this CSV upload'
        });
    }

    try {
        // Generate plot data based on the parsed CSV and user input
        const plotData = await generatePlotDataFromCSV(
            csvParsed,
            plot_type,
            x_axis,
            y_axis
        )
        if (!plotData || (Array.isArray(plotData) && plotData.length === 0)) {
            return res.status(400).json({
                message: 'Failed to generate plot data',
                error: 'The CSV may not contain appropriate data for the selected plot type and axes'
            });
        }

        return res.status(200).json(plotData);
    } catch (error) {
        console.error('Error generating plot data:', error);
        return res.status(500).json({
            message: 'Error generating plot data',
            error: error.message
        });
    }
}

// Helper func
const generatePlotDataFromCSV = async (csvParsed, plot_type, x_axis, y_axis) => {
    const { headers, dataRows } = csvParsed;

    const xIndex = headers.indexOf(x_axis);
    const yIndex = headers.indexOf(y_axis);

    if (xIndex === -1) {
        throw new Error(`X-axis '${x_axis}' not found in headers`);
    }
    if (yIndex === -1) {
        throw new Error(`Y-axis '${y_axis}' not found in headers`);
    }
    const xColValue = dataRows.map(row => row[xIndex]);
    const yColValue = dataRows.map(row => Number(row[yIndex]) || 0);

    let data = [];

    switch (plot_type) {
        case "scatter":
            data.push({
                type: "scatter",
                mode: "markers",
                name: y_axis,
                x: xColValue,
                y: yColValue
            });
            break;

        case "line":
            data.push({
                type: "scatter",
                mode: "lines+markers",
                name: y_axis,
                x: xColValue,
                y: yColValue
            });
            break;

        case "bar":
            data.push({
                type: "bar",
                name: y_axis,
                x: xColValue,
                y: yColValue,
                marker: {
                    color: `rgba(${Math.floor(Math.random() * 255)}, 
                                  ${Math.floor(Math.random() * 255)}, 
                                  ${Math.floor(Math.random() * 255)}, 0.7)`
                }
            });
            break;

        case "pie":
            data.push({
                type: "pie",
                labels: xColValue,
                values: yColValue,
                marker: {
                    colors: xColValue.map(() =>
                        `rgba(${Math.floor(Math.random() * 255)}, 
                               ${Math.floor(Math.random() * 255)}, 
                               ${Math.floor(Math.random() * 255)}, 0.7)`
                    )
                }
            });
            break;

        case "histogram":
            data.push({
                type: "histogram",
                name: y_axis,
                x: yColValue
            });
            break;

        case "box":
            data.push({
                type: "box",
                name: y_axis,
                y: yColValue
            });
            break;

        case "area":
            data.push({
                type: "scatter",
                fill: "tozeroy",
                mode: "lines",
                name: y_axis,
                x: xColValue,
                y: yColValue
            });
            break;

        default:
            throw new Error(`Unsupported plot type: ${plot_type}`);
    }

    // Layout
    const layout = {
        title: `${plot_type.charAt(0).toUpperCase() + plot_type.slice(1)} Plot`,
        xaxis: { title: x_axis },
        yaxis: { title: y_axis }
    };

    return { data, layout };
};

// Router
const groupByColumn = async (req, res) => {
    const { columns, csv_upload_id } = req.body;

    if (!columns || !columns.length || !csv_upload_id) {
        res.status(400);
        throw new Error('Columns and CSV upload ID are required');
    }

    const csvParsed = await csvModel.findById(csv_upload_id);
    if (!csvParsed) {
        res.status(404);
        throw new Error('CSV not found');
    }
    if (csvParsed.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to access this CSV');
    }

    const groupedData = await groupByColumns(csvParsed, columns);

    return res.status(200).json(groupedData);
}

const groupByColumns = async (csvParsed, columns) => {
    const groupedData = csvParsed.dataRows.reduce((acc, row) => {
        const key = columns.map(col => row[col]).join('|');
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(row);
        return acc;
    }, {});
    return groupedData;
};

const saveAnalysis = async (req, res) => {
    const { title, author_name, description, plots } = req.body;

    if (!title || !description || !plots || plots.length === 0) {
        res.status(400);
        throw new Error('Title, description, and at least one plot are required');
    }

    // Validate plots array
    if (!plots || !Array.isArray(plots)) {
        return res.status(400).json({
            message: 'Plots must be an array',
            error: 'INVALID_PLOTS_FORMAT'
        });
    }

    const validatedPlots = plots.map((plot, index) => {
        // Check for required fields
        if (!plot.type) {
            throw new Error(`Plot #${index + 1} is missing required field: type`);
        }

        // For data field, ensure it's present and has proper structure
        if (!plot.data || (Array.isArray(plot.data) && plot.data.length === 0)) {
            throw new Error(`Plot #${index + 1} is missing required field: data`);
        }

        // Ensure each plot has all required fields
        return {
            title: plot.title || 'Untitled Plot',
            type: plot.type,
            configuration: plot.configuration || {
                xAxis: plot.xAxis || '',
                yAxes: plot.yAxes || []
            },
            data: plot.data
        };
    });


    const analysis = await Analysis.create({
        title: title || 'Untitled Analysis',
        authorName: author_name || req.user.username || 'Unknown Author',
        description: description || '',
        plots: validatedPlots,
        user: req.user.id
    });


    return res.status(201).json(analysis);
}

const publishAnalysis = async (req, res) => {
    const { analysisId } = req.body;

    if (!analysisId) {
        res.status(400);
        throw new Error('Analysis ID is required');
    }

    const analysis = await Analysis.findById(analysisId);

    if (!analysis) {
        res.status(404);
        throw new Error('Analysis not found');
    }

    if (analysis.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to save this analysis');
    }

    // update the public flag
    analysis.isPublic = true;
    await analysis.save();

    return res.status(200).json({ message: 'Analysis saved successfully' });
}

const getAnalyses = asyncHandler(async (req, res) => {
    console.log('Fetching analyses for user:', req.user.id);
    const analyses = await Analysis.find({ user: req.user.id });
    res.status(200).json(analyses);
});

const getAnalysis = async (req, res) => {
    console.log('Fetching analysis with ID: 2', req.params.id);
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
        res.status(404);
        throw new Error('Analysis not found');
    }
    if (analysis.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to access this analysis');
    }
    return res.status(200).json(analysis);
}

const updateAnalysis = async (req, res) => {
    const { title, author_name, description, plots } = req.body;
    const analysisId = req.params.id;

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
        res.status(404);
        throw new Error('Analysis not found');
    }
    if (analysis.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to access this analysis');
    }

    // Update analysis fields
    analysis.title = title || analysis.title;
    analysis.authorName = author_name || analysis.authorName;
    analysis.description = description || analysis.description;

    if (plots && Array.isArray(plots)) {
        // Transform and validate each plot
        const validatedPlots = plots.map((plot, index) => {
            // Check for required fields
            if (!plot.type) {
                throw new Error(`Plot #${index + 1} is missing required field: type`);
            }

            // For data field, ensure it's present
            if (!plot.data) {
                throw new Error(`Plot #${index + 1} is missing required field: data`);
            }

            // Ensure each plot has all required fields
            return {
                title: plot.title || 'Untitled Plot',
                type: plot.type,
                configuration: plot.configuration || {
                    xAxis: '',
                    yAxes: []
                },
                data: plot.data
            };
        });

        // Update plots array
        analysis.plots = validatedPlots || analysis.plots;
    }

    analysisUpdated = await analysis.save();

    return res.status(200).json({ analysis: analysisUpdated });
}
const deleteAnalysis = async (req, res) => {
    const analysisId = req.params.id;

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
        res.status(404);
        throw new Error('Analysis not found');
    }
    if (analysis.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to access this analysis');
    }

    await analysis.deleteOne();

    return res.status(204).send();
}

module.exports = { 
    parseCsv, 
    generatePlotData, 
    groupByColumn, 
    publishAnalysis, 
    saveAnalysis, 
    getAnalyses, 
    getAnalysis, 
    updateAnalysis, 
    deleteAnalysis 
};
import React, { useState, useEffect } from 'react';
import { parse } from 'csv-parse/browser/esm';
import { db } from '../../../config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import { MdDownload, MdRefresh } from 'react-icons/md';

const AdminDownloadLogs = () => {
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [loadingCsv, setLoadingCsv] = useState(false);
    const [triggeringJob, setTriggeringJob] = useState(false);
    const apiUrl = import.meta.env.VITE_BLOCK_USER_API;

    // Fetch latest_inventory document
    useEffect(() => {
        setLoading(true);
        const logRef = doc(db, 'ftp_download_logs', 'latest_inventory');
        const unsubscribe = onSnapshot(
            logRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const logData = { id: docSnap.id, ...docSnap.data() };
                    setLog(logData);
                    // Auto-load CSV when log data is available
                    loadCsvData(logData);
                } else {
                    setLog(null);
                    setCsvData([]);
                    setCsvHeaders([]);
                }
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Load CSV data
    const loadCsvData = async (logData) => {
        if (!logData?.downloadUrl) return;

        setLoadingCsv(true);
        setError(null);

        try {
            const response = await fetch(logData.downloadUrl);
            const text = await response.text();

            parse(text, { columns: true, skip_empty_lines: true, trim: true }, (err, records) => {
                if (err) throw new Error(`Failed to parse CSV: ${err.message}`);
                if (records && records.length > 0) {
                    setCsvHeaders(Object.keys(records[0]));
                    setCsvData(records);
                } else {
                    setCsvHeaders([]);
                    setCsvData([]);
                }
                setLoadingCsv(false);
            });
        } catch (err) {
            setError(err.message);
            setLoadingCsv(false);
        }
    };

    // Handle Download
    const handleDownload = () => {
        if (!log?.downloadUrl?.downloadUrl) return;
        const link = document.createElement('a');
        link.href = log.downloadUrl.downloadUrl;
        link.download = log.fileName || 'inventory.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle Manual Trigger
    const handleManualTrigger = async () => {
        setTriggeringJob(true);
        setError(null);

        try {
            const response = await fetch(`${apiUrl}/trigger-ftp-download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: import.meta.env.VITE_APP_API_SECRET_TOKEN, // Make sure to set this in your .env
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to trigger FTP download');
            }

            // Wait 3 seconds then refetch from Firebase
            setTimeout(() => {
                setTriggeringJob(false);
                // Firebase listener will automatically update when the document changes
            }, 10000);

        } catch (err) {
            setError(err.message);
            setTriggeringJob(false);
        }
    };

    return (
        <div className="flex flex-col gap-y-8 w-full h-full">
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                        Inventory Management
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Header Info & Actions */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Latest System Fetch
                                </Typography>
                                <Typography variant="h6">
                                    {loading ? (
                                        'Loading...'
                                    ) : log?.downloadTimestamp ? (
                                        new Date(log.downloadTimestamp).toLocaleString()
                                    ) : (
                                        'No data'
                                    )}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    FTP Last Modified
                                </Typography>
                                <Typography variant="h6">
                                    {loading ? (
                                        'Loading...'
                                    ) : log?.ftpLastModified ? (
                                        new Date(log.ftpLastModified).toLocaleString()
                                    ) : (
                                        'No data'
                                    )}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<MdRefresh />}
                                        onClick={handleManualTrigger}
                                        disabled={triggeringJob}
                                        sx={{
                                            backgroundColor: '#003160',
                                            '&:hover': { backgroundColor: '#00254d' }
                                        }}
                                    >
                                        {triggeringJob ? 'Refreshing...' : 'Refresh'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<MdDownload />}
                                        onClick={handleDownload}
                                        disabled={!log?.downloadUrl}
                                    >
                                        Download CSV
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* CSV Data Table */}
                    {loading || loadingCsv ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : csvData.length === 0 ? (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="body1" color="text.secondary" textAlign="center">
                                No inventory data available
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {csvHeaders.map((header) => (
                                            <TableCell
                                                key={header}
                                                sx={{
                                                    backgroundColor: '#003160',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {csvData.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                                        >
                                            {csvHeaders.map((header) => (
                                                <TableCell
                                                    key={header}
                                                    sx={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {row[header]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {csvData.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Total Records: {csvData.length}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </div>

    );
};

export default AdminDownloadLogs;
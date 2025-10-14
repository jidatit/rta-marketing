import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { parse } from 'csv-parse/browser/esm';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    TextField,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
} from '@mui/material';
import { db } from '../../../config/firebaseConfig';
import { FaEye, FaDownload } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const Inventory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [downloadDateFilter, setDownloadDateFilter] = useState('');
    const [ftpModifiedFilter, setFtpModifiedFilter] = useState('');

    // Fetch PENDING logs with filters
    useEffect(() => {
        setLoading(true);
        let q = query(
            collection(db, 'ftp_download_logs'),
            where("syncStatus", "in", ["PENDING", "PARSED"]), // ✅ include both statuses
            orderBy('downloadTimestamp', 'desc')
        );

        if (downloadDateFilter) {
            const start = new Date(downloadDateFilter).toISOString().split('T')[0] + 'T00:00:00.000Z';
            const end = new Date(downloadDateFilter).toISOString().split('T')[0] + 'T23:59:59.999Z';
            q = query(q, where('downloadTimestamp', '>=', start), where('downloadTimestamp', '<=', end));
        }
        if (ftpModifiedFilter) {
            const start = new Date(ftpModifiedFilter).toISOString().split('T')[0] + 'T00:00:00.000Z';
            const end = new Date(ftpModifiedFilter).toISOString().split('T')[0] + 'T23:59:59.999Z';
            q = query(q, where('ftpLastModified', '>=', start), where('ftpLastModified', '<=', end));
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setLogs(data);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [downloadDateFilter, ftpModifiedFilter]);

    const handleView = async (log) => {
        try {
            const response = await fetch(log.downloadUrl);
            const text = await response.text();
            parse(text, { columns: true, skip_empty_lines: true, trim: true }, (err, records) => {
                if (err) throw new Error(`Failed to parse CSV: ${err.message}`);
                setCsvHeaders(Object.keys(records[0] || {}));
                setCsvData(records);
                setSelectedLog(log);
                setViewOpen(true);
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDownload = (downloadUrl, fileName) => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        setDownloadDateFilter('');
        setFtpModifiedFilter('');
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#003160', fontWeight: 600, mb: 1 }}>
                    Pending FTP Download Logs
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                    View and manage pending FTP download logs
                </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Filters Section */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        label="Download Date"
                        type="date"
                        size="small"
                        value={downloadDateFilter}
                        onChange={(e) => setDownloadDateFilter(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                    />
                    <TextField
                        label="FTP Last Modified"
                        type="date"
                        size="small"
                        value={ftpModifiedFilter}
                        onChange={(e) => setFtpModifiedFilter(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                    />
                    {(downloadDateFilter || ftpModifiedFilter) && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={clearFilters}
                            sx={{
                                color: '#003160',
                                borderColor: '#003160',
                                '&:hover': { borderColor: '#003160', bgcolor: '#f0f4f8' }
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                    <Box sx={{ ml: 'auto' }}>
                        <Chip
                            label={`${logs.length} Records`}
                            sx={{ bgcolor: '#003160', color: 'white', fontWeight: 500 }}
                        />
                    </Box>
                </Box>
            </Paper>

            {/* Main Table */}
            <Paper elevation={2} sx={{ overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        bgcolor: '#003160',
                                        color: 'white',
                                        fontWeight: 600,
                                        width: '25%'
                                    }}
                                >
                                    Download Timestamp
                                </TableCell>
                                <TableCell
                                    sx={{
                                        bgcolor: '#003160',
                                        color: 'white',
                                        fontWeight: 600,
                                        width: '25%'
                                    }}
                                >
                                    FTP Last Modified
                                </TableCell>
                                <TableCell
                                    sx={{
                                        bgcolor: '#003160',
                                        color: 'white',
                                        fontWeight: 600,
                                        width: '15%'
                                    }}
                                >
                                    Status
                                </TableCell>
                                <TableCell
                                    sx={{
                                        bgcolor: '#003160',
                                        color: 'white',
                                        fontWeight: 600,
                                        width: '35%',
                                        textAlign: 'center'
                                    }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <CircularProgress sx={{ color: '#003160' }} />
                                        <Typography sx={{ mt: 2, color: '#666' }}>
                                            Loading logs...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Typography sx={{ color: '#666' }}>
                                            No pending logs found
                                        </Typography>
                                        {(downloadDateFilter || ftpModifiedFilter) && (
                                            <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                                                Try adjusting your filters
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log, index) => (
                                    <TableRow
                                        key={log.id}
                                        sx={{
                                            '&:hover': { bgcolor: '#f8f9fa' },
                                            bgcolor: index % 2 === 0 ? 'white' : '#fafafa'
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: '0.875rem' }}>
                                            {new Date(log.downloadTimestamp).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.875rem' }}>
                                            {new Date(log.ftpLastModified).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.syncStatus}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#fff3e0',
                                                    color: '#e65100',
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View CSV">
                                                <IconButton
                                                    onClick={() => handleView(log)}
                                                    size="small"
                                                    sx={{
                                                        color: '#003160',
                                                        mr: 1,
                                                        '&:hover': { bgcolor: '#e3f2fd' }
                                                    }}
                                                >
                                                    <FaEye fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Download CSV">
                                                <IconButton
                                                    onClick={() => handleDownload(log.downloadUrl, log.fileName)}
                                                    size="small"
                                                    sx={{
                                                        color: '#003160',
                                                        '&:hover': { bgcolor: '#e3f2fd' }
                                                    }}
                                                >
                                                    <FaDownload fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* CSV View Dialog */}
            <Dialog
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { height: '80vh' } }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: '#003160',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        CSV Content: {selectedLog?.fileName}
                    </Typography>
                    <IconButton
                        onClick={() => setViewOpen(false)}
                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        <IoClose />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <TableContainer sx={{ maxHeight: 'calc(80vh - 64px)' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {csvHeaders.map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={{
                                                bgcolor: '#f5f5f5',
                                                fontWeight: 600,
                                                color: '#003160',
                                                whiteSpace: 'nowrap',
                                                borderBottom: '2px solid #003160'
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
                                        sx={{
                                            '&:hover': { bgcolor: '#f8f9fa' },
                                            bgcolor: index % 2 === 0 ? 'white' : '#fafafa'
                                        }}
                                    >
                                        {csvHeaders.map((header) => (
                                            <TableCell
                                                key={header}
                                                sx={{
                                                    fontSize: '0.813rem',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {row[header]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Inventory;
import React, { useState } from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Download, View, X } from "lucide-react";

const CommissionReportGenerator = ({ saleData }) => {
  const [openDialog, setOpenDialog] = useState(false);
  console.log("sale", saleData);
  // Calculate additional values
  const calculateReportData = () => {
    //Vehicle Costs
    const wbosVehicle = Number.parseFloat(saleData.wbosVehicle) || 0;
    const safety = Number.parseFloat(saleData.safetyInspection) || 0;
    const carProof = Number.parseFloat(saleData.carProof) || 0;
    const cleanUp = Number.parseFloat(saleData.cleanUp) || 0;
    const parts = Number.parseFloat(saleData.parts) || 0;
    const repairs = Number.parseFloat(saleData.repairs) || 0;
    const tires = Number.parseFloat(saleData.tires) || 0;
    const referral = Number.parseFloat(saleData.referral) || 0;
    const gas = Number.parseFloat(saleData.gas) || 0;
    const uber = Number.parseFloat(saleData.uber) || 0;
    const driversTow = Number.parseFloat(saleData.driversTow) || 0;
    const pictures = Number.parseFloat(saleData.pictures) || 0;
    const invoiceCopy = Number.parseFloat(saleData.invoiceCopy) || 0;
    const tints = Number.parseFloat(saleData.tints) || 0;
    const purolator = Number.parseFloat(saleData.purolator) || 0;
    const afcFloorPlan = Number.parseFloat(saleData.afcFloorPlan) || 0;
    const mtoLicense = Number.parseFloat(saleData.mtoLicense) || 0;
    const warrantyCost = Number.parseFloat(saleData.warrantyCost) || 0;
    const gapProtectionCost =
      Number.parseFloat(saleData.gapProtectionCost) || 0;
    const downpayment = Number.parseFloat(saleData.downpayment) || 0;
    const acv = Number.parseFloat(saleData.acv) || 0;
    const totalVehicleCosts = wbosVehicle;

    //Customer costs
    const bosVehicle = Number.parseFloat(saleData.bosVehicle) || 0;
    const admin = Number.parseFloat(saleData.adminFee) || 0;
    const gasoline = Number.parseFloat(saleData.gasoline) || 0;
    const licensingCharge = Number.parseFloat(saleData.licensingCharge) || 0;
    const warrantySold = Number.parseFloat(saleData.warrantySold) || 0;
    const gapProtection = Number.parseFloat(saleData.gapProtection) || 0;
    const lenderReserve = Number.parseFloat(saleData.lenderReserve) || 0;
    const lenderBonus = Number.parseFloat(saleData.lenderBonus) || 0;
    const totalDealIncome = Number.parseFloat(saleData.totalIncome) || 0;

    const totalDealExpenses =
      bosVehicle +
      gasoline +
      licensingCharge +
      warrantySold +
      gapProtection +
      lenderReserve +
      lenderBonus;

    const totalGross = totalDealExpenses - totalVehicleCosts;
    const pac = Number.parseFloat(saleData.pac) || 0;
    const salesGross = totalGross - pac;

    //Deal summary

    const unitCost = Number.parseFloat(saleData.unitCost) || 0;
    const salePrice = Number.parseFloat(saleData.salePrice) || 0;

    const warr = Number.parseFloat(saleData.warr) || 0;
    const warCost = Number.parseFloat(saleData.warCost) || 0;
    const reserve = Number.parseFloat(saleData.reserve) || 0;

    // Calculate totals

    //finanancing

    const interestRate = Number.parseFloat(saleData.interestRate) || 0;
    const amountFunded = Number.parseFloat(saleData.amountFunded) || 0;
    const lien = Number.parseFloat(saleData.lienAmount) || 0;
    const trade = Number.parseFloat(saleData.trade) || 0;

    const commissionRate = 25; // Default 25%
    const commission = (salesGross * commissionRate) / 100;

    return {
      vehicleCosts: {
        wbosVehicle: wbosVehicle,
        safetyInspection: safety,
        total: totalVehicleCosts,
        carProof: carProof,
        cleanUp: cleanUp,
        parts: parts,
        repairs: repairs,
        tires: tires,
        referral: referral,
        gas: gas,
        uber: uber,
        driversTow: driversTow,
        pictures: pictures,
        invoiceCopy: invoiceCopy,
        tints: tints,
        purolator: purolator,
        afcFloorPlan: afcFloorPlan,
        mtoLicense: mtoLicense,
        warrantyCost: warrantyCost,
        gapProtectionCost: gapProtectionCost,
        downpayment: downpayment,
        acv: acv,
        totalVehicleCosts: totalVehicleCosts,
      },
      customerCosts: {
        bosVehicle: bosVehicle,
        adminFee: admin,
        gasoline: gasoline,
        licensingCharge: licensingCharge,
        warrantySold: warrantySold,
        gapProtection: gapProtection,
        gap: gapProtection,
        warranty: warr,
        lenderReserve: lenderReserve,
        lenderBonus: lenderBonus,
        total: totalDealIncome,
      },
      dealSummary: {
        totalExpenses: totalVehicleCosts,
        totalIncome: totalDealIncome,
        totalGross: totalGross,
        pac: pac,
        salesGross: salesGross,
      },
      commission: {
        rate: commissionRate,
        amount: commission.toFixed(2),
      },
      financing: {
        amountFunded: totalDealIncome,
        provider: saleData?.financeProvider || "Not Specified",
        interestRate: interestRate,
        lien: lien,
        trade: trade,
      },
    };
  };

  const reportData = calculateReportData();

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const downloadReport = () => {
    // Create CSV content
    const reportDate = new Date().toLocaleDateString();
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add Headers
    csvContent += "RIGHT TURN AUTO - COMMISSION REPORT\r\n";
    csvContent += `Generated on: ${reportDate}\r\n\r\n`;

    // Customer Info
    csvContent += "CUSTOMER INFORMATION\r\n";
    csvContent += `Customer Name,${saleData?.customerName}\r\n`;
    csvContent += `Lead Source,${saleData?.leadSource}\r\n`;
    csvContent += `Sale Date,${saleData?.saleDate}\r\n`;
    csvContent += `Stock Number,${saleData?.stockNumber}\r\n`;
    csvContent += `Vehicle,${saleData?.vehicleMake} ${saleData?.vehicleModel}\r\n\r\n`;

    // Vehicle Costs
    csvContent += "VEHICLE COSTS\r\n";
    csvContent += `WBOS-Vehicle,${reportData.vehicleCosts.wbosVehicle}\r\n`;
    csvContent += `Safety Inspection,${reportData.vehicleCosts.safetyInspection}\r\n`;
    csvContent += `Car Proof,${reportData.vehicleCosts.carProof}\r\n`;
    csvContent += `Clean up,${reportData.vehicleCosts.cleanUp}\r\n`;
    csvContent += `Parts,${reportData.vehicleCosts.parts}\r\n`;
    csvContent += `Repairs,${reportData.vehicleCosts.repairs}\r\n`;
    csvContent += `Tires,${reportData.vehicleCosts.tires}\r\n`;
    csvContent += `Referral,${reportData.vehicleCosts.referral}\r\n`;
    csvContent += `Gas,${reportData.vehicleCosts.gas}\r\n`;
    csvContent += `Uber,${reportData.vehicleCosts.uber}\r\n`;
    csvContent += `Drivers/Tow,${reportData.vehicleCosts.driversTow}\r\n`;
    csvContent += `Pictures,${reportData.vehicleCosts.pictures}\r\n`;
    csvContent += `Invoice Copy,${reportData.vehicleCosts.invoiceCopy}\r\n`;
    csvContent += `Tints,${reportData.vehicleCosts.tints}\r\n`;
    csvContent += `Purolator,${reportData.vehicleCosts.purolator}\r\n`;
    csvContent += `AFC Floor Plan,${reportData.vehicleCosts.afcFloorPlan}\r\n`;
    csvContent += `MTO License,${reportData.vehicleCosts.mtoLicense}\r\n`;
    csvContent += `Warranty Cost,${reportData.vehicleCosts.warrantyCost}\r\n`;
    csvContent += `GAP Protection Cost,${reportData.vehicleCosts.gapProtectionCost}\r\n`;
    csvContent += `DownPayment,${reportData.vehicleCosts.downpayment}\r\n`;
    csvContent += `ACV,${reportData.vehicleCosts.acv}\r\n`;
    csvContent += `Total Costs,${reportData.vehicleCosts.total}\r\n\r\n`;

    // Customer Costs
    csvContent += "CUSTOMER COSTS\r\n";
    csvContent += `BOS-Vehicle,${reportData.customerCosts.bosVehicle}\r\n`;
    csvContent += `Admin Fee,${reportData.customerCosts.adminFee}\r\n`;
    csvContent += `Gasoline,${reportData.customerCosts.gasoline}\r\n`;
    csvContent += `Licensing Charge,${reportData.customerCosts.licensingCharge}\r\n`;
    csvContent += `Warranty Sold,${reportData.customerCosts.warrantySold}\r\n`;
    csvContent += `GAP Protection,${reportData.customerCosts.gapProtection}\r\n`;
    csvContent += `Lender Reserve,${reportData.customerCosts.lenderReserve}\r\n`;
    csvContent += `Lender Bonus,${reportData.customerCosts.lenderBonus}\r\n`;
    csvContent += `Total Deal Income,${reportData.customerCosts.total}\r\n\r\n`;

    // Deal Summary
    csvContent += "DEAL SUMMARY\r\n";
    csvContent += `Total Deal Expenses,${reportData.dealSummary.totalExpenses}\r\n`;
    csvContent += `Total Deal Income,${reportData.dealSummary.totalIncome}\r\n`;
    csvContent += `Total Gross,${reportData.dealSummary.totalGross}\r\n`;
    csvContent += `PAC,${reportData.dealSummary.pac}\r\n`;
    csvContent += `Sales Gross,${reportData.dealSummary.salesGross}\r\n\r\n`;

    // Commission
    csvContent += "COMMISSION\r\n";
    csvContent += `Commission Rate,${reportData.commission.rate}%\r\n`;
    csvContent += `Commission Amount,${reportData.commission.amount}\r\n\r\n`;

    // Financing
    csvContent += "FINANCING\r\n";
    csvContent += `Amount Funded,${reportData.financing.amountFunded}\r\n`;
    csvContent += `Finance Provider,${reportData.financing.provider}\r\n`;
    csvContent += `Interest Rate,${reportData.financing.interestRate}%\r\n`;
    csvContent += `Lien Amount,${reportData.financing.lien}\r\n`;
    csvContent += `Trade Amount,${reportData.financing.trade}\r\n\r\n`;

    // Create the download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `commission_report_${saleData?.saleId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="p-4">
      <Box className="text-center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<View />}
          onClick={handleOpenDialog}
          className="mb-4"
        >
          Generate Commission Report
        </Button>
        <Typography variant="body2" color="textSecondary">
          Click to generate a detailed commission report for this sale
        </Typography>
      </Box>

      {/* Report Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h5" component="h2" fontWeight="bold">
            DEAL / COMMISSION BREAKDOWN
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <X />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Paper elevation={0} className="p-4">
            {/* Header Section */}
            <Grid container spacing={2} className="mb-4">
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" className="mb-2">
                  <img src="/logo.png" alt="Logo" className="w-54 h-24 mr-2" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    component="div"
                    className="flex justify-between mb-2"
                  >
                    <span>Sales Rep:</span>
                    <span className="font-bold">Sales Agent</span>
                  </Typography>
                  <Typography component="div" className="flex justify-between">
                    <span>Signature:</span>
                    <span className="border-b border-black w-40"></span>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider className="mb-4" />

            {/* Customer Info Section */}
            <Grid container spacing={2} className="mb-4  ">
              <Grid item xs={6}>
                <TableContainer className="border-2 border-gray-950">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Customer:
                        </TableCell>
                        <TableCell align="right">
                          {saleData?.customerName}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Date Received:
                        </TableCell>
                        <TableCell align="right">
                          {saleData?.intermediateDate}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Date of Sale:
                        </TableCell>
                        <TableCell align="right">
                          {saleData?.saleDate}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Date Funded:
                        </TableCell>
                        <TableCell align="right">
                          {saleData?.fundedDate}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={6}>
                <TableContainer className="border-2 border-gray-950">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Lead Source:
                        </TableCell>
                        <TableCell align="right">
                          {saleData?.leadSource}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          STOCK #:
                        </TableCell>
                        <TableCell align="right">
                          {saleData?.stockNumber}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Vehicle:
                        </TableCell>
                        <TableCell align="right">
                          {saleData?.vehicleMake} {saleData?.vehicleModel}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>

            {/* Cost Sections */}
            <Grid container spacing={4} className="mb-4">
              {/* Vehicle Costs */}
              <Grid item xs={6}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  align="center"
                  className="bg-gray-100 p-2 mb-2 border-2 border-gray-950"
                >
                  VEHICLE COSTS
                </Typography>
                <TableContainer className=" border-2 border-gray-950">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>WBOS-Vehicle (incl. Buyer Fee)</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.wbosVehicle}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Safety Inspection & Certificate</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.safetyInspection}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Car Proof</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.carProof}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Clean up</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.cleanUp}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Parts</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.parts}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Repairs (DIMA)</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.repairs}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tires</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.tires}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Referral</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.referral}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Gas</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.gas}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Uber</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.uber}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Drivers/Tow</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.driversTow}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pictures</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.pictures}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Invoice Copy</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.invoiceCopy}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tints</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.tints}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Purolator</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.purolator}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>AFC Floor Plan</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.afcFloorPlan}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>MTO - License</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.mtoLicense}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Warranty Cost</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.warrantyCost}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GAP Protection Cost</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.gapProtectionCost}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>DownPayment</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.downpayment}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ACV</TableCell>
                        <TableCell align="right">
                          ${reportData.vehicleCosts.acv}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Total Costs
                        </TableCell>
                        <TableCell align="right" fontWeight="bold">
                          ${reportData.vehicleCosts.total}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Customer Costs */}
              <Grid item xs={6} spacing={4}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    align="center"
                    className="bg-gray-100 p-2 mb-2  border-2 border-gray-950"
                  >
                    CUSTOMER COSTS
                  </Typography>
                  <TableContainer className=" border-2 border-gray-950">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>BOS-Vehicle</TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.bosVehicle}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Admin Fee</TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.adminFee}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Gasoline</TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.gasoline}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Licensing Charge </TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.licensingCharge}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Warranty Sold</TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.warrantySold}
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell>GAP Protection Sold</TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.gapProtection}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Lender Reserve</TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.lenderReserve}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Lender Bonus</TableCell>
                          <TableCell align="right">
                            ${reportData.customerCosts.lenderBonus}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Total Deal Income
                          </TableCell>
                          <TableCell align="right" fontWeight="bold">
                            ${reportData.customerCosts.total}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Deal Summary */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    align="center"
                    className="bg-gray-100 p-2 mb-2  border-2 border-gray-950"
                  >
                    DEAL SUMMARY
                  </Typography>
                  <TableContainer className=" border-2 border-gray-950">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Deal Expenses</TableCell>
                          <TableCell align="right">
                            ${reportData.dealSummary.totalExpenses}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Deal Income</TableCell>
                          <TableCell align="right">
                            ${reportData.dealSummary.totalIncome}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Total Gross
                          </TableCell>
                          <TableCell align="right" fontWeight="bold">
                            ${reportData.dealSummary.totalGross}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>PAC</TableCell>
                          <TableCell align="right">
                            ${reportData.dealSummary.pac}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Sales Gross
                          </TableCell>
                          <TableCell align="right" fontWeight="bold">
                            ${reportData.dealSummary.salesGross}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Commission  */}
                <Grid item xs={12}>
                  <Box className="mb-4">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      align="center"
                      className="bg-gray-100 p-2 mb-2  border-2 border-gray-950"
                    >
                      COMMISSION
                    </Typography>
                    <TableContainer className=" border-2 border-gray-950">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Commission Rate</TableCell>
                            <TableCell align="right">
                              {reportData.commission.rate}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Commission
                            </TableCell>
                            <TableCell align="right" fontWeight="bold">
                              ${reportData.commission.amount}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Financing*/}

            <Box className="my-4">
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                className="bg-gray-100 p-2 mb-2  border-2 border-gray-950 "
              >
                FINANCING
              </Typography>
              <TableContainer className=" border-2 border-gray-950">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Amount Funded</TableCell>
                      <TableCell align="right">
                        ${reportData.financing.amountFunded}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Finance Provider</TableCell>
                      <TableCell align="right">
                        {reportData.financing.provider}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Trade</TableCell>
                      <TableCell align="right">
                        {reportData.financing.trade}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lien</TableCell>
                      <TableCell align="right">
                        {reportData.financing.lien}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Interest Rate</TableCell>
                      <TableCell align="right">
                        {reportData.financing.interestRate}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box className="my-4">
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                className="bg-gray-100 p-2 mb-2  border-2 border-gray-950 "
              >
                Comments
              </Typography>
              <TableContainer className=" border-2 border-gray-950">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>{reportData?.comments}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Download />}
            onClick={downloadReport}
          >
            Download Report
          </Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionReportGenerator;

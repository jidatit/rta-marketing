import React, { useState, useEffect } from "react";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Download, LogOut, View, X } from "lucide-react";
import updateReport from "../../Utils/updateReport";
import { useAuth } from "../../AuthContext";
import { db } from "../../config/firebaseConfig";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logo from "../../images/logo.png";

const CommissionReportGenerator = ({ saleData }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { currentUser } = useAuth();
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [openPdfPreview, setOpenPdfPreview] = useState(false);

  const isVirtualAssistant =
    currentUser?.userType === "Virtual Assistant" ||
    currentUser?.userType === "Admin";
  const firstGeneratedDate = saleData?.reportHistory?.[0]?.generatedAt;
  const formattedDate = firstGeneratedDate
    ? new Date(firstGeneratedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const calculateReportData = (data) => {
    // Vehicle Costs
    const wbosVehicle = Number.parseFloat(data.vehicleCosts.wbosVehicle) || 0;
    const safety = Number.parseFloat(data.vehicleCosts.safetyInspection) || 0;
    const carProof = Number.parseFloat(data.vehicleCosts.carProof) || 0;
    const cleanUp = Number.parseFloat(data.vehicleCosts.cleanUp) || 0;
    const parts = Number.parseFloat(data.vehicleCosts.parts) || 0;
    const repairs = Number.parseFloat(data.vehicleCosts.repairs) || 0;
    const tires = Number.parseFloat(data.vehicleCosts.tires) || 0;
    const referral = Number.parseFloat(data.vehicleCosts.referral) || 0;
    const gas = Number.parseFloat(data.vehicleCosts.gas) || 0;
    const uber = Number.parseFloat(data.vehicleCosts.uber) || 0;
    const driversTow = Number.parseFloat(data.vehicleCosts.driversTow) || 0;
    const pictures = Number.parseFloat(data.vehicleCosts.pictures) || 0;
    const invoiceCopy = Number.parseFloat(data.vehicleCosts.invoiceCopy) || 0;
    const tints = Number.parseFloat(data.vehicleCosts.tints) || 0;
    const purolator = Number.parseFloat(data.vehicleCosts.purolator) || 0;
    const afcFloorPlan = Number.parseFloat(data.vehicleCosts.afcFloorPlan) || 0;
    const mtoLicense = Number.parseFloat(data.vehicleCosts.mtoLicense) || 0;
    const warrantyCost = Number.parseFloat(data.vehicleCosts.warrantyCost) || 0;
    const gapProtectionCost =
      Number.parseFloat(data.vehicleCosts.gapProtectionCost) || 0;
    const acv = Number.parseFloat(data.vehicleCosts.acv) || 0;

    const otherCostsTotal =
      data.vehicleCosts.otherCostItems?.reduce(
        (sum, item) => sum + (Number.parseFloat(item.amount) || 0),
        0
      ) || 0;
    const totalVehicleCosts =
      wbosVehicle +
      safety +
      carProof +
      cleanUp +
      parts +
      repairs +
      tires +
      referral +
      gas +
      uber +
      driversTow +
      pictures +
      tints +
      purolator +
      afcFloorPlan +
      mtoLicense +
      warrantyCost +
      gapProtectionCost +
      otherCostsTotal;

    // Customer Costs
    const bosVehicle = Number.parseFloat(data.customerCosts.bosVehicle) || 0;
    const admin = Number.parseFloat(data.customerCosts.adminFee) || 0;
    const gasoline = Number.parseFloat(data.customerCosts.gasoline) || 0;
    const licensingCharge =
      Number.parseFloat(data.customerCosts.licensingCharge) || 0;
    const warrantySold =
      Number.parseFloat(data.customerCosts.warrantySold) || 0;
    const gapProtection =
      Number.parseFloat(data.customerCosts.gapProtection) || 0;
    const lenderReserve =
      Number.parseFloat(data.customerCosts.lenderReserve) || 0;
    const lenderBonus = Number.parseFloat(data.customerCosts.lenderBonus) || 0;

    const otherIncomeItems =
      data.customerCosts.otherIncomeItems?.reduce(
        (sum, item) => sum + (Number.parseFloat(item.amount) || 0),
        0
      ) || 0;

    const totalDealIncome =
      bosVehicle +
      gasoline +
      admin +
      licensingCharge +
      warrantySold +
      gapProtection +
      lenderReserve +
      lenderBonus +
      otherIncomeItems;

    const totalGross = totalDealIncome - totalVehicleCosts;
    const pacInput = data.dealSummary?.pac;
    const pac =
      pacInput === "" || pacInput === null || pacInput === undefined
        ? 0
        : Number.parseFloat(pacInput);
    const salesGross = totalGross - pac;

    const saleType = saleData?.saleType || "individual";
    const inputRate = data.commission?.rate;

    // Parse only for calculation
    const commissionRateNumber =
      saleType === "wholesale"
        ? 0
        : inputRate === "" || inputRate === null || inputRate === undefined
        ? 0
        : Number.parseFloat(inputRate);

    // Calculate commission
    const commission =
      Math.round(salesGross * (commissionRateNumber / 100) * 100) / 100;

    const trueGross = salesGross - commission;

    // Deal Summary
    const warr = Number.parseFloat(data.customerCosts.warranty) || 0;

    // Financing
    const interestRate = Number.parseFloat(data.financing.interestRate) || 0;
    const amountFunded = Number.parseFloat(data.financing.amountFunded) || 0;
    const financeProvider = data.financing.financeProvider || "";
    const lien = Number.parseFloat(data.financing.lien) || 0;
    const trade = Number.parseFloat(data.financing.trade) || 0;
    const downpayment = Number.parseFloat(data.financing.downpayment) || 0;

    return {
      vehicleCosts: {
        wbosVehicle,
        safetyInspection: safety,
        total: totalVehicleCosts,
        carProof,
        cleanUp,
        parts,
        repairs,
        tires,
        referral,
        gas,
        uber,
        driversTow,
        pictures,
        invoiceCopy,
        tints,
        purolator,
        afcFloorPlan,
        mtoLicense,
        warrantyCost,
        gapProtectionCost,

        acv,
        otherCostItems: data.vehicleCosts.otherCostItems || [], // Include other costs array
        otherCostsTotal, // Include sum of other costs
        totalVehicleCosts,
      },
      customerCosts: {
        bosVehicle,
        adminFee: admin,
        gasoline,
        licensingCharge,
        warrantySold,
        gapProtection,
        gap: gapProtection,
        warranty: warr,
        lenderReserve,
        lenderBonus,
        otherIncomeItems: data.customerCosts.otherIncomeItems || [],
        total: totalDealIncome,
      },
      dealSummary: {
        totalExpenses: totalVehicleCosts,
        totalIncome: totalDealIncome,
        totalGross,
        pac: pacInput,
        salesGross,
        trueGross,
      },
      commission: {
        rate: inputRate,
        amount: commission.toFixed(2),
      },
      financing: {
        amountFunded: amountFunded,
        financeProvider: financeProvider,
        provider: data.financing.provider || "Not Specified",
        interestRate,
        lien,
        trade,
        downpayment,
      },
      comments: data.comments || "",
    };
  };

  const [editableReportData, setEditableReportData] = useState(
    calculateReportData({
      vehicleCosts: {
        wbosVehicle: saleData.wbosVehicle,
        safetyInspection: saleData.safetyInspection,
        carProof: saleData.carProof,
        cleanUp: saleData.cleanUp,
        parts: saleData.parts,
        repairs: saleData.repairs,
        tires: saleData.tires,
        referral: saleData.referral,
        gas: saleData.gas,
        uber: saleData.uber,
        driversTow: saleData.driversTow,
        pictures: saleData.pictures,
        invoiceCopy: saleData.invoiceCopy,
        tints: saleData.tints,
        purolator: saleData.purolator,
        afcFloorPlan: saleData.afcFloorPlan,
        mtoLicense: saleData.mtoLicense,
        warrantyCost: saleData.warrantyCost,
        gapProtectionCost: saleData.gapProtectionCost,

        acv: saleData.acv,
        otherCostItems: saleData.otherCostItems || [], // Include other costs
      },
      customerCosts: {
        bosVehicle: saleData.bosVehicle,
        adminFee: saleData.adminFee,
        gasoline: saleData.gasoline,
        licensingCharge: saleData.licensingCharge,
        warrantySold: saleData.warrantySold,
        gapProtection: saleData.gapProtection,
        warranty: saleData.warr,
        lenderReserve: saleData.lenderReserve,
        lenderBonus: saleData.lenderBonus,
        otherIncomeItems: saleData?.otherIncomeItems || [],
      },
      dealSummary: {
        pac: saleData.pac,
        trueGross: saleData.trueGross,
      },
      commission: {
        rate: saleData.commissionRate,
        amount: saleData.commission,
      },
      financing: {
        amountFunded: saleData.amountFunded,
        financeProvider: saleData.financeProvider,
        interestRate: saleData.interestRate,
        lien: saleData.lienAmount,
        downpayment: saleData.downpayment,
        trade: saleData.trade,
      },
      comments: saleData.comments,
    })
  );

  // Recalculate report data when editableReportData changes
  useEffect(() => {
    setEditableReportData((prev) => {
      const recalculated = calculateReportData(prev);
      return {
        ...prev,
        vehicleCosts: {
          ...prev.vehicleCosts,
          total: recalculated.vehicleCosts.total,
        },
        customerCosts: {
          ...prev.customerCosts,
          total: recalculated.customerCosts.total,
        },
        dealSummary: recalculated.dealSummary,
        commission: recalculated.commission,

        financing: {
          ...prev.financing,
          amountFunded: recalculated.financing.amountFunded,
        },
      };
    });
  }, [
    editableReportData.vehicleCosts.wbosVehicle,
    editableReportData.vehicleCosts.safetyInspection,
    editableReportData.vehicleCosts.carProof,
    editableReportData.vehicleCosts.cleanUp,
    editableReportData.vehicleCosts.parts,
    editableReportData.vehicleCosts.repairs,
    editableReportData.vehicleCosts.tires,
    editableReportData.vehicleCosts.referral,
    editableReportData.vehicleCosts.gas,
    editableReportData.vehicleCosts.uber,
    editableReportData.vehicleCosts.driversTow,
    editableReportData.vehicleCosts.pictures,
    editableReportData.vehicleCosts.invoiceCopy,
    editableReportData.vehicleCosts.tints,
    editableReportData.vehicleCosts.purolator,
    editableReportData.vehicleCosts.afcFloorPlan,
    editableReportData.vehicleCosts.mtoLicense,
    editableReportData.vehicleCosts.warrantyCost,
    editableReportData.vehicleCosts.gapProtectionCost,

    editableReportData.vehicleCosts.acv,
    editableReportData.vehicleCosts.otherCostItems,
    editableReportData.customerCosts.bosVehicle,
    editableReportData.customerCosts.adminFee,
    editableReportData.customerCosts.gasoline,
    editableReportData.customerCosts.licensingCharge,
    editableReportData.customerCosts.warrantySold,
    editableReportData.customerCosts.gapProtection,
    editableReportData.customerCosts.lenderReserve,
    editableReportData.customerCosts.lenderBonus,
    editableReportData.customerCosts.otherIncomeItems,

    editableReportData.dealSummary.pac,
    editableReportData.commission.amount,
    editableReportData.commission.rate,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSuccess = () => {
    setOpenDialog(false);
  };

  const onClose = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { isSubmitting: updatedIsSubmitting } = await updateReport(
      db,
      saleData,
      editableReportData,
      currentUser,
      onSuccess,
      onClose
    );
    setIsSubmitting(updatedIsSubmitting);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const downloadReport = async () => {
    const input = document.getElementById("reportContent");
    if (!input) return;

    const prevTransform = input.style.transform;
    const prevPadding = input.style.padding;
    input.style.transformOrigin = "top left";
    input.style.transform = "scale(0.85)";
    input.style.padding = "8px";

    await new Promise((r) => setTimeout(r, 50));

    const canvas = await html2canvas(input, { scale: 2 });

    input.style.transform = prevTransform;
    input.style.padding = prevPadding;

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const props = pdf.getImageProperties(imgData);
    let imgW = pageW;
    let imgH = (props.height * imgW) / props.width;

    if (imgH > pageH) {
      const scale = pageH / imgH;
      imgW *= scale;
      imgH = pageH;
    }

    const xOffset = (pageW - imgW) / 2;
    pdf.addImage(imgData, "PNG", xOffset, 0, imgW, imgH);

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfPreviewUrl(url);
    setOpenPdfPreview(true);
  };
  function formatDateOrPlaceholder(date) {
    return date ? (
      date
    ) : (
      <Typography color="text.secondary" fontStyle="italic">
        Not entered yet
      </Typography>
    );
  }

  return (
    <Box className="p-4">
      <Box className="text-center">
        <Button
          variant="contained"
          sx={{ color: "white", backgroundColor: "#011c64", mb: 2 }}
          size="large"
          startIcon={<View />}
          onClick={handleOpenDialog}
          className="mb-4"
        >
          Generate Report
        </Button>
        <Typography variant="body2" color="textSecondary">
          Click to generate a detailed commission report for this sale
        </Typography>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <div>
            <Typography variant="h5" component="h2" fontWeight="bold">
              DEAL / COMMISSION BREAKDOWN ({" "}
              {(saleData?.saleType || "individual").toUpperCase()})
            </Typography>
            {formattedDate && (
              <Typography variant="body2" color="text.secondary">
                First Generated: {formattedDate}
              </Typography>
            )}
          </div>
          <IconButton onClick={handleCloseDialog} size="small">
            <X />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Paper id="reportContent" elevation={0} className="p-4">
            <Grid container spacing={2} className="mb-4">
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" className="mb-2">
                  <img src={logo} alt="Logo" className="w-54 h-24 mr-2" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    component="div"
                    className="flex justify-between mb-2"
                  >
                    <span>Sales Rep:</span>
                    <span className="font-bold">{saleData?.salesRep}</span>
                  </Typography>
                  <Typography component="div" className="flex justify-between">
                    <span>Signature:</span>
                    <span className="border-b border-black w-40"></span>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider className="mb-4" />

            <Grid container spacing={2} className="mb-4">
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
                          {formatDateOrPlaceholder(saleData?.dateLeadReceived)}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell component="th" scope="row">
                          Date of Sale:
                        </TableCell>
                        <TableCell align="right">
                          {formatDateOrPlaceholder(saleData?.saleDate)}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell component="th" scope="row">
                          Date Funded:
                        </TableCell>
                        <TableCell align="right">
                          {formatDateOrPlaceholder(saleData?.fundedDate)}
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
                      {saleData?.saleType !== "wholesale" && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Lead Source:
                          </TableCell>
                          <TableCell align="right">
                            {saleData?.leadSource}
                          </TableCell>
                        </TableRow>
                      )}
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

            <Grid container spacing={4} className="mb-4">
              <Grid item xs={6}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  align="center"
                  className="bg-gray-100 p-2 mb-2 border-2 border-gray-950"
                >
                  VEHICLE COSTS
                </Typography>
                <TableContainer className="border-2 border-gray-950">
                  <Table size="small">
                    <TableBody>
                      {[
                        {
                          label: "WBOS-Vehicle (incl. Buyer Fee)",
                          key: "wbosVehicle",
                        },
                        {
                          label: "Safety Inspection & Certificate",
                          key: "safetyInspection",
                        },
                        { label: "Car Proof", key: "carProof" },
                        { label: "Clean up", key: "cleanUp" },
                        { label: "Parts", key: "parts" },
                        { label: "Repairs (DIMA)", key: "repairs" },
                        { label: "Tires", key: "tires" },
                        { label: "Referral", key: "referral" },
                        { label: "Gas", key: "gas" },
                        { label: "Uber", key: "uber" },
                        { label: "Drivers/Tow", key: "driversTow" },
                        { label: "Pictures", key: "pictures" },
                        // { label: "Invoice Copy", key: "invoiceCopy" },
                        { label: "Tints", key: "tints" },
                        { label: "Purolator", key: "purolator" },
                        { label: "AFC Floor Plan", key: "afcFloorPlan" },
                        { label: "MTO - License", key: "mtoLicense" },
                        { label: "Warranty Cost", key: "warrantyCost" },
                        {
                          label: "GAP Protection Cost",
                          key: "gapProtectionCost",
                        },

                        // { label: "ACV", key: "acv" },
                      ].map(({ label, key }) => (
                        <TableRow key={key}>
                          <TableCell>{label}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="text"
                              value={editableReportData.vehicleCosts[key] ?? ""}
                              onChange={
                                isVirtualAssistant
                                  ? (e) => {
                                      const inputValue = e.target.value;
                                      if (/^\d*\.?\d*$/.test(inputValue)) {
                                        setEditableReportData((prev) => ({
                                          ...prev,
                                          vehicleCosts: {
                                            ...prev.vehicleCosts,
                                            [key]: inputValue,
                                          },
                                        }));
                                      }
                                    }
                                  : undefined
                              }
                              readOnly={!isVirtualAssistant}
                              size="small"
                              variant="standard"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {editableReportData.vehicleCosts.otherCostItems?.length >
                      0 ? (
                        <>
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="font-bold text-md text-black bg-gray-200 pl-2"
                            >
                              Other Costs
                            </TableCell>
                          </TableRow>
                          {editableReportData.vehicleCosts.otherCostItems.map(
                            (item, index) => (
                              <TableRow key={`other-cost-${index}`}>
                                <TableCell className="pl-2">{`Other Cost ${
                                  index + 1
                                }`}</TableCell>
                                <TableCell align="right" className="pr-2">
                                  <TextField
                                    type="text"
                                    value={item.amount}
                                    onChange={
                                      isVirtualAssistant
                                        ? (e) => {
                                            const inputValue = e.target.value;
                                            if (
                                              /^\d*\.?\d*$/.test(inputValue)
                                            ) {
                                              setEditableReportData((prev) => {
                                                const updatedItems = [
                                                  ...prev.vehicleCosts
                                                    .otherCostItems,
                                                ];
                                                updatedItems[index] = {
                                                  ...updatedItems[index],
                                                  amount: inputValue,
                                                };
                                                return {
                                                  ...prev,
                                                  vehicleCosts: {
                                                    ...prev.vehicleCosts,
                                                    otherCostItems:
                                                      updatedItems,
                                                  },
                                                };
                                              });
                                            }
                                          }
                                        : undefined
                                    }
                                    readOnly={!isVirtualAssistant}
                                    size="small"
                                    variant="standard"
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          $
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </>
                      ) : (
                        <TableRow>
                          <TableCell className="pl-2">Other Costs</TableCell>
                          <TableCell
                            align="right"
                            className="text-gray-500 italic"
                          >
                            None
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Total Costs
                        </TableCell>
                        <TableCell align="right" fontWeight="bold">
                          <TextField
                            type="text"
                            value={editableReportData.vehicleCosts.total ?? ""}
                            readOnly
                            size="small"
                            variant="standard"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={6} spacing={4}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    align="center"
                    className="bg-gray-100 p-2 mb-2 border-2 border-gray-950"
                  >
                    CUSTOMER COSTS
                  </Typography>
                  <TableContainer className="border-2 border-gray-950">
                    <Table size="small">
                      <TableBody>
                        {[
                          { label: "BOS-Vehicle", key: "bosVehicle" },
                          { label: "Admin Fee", key: "adminFee" },
                          { label: "Gasoline", key: "gasoline" },
                          { label: "Licensing Charge", key: "licensingCharge" },
                          { label: "Warranty Sold", key: "warrantySold" },
                          {
                            label: "GAP Protection Sold",
                            key: "gapProtection",
                          },
                          { label: "Lender Reserve", key: "lenderReserve" },
                          { label: "Lender Bonus", key: "lenderBonus" },
                        ].map(({ label, key }) => (
                          <TableRow key={key}>
                            <TableCell>{label}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="text"
                                value={
                                  editableReportData.customerCosts[key] ?? ""
                                }
                                readOnly={!isVirtualAssistant}
                                onChange={
                                  isVirtualAssistant
                                    ? (e) => {
                                        const inputValue = e.target.value;
                                        if (/^\d*\.?\d*$/.test(inputValue)) {
                                          setEditableReportData((prev) => ({
                                            ...prev,
                                            customerCosts: {
                                              ...prev.customerCosts,
                                              [key]: inputValue,
                                            },
                                          }));
                                        }
                                      }
                                    : undefined
                                }
                                size="small"
                                variant="standard"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      $
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {editableReportData.customerCosts.otherIncomeItems
                          ?.length > 0 ? (
                          <>
                            <TableRow>
                              <TableCell
                                colSpan={2}
                                className="font-bold text-md text-black bg-gray-200 pl-2"
                              >
                                Other Income
                              </TableCell>
                            </TableRow>
                            {editableReportData.customerCosts.otherIncomeItems.map(
                              (item, index) => (
                                <TableRow key={`other-cost-${index}`}>
                                  <TableCell className="pl-2">{`Other Income ${
                                    index + 1
                                  }`}</TableCell>
                                  <TableCell align="right" className="pr-2">
                                    <TextField
                                      type="text"
                                      value={item.amount}
                                      onChange={
                                        isVirtualAssistant
                                          ? (e) => {
                                              const inputValue = e.target.value;
                                              if (
                                                /^\d*\.?\d*$/.test(inputValue)
                                              ) {
                                                setEditableReportData(
                                                  (prev) => {
                                                    const updatedItems = [
                                                      ...prev.customerCosts
                                                        .otherIncomeItems,
                                                    ];
                                                    updatedItems[index] = {
                                                      ...updatedItems[index],
                                                      amount: inputValue,
                                                    };
                                                    return {
                                                      ...prev,
                                                      customerCosts: {
                                                        ...prev.customerCosts,
                                                        otherIncomeItems:
                                                          updatedItems,
                                                      },
                                                    };
                                                  }
                                                );
                                              }
                                            }
                                          : undefined
                                      }
                                      readOnly={!isVirtualAssistant}
                                      size="small"
                                      variant="standard"
                                      InputProps={{
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            $
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </>
                        ) : (
                          <TableRow>
                            <TableCell className="pl-2">Other Income</TableCell>
                            <TableCell
                              align="right"
                              className="text-gray-500 italic"
                            >
                              None
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Total Deal Income
                          </TableCell>
                          <TableCell align="right" fontWeight="bold">
                            <TextField
                              type="text"
                              value={
                                editableReportData.customerCosts.total ?? ""
                              }
                              readOnly
                              size="small"
                              variant="standard"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    align="center"
                    className="bg-gray-100 p-2 mb-2 border-2 border-gray-950"
                  >
                    DEAL SUMMARY
                  </Typography>
                  <TableContainer className="border-2 border-gray-950">
                    <Table size="small">
                      <TableBody>
                        {[
                          {
                            label: "Total Deal Expenses",
                            key: "totalExpenses",
                          },
                          { label: "Total Deal Income", key: "totalIncome" },
                          { label: "Total Gross", key: "totalGross" },
                          { label: "PAC", key: "pac" },
                          { label: "Sales Gross", key: "salesGross" },

                          { label: "True Gross", key: "trueGross" },
                        ].map(({ label, key }) => (
                          <TableRow key={key}>
                            <TableCell>{label}</TableCell>
                            <TableCell
                              align="right"
                              fontWeight={
                                [
                                  "totalGross",
                                  "salesGross",
                                  "trueGross",
                                ].includes(key)
                                  ? "bold"
                                  : "normal"
                              }
                            >
                              <TextField
                                type="text"
                                value={
                                  key === "commission"
                                    ? editableReportData.commission.amount ?? ""
                                    : editableReportData.dealSummary[key] ?? ""
                                }
                                readOnly={key !== "pac" || !isVirtualAssistant}
                                onChange={
                                  isVirtualAssistant && key === "pac"
                                    ? (e) => {
                                        const inputValue = e.target.value;
                                        if (/^\d*\.?\d*$/.test(inputValue)) {
                                          setEditableReportData((prev) => ({
                                            ...prev,
                                            dealSummary: {
                                              ...prev.dealSummary,
                                              [key]: inputValue,
                                            },
                                          }));
                                        }
                                      }
                                    : undefined
                                }
                                size="small"
                                variant="standard"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      $
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                {saleData?.saleType !== "wholesale" && (
                  <Grid item xs={12}>
                    <Box className="mb-4">
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        align="center"
                        className="bg-gray-100 p-2 mb-2 border-2 border-gray-950"
                      >
                        COMMISSION
                      </Typography>
                      <TableContainer className="border-2 border-gray-950">
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Commission Rate</TableCell>
                              <TableCell align="right">
                                <TextField
                                  type="text"
                                  value={
                                    editableReportData.commission.rate ?? ""
                                  }
                                  readOnly={!isVirtualAssistant}
                                  onChange={
                                    isVirtualAssistant
                                      ? (e) => {
                                          const inputValue = e.target.value;
                                          if (
                                            inputValue === "" ||
                                            /^\d*\.?\d*$/.test(inputValue)
                                          ) {
                                            setEditableReportData((prev) => ({
                                              ...prev,
                                              commission: {
                                                ...prev.commission,
                                                rate: inputValue,
                                              },
                                            }));
                                          }
                                        }
                                      : undefined
                                  }
                                  size="small"
                                  variant="standard"
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        %
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Commission
                              </TableCell>
                              <TableCell align="right" fontWeight="bold">
                                <TextField
                                  type="text"
                                  value={
                                    editableReportData.commission.amount ?? ""
                                  }
                                  readOnly
                                  size="small"
                                  variant="standard"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        $
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Box className="my-4">
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                className="bg-gray-100 p-2 mb-2 border-2 border-gray-950"
              >
                FINANCING
              </Typography>
              <TableContainer className="border-2 border-gray-950">
                <Table size="small">
                  <TableBody>
                    {[
                      {
                        label: "Amount Funded",
                        key: "amountFunded",
                        type: "text",
                        adornment: "$",
                        adornmentPosition: "start",
                      },
                      {
                        label: "Finance Provider",
                        key: "financeProvider",
                        type: "text",
                        hide: saleData?.saleType === "wholesale",
                      },
                      { label: "Trade", key: "trade", type: "text" },
                      { label: "Lien", key: "lien", type: "text" },
                      {
                        label: "Interest Rate",
                        key: "interestRate",
                        type: "text",
                        adornment: "%",
                        adornmentPosition: "end",
                      },
                      { label: "DownPayment", key: "downpayment" },
                    ]
                      .filter(({ hide }) => !hide)
                      .map(
                        ({
                          label,
                          key,
                          type,
                          adornment,
                          adornmentPosition,
                        }) => (
                          <TableRow key={key}>
                            <TableCell>{label}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type={type}
                                value={editableReportData.financing[key]}
                                readOnly={!isVirtualAssistant}
                                disabled={key === "financeProvider"} // ← Disable only financeProvider
                                onChange={
                                  isVirtualAssistant &&
                                  key !== "financeProvider"
                                    ? (e) => {
                                        const value = e.target.value;
                                        setEditableReportData((prev) => ({
                                          ...prev,
                                          financing: {
                                            ...prev.financing,
                                            [key]: [
                                              "amountFunded",
                                              "interestRate",
                                            ].includes(key)
                                              ? value.replace(/[^0-9.]/g, "")
                                              : value,
                                          },
                                        }));
                                      }
                                    : undefined
                                }
                                size="small"
                                variant="standard"
                                InputProps={
                                  adornment
                                    ? {
                                        [adornmentPosition === "start"
                                          ? "startAdornment"
                                          : "endAdornment"]: (
                                          <InputAdornment
                                            position={adornmentPosition}
                                          >
                                            {adornment}
                                          </InputAdornment>
                                        ),
                                      }
                                    : {}
                                }
                              />
                            </TableCell>
                          </TableRow>
                        )
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box className="my-4">
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                className="bg-gray-100 p-2 mb-2 border-2 border-gray-950"
              >
                COMMENTS
              </Typography>
              <TableContainer className="border-2 border-gray-950">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <TextField
                          type="text"
                          value={editableReportData.comments}
                          onChange={
                            isVirtualAssistant
                              ? (e) =>
                                  setEditableReportData((prev) => ({
                                    ...prev,
                                    comments: e.target.value,
                                  }))
                              : undefined
                          }
                          readOnly={!isVirtualAssistant}
                          size="small"
                          variant="standard"
                          fullWidth
                        />
                      </TableCell>
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
          {isVirtualAssistant && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          )}
          <Button variant="contained" onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPdfPreview}
        onClose={() => setOpenPdfPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">PDF Preview</Typography>
          <IconButton onClick={() => setOpenPdfPreview(false)} size="small">
            <X />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              title="Commission Report PDF"
              width="100%"
              height="600px"
              style={{ border: 0 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {pdfPreviewUrl && (
            <Button
              component="a"
              href={pdfPreviewUrl}
              download={`commission_report_${saleData?.saleId}.pdf`}
              startIcon={<Download />}
            >
              Download PDF
            </Button>
          )}
          <Button onClick={() => setOpenPdfPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionReportGenerator;

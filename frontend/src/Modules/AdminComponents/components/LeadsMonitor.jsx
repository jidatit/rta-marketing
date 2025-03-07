import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import emailjs from "emailjs-com";
import { db } from "../../../config/firebaseConfig";

// Function to check if leads exceed threshold specifically for the current month
const checkLeadsExceedThreshold = (leads, threshold = 10) => {
  if (!leads || !leads.length) return false;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Count only leads from the current calendar month
  const currentMonthLeads = leads.filter((lead) => {
    const leadDate = lead.timestamp?.toDate
      ? lead.timestamp.toDate()
      : new Date(lead.timestamp);
    return (
      leadDate.getMonth() === currentMonth &&
      leadDate.getFullYear() === currentYear
    );
  });

  return currentMonthLeads.length >= threshold;
};

// Function to send email notification
const sendLeadNotification = async (employee, manager, threshold) => {
  try {
    console.log("employee: " + JSON.stringify(employee));
    // Configure EmailJS with your service ID, template ID, and user ID
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const userId = import.meta.env.VITE_EMAILJS_USER_ID;

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentYear = new Date().getFullYear();

    // First email - to the salesperson
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: employee.email,
        to_name: employee.name,
        subject: `Lead Target Achievement - ${currentMonth} ${currentYear}`,
        message: `Congratulations! You have achieved ${threshold}+ leads for ${currentMonth} ${currentYear}.`,
        company_name: "Your Company",
        month_name: currentMonth,
        from_name: "RTA Marketing Manager",
        year: currentYear,
      },
      userId
    );

    // Second email - to the manager
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: manager.email,
        to_name: manager.name,
        subject: `Sales Lead Threshold Notification - ${currentMonth} ${currentYear}`,
        message: `${employee.name} has exceeded ${threshold} leads for ${currentMonth} ${currentYear}.`,
        company_name: "Your Company",
        from_name: "RTA Marketing Admins",
        month_name: currentMonth,
        year: currentYear,
      },
      userId
    );

    console.log(
      `Notifications sent successfully for ${employee.name} for ${currentMonth} ${currentYear}`
    );
    return true;
  } catch (error) {
    console.error("Error sending email notification:", error);
    return false;
  }
};

// Custom hook to continuously monitor lead counts by month
// Modified to return a trigger function and status
export const useLeadMonitoring = (
  db,
  threshold = 10,
  checkIntervalMinutes = 60
) => {
  const [monitoringStatus, setMonitoringStatus] = useState({
    running: false,
    lastCheck: null,
    error: null,
  });

  // Create the monitoring function outside useEffect so we can return it
  const monitorLeads = async () => {
    try {
      // Set status to running
      setMonitoringStatus((prev) => ({
        ...prev,
        running: true,
      }));

      // Get current month and year for tracking notifications
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const monthYearKey = `${currentYear}-${currentMonth + 1}`;

      console.log(`Checking leads for month: ${monthYearKey}`);

      // IMPROVED STRUCTURE: Get the collection of monthly notification documents
      const notificationsCollectionRef = collection(
        db,
        "notificationHistory",
        "leadThresholds",
        "monthlyRecords"
      );

      // Try to get the document for the current month
      const currentMonthDocRef = doc(notificationsCollectionRef, monthYearKey);
      const currentMonthDocSnap = await getDoc(currentMonthDocRef);

      // Get already notified users for this month
      const sentNotifications = currentMonthDocSnap.exists()
        ? currentMonthDocSnap.data().notifiedUserIds || []
        : [];

      // Fetch manager info
      const managerEmail = "zebihaider123@gmail.com";
      const managerName = "Rta Marketing";

      // Fetch all employees
      const employeesRef = collection(db, "employees");
      const employeesSnapshot = await getDocs(employeesRef);

      const employeesToNotify = [];

      // Check each employee's leads for the current month only
      employeesSnapshot.docs.forEach((doc) => {
        const employee = { id: doc.id, ...doc.data() };

        // Skip if not a salesperson or already notified this month
        if (
          employee.userType !== "Employee" ||
          sentNotifications.includes(employee.uid)
        ) {
          return;
        }

        // Check if current month's leads exceed threshold
        if (checkLeadsExceedThreshold(employee.leads, threshold)) {
          employeesToNotify.push(employee);
        }
      });

      console.log(
        `Found ${employeesToNotify.length} employees exceeding threshold for ${monthYearKey}`
      );

      // Send notifications for employees who exceeded threshold
      const updatedSentNotifications = [...sentNotifications];

      for (const employee of employeesToNotify) {
        // Send emails to employee and manager
        const success = await sendLeadNotification(
          employee,
          { email: managerEmail, name: managerName },
          threshold
        );

        if (success) {
          updatedSentNotifications.push(employee.uid);
        }
      }

      // Update notification history in Firestore
      if (employeesToNotify.length > 0) {
        // If the document doesn't exist yet, create it
        if (!currentMonthDocSnap.exists()) {
          await setDoc(currentMonthDocRef, {
            notifiedUserIds: updatedSentNotifications,
            month: currentMonth + 1,
            year: currentYear,
            createdAt: new Date(),
          });
        } else {
          // Otherwise update the existing document
          await setDoc(
            currentMonthDocRef,
            {
              notifiedUserIds: updatedSentNotifications,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        }
      }

      // Update status with successful completion
      setMonitoringStatus({
        running: false,
        lastCheck: new Date(),
        error: null,
      });

      return {
        success: true,
        employeesNotified: employeesToNotify.length,
      };
    } catch (error) {
      console.error("Error monitoring leads:", error);
      setMonitoringStatus({
        running: false,
        lastCheck: new Date(),
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  };

  useEffect(() => {
    let intervalId;

    // Run immediately on mount
    monitorLeads();

    // Set up interval to check regularly
    intervalId = setInterval(monitorLeads, checkIntervalMinutes * 60 * 1000);

    // Cleanup on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [db, threshold, checkIntervalMinutes]);

  // Return both the status AND the function to trigger manually
  return { status: monitoringStatus, triggerCheck: monitorLeads };
};

// Component to handle continuous monitoring
export const LeadMonitor = ({ threshold = 10, checkIntervalMinutes = 60 }) => {
  const { status } = useLeadMonitoring(db, threshold, checkIntervalMinutes);

  // This is a "silent" component that doesn't render anything visible
  // It just sets up the monitoring system
  return null;
};

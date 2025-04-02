
import axios from 'axios';
import { Worker, AttendanceRecord, Payment, AttendanceStatus } from "../context/AppContext";

// Base API URL - would be configured based on environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.googlegcloud.app/api'
  : 'http://localhost:5001/api';

// Error handling helper
const handleApiError = (error: any, message: string) => {
  console.error(`${message}:`, error);
  // Re-throw for component-level handling
  throw error;
}

// Worker operations
export const fetchWorkers = async (): Promise<Worker[]> => {
  try {
    const response = await axios.get(`${API_URL}/workers`);
    if (!response.data) throw new Error(`HTTP error ${response.status}`);
    
    const workers = response.data;
    return workers.map((worker: any) => ({
      ...worker,
      id: worker._id, // Map MongoDB _id to our id field
    }));
  } catch (error) {
    handleApiError(error, "Error fetching workers");
    return [];
  }
};

export const addWorkerToApi = async (worker: Omit<Worker, "id">): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(worker)
    });
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const newWorker = await response.json();
    return newWorker._id; // Return the MongoDB _id
  } catch (error) {
    handleApiError(error, "Error adding worker");
    throw error;
  }
};

export const updateWorkerInApi = async (worker: Worker): Promise<void> => {
  try {
    const { id, ...workerData } = worker; // Extract id, send rest as body
    const response = await fetch(`${API_URL}/workers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workerData)
    });
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  } catch (error) {
    handleApiError(error, "Error updating worker");
    throw error;
  }
};

export const deleteWorkerFromApi = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/workers/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  } catch (error) {
    handleApiError(error, "Error deleting worker");
    throw error;
  }
};

// Attendance operations
export const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    const response = await fetch(`${API_URL}/attendance`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const attendance = await response.json();
    return attendance.map((record: any) => ({
      ...record,
      id: record._id, // Map MongoDB _id to our id field
      workerId: record.workerId, // MongoDB already stores this as workerId
    }));
  } catch (error) {
    handleApiError(error, "Error fetching attendance");
    return [];
  }
};

export const markAttendanceInApi = async (
  workerId: string,
  date: string,
  status: AttendanceStatus
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId, date, status })
    });
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  } catch (error) {
    handleApiError(error, "Error marking attendance");
    throw error;
  }
};

// Payment operations
export const fetchPayments = async (): Promise<Payment[]> => {
  try {
    const response = await fetch(`${API_URL}/payments`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const payments = await response.json();
    return payments.map((payment: any) => ({
      ...payment,
      id: payment._id, // Map MongoDB _id to our id field
      workerId: payment.workerId, // MongoDB already stores this as workerId
    }));
  } catch (error) {
    handleApiError(error, "Error fetching payments");
    return [];
  }
};

export const addPaymentToApi = async (payment: Omit<Payment, "id">): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    });
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const newPayment = await response.json();
    return newPayment._id; // Return the MongoDB _id
  } catch (error) {
    handleApiError(error, "Error adding payment");
    throw error;
  }
};

export const deletePaymentFromApi = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/payments/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  } catch (error) {
    handleApiError(error, "Error deleting payment");
    throw error;
  }
};

// Helper function for initial data seeding
export const seedInitialData = async (
  workers: Worker[],
  attendance: AttendanceRecord[],
  payments: Payment[]
): Promise<void> => {
  try {
    // Check if data already exists
    const existingWorkers = await fetchWorkers();
    
    if (existingWorkers.length === 0) {
      // Add workers without IDs
      for (const worker of workers) {
        const { id, ...workerData } = worker;
        await addWorkerToApi(workerData);
      }
      
      // Get newly created workers to use their IDs
      const newWorkers = await fetchWorkers();
      const workerIdMap = new Map();
      
      // Map old IDs to new IDs
      workers.forEach((oldWorker) => {
        const newWorker = newWorkers.find(w => w.name === oldWorker.name);
        if (newWorker) {
          workerIdMap.set(oldWorker.id, newWorker.id);
        }
      });
      
      // Add attendance records with updated worker IDs
      for (const record of attendance) {
        const newWorkerId = workerIdMap.get(record.workerId);
        if (newWorkerId) {
          await markAttendanceInApi(newWorkerId, record.date, record.status);
        }
      }
      
      // Add payment records with updated worker IDs
      for (const payment of payments) {
        const newWorkerId = workerIdMap.get(payment.workerId);
        if (newWorkerId) {
          const { id, ...paymentData } = payment;
          await addPaymentToApi({
            ...paymentData,
            workerId: newWorkerId
          });
        }
      }
      
      console.log("Initial data seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
    throw error;
  }
};

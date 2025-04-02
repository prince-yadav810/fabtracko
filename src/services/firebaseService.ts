import { db } from "../config/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  addDoc,
  updateDoc 
} from "firebase/firestore";
import { Worker, AttendanceRecord, Payment, AttendanceStatus } from "../context/AppContext";
import authService from "./authService";

// Collection references
const WORKERS_COLLECTION = "workers";
const ATTENDANCE_COLLECTION = "attendance";
const PAYMENTS_COLLECTION = "payments";

// Ensure auth headers are set before any API call
const ensureAuthHeaders = () => {
  authService.initAuthHeaders();
};

// Worker operations
export const fetchWorkers = async (): Promise<Worker[]> => {
  ensureAuthHeaders();
  try {
    const querySnapshot = await getDocs(collection(db, WORKERS_COLLECTION));
    const workers: Worker[] = [];
    querySnapshot.forEach((doc) => {
      workers.push({ id: doc.id, ...doc.data() } as Worker);
    });
    return workers;
  } catch (error) {
    console.error("Error fetching workers:", error);
    return [];
  }
};

export const addWorkerToFirebase = async (worker: Omit<Worker, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, WORKERS_COLLECTION), worker);
    return docRef.id;
  } catch (error) {
    console.error("Error adding worker:", error);
    throw error;
  }
};

export const updateWorkerInFirebase = async (worker: Worker): Promise<void> => {
  try {
    const workerRef = doc(db, WORKERS_COLLECTION, worker.id);
    await updateDoc(workerRef, { ...worker });
  } catch (error) {
    console.error("Error updating worker:", error);
    throw error;
  }
};

export const deleteWorkerFromFirebase = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, WORKERS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting worker:", error);
    throw error;
  }
};

// Attendance operations
export const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  ensureAuthHeaders();
  try {
    const querySnapshot = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    const attendance: AttendanceRecord[] = [];
    querySnapshot.forEach((doc) => {
      attendance.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
    });
    return attendance;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }
};

export const markAttendanceInFirebase = async (
  workerId: string,
  date: string,
  status: AttendanceStatus
): Promise<void> => {
  try {
    // Check if record already exists for this worker and date
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where("workerId", "==", workerId),
      where("date", "==", date)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing record
      const docId = querySnapshot.docs[0].id;
      await updateDoc(doc(db, ATTENDANCE_COLLECTION, docId), { status });
    } else {
      // Create new record
      const newRecord = {
        workerId,
        date,
        status,
      };
      await addDoc(collection(db, ATTENDANCE_COLLECTION), newRecord);
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

// Payment operations
export const fetchPayments = async (): Promise<Payment[]> => {
  ensureAuthHeaders();
  try {
    const querySnapshot = await getDocs(collection(db, PAYMENTS_COLLECTION));
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as Payment);
    });
    return payments;
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
};

export const addPaymentToFirebase = async (payment: Omit<Payment, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), payment);
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment:", error);
    throw error;
  }
};

export const deletePaymentFromFirebase = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PAYMENTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
};

// Helper function to seed initial data if needed
export const seedInitialData = async (
  workers: Worker[],
  attendance: AttendanceRecord[],
  payments: Payment[]
): Promise<void> => {
  ensureAuthHeaders();
  try {
    // Add workers
    for (const worker of workers) {
      const { id, ...workerData } = worker;
      await setDoc(doc(db, WORKERS_COLLECTION, id), workerData);
    }
    
    // Add attendance records
    for (const record of attendance) {
      const { id, ...recordData } = record;
      await setDoc(doc(db, ATTENDANCE_COLLECTION, id), recordData);
    }
    
    // Add payment records
    for (const payment of payments) {
      const { id, ...paymentData } = payment;
      await setDoc(doc(db, PAYMENTS_COLLECTION, id), paymentData);
    }
    
    console.log("Initial data seeded successfully");
  } catch (error) {
    console.error("Error seeding initial data:", error);
    throw error;
  }
};

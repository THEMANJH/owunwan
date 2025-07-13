import { db } from "./firebase"
import { collection, doc, setDoc, getDoc, query, where, getDocs, orderBy } from "firebase/firestore"

export interface WorkoutSet {
  weight: number
  reps: number
  completed: boolean
}

export interface Exercise {
  id: number
  name: string
  sets: WorkoutSet[]
}

export interface WorkoutSession {
  userId: string
  date: Date
  exercises: Exercise[]
  totalTime: number // in seconds
  totalVolume: number // in kg
  createdAt: Date
}

export const saveWorkoutSession = async (session: WorkoutSession) => {
  try {
    const sessionId = `${session.userId}_${session.date.toISOString().split("T")[0]}`
    await setDoc(doc(db, "workouts", sessionId), {
      ...session,
      date: session.date.toISOString(),
      createdAt: session.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Error saving workout session:", error)
    throw error
  }
}

export const getWorkoutsByDate = async (userId: string, date: Date): Promise<WorkoutSession | null> => {
  try {
    const sessionId = `${userId}_${date.toISOString().split("T")[0]}`
    const docRef = doc(db, "workouts", sessionId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt),
      } as WorkoutSession
    }

    return null
  } catch (error) {
    console.error("Error getting workout by date:", error)
    return null
  }
}

export const getUserWorkouts = async (userId: string) => {
  try {
    const q = query(collection(db, "workouts"), where("userId", "==", userId), orderBy("date", "desc"))

    const querySnapshot = await getDocs(q)
    const workouts: WorkoutSession[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      workouts.push({
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt),
      } as WorkoutSession)
    })

    return workouts
  } catch (error) {
    console.error("Error getting user workouts:", error)
    return []
  }
}

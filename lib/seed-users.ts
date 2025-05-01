"use client"

import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore"
import { getFirestoreInstance } from "./firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { getAuthInstance } from "./firebase"

// Sample user data
const sampleUsers = [
  {
    email: "admin@legendary-signatures.com",
    password: "admin123",
    displayName: "Admin User",
    role: "admin",
    phoneNumber: "+1234567890",
    newsletter: true,
  },
  {
    email: "john.doe@example.com",
    password: "password123",
    displayName: "John Doe",
    role: "customer",
    phoneNumber: "+1987654321",
    address: {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
    },
    newsletter: true,
  },
  {
    email: "jane.smith@example.com",
    password: "password123",
    displayName: "Jane Smith",
    role: "customer",
    phoneNumber: "+1122334455",
    address: {
      line1: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001",
      country: "USA",
    },
    newsletter: true,
  },
  {
    email: "david.wilson@example.com",
    password: "password123",
    displayName: "David Wilson",
    role: "customer",
    phoneNumber: "+1555666777",
    address: {
      line1: "789 Pine St",
      city: "Chicago",
      state: "IL",
      postalCode: "60007",
      country: "USA",
    },
    newsletter: false,
  },
  {
    email: "sarah.johnson@example.com",
    password: "password123",
    displayName: "Sarah Johnson",
    role: "customer",
    phoneNumber: "+1888999000",
    address: {
      line1: "321 Elm St",
      city: "Miami",
      state: "FL",
      postalCode: "33101",
      country: "USA",
    },
    newsletter: true,
  },
]

export async function seedUsers() {
  try {
    const db = getFirestoreInstance()
    const auth = getAuthInstance()

    console.log("Starting user seeding process...")

    // Check if users already exist
    const usersCollection = collection(db, "users")
    const existingUsersSnapshot = await getDocs(usersCollection)

    if (existingUsersSnapshot.size > 0) {
      console.log(`Found ${existingUsersSnapshot.size} existing users. Skipping seeding.`)
      return {
        success: true,
        message: `Found ${existingUsersSnapshot.size} existing users. Skipping seeding.`,
        existingCount: existingUsersSnapshot.size,
      }
    }

    // Seed users
    const results = []

    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const userQuery = query(usersCollection, where("email", "==", userData.email))
        const userSnapshot = await getDocs(userQuery)

        if (!userSnapshot.empty) {
          console.log(`User with email ${userData.email} already exists. Skipping.`)
          results.push({
            email: userData.email,
            status: "skipped",
            message: "User already exists",
          })
          continue
        }

        // Create auth user
        let authUser = null
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
          authUser = userCredential.user
          console.log(`Created auth user for ${userData.email} with UID: ${authUser.uid}`)
        } catch (authError) {
          console.error(`Error creating auth user for ${userData.email}:`, authError)
          results.push({
            email: userData.email,
            status: "error",
            message: `Auth error: ${authError.message}`,
          })
          continue
        }

        // Create Firestore user document
        const { password, ...userDataWithoutPassword } = userData
        const userDoc = {
          ...userDataWithoutPassword,
          uid: authUser.uid,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          wishlist: [],
          orders: [],
        }

        const docRef = await addDoc(usersCollection, userDoc)
        console.log(`Added user document for ${userData.email} with ID: ${docRef.id}`)

        results.push({
          email: userData.email,
          status: "success",
          id: docRef.id,
          uid: authUser.uid,
        })
      } catch (error) {
        console.error(`Error seeding user ${userData.email}:`, error)
        results.push({
          email: userData.email,
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Seeded ${results.filter((r) => r.status === "success").length} users`,
      results,
    }
  } catch (error) {
    console.error("Error seeding users:", error)
    return {
      success: false,
      message: `Error seeding users: ${error.message}`,
      error,
    }
  }
}

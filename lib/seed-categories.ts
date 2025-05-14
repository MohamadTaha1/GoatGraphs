import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { getStorage } from "firebase/storage"

export async function seedCategories() {
  try {
    const db = getFirestoreInstance()
    if (!db) {
      throw new Error("Firestore instance is null")
    }

    const storage = getStorage()
    const categoriesCollection = collection(db, "categories")

    // Define our required categories (removed footballs)
    const requiredCategories = [
      {
        id: "jerseys",
        name: "Jerseys",
        description: "Authentic and signed football jerseys",
        imageUrl: "/images/categories/jerseys.png",
        featured: true,
      },
      {
        id: "boots",
        name: "Boots",
        description: "Professional football boots worn by the stars",
        imageUrl: "/images/categories/boots.png",
        featured: true,
      },
      {
        id: "memorabilia",
        name: "Memorabilia",
        description: "Unique football memorabilia and collectibles",
        imageUrl: "/images/categories/memorabilia.png",
        featured: true,
      },
    ]

    // Check if categories already exist
    for (const category of requiredCategories) {
      const categoryQuery = query(categoriesCollection, where("name", "==", category.name))
      const categorySnapshot = await getDocs(categoryQuery)

      if (categorySnapshot.empty) {
        // Category doesn't exist, create it
        await setDoc(doc(categoriesCollection, category.id), {
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl,
          featured: category.featured,
        })
        console.log(`Created category: ${category.name}`)
      } else {
        console.log(`Category ${category.name} already exists`)
      }
    }

    return { success: true, message: "Categories seeded successfully" }
  } catch (error) {
    console.error("Error seeding categories:", error)
    return { success: false, message: `Error seeding categories: ${error.message}` }
  }
}

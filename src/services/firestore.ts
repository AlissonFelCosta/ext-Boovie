
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// Type for user ratings
export type Rating = {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'movie' | 'book' | 'game';
  rating: number;
  review?: string; // Changed from comment to review to match the component
  createdAt: Date;
  user?: {
    id: string;
    displayName: string;
    avatar: string;
  };
};

// Add a new rating
export const addRating = async (
  userId: string,
  itemId: string, 
  itemType: 'movie' | 'book' | 'game', 
  rating: number, 
  review?: string
) => {
  try {
    if (!auth.currentUser) throw new Error("User not authenticated");

    // Check if user already rated this item
    const existingRating = await getUserRatingForItem(userId, itemId);
    
    // Get user profile for avatar and display name
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    
    const ratingData = {
      userId,
      itemId,
      itemType,
      rating,
      review,
      createdAt: serverTimestamp(),
      user: {
        id: userId,
        displayName: userData?.displayName || "User",
        avatar: userData?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`
      }
    };

    // If the user already rated the item, update the existing rating
    if (existingRating) {
      await updateDoc(doc(db, "ratings", existingRating.id), {
        ...ratingData,
        updatedAt: serverTimestamp()
      });
      return { id: existingRating.id, ...ratingData };
    } else {
      // Create a new rating
      const docRef = await addDoc(collection(db, "ratings"), ratingData);
      return { id: docRef.id, ...ratingData };
    }
  } catch (error) {
    console.error("Error adding rating:", error);
    throw error;
  }
};

// Get all ratings for an item
export const getRatingsForItem = async (itemId: string, itemType: 'movie' | 'book' | 'game') => {
  try {
    const q = query(
      collection(db, "ratings"),
      where("itemId", "==", itemId),
      where("itemType", "==", itemType),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const ratings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ratings.push({
        id: doc.id,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt,
        user: data.user || {
          id: data.userId,
          displayName: "User",
          avatar: `/placeholder.svg`
        }
      });
    });
    
    return ratings;
  } catch (error) {
    console.error("Error getting ratings:", error);
    return [];
  }
};

// Get a specific user's rating for an item
export const getUserRatingForItem = async (userId: string, itemId: string) => {
  try {
    const q = query(
      collection(db, "ratings"),
      where("userId", "==", userId),
      where("itemId", "==", itemId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      rating: data.rating,
      review: data.review,
      createdAt: data.createdAt
    };
  } catch (error) {
    console.error("Error getting user rating:", error);
    return null;
  }
};

// Update a rating
export const updateRating = async (ratingId: string, data: Partial<Omit<Rating, 'id' | 'userId' | 'itemId' | 'itemType'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    await updateDoc(doc(db, "ratings", ratingId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    throw error;
  }
};

// Delete a rating
export const deleteRating = async (ratingId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    await deleteDoc(doc(db, "ratings", ratingId));
  } catch (error) {
    console.error("Error deleting rating:", error);
    throw error;
  }
};

// Get user's ratings
export const getUserRatings = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const q = query(
      collection(db, "ratings"),
      where("userId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const ratings: Rating[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ratings.push({
        id: doc.id,
        userId: data.userId,
        itemId: data.itemId,
        itemType: data.itemType,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt.toDate()
      });
    });
    
    return ratings;
  } catch (error) {
    console.error("Error getting user ratings:", error);
    throw error;
  }
};

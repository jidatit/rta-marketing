import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./config/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import PropTypes from "prop-types";
import { signOut } from "firebase/auth";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const getUserInfo = async (uid) => {
    console.log(uid);

    // Define a helper function to query a collection
    const queryCollection = async (collectionName) => {
      const q = query(collection(db, collectionName), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))[0];
      } else {
        return null;
      }
    };

    // Check in "admins" collection
    let userData = await queryCollection("admins");
    if (userData) {
      console.log("User Data from admins:", userData);
      return userData;
    }

    // Check in "employees" collection
    userData = await queryCollection("employees");
    if (userData) {
      console.log("User Data from employees:", userData);
      return userData;
    }

    // Check in "users" collection
    userData = await queryCollection("virtual-assistants");
    if (userData) {
      console.log("User Data from users:", userData);
      return userData;
    }

    // If no user data is found in any collection
    console.log("No such document!");
    return null;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setIsEmailVerified(user.emailVerified);
          const userData = await getUserInfo(user.uid);
          setCurrentUser(userData);
          setLoading(false);
          console.log(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(null);
          setIsEmailVerified(false);
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsEmailVerified(null);

      // Clear the current user
      // Redirect to the homepage or login page
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{ currentUser, isEmailVerified, handleLogout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

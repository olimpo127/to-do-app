import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Box, Button, Flex, Spacer, Text } from "@chakra-ui/react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  // Check if a user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const name = user.displayName;
        
        // Check if displayName is set, otherwise fetch from Firestore
        if (name) {
          setUserName(name);
        } else {
          const userDocRef = doc(db, "users", user.uid); // assuming users are stored in a "users" collection
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || ""); // Update to match your Firestore field name
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out: ", error.message);
    }
  };

  return (
    <Flex as="nav" padding={4} borderBottom="1px solid gray" alignItems="center">
      <Box>
        {isLoggedIn && userName && (
          <Text fontSize="lg" marginRight={4}>
            Hello, {userName}!
          </Text>
        )}
      </Box>
      <Spacer />
      <Box>
        {isLoggedIn && (
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </Box>
    </Flex>
  );
};

export default Navbar;

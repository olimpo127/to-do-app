import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  Box,
  VStack,
  Image,
  Flex,
  Text,
  Button,
  Heading,
  Stack,
  Input,
} from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const showToast = useShowToast();

  // Set persistence to local for session persistence
  useEffect(() => {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Session persistence set to local
      })
      .catch((error) => {
        showToast("Error", error.message, "error");
      });
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to tasks page after login
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Add user to Firestore with additional fields
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        createdAt: new Date(),
        tasks: [], // To hold user's tasks
        categories: [], // To hold user's custom categories
      });
      navigate("/"); // Redirect to tasks page after sign up
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Success", "Password reset email sent", "success");
      setIsForgotPassword(false);
      setEmail(""); // Clear email after sending
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <VStack justifyContent={"center"} alignItems={"center"}>
      <Heading marginTop={5}>Task Management Portal</Heading>
      <VStack border={"1px solid gray"} padding={5} marginTop={"2rem"}>
        <Image src="/do.png" h={24} cursor={"pointer"} alt="Logo" />
        {!isForgotPassword ? (
          <>
            <Stack spacing={3} marginBottom={5}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              {!isForgotPassword && (
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              )}
              {isSignUp && (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              )}
            </Stack>

            <Stack spacing={5}>
              <Button
                onClick={isSignUp ? handleSignUp : handleSignIn}
                colorScheme="blue"
              >
                {isSignUp ? "Register" : "Log In"}
              </Button>
              <Button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp
                  ? "Already have an account? Log In"
                  : "Don't have an account? Register"}
              </Button>
              {!isSignUp && (
                <Button onClick={() => setIsForgotPassword(true)}>
                  Forgot your password?
                </Button>
              )}
            </Stack>
          </>
        ) : (
          <>
            <Stack spacing={3} marginBottom={5}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </Stack>
            <Button onClick={handleForgotPassword} colorScheme="blue">
              Reset Password
            </Button>
            <Button onClick={() => setIsForgotPassword(false)} colorScheme="red">
              Back to Login
            </Button>
          </>
        )}
      </VStack>
    </VStack>
  );
}

export default Auth;

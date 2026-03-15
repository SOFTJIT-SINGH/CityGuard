import React from "react";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

export default function RootNavigator() {
  const isLoggedIn = true; // later connect to auth state

  // Simply return the appropriate navigator based on state
  return isLoggedIn ? <MainNavigator /> : <AuthNavigator />;
}
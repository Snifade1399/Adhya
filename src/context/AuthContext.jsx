import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./authContext";

function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let active = true;

    /*
     * Restore the existing session on page load. This also processes
     * confirmation / recovery tokens present in the URL.
     */
    supabase.auth.getSession()
      .then(({ data, error }) => {

        if (!active) {
          return;
        }

        if (error) {
          console.error("Could not restore session:", error);
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);

      });


    /*
     * Keep session state in sync with Supabase (sign-in, sign-out,
     * token refresh, email confirmation, password recovery).
     */
    const { data: subscription } =
      supabase.auth.onAuthStateChange((event, currentSession) => {

        if (!active) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

      });


    return () => {

      active = false;
      subscription.subscription.unsubscribe();

    };

  }, []);


  async function signOut() {

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not sign out:", error);
    }

    /*
     * onAuthStateChange updates the context state.
     */

  }


  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

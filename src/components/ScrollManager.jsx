import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const id = location.hash.replace("#", "");
    let attempts = 0;
    let timer = null;

    function scrollToHash() {
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView();
        return true;
      }

      return false;
    }

    if (!scrollToHash()) {
      timer = setInterval(() => {
        attempts += 1;

        if (scrollToHash() || attempts >= 20) {
          clearInterval(timer);
          timer = null;
        }
      }, 100);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [location]);

  return null;
}

export default ScrollManager;

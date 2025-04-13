"use client"

import { MenuItem } from "./nav-menu";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion

export default function SubMenu({
  menuItme,
  SubMenuContent
}: {
  menuItme: MenuItem;
  SubMenuContent: React.ReactNode;
}) {
  const [menuShow, setMenuShow] = useState<boolean>(false);

  function handleSubMenu() {
    setMenuShow(!menuShow);
  }

  return (
    <>
      <button
        onClick={handleSubMenu}
      >
        {menuItme.label}
      </button>

      <AnimatePresence>
        {menuShow && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {SubMenuContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
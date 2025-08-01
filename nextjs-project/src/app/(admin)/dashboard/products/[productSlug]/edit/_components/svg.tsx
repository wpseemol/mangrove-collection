export const OnCheckmark = ({
     color = "currentColor",
     size = 24,
     strokeWidth = 2,
     filled = false,
     fillColor = "currentColor",
}) => (
     <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={filled ? fillColor : "none"}
          xmlns="http://www.w3.org/2000/svg"
     >
          <circle
               cx="12"
               cy="12"
               r="10"
               stroke={color}
               strokeWidth={strokeWidth}
          />
          <path
               d="M8 12L11 15L16 9"
               stroke={filled ? "white" : color}
               strokeWidth={strokeWidth}
               strokeLinecap="round"
               strokeLinejoin="round"
          />
     </svg>
);

export const InfoIcon = ({
     size = 24,
     color = "currentColor",
     strokeWidth = 2,
}) => (
     <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
     >
          <circle
               cx="12"
               cy="12"
               r="9"
               stroke={color}
               strokeWidth={strokeWidth}
          />
          <path
               d="M12 8V12M12 16H12.01"
               stroke={color}
               strokeWidth={strokeWidth}
               strokeLinecap="round"
          />
     </svg>
);

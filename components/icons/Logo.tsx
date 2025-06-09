const Logo = ({ ...props }) => (
  <div className="flex items-center space-x-2">
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="100%" height="100%" rx="6" fill="#238287" />
      <path
        d="M8 10h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2zm0 4h8v2H8v-2z"
        fill="white"
      />
      <path
        d="M20 18l4 4-4 4v-8z"
        fill="white"
      />
    </svg>
    <span className="text-xl font-bold text-white">RevisePDF</span>
  </div>
);

export default Logo;

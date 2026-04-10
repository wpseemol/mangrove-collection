// Define payment methods array with associative properties
export const PAYMENT_METHODS = [
    {
        id: "bKash" as const,
        label: "bKash",
        icon: "send_to_mobile",
        color: "#e2136e",
        description:
            "+880 1323 846556 bKash,Nagad,(Rocket +6) Personal Account এখানে Send Money করে এর স্ক্রিনশট আমাদের Whatsapp করুন । Whatsapp: +880 1323 846556",
        shortDescription: "Send money to bKash account",
        infoAlert:
            "After payment, please send the transaction ID to our WhatsApp",
    },
    {
        id: "rocket" as const,
        label: "Rocket",
        icon: "rocket_launch",
        color: "#5D2D91",
        description:
            "Send money to our Rocket account. Please include your order number as reference.",
        shortDescription: "Send money to Rocket account",
        infoAlert:
            "After payment, please send the transaction ID to our WhatsApp",
    },
    {
        id: "nagad" as const,
        label: "Nagad",
        icon: "account_balance_wallet",
        color: "#E5006D",
        description:
            "Send money to our Nagad account. Please include your order number as reference.",
        shortDescription: "Send money to Nagad account",
        infoAlert:
            "After payment, please send the transaction ID to our WhatsApp",
    },
    {
        id: "cod" as const,
        label: "Cash on Delivery",
        icon: "handshake",
        color: "primary", // Using your primary color
        description:
            "Cash on Delivery (COD) ঢাকা মেট্রোপলিটন সিটির ভেতরে ডেলিভেরির পরে টাকা ( COD) পেমেন্ট করতে পারবেন ঢাকার মেট্রোপলিটন সিটির বাহিরে ডেলিভারির ক্ষেত্রে সর্বনিম্ন ১০০০ টাকা অগ্রিম পেমেন্ট করতে হবে, ৪৮ থেকে ৭২ ঘন্টার ভেতরে মাছ ডেলিভারি করা হবে।",
        shortDescription: "Pay when you receive the order",
        infoAlert: "",
    },
];

// Define districts array (all 64 districts of Bangladesh)
export const BANGLADESH_DISTRICTS = [
    { id: 1, value: "dhaka", label: "Dhaka" },
    { id: 2, value: "faridpur", label: "Faridpur" },
    { id: 3, value: "gazipur", label: "Gazipur" },
    { id: 4, value: "gopalganj", label: "Gopalganj" },
    { id: 5, value: "kishoreganj", label: "Kishoreganj" },
    { id: 6, value: "madaripur", label: "Madaripur" },
    { id: 7, value: "manikganj", label: "Manikganj" },
    { id: 8, value: "munshiganj", label: "Munshiganj" },
    { id: 9, value: "narayanganj", label: "Narayanganj" },
    { id: 10, value: "narsingdi", label: "Narsingdi" },
    { id: 11, value: "rajbari", label: "Rajbari" },
    { id: 12, value: "shariatpur", label: "Shariatpur" },
    { id: 13, value: "tangail", label: "Tangail" },

    { id: 14, value: "chittagong", label: "Chittagong" },
    { id: 15, value: "bandarban", label: "Bandarban" },
    { id: 16, value: "brahmanbaria", label: "Brahmanbaria" },
    { id: 17, value: "chandpur", label: "Chandpur" },
    { id: 18, value: "comilla", label: "Comilla" },
    { id: 19, value: "coxsbazar", label: "Cox's Bazar" },
    { id: 20, value: "feni", label: "Feni" },
    { id: 21, value: "khagrachari", label: "Khagrachari" },
    { id: 22, value: "lakshmipur", label: "Lakshmipur" },
    { id: 23, value: "noakhali", label: "Noakhali" },
    { id: 24, value: "rangamati", label: "Rangamati" },

    { id: 25, value: "sylhet", label: "Sylhet" },
    { id: 26, value: "habiganj", label: "Habiganj" },
    { id: 27, value: "moulvibazar", label: "Moulvibazar" },
    { id: 28, value: "sunamganj", label: "Sunamganj" },

    { id: 29, value: "khulna", label: "Khulna" },
    { id: 30, value: "bagerhat", label: "Bagerhat" },
    { id: 31, value: "chuadanga", label: "Chuadanga" },
    { id: 32, value: "jessore", label: "Jessore" },
    { id: 33, value: "jhenaidah", label: "Jhenaidah" },
    { id: 34, value: "kushtia", label: "Kushtia" },
    { id: 35, value: "magura", label: "Magura" },
    { id: 36, value: "meherpur", label: "Meherpur" },
    { id: 37, value: "narail", label: "Narail" },
    { id: 38, value: "satkhira", label: "Satkhira" },

    { id: 39, value: "rajshahi", label: "Rajshahi" },
    { id: 40, value: "bogra", label: "Bogra" },
    { id: 41, value: "joypurhat", label: "Joypurhat" },
    { id: 42, value: "naogaon", label: "Naogaon" },
    { id: 43, value: "natore", label: "Natore" },
    { id: 44, value: "chapainawabganj", label: "Chapainawabganj" },
    { id: 45, value: "pabna", label: "Pabna" },
    { id: 46, value: "sirajganj", label: "Sirajganj" },

    { id: 47, value: "barisal", label: "Barisal" },
    { id: 48, value: "barguna", label: "Barguna" },
    { id: 49, value: "bhola", label: "Bhola" },
    { id: 50, value: "jhalokati", label: "Jhalokati" },
    { id: 51, value: "patuakhali", label: "Patuakhali" },
    { id: 52, value: "pirojpur", label: "Pirojpur" },

    { id: 53, value: "rangpur", label: "Rangpur" },
    { id: 54, value: "dinajpur", label: "Dinajpur" },
    { id: 55, value: "gaibandha", label: "Gaibandha" },
    { id: 56, value: "kurigram", label: "Kurigram" },
    { id: 57, value: "lalmonirhat", label: "Lalmonirhat" },
    { id: 58, value: "nilphamari", label: "Nilphamari" },
    { id: 59, value: "panchagarh", label: "Panchagarh" },
    { id: 60, value: "thakurgaon", label: "Thakurgaon" },

    { id: 61, value: "mymensingh", label: "Mymensingh" },
    { id: 62, value: "jamalpur", label: "Jamalpur" },
    { id: 63, value: "netrokona", label: "Netrokona" },
    { id: 64, value: "sherpur", label: "Sherpur" },
];

// Or if you only need major districts:
export const MAJOR_DISTRICTS = [
    { id: 1, value: "dhaka", label: "Dhaka" },
    { id: 2, value: "chittagong", label: "Chittagong" },
    { id: 3, value: "sylhet", label: "Sylhet" },
    { id: 4, value: "khulna", label: "Khulna" },
    { id: 5, value: "rajshahi", label: "Rajshahi" },
    { id: 6, value: "barisal", label: "Barisal" },
    { id: 7, value: "rangpur", label: "Rangpur" },
    // { value: "mymensingh", label: "Mymensingh" },
    // { value: "cumilla", label: "Cumilla" },
    // { value: "narayanganj", label: "Narayanganj" },
    // { value: "gazipur", label: "Gazipur" },
    // { value: "bogra", label: "Bogra" },
    // { value: "feni", label: "Feni" },
    // { value: "cox's bazar", label: "Cox's Bazar" },
];

// Define payment methods array with associative properties
export const PAYMENT_METHODS = [
    {
        id: "bKash" as const,
        label: "bKash",
        icon: "send_to_mobile",
        color: "#e2136e",
        description:
            "01710110733 bKash,Nagad,(Rocket +6) Personal Account এখানে Send Money করে এর স্ক্রিনশট আমাদের Whatsapp করুন । Whatsapp: 01626328524",
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

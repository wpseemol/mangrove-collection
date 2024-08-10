interface CustomLinkType {
    className?: string;
    href: string;
    children: React.ReactNode;
    isActive?: boolean;
}

interface MenuType {
    id: string;
    href: string;
    label: string;
}

export type { CustomLinkType, MenuType };

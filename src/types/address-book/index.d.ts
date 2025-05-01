



export interface AddressBookType {
        id: string;
        userId: string | null;;
        addresses: AddressType[];
}


export interface AddressType {
    name: string;
    email: string | null;
    phone: string;
    landmark?: string;
    region: string | null;
    city: string | null;
    fullAddress: string;
    isSelected: boolean;
    zone: string | null;
}
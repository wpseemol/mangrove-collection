import { connectMongoDB } from '@/db/connections';
import AddressBookModel from '@/lib/schemas/mongoose/address-book';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // const addressBookCookies = request.cookies.get(
        //     addressBookCookiesKey
        // )?.value;

        const body = (await request.json()) as AddressType;

        if (
            !body.phone ||
            !body.fullAddress ||
            !body.fullName ||
            !body.termsAccepted
        ) {
            return NextResponse.json(
                { message: 'Product buy address is required', success: false },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const existingAddressBook = await AddressBookModel.findOne({
            addresses: { $elemMatch: { phone: body.phone } },
        }).lean();

        if (!existingAddressBook) {
            const addressBookSaveData = [
                {
                    name: body.fullName,
                    phone: body.phone,
                    fullAddress: body.fullAddress,
                    isSelected: true,
                },
            ];
            const isSaveAddress = await AddressBookModel.create({
                addresses: addressBookSaveData,
            });
            console.log('isCreate:', isSaveAddress);
        }

        return NextResponse.json(
            { message: 'Order place success full.', success: true },
            {
                status: 201,
            }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || 'Internal server error.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'An unknown error occurred.' },
            { status: 500 }
        );
    }
}

// const addressBookCookiesKey = 'address-book';

interface AddressType {
    phone: string;
    fullName: string;
    fullAddress: string;
    termsAccepted: boolean;
}

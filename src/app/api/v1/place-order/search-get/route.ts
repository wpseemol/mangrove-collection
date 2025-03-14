import { connectMongoDB } from '@/db/connections';
import AddressBookModel from '@/lib/schemas/mongoose/address-book';
import { replaceMongodbId, replaceMongoIds } from '@/utils/replace-mongo-Ids';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // const addressBookCookies = request.cookies.get(
        //     addressBookCookiesKey
        // )?.value;

        const searchParams = request.nextUrl.searchParams;

        const inputPhoneNumber = searchParams.get('input-phone-number');

        if (!inputPhoneNumber) {
            return NextResponse.json(
                {
                    message: 'Search Params number need to find',
                    success: false,
                },
                {
                    status: 400,
                }
            );
        }

        await connectMongoDB();

        const existingAddressBook = await AddressBookModel.findOne({
            addresses: { $elemMatch: { phone: inputPhoneNumber } },
        }).lean();

        if (!existingAddressBook) {
            return NextResponse.json(
                { message: 'Search data is not found.', success: false },
                {
                    status: 404,
                }
            );
        }

        const responsData = replaceMongodbId(
            existingAddressBook
        ) as AddressBookDataType;

        const addressBookData = replaceMongoIds(
            responsData.addresses
        ) as ReplaceAddressType[];

        const slelctedAddres = addressBookData.find((item) => item.isSelected);

        return NextResponse.json(
            {
                message: 'Order place success full.',
                success: true,
                data: slelctedAddres,
            },
            {
                status: 200,
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

// interface AddressType {
//     phone: string;
//     fullName: string;
//     fullAddress: string;
//     termsAccepted: boolean;
// }

interface AddressType {
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

type WithMongoId = AddressType & {
    _id: mongoose.Types.ObjectId;
};

type ReplaceAddressType = AddressType & {
    id: mongoose.Types.ObjectId;
};

interface AddressBookDataType {
    userId: mongoose.Types.ObjectId | null;
    addresses: WithMongoId[];
}

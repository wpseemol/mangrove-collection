import mongoose, { Document, Schema } from 'mongoose';

interface Address {
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

interface AddressBook extends Document {
    userId?: mongoose.Types.ObjectId | null;
    addresses: Address[];
}

const AddressSchema = new Schema<Address>({
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, required: true },
    landmark: { type: String, default: null },
    region: { type: String, default: null },
    city: { type: String, default: null },
    fullAddress: { type: String, required: true },
    isSelected: { type: Boolean, default: false },
});

const AddressBookSchema = new Schema<AddressBook>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    addresses: { type: [AddressSchema], default: [] },
});

// Check if the model already exists to prevent OverwriteModelError
const AddressBookModel =
    mongoose.models.AddressBook ||
    mongoose.model<AddressBook>('AddressBook', AddressBookSchema);

export default AddressBookModel;

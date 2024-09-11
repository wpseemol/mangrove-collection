import { VisitorBase } from '@/types/mongoose-models/visitor';
import mongoose from 'mongoose';

interface IVisitor extends VisitorBase, mongoose.Document {}

const visitorSchema = new mongoose.Schema<IVisitor>({
    visitorId: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        unique: true,
    },

    expires: {
        type: Date,
        required: false,
        default: null,
    },

    isLogin: {
        type: Boolean,
        required: true,
        default: false,
    },
    visitAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    lastVisitAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    lastDeviceID: {
        type: [String],
        required: false,
    },
});

const Visitor =
    mongoose.models.Visitor ||
    mongoose.model<IVisitor>('Visitor', visitorSchema);

export { Visitor };

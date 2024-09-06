import { VisitorBase } from '@/types/mongoose-models/visitor';
import mongoose from 'mongoose';

interface IVisitor extends VisitorBase, mongoose.Document {}

const visitorSchema = new mongoose.Schema<IVisitor>({
    visitorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
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
});

const Visitor =
    mongoose.models.Visitor ||
    mongoose.model<IVisitor>('Visitor', visitorSchema);

export { Visitor };

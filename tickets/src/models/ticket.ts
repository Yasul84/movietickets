import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketStatus } from './ticket-status';

interface TicketAttrs {
    title: string;
    description: string;
    price: number;
    maxCount: number;
    currentCount: number;
    userId: string;
    status: string;
}

interface TicketDoc extends mongoose.Document {
    title: string;
    description: string;
    price: number;
    maxCount: number;
    currentCount: number;
    userId: string;
    version: number;
    orderId?: string;
    status: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }, 
    maxCount: {
        type: Number,
        required: true
    },
    currentCount: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }, 
    orderId: {
        type: String
    },
    status: {
        type: String,
        enum: Object.values(TicketStatus),
        default: TicketStatus.Created
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
});

ticketSchema.set('versionKey', 'version');

/* ticketSchema.plugin(updateIfCurrentPlugin); */

/* ticketSchema.pre('save', function (done) {
    // @ts-ignore
    this.$where = {
        version: this.get('version') - 1
    }

    done();
}); */

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
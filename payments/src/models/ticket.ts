import mongoose from 'mongoose';


interface TicketAttrs {
    id: string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    id: string;
    price: number;
    version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id
        }
    }
});

ticketSchema.set('versionKey', 'version');

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        price: attrs.price
    });
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
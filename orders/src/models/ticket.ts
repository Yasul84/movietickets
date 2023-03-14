import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';
import { TicketStatus } from './ticket-status';


interface TicketAttrs {
    title: string;
    price: number;
    description: string;
    id: string;
    maxCount: number;
    currentCount: number;
    status: string;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    description: string;
    version: number;
    maxCount: number;
    currentCount: number;
    status: string;
    /* isSoldOut(): Promise<boolean>;
    doublecheckSoldOut(): Promise<boolean>; */
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
        required: true, 
        min: 0
    }, 
    maxCount: {
        type: Number,
        required: true,
        min: 0
    }, 
    currentCount: {
        type: Number,
        required: true,
        min: 0
    }, 
    status: {
        type: String,
        enum: Object.values(TicketStatus),
        default: TicketStatus.Created
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
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        description: attrs.description,
        price: attrs.price, 
        maxCount: attrs.maxCount,
        currentCount: attrs.currentCount,
        status: attrs.status
    });
};
/* ticketSchema.methods.isSoldOut = async function () {
    // this === the ticket document that we are calling on.
    const max = this.maxCount;
    const current = this.currentCount; 
    
    let status;
    if (current >= max) {
        status = true;
    } else {
        status = false;
    }

    return status;
};

ticketSchema.methods.doublecheckSoldOut = async function () {
    // this === the ticket document that we are calling on.
    const max = this.maxCount;
    const current = this.currentCount;

    let status;
    if (current > max) {
        status = true;
    } else {
        status = false;
    }

    return status;
}; */

/* ticketSchema.methods.updateCount = async function (count: number) {
    // this === the ticket document that we are calling on.
    const current = this.currentCount;

    const newCount = current + count;

    this.currentCount = newCount;
}; */

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
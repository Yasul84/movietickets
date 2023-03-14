import mongoose from 'mongoose';
import { OrderStatus } from '@tnmovieticketsv1/common';
import { TicketDoc } from './ticket';

interface OrderAttrs {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    count: number;
    charge: number;
    ticket?: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    count: number;
    charge: number;
    ticket?: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    }, 
    count: {
        type: Number,
        required: true
    }, 
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    charge: {
        type: Number,
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id
        }
    }
});

orderSchema.set('versionKey', 'version');
/* ticketSchema.plugin(updateIfCurrentPlugin); */

/* orderSchema.pre('save', function (done) {
    // @ts-ignore
    this.$where = {
        version: this.get('version') - 1
    }

    done();
}); */

orderSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1
    })
};

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        count: attrs.count,
        userId: attrs.userId,
        status: attrs.status,
        ticket: attrs.ticket, 
        charge: attrs.charge
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };


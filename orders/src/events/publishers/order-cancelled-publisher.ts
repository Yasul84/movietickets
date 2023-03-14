import { Publisher, OrderCancelledEvent, Subjects } from '@tnmovieticketsv1/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
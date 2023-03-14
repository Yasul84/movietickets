import { Publisher, OrderUpdatedEvent, Subjects } from '@tnmovieticketsv1/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
    subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}
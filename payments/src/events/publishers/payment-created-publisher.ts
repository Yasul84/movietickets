import { Publisher, PaymentCreatedEvent, Subjects } from '@tnmovieticketsv1/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
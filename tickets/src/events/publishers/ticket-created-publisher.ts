import { Publisher, Subjects, MovieCreatedEvent } from '@tnmovieticketsv1/common';

export class TicketCreatedPublisher extends Publisher<MovieCreatedEvent> {
    subject: Subjects.MovieCreated = Subjects.MovieCreated;    
}
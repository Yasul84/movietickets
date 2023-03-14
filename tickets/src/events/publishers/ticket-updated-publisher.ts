import { Publisher, Subjects, MovieUpdatedEvent } from '@tnmovieticketsv1/common';

export class TicketUpdatedPublisher extends Publisher<MovieUpdatedEvent> {
    subject: Subjects.MovieUpdated = Subjects.MovieUpdated;    
}
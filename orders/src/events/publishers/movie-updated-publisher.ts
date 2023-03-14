import { Publisher, MovieUpdatedEvent, Subjects } from '@tnmovieticketsv1/common';

export class MovieUpdatedPublisher extends Publisher<MovieUpdatedEvent> {
    subject: Subjects.MovieUpdated = Subjects.MovieUpdated;
}
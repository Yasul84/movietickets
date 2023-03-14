export enum TicketStatus {
    // When a ticket is first created.
    Created = 'created',

    // When a ticket's currentCount is less than its maxCount.
    Available = 'available',

    // When a ticket's currentCount is greater than or equal to its maxCount.
    Unavailable = 'unavailable'
}
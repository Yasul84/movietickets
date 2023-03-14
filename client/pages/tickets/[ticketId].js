import Router from 'next/router';
import useRequest from '../../hooks/use-request';
import { useState } from 'react';

const TicketShow = ({ ticket }) => {
    const [ count, setCount ] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id, 
            count: count
        }, 
        onSuccess: (order) => Router.push('/orders')
    });

    /* const onSubmit = (e) => {
        e.preventDefault();

        doRequest();
    }; */

    console.log(`Count is: ${count}.`);
    

    return(
        <div>
            <h1>Title: {ticket.title}</h1>
            <h4>Description: {ticket.description}</h4>
            <h4>Price: {ticket.price}</h4>
            <h4>Maximum occupancy: {ticket.maxCount}</h4>
            <h4>Current number of tickets sold: {ticket.currentCount}</h4>
            <br />
            <h2>Create an order:</h2>
            {/* <form onSubmit={onSubmit}> */}
                {/* <div className='form-group'> */}
                    <label>Set ticket number for purchase:</label>
                    <input className='form-control' value={count} onChange={(e) => setCount(e.target.value)} />
                {/* </div> */}
                <button className='btn btn-primary' onClick={() => doRequest()}>Purchase</button>
            {/* </form> */}
        </div>
    )
};

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);

    return { ticket: data };
}

export default TicketShow;

/* '/orders/[orderId]', `/orders/${order.id}` */
import Link from 'next/link';

const OrderIndex = ({ orders }) => {
    const orderList = orders.map((order) => {
        return(
            <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.ticket.title} - {order.ticket.description}</td>
                <td>{order.charge}</td>
                <td>{order.status}</td>
                <td>
                    <Link href={`/orders/${order.id}`}>
                        Checkout
                    </Link>
                </td>
            </tr>
        )
    });

    return(
        <div>
            <h1>Orders</h1>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Ticket description</th>
                        <th>Order charge amount</th>
                        <th>Order status</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList}
                </tbody>
            </table>
        </div>
    );
};

OrderIndex.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/orders');

    return { orders: data };
};

export default OrderIndex;

{/* <ul>
            {orders.map((order) => {
                return (<li key = {order.id}>
                    {order.ticket.title} - {order.status}
                </li>);
            })}
        </ul> */}
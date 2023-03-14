import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {

    const { doRequest, errors } = useRequest({
        url: '/api/payments', 
        method: 'post',
        body: {
            orderId: order.order.id
        }, 
        onSuccess: (payment) => Router.push('/orders')
    });

    console.log(order.order.id);

    return(
        <div>
            Confirm your order by submitting payment below:
            <br />
            <StripeCheckout 
                token = {({ id }) => doRequest({ token: id })}  
                stripeKey = 'pk_test_51M7EusE1825sNhpPe8uMevlq8MaM5vP4TpdtaD4oJkfgp22fFNg817puwKSrZ8OYL1Zq4hHMj7ItiXUGTIysPQqm00LCQw8JAi'
                amount = {order.charge * 100}
                email = {currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default OrderShow;